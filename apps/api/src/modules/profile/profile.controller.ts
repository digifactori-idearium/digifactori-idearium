import { Profile, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { profileSchema, userProfileSchema } from './profile.validation';

import { IProfileService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';

export default class ProfileController {
  constructor(private readonly profileService: IProfileService) {}

  /**
   * Retrieves the authenticated user's profile and user data.
   *
   * @route  GET /profile
   * @access Authenticated
   *
   * @body   { parental_code?: string }
   *
   * @returns
   *   - 200 { data: { profile: Profile, user?: User } }
   *   - 404 user or profile not found
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const currentUser = req.user!;

    const profile = await this.profileService.getSingleProfile(
      currentUser.userId
    );
    if (!profile) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    const user = await this.profileService.getSingleUser(currentUser.userId);
    if (!user) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    const data: { profile: Profile; user?: User } = { profile };

    let isParentalCodeValid = false;
    if (req.body.parental_code && user.parental_code) {
      isParentalCodeValid = await bcrypt.compare(
        req.body.parental_code,
        user.parental_code
      );
    }

    if (user.role !== 'INTERN' || isParentalCodeValid) {
      data.user = user;
    }

    HttpResponse.success(data, 'Utilisateur trouvé').send(res);
  });

  /**
   * Updates the authenticated user's profile and user data.
   *
   * @route  PATCH /profile
   * @access Authenticated
   *
   * @body   { profile?: { pseudo?, bio?, avatar? }, user?: { email?, first_name?, last_name?, role?, parental_code? } }
   *
   * @returns
   *   - 200 { data: Profile }
   *   - 400 { profileErrors: ValidationError[], userErrors: ValidationError[] }
   *   - 404 profile not found
   */
  setProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    let profileErrors: any[] = [];
    let userErrors: any[] = [];

    if (req.body.profile) {
      const result = await profileSchema.safeParseAsync(req.body.profile);
      if (!result.success) {
        profileErrors = result.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
      }
    }

    if (req.body.user) {
      const result = await userProfileSchema.safeParseAsync(req.body.user);
      if (!result.success) {
        userErrors = result.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
      }
    }

    if (profileErrors.length > 0 || userErrors.length > 0) {
      return res.status(400).json({ profileErrors, userErrors });
    }

    const profile = await this.profileService.updateProfile(
      user.userId,
      req.body
    );
    if (!profile) {
      return HttpResponse.notFound('Profil non trouvé').send(res);
    }

    HttpResponse.success(profile, 'Profil mis à jour avec succès').send(res);
  });

  /**
   * Permanently deletes the authenticated user's account and profile.
   *
   * @route  DELETE /profile
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: { user: User, profile: Profile } }
   *   - 401 not authenticated
   */
  deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    const deleted = await this.profileService.deleteUser(user.userId);
    HttpResponse.success(deleted, 'Utilisateur supprimé avec succès').send(res);
  });
}
