import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';
import { profileSchema, userSchema } from '../../utils/validations';

import { deleteUser, getSingleProfile, updateProfile, verifyPassword } from './profile.service';

const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "You don't have access",
      },
      status_code: 401,
    });
  }

    try {
        const user = await getSingleProfile(currentUser?.userId, !!req.params.code );
        if (user) {
            const response = {
                status: 'success',
                message: 'User found',
                data: user,
            };
            return res.status(200).json(response);
        } else {
            return res.status(404).json({
                status: 'error',
                error: { code: 'Not Found', message: "This user doesn't exist" },
                status_code: 404,
            });
        }
    } catch (error: any) {
        const responseError = {
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Errer Getting Your User Profile',
                error: error
            },
            status_code: 500,
        };
        return res.status(responseError.status_code).json(responseError);
    }
}

const setProfile = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "You don't have access",
      },
      status_code: 401,
    });
  }
  const test = await verifyPassword(user.userId, req.body.password);
  if(!test) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: 'Bad Request',
          message: 'Bad Password',
        },
        status_code: 401,
      });
  }

  const resultProfileSchema = await profileSchema.safeParseAsync(req.body.profile);
  const resultUserSchema = await userSchema.safeParseAsync(req.body.user);

  if (!resultProfileSchema.success || !resultUserSchema.success) {
    let profileErrors = {};
    let userErrors = {};
  
    if (!resultProfileSchema.success) {
      profileErrors = resultProfileSchema.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

    }

    if (!resultUserSchema.success) {
      userErrors = resultUserSchema.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

    }
    return res.status(400).json({ profileErrors, userErrors });
  }

  // if (req.file) {
  //     const file = req.file;
  //     if (file.filename != 'null') {
  //         req.body[file.fieldname] = file.filename;
  //     }
  // }

  try {
    const profile = await updateProfile(user?.userId, req.body);
    if (profile) {
      const response = {
        status: 'success',
        message: 'Profile retrieved successfully',
        data: profile,
        status_code: 201,
      };
      return res.status(response.status_code).json(response);
    } else {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'Not Found',
          message: 'Profile not found',
        },
        status_code: 404,
      });
    }
  } catch (error) {
    const responseError = {
      status: 'error',
      error: {
        code: 'Bad Request',
        message: 'Error setting profile',
        error: error,
      },
      status_code: 400,
    };
    return res.status(responseError.status_code).json(responseError);
  }
};

const deleteProfile = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
  if (!user) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "You don't have access",
      },
      status_code: 401,
    });
  }

  try {
    const deleted = await deleteUser(user.userId);
    const response = {
      status: 'success',
      message: 'User deleted successfully',
      data: deleted,
      status_code: 201,
    }
    return res.status(response.status_code).json(response);
  } catch {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Error',
        message: "Error while deleting user",
      },
      status_code: 401,
    })
  }
}

export { deleteProfile, getProfile, setProfile };

