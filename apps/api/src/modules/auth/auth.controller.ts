import AuthenticationService from './auth.service';

import asyncHandler from '@/utils/async-handler';
import { generateToken } from '@/utils/generate-token';
import HttpResponse from '@/utils/http-response';
import { failOnValidation } from '@/utils/validation-errors';
import { registrationSchema, loginSchema } from '@/utils/validations';

/**
 * Creates a new user account and returns an authentication token
 *
 * @description Registers a new user account with email/username and password.
 * Validates input against registrationSchema and creates an account in the database.
 * Returns a JWT token for immediate authentication after registration
 *
 * @param {Request} req - Express request with { email, password, pseudo } in body
 * @param {Response} res - Express response object
 * @returns {Response} JSON response
 */
export const register = asyncHandler(async (req, res) => {
  const result = await registrationSchema.safeParseAsync(req.body);
  if (failOnValidation(result, res)) return;

  const account = await AuthenticationService.createAccount(
    result.data as RegisterInput
  );
  const token = generateToken(account.user);

  HttpResponse.created(
    {
      accessToken: token,
      user: account.user,
    },
    'Account created successfully'
  ).send(res);
});

/**
 * Authenticates a user and returns an authentication token
 *
 * @description Authenticates user credentials (email or pseudo with password).
 * Validates input against loginSchema and verifies credentials against stored user data.
 * Returns a JWT token for use in authenticated API requests
 *
 * @param {Request} req - Express request with { email | pseudo, password } in body
 * @param {Response} res - Express response object
 * @returns {Response} JSON response
 */
export const login = asyncHandler(async (req, res) => {
  const result = await loginSchema.safeParseAsync(req.body);
  if (failOnValidation(result, res)) return;

  const { pseudo, email, password } = result.data!;

  let user;
  if (pseudo) {
    user = await AuthenticationService.loginPseudo(pseudo, password);
  } else if (email) {
    user = await AuthenticationService.loginEmail(email, password);
  }

  if (!user) {
    return HttpResponse.unAuthorized('Invalid credentials').send(res);
  }

  const token = generateToken(user);
  HttpResponse.success(
    {
      accessToken: token,
      user,
    },
    'Login successful'
  ).send(res);
});
