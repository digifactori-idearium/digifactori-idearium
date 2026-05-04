import { Heart, Trash2 } from 'lucide-react';
import React from 'react';
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
  profile: Partial<Profile>;
  setIdeoramas: React.Dispatch<React.SetStateAction<Ideorama[]>>;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}> = ({ ideoramas, profile, setIdeoramas, setProfile }) => {
  const navigate = useNavigate();
  const user = useUser().user;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {ideoramas.map((ideorama, index) => {
        const isLiked = profile.ideoramaLiked?.some(
          liked => liked.ideoramaId === ideorama.id
        );
        const isOwner = profile.userId === user?.id;

        return (
          <Card
            key={index}
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
                onClick={async e => {
                  e.stopPropagation();
                  await likeIdeorama(ideorama.id);
                  if (isLiked) {
                    setProfile(pro => ({
                      ...pro,
                      ideoramaLiked:
                        pro.ideoramaLiked?.filter(
                          l => l.ideoramaId !== ideorama.id
                        ) ?? [],
                    }));
                    setIdeoramas(prev =>
                      prev.map(i =>
                        i.id === ideorama.id
                          ? {
                              ...i,
                              _count: { likers: (i._count?.likers ?? 0) - 1 },
                            }
                          : i
                      )
                    );
                  } else {
                    setProfile(pro => ({
                      ...pro,
                      ideoramaLiked: [
                        ...(pro.ideoramaLiked ?? []),
                        { ideoramaId: ideorama.id },
                      ],
                    }));
                    setIdeoramas(prev =>
                      prev.map(i =>
                        i.id === ideorama.id
                          ? {
                              ...i,
                              _count: { likers: (i._count?.likers ?? 0) + 1 },
                            }
                          : i
                      )
                    );
                  }
                }}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                  bg-black/50 backdrop-blur-sm text-white text-xs font-bold
                  hover:bg-black/70 transition-all active:scale-90"
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
            <div className="px-4 py-3 flex items-center gap-3">
              {/* Avatar — links to profile */}
              <SuperButton
                tooltip={`voir le profile de ${profile.pseudo}`}
                onClick={e => {
                  e.stopPropagation();
                  if (ideorama.userId == profile.userId) {
                    navigate(`/app/profile/${ideorama.userId}`);
                  } else {
                    navigate(`/app/profile`);
                  }
                }}
                className="shrink-0 ring-2 ring-white/10 rounded-full hover:ring-mauve/60 transition-all bg-transparent! p-0!"
              >
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
              </SuperButton>

              {/* Name + author */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate leading-tight">
                  {ideorama.name}
                </p>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (ideorama.userId == profile.userId) {
                      navigate(`/app/profile/${ideorama.userId}`);
                    } else {
                      navigate(`/app/profile`);
                    }
                  }}
                  className="text-xs text-mauve font-medium hover:underline leading-tight bg-transparent! p-0!"
                >
                  {profile.pseudo}
                </button>
              </div>

              {/* Delete — owner only */}
              {isOwner && (
                <AlertDialog
                  trigger={
                    <SuperButton
                      tooltip={`supprimer ${ideorama.name}`}
                      onClick={e => {
                        e.stopPropagation();
                      }}
                      className="shrink-0 p-1.5! rounded-lg text-muted-foreground hover:text-destructive
                    hover:bg-destructive/10 transition-all active:scale-90 bg-transparent "
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </SuperButton>
                  }
                  description={
                    <>
                      Cela supprimera définitivement l'idéorama{' '}
                      <span className="font-bold text-mauve">
                        {ideorama.name}
                      </span>
                    </>
                  }
                  confirmationMessage="Oui, supprimer"
                  onConfirm={() => {
                    deleteIdeorama(ideorama.id).then(res => {
                      if (res) {
                        setIdeoramas(prev =>
                          prev.filter(i => i.id !== ideorama.id)
                        );
                        toast.success('Idéorama supprimé avec succès');
                      } else {
                        toast.error(
                          "Échec lors de la suppression de l'idéorama"
                        );
                      }
                    });
                  }}
                  onCancel={() => {}}
                />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default IdeoramasGroup;
