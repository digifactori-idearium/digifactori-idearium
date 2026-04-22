import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma, User } from '@/config/client.config';
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
        include: { profil: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    // SUPERVISOR sees all children
    return userTable.findMany({
      where: { role: Role.INTERN },
      include: { profil: true },
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
      include: { profil: true },
    });
  }

  /**
   * Creates a new user account and matching profile in a single transaction.
   * The role is already validated by the controller before this is called.
   *
   * @param data - Validated creation payload (email, names, pseudo, password, role)
   * @returns Promise<{ user: User }>
   */
  async createUser(data: {
    email: string;
    first_name: string;
    last_name: string;
    pseudo: string;
    password: string;
    role: Role;
  }): Promise<{ user: User }> {
    const { pseudo, ...userData } = data;

    const year = new Date().getFullYear();
    const temporaryPassword = `${data.role}@${pseudo.toLowerCase().replace(/\s+/g, '')}${year}`;
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    return prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: { ...userData, password: hashedPassword },
      });

      await tx.profile.create({
        data: { pseudo, userId: user.id },
      });

      return { user };
    });
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
    data: Partial<Pick<User, 'email' | 'first_name' | 'last_name'>>
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
}
