import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import { Loading } from '@/components/common';
import { SuperButton } from '@/components/common/button/SuperButton';
import AlertDialog from '@/components/dialog/AlertDialog';
import EditPanel from '@/components/voxel/panel';
import Voxel, { VoxelPoint } from '@/pages/Voxel';
import { autoSaveVoxelModel, getVoxelModelById } from '@/services/voxel.service';

const handleReset = (setVoxels: (VoxelPoints: VoxelPoint[]) => void) => {
    setVoxels([]);
};

const exportGLB = (scene: THREE.Scene): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();

      const exportScene = scene.clone(true);
      exportScene.traverse(obj => {
        if (obj.name == 'cubeToSave') {
          const scale = 0.005;
          obj.scale.set(scale, scale, scale);
          obj.position.multiplyScalar(scale);
        } else {
          obj.visible = false;
        }
      });

      exporter.parse(
        exportScene,
        result => {
          const blob = new Blob([result as BlobPart], {
            type: 'model/gltf-binary',
          });

          console.log('GLB size:', blob.size);

          resolve(blob);
        },
        error => reject(error),
        { binary: true }
      );
    });
  };

export default function VoxelLayout() {
  const { modelId } = useParams<{ modelId: string }>();

  const [mode, setMode] = useState<'add' | 'remove' | 'paint'>('add');
  const [shape, setShape] = useState<'cube' | 'mur' | 'plateforme' | 'escalier' | 'cadre' | 'anneau' | 'cercle' | 'sphere'>('cube');
  const [rotationH, setRotationH] = useState(0);
  const [rotationV, setRotationV] = useState(0);

  const [voxels, setVoxels] = useState<VoxelPoint[]>([]);
  const voxelsRef = useRef(voxels)

  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [longueur, setLongueur] = useState(1)
  const [largeur, setLargeur] = useState(1)
  const [hauteur, setHauteur] = useState(1)

  // 🔹 Charger le modèle
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const sceneRef = useRef(scene)

  // Auto-save voxels in ref whenever they change
  useEffect(() => {
    try {
      voxelsRef.current = voxels
    } catch (err) {
      console.error('Failed to save model:', err);
    }
  }, [voxels]);

  // Auto-save scene in ref whenever it changes
  useEffect(() => {
      sceneRef.current = scene
  }, [scene])

  // Loads the model from the backend
  useEffect(() => {
    if (!modelId) {
      setIsLoading(false);
      return;
    }
    const loadModel = async () => {
      try {
        const response = await getVoxelModelById(modelId);

        if (Array.isArray(response.data.model)) {
          setVoxels(response.data.model);
          setModelName(response.data.name || 'Sans nom');
        }
      } catch (error) {
        console.error('Erreur chargement modèle', error);
        setMessage('Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };
    loadModel();
  }, [modelId]);
  
  // Saves the voxel model when the component is unmounted or on refresh
  const saveModel = () => {
    if(sceneRef.current) {
        exportGLB(sceneRef.current).then(blob => {
          const hasBeenSaved = autoSaveVoxelModel(modelId, JSON.stringify(voxelsRef.current), blob)
          if(!hasBeenSaved) {
            toast.error("error")
          };
        })
      } else {
        console.log("scene is not initialized")
      }
  }
  useEffect(() => {
    return () => {
      saveModel()
    }
  }, []);
  useEffect(() => {
      const handleBeforeUnload = () => {
        saveModel()
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [modelId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full  overflow-hidden relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
      <SuperButton
          tooltip="Réinitialiser"
          voiceText="Réinitialiser"
          onClick={() => {
            setResetDialogOpen(true);
          }}
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
            handleReset(setVoxels)
            toast.success('Idéorama réinitialisé')
            setResetDialogOpen(false);
          }}
          onCancel={() => {
            setResetDialogOpen(false);
          }}
        />
      </div>

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
          {message && (
            <>
              <br />
              <span className="text-xs">{message}</span>
            </>
          )}
        </div>
      </div>

      {/* 🔹 Viewer */}
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