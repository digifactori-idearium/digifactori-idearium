import { Profile, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { profileSchema, userProfileSchema } from '../../utils/validations';

import { deleteUser, getSingleProfile, getSingleUser, updateProfile } from './profile.service';

import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';

/**
 * Retrieves a single user profile with associated user data
 *
 * @description Fetches the profile of the authenticated user or a linked user if authorized.
 * User can access their own profile or other user data if they have SUPERVISOR role or valid parental_code
 *
 * @param {Request} req - Express request with authenticated user and optional parental_code in body
 * @param {Response} res - Express response object
 * @returns {Response} JSON response with structure:
 *   - Success (200): { status: 'success', message: string, data: { profile: Profile, user?: User } }
 *   - Not Found (404): { status: 'error', error: { code: 'Not Found', message: string }, status_code: 404 }
 *   - Unauthorized (401): { status: 'error', error: { code: 'Unauthorized', message: string }, status_code: 401 }
 *   - Server Error (500): { status: 'error', error: { code: 'Internal Server Error', message: string }, status_code: 500 }
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = req.user!;

  const profile = await getSingleProfile(currentUser.userId);
  if (!profile) {
    return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
  }
  const data: { profile: Profile; user?: User } = { profile: profile };

  const user = await getSingleUser(currentUser?.userId);
  if (!user) {
    return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
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

  HttpResponse.success(data, 'Utilisateur trouvé').send(res);
});

/**
 * Updates a user's profile and associated user data
 *
 * @description Updates both profile and user information for the authenticated user.
 * Validates input data against profileSchema and userProfileSchema before persisting changes
 *
 * @param {Request} req - Express request with authenticated user and { profile?, user? } in body
 * @param {Response} res - Express response object
 * @returns {Response} JSON response with structure:
 *   - Success (200): { status: 'success', message: string, data: Profile, status_code: 200 }
 *   - Bad Request (400): { profileErrors: ValidationError[], userErrors: ValidationError[] }
 *   - Not Found (404): { status: 'error', error: { code: 'Not Found', message: string }, status_code: 404 }
 *   - Unauthorized (401): { status: 'error', error: { code: 'Unauthorized', message: string }, status_code: 401 }
 *   - Server Error (500): { status: 'error', error: { code: 'Internal Server Error', message: string }, status_code: 500 }
 */
export const setProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

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

  const profile = await updateProfile(user.userId, req.body);

  if (!profile) {
    return HttpResponse.notFound('Profil non trouvé').send(res);
  }

  HttpResponse.success(profile, 'Profil mis à jour avec succès').send(res);
});

/**
 * Deletes a user account and associated profile
 *
 * @description Permanently removes the authenticated user's account, profile, and all associated data
 *
 * @param {Request} req - Express request with authenticated user
 * @param {Response} res - Express response object
 * @returns {Response} JSON response with structure:
 *   - Success (201): { status: 'success', message: string, data: DeletedUser, status_code: 201 }
 *   - Unauthorized (401): { status: 'error', error: { code: 'Unauthorized', message: string }, status_code: 401 }
 *   - Server Error (401): { status: 'error', error: { code: 'Error', message: string }, status_code: 401 }
 */
export const deleteProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const deleted = await deleteUser(user.userId);
    HttpResponse.success(deleted, 'Utilisateur supprimé avec succès').send(res);
  }
);