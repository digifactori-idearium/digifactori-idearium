import { Profile, User } from '@prisma/client';
import { Request, Response } from 'express';

import {
  createUserProfileSchema,
  createProfileSchema,
} from './profile.validation';

import { prisma } from '@/config/client.config';
import { IProfileService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { failOnValidation } from '@/utils/validation-errors';

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
  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
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

    const setting = await prisma.setting.findUnique({
      where: { id: 1 },
      select: { orgParentalCode: true },
    });
    const isParentalCodeValid =
      req.body.parental_code && setting?.orgParentalCode
        ? req.body.parental_code == setting.orgParentalCode
        : false;

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

    if (req.body.profile) {
      const profileSchema = createProfileSchema(user.userId);
      const result = await profileSchema.safeParseAsync(req.body.profile);
      if (failOnValidation(result, res)) return;
    }

    if (req.body.user) {
      const userProfileSchema = createUserProfileSchema(user.userId);
      const result = await userProfileSchema.safeParseAsync(req.body.user);
      if (failOnValidation(result, res)) return;
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
   * Retrieves a user's profile by its pseudo.
   *
   * @route  PATCH /profile/find
   * @access No restriction
   *
   * @body   { userId?: string }
   *
   * @returns
   *   - 200 { data: Profile }
   *   - 404 profile not found
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await this.profileService.getSingleProfile(req.body.userId);
    if (!profile) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }
    HttpResponse.success({ profile: profile }, 'Utilisateur trouvé').send(res);
  });

  /**
   * Follows or unfollows a user.
   *
   * @route  PATCH /profile/follow
   * @access Authenticated
   *
   * @body   { followedUserId: string }
   *
   * @returns
   *   - 200 { data: boolean }
   *   - 400 cannot follow/unfollow oneself
   */
  followUser = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const followingId = req.body.followedUserId;
    if (user.userId === followingId) {
      return HttpResponse.badRequest(
        'Vous ne pouvez pas vous suivre vous-même'
      ).send(res);
    }
    const followed = await this.profileService.followUser(
      user.userId,
      followingId
    );
    HttpResponse.success(followed, 'Utilisateur suivi avec succès').send(res);
  });

  /**
   * Retrieves a user's followers by its userId.
   *
   * @route  PATCH /profile/followers
   * @access No restriction
   *
   * @body   { userId?: string }
   *
   * @returns
   *   - 200 { data: {pseudo: string, avatar: string}[] }
   *   - 404 profile not found
   */
  getFollowers = asyncHandler(async (req: Request, res: Response) => {
    const followers = await this.profileService.getFollowers(req.body.userId);
    HttpResponse.success(followers, 'Followers récupérés avec succès').send(
      res
    );
  });

  /**
   *
   * Retrieves the users followed by the user.
   *
   * @route  PATCH /profile/following
   * @access No restriction
   *
   * @body   { userId?: string }
   *
   * @returns
   *   - 200 { data: {pseudo: string, avatar: string}[] }
   *   - 404 profile not found
   */
  getFollowing = asyncHandler(async (req: Request, res: Response) => {
    const following = await this.profileService.getFollowing(req.body.userId);
    HttpResponse.success(
      following,
      'Utilisateurs suivis récupérés avec succès'
    ).send(res);
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
