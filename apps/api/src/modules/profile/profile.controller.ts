import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';
import { profileSchema } from '../../utils/validations';

import { getSingleProfile, updateProfile } from './profile.service';

async function profile(req: AuthenticatedRequest, res: Response) {
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
        const user = await getSingleProfile(currentUser?.userId, req.params.code ? true : false );
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

  const result = await profileSchema.safeParseAsync(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({ errors });
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
        message: 'Employer profile retrieved successfully',
        data: { ...profile },
        status_code: 201,
      };
      return res.status(response.status_code).json(response);
    } else {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'Not Found',
          message: 'Employer profile not found',
        },
        status_code: 404,
      });
    }
  } catch (error) {
    const responseError = {
      status: 'error',
      error: {
        code: 'Bad Request',
        message: 'Error setting employer profile',
        error: error,
      },
      status_code: 400,
    };
    return res.status(responseError.status_code).json(responseError);
  }
};

export { profile, setProfile };

