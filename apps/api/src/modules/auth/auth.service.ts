import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { EmailService } from './email.service';

import { prisma, Profile, User } from '@/config/client.config';
import { IAuthService } from '@/types';

const userTable = prisma.user;
const profileTable = prisma.profile;

export default class AuthService implements IAuthService {
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
   * Finds the user in DB.
   *
   * @param id - the user id for wich we are looking for its profile (string)
   * @returns :
   * - if found, a Promise with the profile (Promise<Profile>)
   * - otherwise, a Promise with null (Promise<null>)
   */
  async getSingleUser(id: string): Promise<User | null> {
    const user = await userTable.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  }

  /**
   * Returns the profile of the user
   *
   * @param userId - the user id. It exists in DB
   */
  async getSingleProfile(userId: string): Promise<Profile | null> {
    const profile = await profileTable.findUnique({
      where: {
        userId: userId,
      },
    });
    return profile;
  }

  /**
   * Creates a new user in DB.
   *
   * @param input - the user data
   * @returns a Promise with the new user (Promise<User>)
   */
  async createUser(input: UserInput): Promise<User> {
    const { password, ...user } = input;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userTable.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
    return newUser;
  }

  /**
   * Creates a new profile in DB.
   *
   * @param ideoramaData - the profile data
   * @returns a Promise with the new profile (Promise<Profile>)
   */
  async createProfile(input: ProfileInput, userId: string): Promise<Profile> {
    const newProfile = await profileTable.create({
      data: {
        ...input,
        userId,
      },
    });

    return newProfile;
  }

  /**
   * Creates a new user and a new profile in DB.
   *
   * @param ideoramaData - the user and profile data
   * @returns a Promise with the data added in DB (Promise<{ user: User, profile: Profile}>)
   */
  async createAccount(
    data: RegisterInput
  ): Promise<{ user: User; profile: Profile }> {
    const { password, ...userData } = data.user;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async tx => {
      const newUser = await tx.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      const newProfile = await tx.profile.create({
        data: {
          ...data.profile,
          userId: newUser.id,
        },
      });

      return {
        user: newUser,
        profile: newProfile,
      };
    });

    return result;
  }

  /**
   * Gives the user with the corresponding email if the password matches, null otherwise.
   *
   * @param email - the email of the user who tries to login
   * @param password - the entered password to verify
   * @returns a promise with the user and its profile if it exists and if the password
   * is correct (Promise<{ profile: Profile; user: User }>), Promise<null> otherwise
   */
  async loginEmail(
    email: string,
    password: string
  ): Promise<{ profile: Profile; user: User } | null> {
    const user = await userTable.findUnique({
      where: {
        email: email,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const profile = (await profileTable.findUnique({
        where: {
          userId: user.id,
        },
      })) as Profile;
      return { profile, user };
    } else {
      return null;
    }
  }

  /**
   * Gives the user with the corresponding pseudo if the password matches, null otherwise.
   *
   * @param email - the email of the user who tries to login
   * @param password - the entered password to verify
   * @returns a promise with the user and its profile if it exists and if the password
   * is correct (Promise<{ profile: Profile; user: User }>), Promise<null> otherwise
   */
  async loginPseudo(
    pseudo: string,
    password: string
  ): Promise<{ profile: Profile; user: User } | null> {
    const data = await profileTable.findUnique({
      where: {
        pseudo,
      },
      include: {
        user: true,
      },
    });

    if (data && (await bcrypt.compare(password, data.user.password))) {
      return {
        profile: {
          id: data.id,
          userId: data.userId,
          pseudo: data.pseudo,
          bio: data.bio,
          avatar: data.avatar,
          voiceButtons: data.voiceButtons,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        user: data.user,
      };
    } else {
      return null;
    }
  }

  /**
   * Changes the password for an authenticated user.
   * hashes the current password before applying the change.
   *
   * @param userId          - The authenticated user's id
   * @param newPassword     - The new plain password to hash and store
   * @returns Promise<true> on success
   */
  async changePassword(userId: string, newPassword: string): Promise<true> {
    const hashed = await bcrypt.hash(newPassword, 10);
    await userTable.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return true;
  }

  /**
   * Generates a short-lived reset JWT and emails it to the user.
   *
   * We always respond with 200 even if the email does not exist to avoid
   * user enumeration attacks.
   *
   * @param email - The account email to send the reset link to
   * @returns Promise<void>
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await userTable.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.isActive) return;

    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
      expiresIn: '1h',
    });

    await EmailService.sendPasswordReset(email, token);
  }
}
