import { Request, Response } from 'express';

import { generateToken } from '../../utils/generateToken';
import { validateLogin, validateRegistration } from '../../utils/validations';

import AuthenticationService from './auth.service';

interface UserRequest extends Request {
  body: RegisterInput;
  params: {
    userId: string;
  };
}

async function register(req: UserRequest, res: Response) {
  const errors = await validateRegistration(req.body);
  if (errors.length > 0) return res.status(422).json({ errors });

  try {
    const acc = await AuthenticationService.createAccount(req.body);
    const token = generateToken(acc.user);
    const response = {
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: acc.user,
      },
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const responseError = {
      status: 'error',
      error: {
        code: 'Bad Request',
        message: 'Registration unsuccessful',
        error,
      },

      status_code: 400,
    };
    return res.status(responseError.status_code).json(responseError);
  }
}

async function login(req: Request, res: Response) {
  const { pseudo, password } = req.body;
  const errors = validateLogin(req.body);
  if (errors.length > 0) return res.status(422).json({ errors });

  try {
    const user = await AuthenticationService.loginPseudo(pseudo, password);

    if (user) {
      const token = generateToken(user);
      const response = {
        status: 'success',
        message: 'Login successful',
        data: {
          accessToken: token,
          user: user,
        },
      };
      return res.status(200).json(response);
    } else {
      const responseError = {
        status: 'error',
        error: {
          code: 'Bad Request',
          message: 'Bad Credential',
        },
        status_code: 400,
      };
      return res.status(responseError.status_code).json(responseError);
    }
  } catch (error) {
    const responseError = {
      status: 'error',
      error: {
        code: 'Bad Request',
        message: 'Authentication failed',
        error,
      },
      status_code: 400,
    };
    return res.status(responseError.status_code).json(responseError);
  }
}

export { register, login };
