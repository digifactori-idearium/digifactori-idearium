import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import { Loading } from '@/components/common';
import { SuperButton } from '@/components/common/button/SuperButton';
import AlertDialog from '@/components/dialog/AlertDialog';
import EditPanel from '@/components/voxel/panel';
import Voxel, { VoxelPoint } from '@/pages/Voxel';
import { getVoxelModelById, saveVoxelModel } from '@/services/voxel.service';

const exportGLB = (scene: THREE.Scene): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();

    const exportScene = scene.clone(true);
    exportScene.traverse(obj => {
      if (obj.name === 'cubeToSave') {
        const scale = 0.005;
        obj.scale.set(scale, scale, scale);
        obj.position.multiplyScalar(scale);
      } else {
        obj.visible = false;
      }
    });

    exporter.parse(
      exportScene,
      result =>
        resolve(new Blob([result as BlobPart], { type: 'model/gltf-binary' })),
      error => reject(error),
      { binary: true }
    );
  });
};

export default function VoxelLayout() {
  const { modelId } = useParams<{ modelId: string }>();

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
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [scene, setScene] = useState<THREE.Scene | null>(null);

  // Stable refs — always reflect latest values without re-creating saveModel.
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelIdRef = useRef<string | undefined>(modelId);
  const isSavingRef = useRef(false);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  useEffect(() => {
    modelIdRef.current = modelId;
  }, [modelId]);

  // Load model metadata
  useEffect(() => {
    if (!modelId) {
      setIsLoading(false);
      return;
    }

    getVoxelModelById(modelId)
      .then(response => setModelName(response.data.name))
      .catch(() => toast.error('Erreur lors du chargement du modèle'))
      .finally(() => setIsLoading(false));
  }, [modelId]);

  //  Save
  const saveModel = useCallback(async () => {
    const id = modelIdRef.current;
    const currentScene = sceneRef.current;

    if (!id || !currentScene || isSavingRef.current) return;

    isSavingRef.current = true;
    try {
      const blob = await exportGLB(currentScene);
      await saveVoxelModel(id, blob);
    } catch (err) {
      console.error('Failed to save voxel model:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  // Save on unmount.
  useEffect(() => {
    return () => {
      saveModel();
    };
  }, [saveModel]);

  // Save on tab close / refresh.
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveModel();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveModel]);

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-full overflow-hidden relative">
      {/* Top toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        <SuperButton
          tooltip="Réinitialiser"
          voiceText="Réinitialiser"
          onClick={() => setResetDialogOpen(true)}
          className="z-50 p-2 main-small-btn"
        >
          <span className="flex items-center gap-1">
            <RotateCcw className="w-4 h-4 text-white!" />
          </span>
        </SuperButton>

        <AlertDialog
          open={resetDialogOpen}
          description="Cela réinitialisera votre modèle"
          confirmationMessage="Oui, réinitialiser"
          onConfirm={() => {
            setVoxels([]);
            toast.success('Idéorama réinitialisé');
            setResetDialogOpen(false);
          }}
          onCancel={() => setResetDialogOpen(false)}
        />
      </div>

      {/* Left panel */}
      <div className="absolute top-6 left-6 z-50 w-70">
        <EditPanel
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

        <div className="mt-4 p-3 rounded-xl bg-white/80 text-black text-sm">
          <strong>Modèle :</strong> {modelName}
          <br />
          <strong>Voxels :</strong> {voxels.length}
        </div>
      </div>

      {/* Voxel editor */}
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
