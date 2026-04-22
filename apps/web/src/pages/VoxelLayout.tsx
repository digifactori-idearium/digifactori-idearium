import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { SuperButton } from '@/components/common/button';
import EditPanel from '@/components/voxel/panel';
import Voxel, { VoxelPoint } from '@/pages/Voxel';
import {
  getVoxelModelById,
  saveVoxelModel,
} from '@/services/voxel.service';

export default function VoxelLayout() {
  const { modelId } = useParams<{ modelId: string }>();

  const [mode, setMode] = useState<'add' | 'remove' | 'paint'>('add');
  const [shape, setShape] = useState<'cube' | 'mur' | 'plateforme' | 'escalier' | 'cadre' | 'anneau' | 'cercle' | 'sphere'>('cube');
  const [rotationH, setRotationH] = useState(0);
  const [rotationV, setRotationV] = useState(0);

  const [voxels, setVoxels] = useState<VoxelPoint[]>([]);
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [longueur, setLongueur] = useState(1)
  const [largeur, setLargeur] = useState(1)
  const [hauteur, setHauteur] = useState(1)

  // 🔹 Charger le modèle
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

  // 🔹 Sauvegarde
  const handleSave = async () => {
    if (!modelId) {
      setMessage('Aucun modèle à sauvegarder');
      return;
    }

    try {
      setIsSaving(true);
      setMessage('');

      await saveVoxelModel(modelId, voxels);

      setMessage('Modèle sauvegardé ✅');
    } catch (error) {
      console.error('Erreur sauvegarde', error);
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // 🔹 Reset
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
      {/* 🔹 Boutons */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        <SuperButton onClick={handleSave} className="main-btn">
          <Save /> {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </SuperButton>

        <SuperButton onClick={handleReset} className="main-btn">
          <RotateCcw /> Réinitialiser
        </SuperButton>
      </div>

      {/* 🔹 Panel */}
      <div className="absolute top-6 left-6 z-50 w-[280px]">
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