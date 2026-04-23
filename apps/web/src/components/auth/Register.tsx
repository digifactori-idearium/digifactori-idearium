import { useState } from 'react';
import { SubmitHandler, FieldValues, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Form } from '@/components/common/form';
import { adminCodeInput, orgCodeInput, registerBaseInputs } from '@/lib/input';
import { useAuth } from '@/providers/AuthProvider';
import { register as registerService } from '@/services/auth.service';

const buildInputs = (role: Role) => {
  const roleIndex = registerBaseInputs.findIndex(i => i.name === 'user.role');

  const conditionalInput =
    role === 'ADMIN'
      ? adminCodeInput
      : role === 'SUPERVISOR'
        ? orgCodeInput
        : null;

  if (!conditionalInput) return registerBaseInputs;

  return [
    ...registerBaseInputs.slice(0, roleIndex + 1),
    conditionalInput,
    ...registerBaseInputs.slice(roleIndex + 1),
  ];
};

export default function Register() {
  const { switchToLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<FieldValues>({
    defaultValues: {},
  });

  // Watch the role field to rebuild the inputs array reactively
  const selectedRole = useWatch({
    control: form.control,
    name: 'user.role',
    defaultValue: '',
  }) as Role;

  const inputs = buildInputs(selectedRole);

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
        inputs={inputs}
        handleOnSubmit={onSubmit}
        loading={loading}
        form={form}
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
