import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import {
  changePasswordSchema,
  loginSchema,
  registrationSchema,
  requestResetSchema,
  resetPasswordSchema,
} from './auth.validation';

import config from '@/config/app.config';
import { IAuthService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import { generateToken } from '@/utils/generate-token';
import HttpResponse from '@/utils/http-response';
import { failOnValidation } from '@/utils/validation-errors';

export default class AuthController {
  constructor(private readonly authService: IAuthService) {}
  /**
   * Creates a new user account and returns an authentication token.
   *
   * @route  POST /auth/register
   * @access Public
   *
   * @body   { user: { email, password, first_name, last_name, role, ... }, profile: { pseudo } }
   *
   * @returns
   *   - 201 { accessToken, user }
   *   - 400 validation errors | email already taken
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await registrationSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const account = await this.authService.createAccount(
      result.data as RegisterInput
    );
    const token = generateToken(account.user, account.profile);

    HttpResponse.created(
      { accessToken: token, user: account.user },
      'Account created successfully'
    ).send(res);
  });

  /**
   * Authenticates a user and returns an authentication token.
   *
   * @route  POST /auth/login
   * @access Public
   *
   * @body   { email | pseudo, password }
   *
   * @returns
   *   - 200 { accessToken, user }
   *   - 400 validation errors
   *   - 401 invalid credentials | account inactive
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await loginSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const { pseudo, email, password } = result.data!;

    let data;
    if (pseudo) {
      data = await this.authService.loginPseudo(pseudo, password);
    } else if (email) {
      data = await this.authService.loginEmail(email, password);
    }

    if (!data) {
      return HttpResponse.unAuthorized('Invalid credentials').send(res);
    }

    const token = generateToken(data.user, data.profile);
    HttpResponse.success(
      { accessToken: token, user: data.user },
      'Login successful'
    ).send(res);
  });

  /**
   * Changes the password for the currently authenticated user.
   * Requires the user to provide their current password for verification.
   *
   * @route  POST /auth/change-password
   * @access Authenticated (any role)
   *
   * @body   { currentPassword, newPassword, confirmPassword }
   *
   * @returns
   *   - 200 success message
   *   - 400 validation errors | wrong current password | same as current
   *   - 401 not authenticated
   *   - 404 if user is not found
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userAuth = req.user!;

    const result = await changePasswordSchema.safeParseAsync({
      ...req.body,
      role: userAuth.role,
    });
    if (failOnValidation(result, res)) return;

    const user = await this.authService.getSingleUser(userAuth.userId);
    if (!user) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    const { currentPassword, newPassword } = result.data!;

    const isPasswordCorrect = await this.authService.verifyPassword(
      user.id,
      currentPassword
    );
    if (!isPasswordCorrect) {
      return HttpResponse.badRequest('Code incorrect').send(res);
    }

    await this.authService.changePassword(user.id, newPassword);
    return HttpResponse.success(null, 'Mot de passe modifié avec succès.').send(
      res
    );
  });

  /**
   * Sends a password reset link to the provided email address.
   * Always returns 200 even if the email does not exist to prevent user enumeration.
   *
   * @route  POST /auth/reset-password/request
   * @access Public
   *
   * @body   { email }
   *
   * @returns
   *   - 200 (always, even if email not found)
   *   - 400 validation errors
   */
  requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const result = await requestResetSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    await this.authService.requestPasswordReset(result.data!.email);

    // Always 200 — never reveal whether the email exists
    return HttpResponse.success(
      null,
      'Si un compte correspond à cet email, un lien de réinitialisation a été envoyé.'
    ).send(res);
  });

  /**
   * Resets the password using the JWT token received in the email link.
   * The token is passed as a query parameter: /auth/reset-password?token=xxx
   *
   * The token secret is built from JWT_SECRET,
   * so it is automatically invalidated once the password changes (true one-time use).
   *
   * @route  POST /auth/reset-password?token=xxx
   * @access Public
   *
   * @query  token - The signed JWT reset token from the email link
   * @body   { newPassword, confirmPassword }
   *
   * @returns
   *   - 200 success message
   *   - 400 validation errors | invalid token | expired token
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;

    if (!token) {
      return HttpResponse.badRequest('Token manquant.').send(res);
    }

    const decoded = jwt.decode(token) as { userId?: string } | null;
    if (!decoded?.userId) {
      return HttpResponse.badRequest('Token invalide').send(res);
    }

    const user = await this.authService.getSingleUser(decoded.userId);
    if (!user) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }
    if (!user.isActive) {
      return HttpResponse.badRequest("Cet utilisateur n'est pas actif").send(
        res
      );
    }

    try {
      jwt.verify(token, config.JWT_SECRET);
    } catch {
      return HttpResponse.badRequest(
        'Le lien de réinitialisation est invalide ou a expiré.'
      ).send(res);
    }

    const result = await resetPasswordSchema.safeParseAsync({
      ...req.body,
      role: user.role,
    });
    if (failOnValidation(result, res)) return;

    await this.authService.changePassword(user.id, result.data!.newPassword);

    return HttpResponse.success(
      null,
      'Mot de passe réinitialisé avec succès.'
    ).send(res);
  });
}
