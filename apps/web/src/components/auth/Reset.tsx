import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { toast } from 'sonner';

import { Form } from '@/components/common/form';
import { resetInputs } from '@/lib/input';
import { useAuth } from '@/providers/AuthProvider';
import { requestPasswordReset } from '@/services/auth.service';

export default function Reset() {
  const { switchToLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FieldValues): Promise<boolean | void> => {
    try {
      setLoading(true);

      await requestPasswordReset(data.email ?? '');

      toast.success('Reset link sent to your email');
      switchToLogin();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="title">
        <p className="text-[#626262]">
          Réinitialisez votre mot de passe pour retrouver l'accès à votre compte
        </p>
      </div>

      <Form inputs={resetInputs} handleOnSubmit={onSubmit} loading={loading} />

      <div className="w-full text-center">
        Remembered your password?{' '}
        <span
          className="links font-medium cursor-pointer hover:text-[#6F51B0]!"
          role="button"
          onClick={switchToLogin}
        >
          Sign in
        </span>
      </div>
    </div>
  );
}
