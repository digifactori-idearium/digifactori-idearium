import { useState } from 'react';
import { SubmitHandler, FieldValues } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { login as loginService } from '../../services/auth.service';

import { Form } from '@/components/global';
import { loginInputs } from '@/lib/input';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';

export default function Login() {
  const navigate = useNavigate();
  const { switchToRegister, switchToRest, setIsOpen } = useAuth();
  const { setToken, removeToken } = useUser();
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FieldValues> = async data => {
    try {
      setLoading(true);
      const response = await loginService(data.pseudo, data.password);
      setToken(response.token);

      navigate('/app');
      setIsOpen(false);
      toast.success('Connexion réussie');
    } catch (error: any) {
      removeToken();
      toast.error(error?.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login w-full flex flex-col gap-5">
      <div className="title">
        <p className="text-[#626262]">Connectez-vous à votre compte</p>
      </div>

      <Form inputs={loginInputs} handleOnSubmit={onSubmit} loading={loading} />

      <div className="action flex justify-between items-center">
        <div className="remember">
          <input
            id="remember"
            className="checked:bg-primary mr-2"
            type="checkbox"
          />
          <label htmlFor="remember" className="font-medium">
            Se souvenir de moi
          </label>
        </div>

        <span
          className="forgot links font-semibold cursor-pointer hover:text-[#6F51B0]!"
          onClick={switchToRest}
        >
          Mot de passe oublié ?
        </span>
      </div>

      <div className="w-full text-center">
        Pas de compte ?{' '}
        <span
          className="links font-medium cursor-pointer hover:text-[#6F51B0]!"
          onClick={switchToRegister}
        >
          S'enregistrer
        </span>
      </div>
    </div>
  );
}
