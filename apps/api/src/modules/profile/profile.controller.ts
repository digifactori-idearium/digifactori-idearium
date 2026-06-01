import { Request, Response } from 'express';

import {
  createProfileSchema,
  createUserProfileSchema,
} from './profile.validation';

import { IProfileService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import { generateToken } from '@/utils/generate-token';
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

    HttpResponse.success({ profile: profile }, 'Utilisateur trouvé').send(res);
  });

  /**
   * Retrieves a user's data if the parental code is valid or if the user is not an intern.
   *
   * @route   GET /profile/user
   * @access  Authenticated
   *
   * @header  { X-Parental-Code?: string }
   *
   * @returns
   *   - 200 { data: { user: User | null } }
   *   - 404 user not found
   */
  getUser = asyncHandler(async (req: Request, res: Response) => {
    const authUser = req.user!;
    const user = await this.profileService.getSingleUser(authUser.userId);
    if (!user) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }
    const parentalCode = req.headers['x-parental-code'] as string;
    const correctparentalCode =
      await this.profileService.getCorrectParentalCode();
    const isParentalCodeValid =
      parentalCode && correctparentalCode
        ? parentalCode == correctparentalCode.toString()
        : false;
    if (!isParentalCodeValid && user.role == 'INTERN') {
      return HttpResponse.success({ user: null }, 'Mauvais code parental').send(
        res
      );
    }
    HttpResponse.success({ user: user }, 'Utilisateur trouvé').send(res);
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
    const authUser = req.user!;
    if (req.body.profile) {
      const profileSchema = createProfileSchema(authUser.userId);
      const result = await profileSchema.safeParseAsync(req.body.profile);
      if (failOnValidation(result, res)) return;
    }

    if (req.body.user) {
      const userProfileSchema = createUserProfileSchema(authUser.userId);
      const result = await userProfileSchema.safeParseAsync(req.body.user);
      if (failOnValidation(result, res)) return;
    }

    const user = await this.profileService.getSingleUser(authUser.userId);

    if (!user) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    const data = await this.profileService.updateProfile(user.id, req.body);

    const newToken = generateToken(data.user ? data.user : user, data.profile);

    HttpResponse.success(
      {
        ...data,
        accessToken: newToken,
      },
      'Profil mis à jour avec succès'
    ).send(res);
  });

  /**
   * Retrieves a user's profile by its pseudo.
   *
   * @route  GET /profile/find
   * @access No restriction
   *
   * @params  { userId: string }
   *
   * @returns
   *   - 200 { data: Profile }
   *   - 404 profile not found
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await this.profileService.getSingleProfile(
      req.params.userId as string
    );
    if (!profile) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }
    console.log(profile);
    HttpResponse.success({ profile: profile }, 'Utilisateur trouvé').send(res);
  });

  /**
   * Follows or unfollows a user.
   *
   * @route  POST /profile/follow
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
    const followedUser = await this.profileService.getSingleUser(followingId);
    if (!followedUser) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
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
   * @params   { userId: string }
   *
   * @returns
   *   - 200 { data: {pseudo: string, avatar: string}[] }
   *   - 404 profile not found
   */
  getFollowers = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.profileService.getSingleProfile(
      req.params.userId as string
    );
    if (!user) {
      return HttpResponse.notFound("Cet 'utilisateur n'existe pas").send(res);
    }
    const followers = await this.profileService.getFollowers(
      req.params.userId as string
    );
    return HttpResponse.success(
      { followers },
      'Followers récupérés avec succès'
    ).send(res);
  });

  /**
   *
   * Retrieves the users followed by the user.
   *
   * @route  PATCH /profile/following
   * @access No restriction
   *
   * @params   { userId: string }
   *
   * @returns
   *   - 200 { data: {pseudo: string, avatar: string}[] }
   *   - 404 profile not found
   */
  getFollowing = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.profileService.getSingleProfile(
      req.params.userId as string
    );
    if (!user) {
      return HttpResponse.notFound("Cet 'utilisateur n'existe pas").send(res);
    }
    const following = await this.profileService.getFollowing(
      req.params.userId as string
    );
    return HttpResponse.success(
      { following },
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
    const authUser = req.user!;
    const user = await this.profileService.getSingleUser(authUser.userId);
    if (!user) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }
    const deleted = await this.profileService.deleteUser(user.id);
    HttpResponse.success(deleted, 'Utilisateur supprimé avec succès').send(res);
  });
}
