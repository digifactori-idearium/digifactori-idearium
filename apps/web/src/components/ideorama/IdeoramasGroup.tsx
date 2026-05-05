import { Heart, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { SuperButton } from '@/components/common/button';
import AlertDialog from '@/components/dialog/AlertDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/providers/UserProvider';
import { deleteIdeorama, likeIdeorama } from '@/services/ideorama.service';

const IdeoramasGroup: React.FC<{
  ideoramas: Ideorama[];
  setIdeoramas: React.Dispatch<React.SetStateAction<Ideorama[]>>;
}> = ({ ideoramas, setIdeoramas }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [ideoramaToDelete, setIdeoramaToDelete] = useState<Ideorama | null>(
    null
  );
  const [loadingLike, setLoadingLike] = useState<string | null>(null);

  const handleLike = async (e: React.MouseEvent, ideorama: Ideorama) => {
    e.stopPropagation();

    if (!user) {
      toast.warning('Connectez-vous pour aimer un idéorama');
      return;
    }

    if (loadingLike === ideorama.id) return;

    const isCurrentlyLiked = !!ideorama.likers?.some(l => l.userId === user.id);
    const newLikeCount =
      (ideorama._count?.likers ?? 0) + (isCurrentlyLiked ? -1 : 1);

    setIdeoramas(prev =>
      prev.map(i =>
        i.id === ideorama.id
          ? {
              ...i,
              likers: isCurrentlyLiked
                ? i.likers?.filter(l => l.userId !== user.id)
                : [...(i.likers || []), { userId: user.id }],
              _count: { likers: newLikeCount },
            }
          : i
      )
    );

    try {
      setLoadingLike(ideorama.id);
      await likeIdeorama(ideorama.id);
    } catch {
      // Rollback on error
      setIdeoramas(prev =>
        prev.map(i =>
          i.id === ideorama.id
            ? {
                ...i,
                likers: isCurrentlyLiked
                  ? [...(i.likers || []), { userId: user.id }]
                  : i.likers?.filter(l => l.userId !== user.id),
                _count: { likers: ideorama._count?.likers ?? 0 },
              }
            : i
        )
      );
      toast.error('Erreur lors du like');
    } finally {
      setLoadingLike(null);
    }
  };

  const handleDelete = async () => {
    if (!ideoramaToDelete?.id) return;

    try {
      await deleteIdeorama(ideoramaToDelete.id);
      setIdeoramas(prev => prev.filter(i => i.id !== ideoramaToDelete.id));
      toast.success('Idéorama supprimé avec succès');
    } catch {
      toast.error("Échec lors de la suppression de l'idéorama");
    } finally {
      setIdeoramaToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {ideoramas.map(ideorama => {
        const isLiked = ideorama.likers?.some(l => l.userId === user?.id);
        const isOwner = user?.id === ideorama.userId;

        return (
          <Card
            key={ideorama.id}
            className="overflow-hidden pt-0 bg-sidebar dark:bg-sidebar shadow-[0_0_20px_rgba(0,0,0,0.2)] border-2 border-white/5 dark:border-white/20 relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-[1.03]"
            onClick={() => navigate(`/app/ideorama/${ideorama.id}`)}
          >
            {/* Thumbnail */}
            <CardContent className="px-0 relative overflow-hidden">
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-7.png?width=368&format=auto"
                alt={ideorama.name || ''}
                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Like badge — floated over the image */}
              <button
                disabled={loadingLike === ideorama.id || !user}
                onClick={e => handleLike(e, ideorama)}
                className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                  ${
                    !user
                      ? 'opacity-50 cursor-not-allowed bg-black/50 backdrop-blur-sm text-white'
                      : 'bg-black/50 backdrop-blur-sm text-white text-xs font-bold hover:bg-black/70 transition-all active:scale-90'
                  }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isLiked ? 'fill-rose-400 stroke-rose-400' : 'stroke-white'
                  }`}
                />
                {ideorama._count?.likers ?? 0}
              </button>
            </CardContent>

            {/* Info bar */}
            <div className="px-4 py-2 flex items-center gap-3">
              {/* Avatar — links to profile */}
              <SuperButton
                tooltip={`voir le profile de ${ideorama.user?.profile?.pseudo}`}
                onClick={e => {
                  e.stopPropagation();
                  if (ideorama.userId === user?.id) {
                    navigate(`/app/profile`);
                  } else {
                    navigate(`/app/profile/${ideorama.userId}`);
                  }
                }}
                className="shrink-0 ring-2 size-13 ring-white/10 rounded-full hover:ring-mauve/60 transition-all bg-transparent! p-0!"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      ideorama.user?.profile?.avatar ??
                      'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
                    }
                    alt={ideorama.user?.profile?.pseudo}
                    className="size-11"
                  />
                  <AvatarFallback className="text-sm">
                    {ideorama.user?.profile?.pseudo?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </SuperButton>

              {/* Name + author */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xl text-foreground truncate leading-tight">
                  {ideorama.name}
                </p>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (ideorama.userId === user?.id) {
                      navigate(`/app/profile/${ideorama.userId}`);
                    } else {
                      navigate(`/app/profile`);
                    }
                  }}
                  className="text-sm text-mauve font-medium hover:underline leading-tight bg-transparent! p-0!"
                >
                  {ideorama.user?.profile?.pseudo}
                </button>
              </div>

              {/* Delete — owner only */}
              {isOwner && (
                <SuperButton
                  tooltip={`supprimer ${ideorama.name}`}
                  onClick={e => {
                    e.stopPropagation();
                    setIdeoramaToDelete(ideorama);
                  }}
                  className="shrink-0 p-1.5! rounded-lg text-muted-foreground hover:text-destructive
                    hover:bg-destructive/10 transition-all active:scale-90 bg-transparent "
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </SuperButton>
              )}
            </div>
          </Card>
        );
      })}

      <AlertDialog
        open={ideoramaToDelete != null}
        description={
          <>
            Cela supprimera définitivement l'idéorama{' '}
            <span className="font-bold text-mauve">
              {ideoramaToDelete?.name}
            </span>
          </>
        }
        confirmationMessage="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setIdeoramaToDelete(null)}
      />
    </div>
  );
};

export default IdeoramasGroup;
