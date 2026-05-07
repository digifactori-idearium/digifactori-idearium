import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SuperButton } from '@/components/common/button/SuperButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUser } from '@/providers/UserProvider';
import { followUser } from '@/services/profile.service';

type User = {
  pseudo: string;
  avatar: string | null;
  userId: string;
};

interface UsersListProps {
  users: User[];
  title: string;
  trigger: React.ReactNode;
  currentUserFollowing: string[];
  onFollowChange: (userId: string, isNowFollowing: boolean) => void;
}

export function UsersList({
  users,
  title,
  trigger,
  currentUserFollowing,
  onFollowChange,
}: UsersListProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  console.log('users:', users);
  const filtered = users.filter(user =>
    user.pseudo.toLowerCase().includes(search.toLowerCase())
  );
  const user = useUser().user;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-sidebar">
        <DialogHeader>
          <DialogTitle className="flex justify-center">{title}</DialogTitle>
        </DialogHeader>
        <Field>
          <Input
            id="user-search"
            placeholder="Écrivez pour rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Field>

        <div className="mt-2 max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1.5 text-sm">
              Aucun utilisateur.
            </p>
          ) : (
            filtered.map(u => {
              const isFollowing = currentUserFollowing.includes(u.userId);
              return (
                <div key={u.userId} className="flex gap-3 items-center">
                  <Avatar className="h-8 w-8 border-2 border-white/20 shadow-sm shrink-0">
                    <AvatarImage
                      src={
                        u.avatar ||
                        'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
                      }
                      alt="Profile"
                    />
                    <AvatarFallback>{u.pseudo}</AvatarFallback>
                  </Avatar>
                  <SuperButton
                    className="bg-transparent p-0 text-lg font-semibold text-mauve hover:bg-transparent"
                    tooltip={`Voir le profil de ${u.pseudo}`}
                    onClick={e => {
                      e.stopPropagation();
                      setOpen(false);
                      navigate(`/app/profile/${u.userId}`);
                    }}
                  >
                    {u.pseudo}
                  </SuperButton>
                  <div className="flex justify-end ml-auto">
                    {isFollowing ? (
                      <SuperButton
                        className="ml-auto hover:bg-green-500/50 bg-green-500 text-white! text-xs! px-2! py-0.5! rounded-full! flex items-center gap-1 h-auto! min-h-0! font-normal!"
                        tooltip={`Se désabonner de ${u.pseudo}`}
                        onClick={e => {
                          e.stopPropagation();
                          followUser(u!.userId);
                          onFollowChange(u.userId, false);
                        }}
                      >
                        Abonné
                      </SuperButton>
                    ) : (
                      u.userId !== user?.id && (
                        <SuperButton
                          className="ml-auto hover:bg-mauve/40 text-white! text-xs! px-2! py-0.5! rounded-full! flex items-center gap-1 bg-mauve/80 h-auto! min-h-0! font-normal!"
                          tooltip={`S'abonner à ${u.pseudo}`}
                          onClick={e => {
                            e.stopPropagation();
                            followUser(u!.userId);
                            onFollowChange(u.userId, true);
                          }}
                        >
                          S'abonner
                        </SuperButton>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
