import { Loader2, Lock, Trash2, UserCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getProfile, updateProfile } from '../services/profile.service';

import Form from '@/components/global/Form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUser } from '@/providers/UserProvider';

const AVATAR_OPTIONS = [
  { id: 1, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Noah' },
  { id: 2, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { id: 3, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma' },
  { id: 4, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie' },
  { id: 5, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lily' },
];

const ProfilePage: React.FC = () => {
  const { getUser, removeToken } = useUser();
  const [acc, setAcc] = useState<{ profile: any; user?: any } | null>(null);
  const [parentalAccess, setParentalAccess] = useState(
    getUser()?.role != 'CHILD'
  );
  const [parentalCodeInput, setParentalCodeInput] = useState('');
  const [open, setOpen] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setAcc(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleUnlock = async () => {
    if (!parentalCodeInput) {
      toast.error('Veuillez entrer un code');
      return;
    }

    try {
      const response = await getProfile(parentalCodeInput);

      if (response.data && response.data.user) {
        setAcc(response.data);
        setParentalAccess(true);
        toast.success('Accès autorisé');
      } else {
        toast.error('Code parental incorrect');
      }
    } catch {
      toast.error('Erreur de validation du code');
    }
  };

  if (!acc) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 /> Loading
      </div>
    );
  }

  // Form initial values
  const initialValues = {
    pseudo: acc.profile.pseudo || '',
    bio: acc.profile.bio || '',
    avatar: acc.profile.avatar || AVATAR_OPTIONS[0].url,
  };

  const advancedInitialValues = {
    email: acc.user?.email || '',
    first_name: acc.user?.first_name || '',
    last_name: acc.user?.last_name || '',
    role: acc.user?.role || '',
    parental_code: acc.user?.parental_code ? '****' : '',
  };

  const handleSubmit = async (data: any) => {
    try {
      await updateProfile(acc.user, data);
      setAcc(prev => (prev ? { ...prev, profile: data } : prev));
      toast.success('Profil mis à jour !');
    } catch (err) {
      console.error(err);
      toast.error('Échec de la mise à jour du profil.');
    }
  };

  const handleAdvancedSubmit = async (data: any) => {
    try {
      const payload = { ...data };

      if (payload.parental_code === '****') {
        delete payload.parental_code;
      }

      await updateProfile(payload, acc.profile);
      setAcc(prev =>
        prev ? { ...prev, user: { ...prev.user, ...data } } : prev
      );

      const currentRole = acc.user?.role;
      const newRole = data.role;

      if (currentRole && newRole && currentRole !== newRole) {
        toast.success('Rôle mis à jour. Veuillez vous reconnecter.');
        removeToken();
        return;
      }

      toast.success('Profil mis à jour !');
    } catch {
      setOpen(false);
      const res = await getProfile();
      setAcc(res.data);
      toast.error('Échec de la mise à jour du profil.');
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 flex-col md:flex-row justify-around items-center py-4">
        <div className="flex gap-2 justify-center items-center py-4">
          <UserCircle className="w-12! h-12! text-mauve" />
          <h1 className="magic-text text-center w-fit md:text-5xl! text-3xl!">
            MON PROFILE
          </h1>
        </div>
        {/* Advanced Settings */}
        <div>
          <Dialog
            open={open}
            onOpenChange={isOpen => {
              setOpen(isOpen);

              if (!isOpen) {
                setParentalAccess(getUser()?.role != 'CHILD');
                setParentalCodeInput('');
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 form-button">
                <Lock className="w-4 h-4" />
                Paramètres avancés
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden bg-sidebar! border-mauve! [&>button]:hidden">
              <DialogHeader>
                <DialogTitle>
                  {parentalAccess ? 'Account Setting' : 'Enter Parental Code'}
                </DialogTitle>
              </DialogHeader>

              {parentalAccess && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="absolute top-3 right-14">
                      <Button className=" w-8 h-8 flex justify-center items-center bg-red-300! text-red-700! rounded-full">
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="rounded-4xl border-mauve! bg-sidebar!  shadow-2xl p-8">
                    <AlertDialogHeader className="flex flex-col items-center justify-center">
                      <AlertDialogTitle className="text-2xl mx-auto font-black text-mauve text-center!">
                        Êtes-vous sûr ?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-slate-500  text-center text-lg">
                        Cela supprimera définitivement le profil de{' '}
                        <span className="font-bold text-mauve">
                          {acc.profile.pseudo}
                        </span>
                        . Cette action ne peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-4">
                      <AlertDialogCancel className="p-4 form-button font-bold ">
                        Non, gardez-le.
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => console.log('Deleting profile...')}
                        className="danger-btn"
                      >
                        Oui, supprimer le profil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <DialogClose
                className="absolute w-8 h-8 flex justify-center items-center top-3 right-3 text-white hover:text-white/80 bg-mauve! rounded-full"
                asChild
              >
                <X className="w-6 h-6" />
              </DialogClose>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {parentalAccess ? (
                  <div className="p-3">
                    <Form
                      inputs={[
                        {
                          label: 'Email',
                          type: 'email',
                          name: 'email',
                          required: true,
                        },
                        {
                          label: 'First Name',
                          type: 'text',
                          name: 'first_name',
                        },
                        { label: 'Last Name', type: 'text', name: 'last_name' },
                        {
                          label: 'Role',
                          type: 'select',
                          name: 'role',
                          options: [
                            { text: 'Enfant', value: 'CHILD' },
                            { text: 'Superviseur', value: 'SUPERVISOR' },
                          ],
                        },
                        {
                          label: 'Change Parental Code',
                          type: 'text',
                          name: 'parental_code',
                        },
                      ]}
                      initialValues={advancedInitialValues}
                      handleOnSubmit={handleAdvancedSubmit}
                    />
                  </div>
                ) : (
                  <>
                    <Input
                      type="password"
                      placeholder="0 0 0 0"
                      maxLength={4}
                      className="mt-4 mb-4 text-center text-lg"
                      value={parentalCodeInput}
                      onChange={e => setParentalCodeInput(e.target.value)}
                    />
                    <Button
                      onClick={handleUnlock}
                      className="w-full text-foreground!"
                    >
                      Unlock
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="h-full w-full flex md:flex-row flex-col justify-center items-center md:gap-8 gap-1">
        {/* Avatar */}
        <div className="flex flex-col gap-3 justify-center items-center md:w-2/6 w-full">
          <div className="w-32 h-32 rounded-full border-4 p-1">
            <Avatar className="w-full h-full">
              <AvatarImage src={initialValues.avatar} />
              <AvatarFallback>NB</AvatarFallback>
            </Avatar>
          </div>
          <p className="magic-text py-1!">{acc.profile.pseudo}</p>
          {/* Avatar Selection */}
          <div className="grid grid-cols-3 grid-rows-2 gap-6 mb-10 w-fit mx-auto">
            {AVATAR_OPTIONS.map(av => (
              <button
                key={av.id}
                onClick={() =>
                  setAcc(prev =>
                    prev
                      ? {
                          ...prev,
                          profile: { ...prev.profile, avatar: av.url },
                        }
                      : prev
                  )
                }
                className={`w-16 h-16 p-1! rounded-full overflow-hidden border-2 transition-all ${
                  acc.profile.avatar === av.url
                    ? 'border-orange-500 scale-110 shadow-md'
                    : 'border-transparent opacity-50'
                }`}
              >
                <img
                  src={av.url}
                  alt="avatar option"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:4/6 md:w-3/6 w-full p-3">
          <Form
            inputs={[
              { label: 'Pseudo', type: 'text', name: 'pseudo', required: true },
              { label: 'Bio', type: 'textarea', name: 'bio' },
              // { label: 'Avatar URL', type: 'text', name: 'avatar' },
            ]}
            initialValues={initialValues}
            handleOnSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
