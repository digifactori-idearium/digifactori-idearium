import { Role } from '@prisma/client';
import { Request, Response } from 'express';

import {
  createUserSchema,
  updateRoleSchema,
  updateUserSchema,
} from './user.validation';

import { IUserService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { failOnValidation } from '@/utils/validation-errors';

export default class UserController {
  constructor(private readonly userService: IUserService) {}

  /**
   * Lists users scoped by the requester's role.
   *
   * - ADMIN      → all users
   * - SUPERVISOR → all INTERN accounts
   *
   * @route  GET /user/list
   * @access ADMIN | SUPERVISOR
   *
   * @returns
   *   - 200 { data: User[] }
   */
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const requester = req.user!;

    const users = await this.userService.getUsers(requester.role as Role);
    return HttpResponse.success(users, 'Utilisateurs récupérés').send(res);
  });

  /**
   * Returns a single user by id, scoped by the requester's role.
   *
   * - ADMIN      → any user
   * - SUPERVISOR → any INTERN account
   *
   * @route  GET /user/:id
   * @access ADMIN | SUPERVISOR
   *
   * @returns
   *   - 200 { data: User }
   *   - 404 user not found or out of scope
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const requester = req.user!;
    const id = req.params.id as string;

    const user = await this.userService.getUserById(id, requester.role as Role);
    if (!user) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    return HttpResponse.success(user, 'Utilisateur trouvé').send(res);
  });

  /**
   * Creates a new user account and profile.
   *
   * - ADMIN      → can create SUPERVISOR or INTERN
   * - SUPERVISOR → can only create INTERN
   *
   * @route  POST /user
   * @access ADMIN | SUPERVISOR
   *
   * @returns
   *   - 201 { data: { user } }
   *   - 400 validation errors | email already taken
   *   - 403 role not allowed for this requester
   */
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const requester = req.user!;
    const requesterRole = requester.role;

    const result = await createUserSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const { role } = result.data!;

    if (requesterRole === Role.SUPERVISOR && role !== Role.INTERN) {
      return HttpResponse.forbidden(
        'Les superviseurs ne peuvent créer que des comptes stagiaires.'
      ).send(res);
    }

    if (requesterRole === Role.ADMIN && role === Role.ADMIN) {
      return HttpResponse.forbidden(
        'Vous ne pouvez pas créer un compte administrateur.'
      ).send(res);
    }

    const created = await this.userService.createUser(result.data!);
    return HttpResponse.created(created, 'Utilisateur créé avec succès').send(
      res
    );
  });

  /**
   * Updates a user's info (email, first_name, last_name, role).
   *
   * - ADMIN      → any user
   * - SUPERVISOR → any INTERN account + can only assign INTERN role
   *
   * @route  PATCH /user/:id
   * @access ADMIN | SUPERVISOR
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const requester = req.user!;
    const id = req.params.id as string;

    const result = await updateUserSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const { role, ...rest } = result.data!;

    const target = await this.userService.getUserById(
      id,
      requester.role as Role
    );
    if (!target) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    if (role) {
      if (requester.role === Role.SUPERVISOR && role !== Role.INTERN) {
        return HttpResponse.forbidden(
          'Les superviseurs ne peuvent attribuer que le rôle stagiaire.'
        ).send(res);
      }

      if (target.role === Role.ADMIN && requester.userId !== id) {
        return HttpResponse.forbidden(
          "Vous ne pouvez pas modifier le rôle d'un autre administrateur."
        ).send(res);
      }
    }

    const updated = await this.userService.updateUser(id, {
      ...rest,
      ...(role && { role }),
    });

    return HttpResponse.success(updated, 'Utilisateur mis à jour').send(res);
  });

  /**
   * Changes a user's role.
   *
   * - ADMIN      → can assign any role, but cannot change another ADMIN's role
   * - SUPERVISOR → can only assign INTERN role (cannot promote to SUPERVISOR or ADMIN)
   *
   * @route  PATCH /user/:id/role
   * @access ADMIN | SUPERVISOR
   *
   * @returns
   *   - 200 { data: User }
   *   - 400 validation errors
   *   - 403 permission denied
   *   - 404 user not found or out of scope
   */
  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const requester = req.user!;
    const id = req.params.id as string;

    const result = await updateRoleSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const { role } = result.data!;

    if (requester.role === Role.SUPERVISOR && role !== Role.INTERN) {
      return HttpResponse.forbidden(
        'Les superviseurs ne peuvent attribuer que le rôle stagiaire.'
      ).send(res);
    }

    const target = await this.userService.getUserById(
      id,
      requester.role as Role
    );
    if (!target) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    if (target.role === Role.ADMIN && requester.userId !== id) {
      return HttpResponse.forbidden(
        "Vous ne pouvez pas modifier le rôle d'un autre administrateur."
      ).send(res);
    }

    const updated = await this.userService.updateRole(id, role);
    return HttpResponse.success(updated, 'Rôle mis à jour').send(res);
  });

  /**
   * Permanently deletes a user and their profile.
   *
   * - ADMIN      → any non-ADMIN user
   * - SUPERVISOR → any INTERN account
   *
   * @route  DELETE /user/:id
   * @access ADMIN | SUPERVISOR
   *
   * @returns
   *   - 200 { data: { user } }
   *   - 403 permission denied
   *   - 404 user not found or out of scope
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const requester = req.user!;
    const id = req.params.id as string;

    const target = await this.userService.getUserById(
      id,
      requester.role as Role
    );
    if (!target) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    if (target.role === Role.ADMIN && requester.userId !== id) {
      return HttpResponse.forbidden(
        'Vous ne pouvez pas supprimer un autre administrateur.'
      ).send(res);
    }

    const deleted = await this.userService.deleteUser(id);
    return HttpResponse.success(
      deleted,
      'Utilisateur supprimé avec succès'
    ).send(res);
  });

  /**
   * Activates or deactivates a user account.
   * An admin cannot deactivate himself 🙃.
   *
   * @route  PATCH /users/:id/active
   * @access ADMIN
   *
   * @body   { isActive: boolean }
   *
   * @returns
   *   - 200 { data: User }
   *   - 400 if isActive is not a boolean
   *   - 403 if requester is not ADMIN or tries to deactivate themselves
   *   - 404 user not found
   */
  setActive = asyncHandler(async (req: Request, res: Response) => {
    const requester = req.user!;
    const id = req.params.id as string;

    if (requester.role !== Role.ADMIN) {
      return HttpResponse.forbidden(
        'Seul un administrateur peut activer ou désactiver un compte.'
      ).send(res);
    }

    if (requester.userId === id) {
      return HttpResponse.forbidden(
        'Vous ne pouvez pas désactiver votre propre compte.'
      ).send(res);
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return HttpResponse.badRequest('isActive doit être un booléen.').send(
        res
      );
    }

    const target = await this.userService.getUserById(id, Role.ADMIN);
    if (!target) {
      return HttpResponse.notFound("Cet utilisateur n'existe pas").send(res);
    }

    const updated = await this.userService.setActive(id, isActive);
    const message = isActive
      ? 'Compte activé avec succès.'
      : 'Compte désactivé avec succès.';
    return HttpResponse.success(updated, message).send(res);
  });
}
