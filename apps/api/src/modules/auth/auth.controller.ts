import { Request, Response } from 'express';

import { generateToken } from '../../utils/generateToken';
import { registrationSchema, loginSchema } from '../../utils/validations';

import AuthenticationService from './auth.service';

interface UserRequest extends Request {
  body: RegisterInput;
  params: {
    userId: string;
  };
}

async function register(req: UserRequest, res: Response) {
  const result = await registrationSchema.safeParseAsync(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({ errors });
  }

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
        code: 'Internal server error',
        message: 'Registration unsuccessful',
        error,
      },

      status_code: 500,
    };
    return res.status(responseError.status_code).json(responseError);
  }
}

async function login(req: Request, res: Response) {
  const result = await loginSchema.safeParseAsync(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({ errors });
  }

  const { pseudo, email, password } = result.data;

  try {
    let user;

    if (pseudo) {
      user = await AuthenticationService.loginPseudo(pseudo, password);
    } else if (email) {
      user = await AuthenticationService.loginEmail(email, password);
    }

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
        status_code: 401,
      };
      return res.status(responseError.status_code).json(responseError);
    }
  } catch (error) {
    const responseError = {
      status: 'error',
      error: {
        code: 'Internal server error',
        message: 'Authentication failed',
        error,
      },
      status_code: 500,
    };
    return res.status(responseError.status_code).json(responseError);
  }
}

export { register, login };
