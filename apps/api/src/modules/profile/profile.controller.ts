import { Profile, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';
import { profileSchema, userProfileSchema } from '../../utils/validations';

import { deleteUser, getSingleProfile, getSingleUser, updateProfile } from './profile.service';

/**
 * Finds a profile based on its ID. Adds all user data if the user is a SUPERVISOR or if the parental code is correct.
 *
 * @param req - Express request object. Expects 'req.body.parentalCode' (String)
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: "Profile récupéré avec succès",
 *    data: the profile, and the user if needed ({profile: Profile, user?: user}}),
 *    status_code: 200
 *  }
 * - 401 if the user is not authenticated
 * - 404 if the user or the profile is not found
 * - 500 if an unexpected error occurs
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
    const profile = await getSingleProfile(currentUser.userId);
    if(!profile) {
      console.log("profile not found")
      return res.status(404).json({
        status: 'error',
        message: 'Profile non trouvé',
        status_code: 404
      });
    }
    const data: {profile: Profile, user?: User} = {profile: profile};
    const user = await getSingleUser(currentUser?.userId)
    if (!user) {
      console.log("user not found")
      return res.status(404).json({
        status: 'success',
        message: 'Utilisateur non trouvé',
        status_code: 404
      });
    }

    // Checks if the user info should be added in the response
    let isParentalCodeValid = false;
    if (req.body.parental_code && user.parental_code) {
      isParentalCodeValid = await bcrypt.compare(
        req.body.parental_code,
        user.parental_code
      );
    }
    if (user.role !== 'CHILD' || isParentalCodeValid) {
      data.user = user;
    }
    return res.status(200).json({
      status: 'success',
      message: 'Profil récupéré avec succès',
      data: data,
      status_code: 404,
    });
  } catch (error: any) {
    const responseError = {
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la recherche de votre profil',
        error: error,
      },
      status_code: 500,
    };
    return res.status(responseError.status_code).json(responseError);
  }
};

/**
 * Updates the profile.
 *
 * @param req - Express request object. Expects 'req.body.profile' (Profile)
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: "Profil mis à jour avec succès",
 *    data: the updated profile (Profile),
 *    status_code: 200
 *  }
 * - 400 if the new data is not well-formatted
 * - 401 if the user is not authenticated
 * - 404 if the profile is not found
 * - 500 if an unexpected error occurs
 */
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

/**
 * Deletes the profile and the user to which it belongs.
 *
 * @param req - Express request object. Expects 'req.user.userId' (String)
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: "Profil supprimé avec succès",
 *    data: the new ideorama (Ideorama),
 *    status_code: 200
 *  }
 * - 401 if the user is not authenticated
 * - 500 if an unexpected error occurs
 */
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
      message: 'Profil supprimé avec succès',
      data: deleted,
      status_code: 201,
    };
    return res.status(response.status_code).json(response);
  } catch {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Error',
        message: "Erreur lors de la suppression de l'utilisateur",
      },
      status_code: 500,
    });
  }
};

export { deleteProfile, getProfile, setProfile };

