import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AlertDialog from '../dialog/AlertDialog';


import { SuperButton } from '@/components/common/button/SuperButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { deleteVoxelModel, VoxelModel } from '@/services/voxel.service';

const VoxelModelsGroup: React.FC<{
  models: VoxelModel[];
  profile: Partial<Profile>;
  setModels: React.Dispatch<React.SetStateAction<VoxelModel[]>>;
}> = ({ models, profile, setModels }) => {
  const navigate = useNavigate();
  const [modelToDelete, setModelToDelete] = useState<VoxelModel | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {models.map((model, index) => (
        <Card
          key={model.id ?? index}
          className="overflow-hidden pt-0 bg-sidebar dark:bg-sidebar shadow-[0_0_20px_rgba(0,0,0,0.2)] border-2 border-white/5 dark:border-white/20 group-hover:border-white/20 relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-107"
          onClick={() => {
            navigate(`/app/voxel/${model.id}`);
          }}
        >
          <CardContent className="px-0">
            <div className="aspect-video w-full bg-linear-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold text-center px-4">
                {model.name}
              </span>
            </div>
          </CardContent>

          <div className="flex items-center justify-between px-6 pt-4">
            <div className="space-y-2">
              <p className="text-xl font-bold tracking-tight text-foreground/90">
                {model.name}
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground/90">
                {profile.pseudo}
              </p>

              <SuperButton
                tooltip="Supprime ton modèle"
                voiceText="Supprime ton modèle"
                onClick={e => {
                  e.stopPropagation();
                  setModelToDelete(model);
                }}
                className="main-btn"
              >
                <Trash2 /> Supprimer
              </SuperButton>
            </div>

            <Avatar className="h-14 w-14 border-2 border-white/20 shadow-sm shrink-0">
              <AvatarImage
                src={
                  profile.avatar ||
                  'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
                }
                alt="Profile"
              />
              <AvatarFallback>{profile.pseudo}</AvatarFallback>
            </Avatar>
          </div>
        </Card>
      ))}
      <AlertDialog
        open={modelToDelete != null}
        description={
          <>
            Cela supprimera définitivement le modèle{' '}
            <span className="font-bold text-mauve">{modelToDelete?.name}</span>
          </>
        }
        confirmationMessage="Oui, supprimer"
        onConfirm={() => {
          deleteVoxelModel(modelToDelete?.id).then(res => {
            if (res) {
              setModels(prev =>
                prev.filter(model => model.id !== modelToDelete?.id)
              );
              toast.success('modèle supprimé avec succès');
            } else {
              toast.error("Échec lors de la suppression du modèle");
            }
          });
          setModelToDelete(null);
        }}
        onCancel={() => setModelToDelete(null)}
      />
    </div>
  );
};

export default VoxelModelsGroup;
