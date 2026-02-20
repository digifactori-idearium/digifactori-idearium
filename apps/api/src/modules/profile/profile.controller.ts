import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';
import { profileSchema, userProfileSchema } from '../../utils/validations';

import { deleteUser, getSingleProfile, updateProfile } from './profile.service';

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

  let profileErrors: any[] = [];
  let userErrors: any[] = [];

  if (req.body.profile) {
    const resultProfileSchema = await profileSchema.safeParseAsync(
      req.body.profile
    );

    if (!resultProfileSchema.success) {
      profileErrors = resultProfileSchema.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
    }
  }

  if (req.body.user) {
    const resultUserSchema = await userProfileSchema.safeParseAsync(
      req.body.user
    );

    if (!resultUserSchema.success) {
      userErrors = resultUserSchema.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
    }
  }

  if (profileErrors.length > 0 || userErrors.length > 0) {
    return res.status(400).json({
      profileErrors,
      userErrors,
    });
  }

  try {
    const profile = await updateProfile(user.userId, req.body);

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'Not Found',
          message: 'Profil non trouvé',
        },
        status_code: 404,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Profil mis à jour avec succès',
      data: profile,
      status_code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la configuration du profil',
        error,
      },
      status_code: 500,
    });
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
