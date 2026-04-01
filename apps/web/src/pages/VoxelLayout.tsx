import { useState } from 'react';

import EditPanel from '@/components/voxel/panel';
import Voxel, { VoxelPoint } from '@/pages/Voxel';
import {
  createVoxelModel,
  getVoxelModelById,
  saveVoxelModel,
} from '@/services/voxel.service';

export default function VoxelLayout() {
  const [mode, setMode] = useState<'add' | 'remove' | 'paint'>('add');
  const [shape, setShape] = useState<'cube' | 'mur' | 'plateforme' | 'escalier'>('cube');
  const [rotation, setRotation] = useState(0);
  const [voxels, setVoxels] = useState<VoxelPoint[]>([]);
  const [currentModelId, setCurrentModelId] = useState('');
  const [modelName, setModelName] = useState('My Voxel Model');
  const [loadModelId, setLoadModelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [taille, setTaille] = useState(1)
  const handleCreateModel = async () => {
    try {
      setMessage('');
      const response = await createVoxelModel(modelName);
      setCurrentModelId(response.data.id);
      setMessage(`Modèle créé : ${response.data.id}`);
    } catch (error: any) {
      setMessage(error.message || 'Erreur lors de la création du modèle');
    }
  };

  const handleSaveModel = async () => {
    if (!currentModelId) {
      setMessage('Crée d’abord un modèle avant de sauvegarder.');
      return;
    }

    try {
      setIsSaving(true);
      setMessage('');
      await saveVoxelModel(currentModelId, voxels);
      setMessage('Modèle sauvegardé avec succès.');
    } catch (error: any) {
      setMessage(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadModel = async () => {
    if (!loadModelId) {
      setMessage('Entre un id de modèle à charger.');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      const response = await getVoxelModelById(loadModelId);

      const loadedModel = response.data.model;

      if (Array.isArray(loadedModel)) {
        setVoxels(loadedModel);
        setCurrentModelId(response.data.id);
        setModelName(response.data.name);
        setMessage('Modèle chargé avec succès.');
      } else {
        setMessage('Le modèle chargé est invalide.');
      }
    } catch (error: any) {
      setMessage(error.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ width: 320, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <EditPanel
          mode={mode}
          setMode={setMode}
          shape={shape}
          setShape={setShape}
          rotation={rotation}
          setRotation={setRotation}
          taille={taille}
          setTaille={setTaille}
        />

        <hr />

        <div>
          <label>Nom du modèle</label>
          <input
            value={modelName}
            onChange={e => setModelName(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <button onClick={handleCreateModel}>Créer modèle</button>

        <div>
          <label>ID du modèle courant</label>
          <input
            value={currentModelId}
            readOnly
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <button onClick={handleSaveModel} disabled={isSaving}>
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>

        <hr />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="load-model-id">ID du modèle à charger</label>
          <input
            id="load-model-id"
            type="text"
            placeholder="Colle ici l'id du modèle"
            value={loadModelId}
            onChange={e => setLoadModelId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: 4,
              border: '1px solid #999',
              borderRadius: 8,
              backgroundColor: '#fff',
              color: '#000',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button onClick={handleLoadModel} disabled={isLoading}>
          {isLoading ? 'Chargement...' : 'Charger'}
        </button>

        {message && (
          <div style={{ padding: 10, background: '#f3f3f3', borderRadius: 8 }}>
            {message}
          </div>
        )}

        <div>
          <strong>Nombre de voxels :</strong> {voxels.length}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <Voxel
          mode={mode}
          shape={shape}
          rotation={rotation}
          taille={taille}
          voxels={voxels}
          onVoxelsChange={setVoxels}
        />
      </div>
    </div>
  );
}