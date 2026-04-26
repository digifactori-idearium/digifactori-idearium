import bcrypt from 'bcrypt';

import { prisma, Profile, User } from '../../config/client.config';

import { IProfileService } from '@/types';

const profileTable = prisma.profile;
const userTable = prisma.user;

export default class ProfileService implements IProfileService {
  /**
   * Checks if the password is correct
   *
   * @param userId: the id of the user who wants to connect (string)
   * @param password: the provided password
   * @returns Promise<true> if the password is correct, Promise<false> otherwise
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const correctPassword = await userTable
      .findUnique({
        where: {
          id: userId,
        },
      })
      .then(res => res?.password);
    const result = await bcrypt.compare(password, correctPassword);
    return result;
  }

  /**
   * Finds the profile in DB.
   *
   * @param userId - the user id for wich we are looking for its profile (string)
   * @returns :
   * - if found, a Promise with the profile (Promise<Profile>)
   * - otherwise, a Promise with null (Promise<null>)
   */
  async getSingleProfile(userId: string): Promise<Profile | null> {
    return profileTable.findUnique({
      where: {
        userId: userId,
      },
      include: {
        followers: true,
        following: true,
      },
    });
  }

  /**
 * Retrieves a public profile by pseudo.
 *
 * @param pseudo - the public pseudo
 * @returns only public profile fields
 */
  async getPublicProfileByPseudo(
    pseudo: string
  ): Promise<Pick<Profile, 'id' | 'userId' | 'pseudo' | 'avatar' | 'bio'> | null> {
    return profileTable.findUnique({
      where: {
        pseudo,
      },
      select: {
        id: true,
        userId: true,
        pseudo: true,
        avatar: true,
        bio: true,
      },
    });
  }

  /**
   * Finds the user in DB.
   *
   * @param userId - the user id (string)
   * @returns:
   * - if found, a Promise with the user (Promise<User>)
   * - otherwise, a Promise with null (Promise<null>)
   */
  async getSingleUser(userId: string): Promise<User | null> {
    return await userTable.findUnique({
      where: {
        id: userId,
      },
    });
  }

  /**
   * Updates the user and the profile in DB.
   *
   * @param userId - the user id (string)
   * @param body - the new data (SetProfileInput)
   * @returns the updated user and profile ({user?: User, profile: Profile})
   * @throws error if the user or profile is not found
   */
  async updateProfile(
    userId: string,
    body: SetProfileInput
  ): Promise<{ user?: User; profile: Profile }> {
    const response: { user?; profile } = { profile: {} };
    if (body.user) {
      const user = await userTable.findUnique({
        where: {
          id: userId,
        },
      });
      const { password, ...data } = {
        ...body.user,
      };
      const hashedPassword: string | undefined = password
        ? await bcrypt.hash(password, 10)
        : user?.password;

      response.user = await userTable.update({
        where: {
          id: userId,
        },
        data: {
          ...data,
          password: hashedPassword,
        },
      });
    }
    const { pseudo, bio, avatar } = { ...body.profile };
    response.profile = await profileTable.update({
      where: {
        userId: userId,
      },
      data: { pseudo, bio, avatar },
    });
    return response;
  }

  /**
   * Deletes the user and its corresponding profile from DB
   *
   * @param userId the id of the user to delete
   * @returns a Promise with the deleted user and profile (Promise<{user: User, profile: Profile}>)
   * @throws an error if the user or the profile is not found
   */
  async deleteUser(userId: string): Promise<{ user: User; profile: Profile }> {
    const response = await prisma.$transaction(async tx => {
      const profile = await tx.profile.delete({
        where: {
          userId: userId,
        },
      });

      const user = await tx.user.delete({
        where: {
          id: userId,
        },
      });

      return { user, profile };
    });

    return response;
  }
}
