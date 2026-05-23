import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { Loading } from '@/components/common';
import { SuperButton } from '@/components/common/button/SuperButton';
import ResetVoxelDialog from '@/components/dialog/AlertDialog';
import EditPanel from '@/components/voxel/panel';
import { isNotFoundError } from '@/lib/api';
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/constants';
import Voxel, { VoxelPoint } from '@/pages/Voxel';
import {
  getSignedUrl,
  getVoxelModelById,
  saveVoxelModel,
} from '@/services/voxel.service';

// Constants
const VOXEL_SCALE = 0.005;
const AUTOSAVE_DEBOUNCE_MS = 2000;

//  GLB export: voxel data stored in group extras
const exportGLB = (scene: THREE.Scene, voxels: VoxelPoint[]): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    const exportGroup = new THREE.Group();
    exportGroup.name = 'voxel_model';

    // Embed voxel state in the group's extras to survives the GLB processing.
    exportGroup.userData = { voxelData: voxels };

    scene.traverse(obj => {
      if (obj.name === 'cubeToSave' && obj instanceof THREE.Mesh) {
        const clone = obj.clone(true);
        clone.scale.setScalar(VOXEL_SCALE);
        clone.position.copy(obj.position).multiplyScalar(VOXEL_SCALE);
        exportGroup.add(clone);
      }
    });

    exporter.parse(
      exportGroup,
      result =>
        resolve(new Blob([result as BlobPart], { type: 'model/gltf-binary' })),
      (error: unknown) =>
        reject(error instanceof Error ? error : new Error(String(error))),
      { binary: true }
    );
  });
};

//  GLB import: extract voxel state from extras
const loadVoxelsFromGLB = (url: string): Promise<VoxelPoint[]> => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      gltf => {
        // userData is populated from the GLTF extras field by the loader.
        const voxelData =
          gltf.scene.children.find(c => c.name === 'voxel_model')?.userData
            ?.voxelData ?? gltf.scene.userData?.voxelData; // fallback: root scene extras

        resolve(Array.isArray(voxelData) ? (voxelData as VoxelPoint[]) : []);
      },
      undefined,
      reject
    );
  });
};

export default function VoxelLayout() {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'add' | 'remove' | 'paint'>('add');
  const [shape, setShape] = useState<
    | 'cube'
    | 'mur'
    | 'plateforme'
    | 'escalier'
    | 'cadre'
    | 'anneau'
    | 'cercle'
    | 'sphere'
  >('cube');
  const [rotationH, setRotationH] = useState(0);
  const [rotationV, setRotationV] = useState(0);
  const [longueur, setLongueur] = useState(1);
  const [largeur, setLargeur] = useState(1);
  const [hauteur, setHauteur] = useState(1);

  const [voxels, setVoxels] = useState<VoxelPoint[]>([]);
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const voxelsRef = useRef<VoxelPoint[]>([]);
  const modelIdRef = useRef<string | undefined>(modelId);
  const isSavingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  useEffect(() => {
    voxelsRef.current = voxels;
  }, [voxels]);
  useEffect(() => {
    modelIdRef.current = modelId;
  }, [modelId]);

  // Load get signed URL, load GLB, extract voxelData from extras
  useEffect(() => {
    if (!modelId) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await getVoxelModelById(modelId);
        const { name, model: glbKey } = response.data;
        setModelName(name);

        if (glbKey) {
          const { url } = await getSignedUrl(glbKey);
          const saved = await loadVoxelsFromGLB(url);
          if (saved.length > 0) setVoxels(saved);
        }
      } catch (error) {
        if (isNotFoundError(error)) {
          navigate('/not-found', {
            replace: true,
            state: {
              title: 'Modèle Voxel introuvable',
              message: "Cet modèle n'existe pas ou vous n'avez pas accès.",
              backTo: '/app/my-models',
              backLabel: 'Mes modèles',
            },
          });
        } else {
          toast.error('Erreur lors du chargement du modèle');
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [modelId, navigate]);

  // Core save
  const saveModel = useCallback(async () => {
    const id = modelIdRef.current;
    const currentScene = sceneRef.current;
    if (!id || !currentScene || isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // Pass current voxels into the exporter — they get embedded in extras.
      const blob = await exportGLB(currentScene, voxelsRef.current);
      await saveVoxelModel(id, blob);
      setSaveStatus('saved');
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save voxel model:', err);
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  // Auto-save on voxel change (debounced)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    setSaveStatus('pending');
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(saveModel, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [voxels, saveModel]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      saveModel();
    };
  }, [saveModel]);

  // Save on tab close
  useEffect(() => {
    const handleBeforeUnload = () => saveModel();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveModel]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <ResetVoxelDialog
          trigger={
            <SuperButton
              tooltip="Réinitialiser"
              voiceText="Réinitialiser"
              className="z-50 p-2 main-small-btn"
            >
              <span className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4 text-white!" />
              </span>
            </SuperButton>
          }
          description="Cela réinitialisera votre modèle"
          confirmationMessage="Oui, réinitialiser"
          onConfirm={() => {
            setVoxels([]);
            toast.success('Idéorama réinitialisé');
          }}
          onCancel={() => {}}
        />

        {saveStatus !== 'idle' && (
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full
              bg-sidebar-dark backdrop-blur transition-all duration-300
              ${STATUS_COLOR[saveStatus]}`}
          >
            {STATUS_LABEL[saveStatus]}
          </span>
        )}
      </div>

      <div
        className="absolute top-6 left-6 z-50 w-70"
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
      >
        <EditPanel
          modelName={modelName}
          mode={mode}
          setMode={setMode}
          shape={shape}
          setShape={setShape}
          rotationH={rotationH}
          setRotationH={setRotationH}
          rotationV={rotationV}
          setRotationV={setRotationV}
          longueur={longueur}
          setLongueur={setLongueur}
          largeur={largeur}
          setLargeur={setLargeur}
          hauteur={hauteur}
          setHauteur={setHauteur}
        />
      </div>

      <Voxel
        setScene={setScene}
        mode={mode}
        shape={shape}
        rotationH={rotationH}
        rotationV={rotationV}
        longueur={longueur}
        largeur={largeur}
        hauteur={hauteur}
        voxels={voxels}
        onVoxelsChange={setVoxels}
      />
    </div>
  );
}
