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

type User = {
  pseudo: string;
  avatar: string | null;
  userId: string;
};

interface UsersListProps {
  users: User[];
  title: string;
  trigger: React.ReactNode;
}

export function UsersList({ users, title, trigger }: UsersListProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const filtered = users.filter(user =>
    user.pseudo.toLowerCase().includes(search.toLowerCase())
  );

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
            filtered.map(user => (
              <div className="flex gap-3 items-center">
                <Avatar className="h-8 w-8 border-2 border-white/20 shadow-sm shrink-0">
                  <AvatarImage
                    src={
                      user.avatar ||
                      'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
                    }
                    alt="Profile"
                  />
                  <AvatarFallback>{user.pseudo}</AvatarFallback>
                </Avatar>
                <SuperButton
                  className="bg-transparent p-0 text-lg font-semibold text-mauve hover:bg-transparent"
                  tooltip={`Voir le profil de ${user.pseudo}`}
                  onClick={e => {
                    e.stopPropagation();
                    setOpen(false);
                    navigate(`/app/profile/${user.userId}`);
                  }}
                >
                  {user.pseudo}
                </SuperButton>
              </div>
              // </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
