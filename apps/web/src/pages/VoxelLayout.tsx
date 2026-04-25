import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import { Loading } from '@/components/common';
import { SuperButton } from '@/components/common/button';
import EditPanel from '@/components/voxel/panel';
import Voxel, { VoxelPoint } from '@/pages/Voxel';
import { getVoxelModelById, saveVoxelModel } from '@/services/voxel.service';

export default function VoxelLayout() {
  const { modelId } = useParams();

  const [mode, setMode] = useState<'add' | 'remove' | 'paint'>('add');
  const [shape, setShape] = useState<
    'cube' | 'mur' | 'plateforme' | 'escalier'
  >('cube');
  const [rotation, setRotation] = useState(0);

  const [voxels, setVoxels] = useState<VoxelPoint[]>([]);
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // const sceneRef = useRef<THREE.Scene>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
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
          setModelName(response.data.name);
        }
      } catch (error) {
        console.error('Erreur chargement modèle', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [modelId]);

  const exportGLB = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();

      if (!scene) {
        throw new Error('Scene is not initialized');
      }

      const exportScene = scene.clone(true);
      exportScene.traverse(obj => {
        if (obj.name == 'cubeToSave') {
          console.log('scale: ', obj.scale);
          const scale = 0.005;
          obj.scale.set(scale, scale, scale);
          obj.position.multiplyScalar(scale);
          console.log('scale: ', obj.scale);
        } else {
          obj.visible = false;
        }
      });

      console.log('Exporting scene:', scene.children.length);
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

  const handleSave = async () => {
    if (!modelId) return;

    try {
      setIsSaving(true);
      const blob = await exportGLB();
      console.log('Exported GLB blob:', blob);
      await saveVoxelModel(modelId, voxels, blob);
    } catch (error) {
      console.error('Erreur sauvegarde', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setVoxels([]);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full  overflow-hidden relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        <SuperButton
          tooltip="Sauvegarde ton modèle"
          voiceText="Sauvegarde ton modèle"
          onClick={handleSave}
          className="main-btn"
        >
          <Save /> {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </SuperButton>

        <SuperButton
          tooltip="Réinitialise ton modèle"
          voiceText="Réinitialise ton modèle"
          onClick={handleReset}
          className="main-btn"
        >
          <RotateCcw /> Réinitialiser
        </SuperButton>
      </div>

      <div className="absolute top-6 left-6 z-50 w-70">
        <EditPanel
          mode={mode}
          setMode={setMode}
          shape={shape}
          setShape={setShape}
          rotation={rotation}
          setRotation={setRotation}
        />

        <div className="mt-4 p-3 rounded-xl bg-white/80 text-black text-sm">
          <strong>Modèle :</strong> {modelName || 'Sans nom'}
          <br />
          <strong>Voxels :</strong> {voxels.length}
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <Voxel
          setScene={setScene}
          mode={mode}
          shape={shape}
          rotation={rotation}
          voxels={voxels}
          onVoxelsChange={setVoxels}
        />
      </div>
    </div>
  );
}
