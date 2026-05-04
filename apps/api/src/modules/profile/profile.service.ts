import bcrypt from 'bcrypt';

import { prisma, Profile, User } from '../../config/client.config';

import { IProfileService } from '@/types';

const profileTable = prisma.profile;
const userTable = prisma.user;
const followTable = prisma.follow;
const setting = prisma.setting;

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
    const profile = await profileTable.findUnique({
      where: {
        userId: userId,
      },
      include: {
        followers: {
          select: {
            followerId: true,
          },
        },
        following: {
          select: {
            followedId: true,
          },
        },

        ideoramaLiked: {
          select: {
            ideoramaId: true,
          },
        },
      },
    });
    return profile;
  }

  /**
   * Finds the correct parental code in DB.
   *
   * @returns the correct parental
   */
  async getCorrectParentalCode(): Promise<number | undefined> {
    const set = await setting.findUnique({
      where: { id: 1 },
      select: { orgParentalCode: true },
    });
    return set?.orgParentalCode;
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
      response.user = await userTable.update({
        where: {
          id: userId,
        },
        data: {
          ...body.user,
        },
      });
    }
    const { pseudo, bio, avatar, voiceButtons } = { ...body.profile };
    response.profile = await profileTable.update({
      where: {
        userId: userId,
      },
      data: { pseudo, bio, avatar, voiceButtons },
    });
    return response;
  }

  /**
   * Follows a user.
   *
   * @param userId the id of the user who wants to follow (string)
   * @param followedUserId the id of the user to follow (string)
   * @returns Promise<true> if the follow/unfollow action is successful, Promise<false> otherwise
   * @throws error if the user or the followed user is not found
   */
  async followUser(userId: string, followedUserId: string): Promise<boolean> {
    const existingFollow = await followTable.findFirst({
      where: {
        followerId: userId,
        followedId: followedUserId,
      },
    });

    if (existingFollow) {
      await followTable.deleteMany({
        where: {
          followerId: userId,
          followedId: followedUserId,
        },
      });
      return true;
    }
    await followTable.create({
      data: {
        followerId: userId,
        followedId: followedUserId,
      },
    });
    return true;
  }

  /**
   * Gets the followers of a user
   *
   * @param userId the id of the user (string)
   * @returns an array of followers with their pseudo and avatar ({pseudo: string, avatar: string | null}[])
   */
  async getFollowers(
    userId: string
  ): Promise<{ pseudo: string; avatar: string | null }[]> {
    const followers = await followTable.findMany({
      where: {
        followedId: userId,
      },
      include: {
        follower: {
          select: {
            pseudo: true,
            avatar: true,
          },
        },
      },
    });
    return followers.map(follow => follow.follower);
  }

  /**
   * Gets the following of a user
   *
   * @param userId the id of the user (string)
   * @returns an array of following with their pseudo and avatar ({pseudo: string, avatar: string | null}[])
   */
  async getFollowing(
    userId: string
  ): Promise<{ pseudo: string; avatar: string | null }[]> {
    const following = await followTable.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            pseudo: true,
            avatar: true,
          },
        },
      },
    });
    return following.map(follow => follow.following);
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
