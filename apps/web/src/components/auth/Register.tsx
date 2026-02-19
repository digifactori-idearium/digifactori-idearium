import { useState } from 'react';
import { SubmitHandler, FieldValues } from 'react-hook-form';
import { toast } from 'sonner';

import { register as registerService } from '../../services/auth.service';
import Form from '../global/Form';

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
      toast.success('Account Created Successfully');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="title">
        <p className="text-[#626262]">
          Create your account and enjoy exclusive features
        </p>
      </div>

      <Form
        inputs={registerInputs}
        handleOnSubmit={onSubmit}
        loading={loading}
      />

      <div className="w-full text-center">
        Already have an account?{' '}
        <span
          className="links font-medium cursor-pointer hover:text-[#6F51B0]!"
          onClick={switchToLogin}
        >
          Sign in
        </span>
      </div>
    </div>
  );
}
