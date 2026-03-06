import { useState } from 'react';
import { SubmitHandler, FieldValues } from 'react-hook-form';
import { toast } from 'sonner';

import { register as registerService } from '../../services/auth.service';
import { Form } from '@/components/global';

import { registerInputs } from '@/lib/input';
import { useAuth } from '@/providers/AuthProvider';

export default function Register() {
  const { switchToLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FieldValues> = async data => {
    try {
      setLoading(true);
      await registerService(data);

      switchToLogin();
      toast.success('Création du compte réussie');
    } catch (error: any) {
      toast.error(error.message || 'Échec de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="title">
        <p className="text-[#626262]">
          Créez votre compte et profitez d'Idéarium
        </p>
      </div>

      <Form
        inputs={registerInputs}
        handleOnSubmit={onSubmit}
        loading={loading}
      />

      <div className="w-full text-center">
        Vous avez déjà un compte ?{' '}
        <span
          className="links font-medium cursor-pointer hover:text-[#6F51B0]!"
          onClick={switchToLogin}
        >
          Se connecter
        </span>
      </div>
    </div>
  );
}
