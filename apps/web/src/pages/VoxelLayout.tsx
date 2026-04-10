import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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

  const handleSave = async () => {
    if (!modelId) return;

    try {
      setIsSaving(true);
      await saveVoxelModel(modelId, voxels);
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
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Chargement du modèle...
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
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

      <div className="absolute top-6 left-6 z-50 w-[280px]">
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

      <Voxel
        mode={mode}
        shape={shape}
        rotation={rotation}
        voxels={voxels}
        onVoxelsChange={setVoxels}
      />
    </div>
  );
}
