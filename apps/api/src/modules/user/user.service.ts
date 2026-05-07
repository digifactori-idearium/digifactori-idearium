import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma, User } from '@/config/client.config';
import { EmailService } from '@/modules/auth/email.service';
import { IUserService } from '@/types';

const userTable = prisma.user;

export default class UserService implements IUserService {
  /**
   * Returns users depending on the requester's role.
   * - ADMIN      → every user in the database
   * - SUPERVISOR → every INTERN account
   *
   * @param requesterRole - The role of the authenticated user making the request
   * @returns Promise<User[]>
   */
  async getUsers(requesterRole: Role): Promise<User[]> {
    if (requesterRole === Role.ADMIN) {
      return userTable.findMany({
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    // SUPERVISOR sees all children
    return userTable.findMany({
      where: { role: Role.INTERN },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Returns a single user by id, scoped by the requester's role.
   * - ADMIN      → any user
   * - SUPERVISOR → only INTERN accounts
   *
   * Returns null if the user does not exist or is out of scope for the requester.
   *
   * @param id            - The target user's id
   * @param requesterRole - The role of the authenticated user making the request
   * @returns Promise<User | null>
   */
  async getUserById(id: string, requesterRole: Role): Promise<User | null> {
    const where =
      requesterRole === Role.ADMIN ? { id } : { id, role: Role.INTERN }; // supervisors can only see children

    return userTable.findUnique({
      where,
      include: { profile: true },
    });
  }

  /**
   * Creates a new user account and matching profile in a single transaction.
   * The role is already validated by the controller before this is called.
   *
   * @param data - Validated creation payload (email, names, pseudo, password, role)
   * @returns Promise<{ user: User }>
   */
  /**
   * Creates a new user account and matching profile in a single transaction.
   * Auto-generates a temporary password using the pattern: ROLE@pseudo{year}
   * Sends a welcome email with the temporary password after creation.
   *
   * @param data - Validated creation payload (email, names, pseudo, role)
   * @returns Promise<{ user: User; temporaryPassword: string }>
   */
  async createUser(data: {
    email: string;
    first_name: string;
    last_name: string;
    pseudo: string;
    role: Role;
  }): Promise<{ user: User; temporaryPassword: string }> {
    const { pseudo, ...userData } = data;

    const year = new Date().getFullYear();
    const sanitizedPseudo = pseudo.toLowerCase().replace(/\s+/g, '');
    const temporaryPassword = `${data.role}@${sanitizedPseudo}${year}`;
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const { user } = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      await tx.profile.create({
        data: { pseudo, userId: user.id },
      });

      return { user };
    });

    EmailService.sendWelcome(data.email, pseudo, temporaryPassword).catch(
      console.error
    );

    return { user, temporaryPassword };
  }

  /**
   * Updates a user's basic info (email, first_name, last_name).
   * Does NOT touch role, password, or parental_code — use dedicated methods for those.
   *
   * @param id   - The target user's id
   * @param data - Partial user data to update
   * @returns Promise<User>
   */
  async updateUser(
    id: string,
    data: Partial<Pick<User, 'email' | 'first_name' | 'last_name' | 'role'>>
  ): Promise<User> {
    return userTable.update({ where: { id }, data });
  }

  /**
   * Activates or deactivates a user account.
   * Only ADMIN can call this — enforced in the controller.
   *
   * @param id       - The target user's id
   * @param isActive - true to activate, false to deactivate
   * @returns Promise<User>
   */
  async setActive(id: string, isActive: boolean): Promise<User> {
    return userTable.update({ where: { id }, data: { isActive } });
  }

  /**
   * Changes a user's role.
   * Business-rule enforcement (who can assign what role) lives in the controller.
   *
   * @param id   - The target user's id
   * @param role - The new role
   * @returns Promise<User>
   */
  async updateRole(id: string, role: Role): Promise<User> {
    return userTable.update({ where: { id }, data: { role } });
  }

  /**
   * Permanently removes a user and their profile.
   * Wrapped in a transaction so the profile is always deleted first.
   *
   * @param id - The target user's id
   * @returns Promise<{ user: User }>
   */
  async deleteUser(id: string): Promise<{ user: User }> {
    return prisma.$transaction(async tx => {
      await tx.profile.delete({ where: { userId: id } });
      const user = await tx.user.delete({ where: { id } });
      return { user };
    });
  }

  /**
   * Bulk delete; partial success.
   * Respects role-based permissions via the controller.
   */
  async bulkDeleteUsers(
    ids: string[],
    requesterRole: Role,
    requesterId: string
  ): Promise<{ deleted: number; failed: { id: string; reason: string }[] }> {
    const failed: { id: string; reason: string }[] = [];
    const safeIds: string[] = [];

    // Pre-flight: filter out self-delete before hitting the DB
    for (const id of ids) {
      if (id === requesterId) {
        failed.push({
          id,
          reason: 'Vous ne pouvez pas vous supprimer vous-même.',
        });
      } else {
        safeIds.push(id);
      }
    }

    if (safeIds.length === 0) return { deleted: 0, failed };

    // Scope query to only IDs this role is allowed to delete
    const scopeWhere =
      requesterRole === Role.ADMIN
        ? { id: { in: safeIds }, role: { not: Role.ADMIN } }
        : { id: { in: safeIds }, role: Role.INTERN };

    const existing = await userTable.findMany({
      where: scopeWhere,
      select: { id: true },
    });

    const allowedIds = new Set(existing.map(u => u.id));

    // Everything not found or out of scope → failed
    for (const id of safeIds) {
      if (!allowedIds.has(id)) {
        failed.push({
          id,
          reason: 'Utilisateur introuvable ou action non autorisée.',
        });
      }
    }

    if (allowedIds.size === 0) return { deleted: 0, failed };

    // DB handles Profile → Follow, IdeoramaLikes via Cascade
    // DB handles Ideorama, Document, VoxelModel via SetNull
    const { count } = await userTable.deleteMany({
      where: { id: { in: [...allowedIds] } },
    });

    return { deleted: count, failed };
  }
}
