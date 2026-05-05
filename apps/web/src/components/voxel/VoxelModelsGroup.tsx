import { Box, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { SuperButton } from '@/components/common/button';
import AlertDialog from '@/components/dialog/AlertDialog';
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
          className="overflow-hidden pt-0 bg-sidebar dark:bg-sidebar shadow-[0_0_20px_rgba(0,0,0,0.2)] border-2 border-white/5 dark:border-white/20 relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-[1.03]"
          onClick={() => navigate(`/app/voxel/${model.id}`)}
        >
          {/* Thumbnail */}
          <CardContent className="px-0 relative overflow-hidden">
            <div className="aspect-video w-full bg-linear-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <Box className="w-12 h-12 text-white/20 absolute" />
              <span className="text-white text-sm font-bold text-center px-4 truncate z-10">
                {model.name}
              </span>
            </div>

            {/* Voxel count badge */}
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
              bg-black/50 backdrop-blur-sm text-white text-xs font-bold pointer-events-none"
            >
              <Box className="w-3.5 h-3.5" />
              3D
            </div>
          </CardContent>

          {/* Info bar */}
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Avatar */}
            <div className="shrink-0 ring-2 ring-white/10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={
                    profile.avatar ??
                    'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
                  }
                  alt={profile.pseudo}
                />
                <AvatarFallback className="text-xs">
                  {profile.pseudo?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name + author */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate leading-tight">
                {model.name}
              </p>
              <p className="text-xs text-mauve font-medium leading-tight truncate">
                {profile.pseudo}
              </p>
            </div>

            {/* Delete */}
            <SuperButton
              tooltip={`supprimer ${model.name}`}
              onClick={e => {
                e.stopPropagation();
                setModelToDelete(model);
              }}
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive bg-transparent
                hover:bg-destructive/10 transition-all active:scale-90"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </SuperButton>
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
          if (!modelToDelete?.id) return;
          deleteVoxelModel(modelToDelete.id).then(res => {
            if (res) {
              setModels(prev => prev.filter(m => m.id !== modelToDelete.id));
              toast.success('Modèle supprimé avec succès');
            } else {
              toast.error('Échec lors de la suppression du modèle');
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
