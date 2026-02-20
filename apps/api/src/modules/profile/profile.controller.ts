import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';
import { profileSchema, userSchema } from '../../utils/validations';

import {
	deleteUser,
	getSingleProfile,
	updateProfile,
	verifyPassword,
} from './profile.service';

/**
 *
 * @param req
 * @param res {status: string, status_code: int, error?: {code: string, message: string}, data?: {
 *     profile: Profile,
 *     user?: User
 * } where: - error is set if an error occurs, data is set otherwise
 *          - User is set if the auth user has the "SUPERVISOR" role or if the parental_code in the body of req corresponds to its correct
 *            parental_code
 * }
 * @returns res
 */
const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "Vous n'avez pas les droits d'accès",
      },
      status_code: 401,
    });
  }

  try {
    const user = await getSingleProfile(
      currentUser?.userId,
      req.body.parental_code
    );
    if (user.profile) {
      const response = {
        status: 'success',
        message: 'Utilisateur trouvé',
        data: user,
      };
      return res.status(200).json(response);
    } else {
      return res.status(404).json({
        status: 'error',
        error: { code: 'Not Found', message: "Cet utilisateur n'existe pas" },
        status_code: 404,
      });
    }
  } catch (error: any) {
    const responseError = {
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la rechercher de votre profil',
        error: error,
      },
      status_code: 500,
    };
    return res.status(responseError.status_code).json(responseError);
  }
};

const setProfile = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "Vous n'avez pas les droits d'accès",
      },
      status_code: 401,
    });
  }
  const test = await verifyPassword(user.userId, req.body.password);
  if (!test) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Bad Request',
        message: 'Mot de passe erroné',
      },
      status_code: 401,
    });
  }

  const resultProfileSchema = await profileSchema.safeParseAsync(
    req.body.profile
  );
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
        message: 'Profil récupéré avec succès',
        data: profile,
        status_code: 201,
      };
      return res.status(response.status_code).json(response);
    } else {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'Not Found',
          message: 'Profil non trouvé',
        },
        status_code: 404,
      });
    }
  } catch (error) {
    const responseError = {
      status: 'error',
      error: {
        code: 'Bad Request',
        message: 'Erreur lors de la configuration du profil',
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
        message: "Vous n'avez pas les droits d'accès",
      },
      status_code: 401,
    });
  }

  try {
    const deleted = await deleteUser(user.userId);
    const response = {
      status: 'success',
      message: 'Utilisateur supprimé avec succès',
      data: deleted,
      status_code: 201,
    };
    return res.status(response.status_code).json(response);
  } catch {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Error',
        message: "Erreur lors de la suppression de l'utilisateur",
      },
      status_code: 401,
    });
  }
};

export { deleteProfile, getProfile, setProfile };

