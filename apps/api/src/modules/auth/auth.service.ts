import bcrypt from 'bcrypt';

import { prisma, Profile, User } from '@/config/client.config';
import { IAuthService } from '@/types';

const userTable = prisma.user;
const profileTable = prisma.profile;

export default class AuthService implements IAuthService {
  /**
   * Creates a new user in DB.
   *
   * @param input - the user data
   * @returns a Promise with the new user (Promise<User>)
   */
  async createUser(input: UserInput): Promise<User> {
    const { password, parental_code, ...user } = input;

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedParentalCode = await bcrypt.hash(parental_code, 10);

    const newUser = await userTable.create({
      data: {
        ...user,
        password: hashedPassword,
        parental_code: hashedParentalCode,
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
    const { password, parental_code, ...userData } = data.user;

    const hashedPassword = await bcrypt.hash(password, 10);
    let hashedParentalCode: string | null = null;
    if (parental_code !== undefined && parental_code !== null) {
      hashedParentalCode = await bcrypt.hash(parental_code.toString(), 10);
    }

    const result = await prisma.$transaction(async tx => {
      const newUser = await tx.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          parental_code: hashedParentalCode,
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
   * @returns a promise with the user exists and if the password is correct (Promise<User>), Promise<null> otherwise
   */
  async loginEmail(email: string, password: string): Promise<User | null> {
    const user = await userTable.findUnique({
      where: {
        email: email,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    } else {
      return null;
    }
  }

  /**
   * Gives the user with the corresponding pseudo if the password matches, null otherwise.
   *
   * @param email - the email of the user who tries to login
   * @param password - the entered password to verify
   * @returns a promise with the user exists and if the password is correct (Promise<User), Promise<null> otherwise
   */
  async loginPseudo(pseudo: string, password: string): Promise<User | null> {
    const profile = await profileTable.findUnique({
      where: {
        pseudo,
      },
      include: {
        user: true,
      },
    });

    if (profile && (await bcrypt.compare(password, profile.user.password))) {
      return profile.user;
    } else {
      return null;
    }
  }
}
