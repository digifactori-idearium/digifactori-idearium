import { useState } from 'react';
import { SubmitHandler, FieldValues } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { login as loginService } from '../../services/auth.service';
import Form from '../global/Form';

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
      toast.success('Login Successfully');
    } catch (error: any) {
      removeToken();
      toast.error(error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login w-full flex flex-col gap-5">
      <div className="title">
        <p className="text-[#626262]">
          Login to your account - enjoy exclusive features & many more
        </p>
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
            Remember me
          </label>
        </div>

        <span
          className="forgot links font-semibold cursor-pointer hover:text-[#6F51B0]!"
          onClick={switchToRest}
        >
          Forget password?
        </span>
      </div>

      <div className="w-full text-center">
        Don't have an account?{' '}
        <span
          className="links font-medium cursor-pointer hover:text-[#6F51B0]!"
          onClick={switchToRegister}
        >
          Sign Up
        </span>
      </div>
    </div>
  );
}
