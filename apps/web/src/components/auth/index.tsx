import { X } from 'lucide-react';

import Login from './Login';
import Register from './Register';
import Reset from './Reset';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthModal() {
  const { mode, isOpen, setIsOpen } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden bg-sidebar! border-[#6F51B0]! [&>button]:hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === 'login' && 'Se connecter'}
            {mode === 'register' && 'Créez votre compte'}
            {mode === 'reset' && 'Réinitialisez votre mot de passe'}
          </DialogTitle>
        </DialogHeader>

        <DialogClose
          className="absolute w-8 h-8 flex justify-center items-center top-3 right-3 text-white hover:text-white/80 bg-[#6F51B0]! rounded-full"
          asChild
        >
          <X className="w-6 h-6" />
        </DialogClose>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {mode === 'login' && <Login />}
          {mode === 'register' && <Register />}
          {mode === 'reset' && <Reset />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
