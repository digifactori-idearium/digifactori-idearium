import { prisma } from '../../config/client.config';
import { RequestBodyProfile } from '../../types';

const profileTable = prisma.profile;

const getSingleProfile = async (userId: string) => {
  try {
    const profil = await profileTable.findUnique({
      where: {
        id: userId,
      },
      include: {
        followers: true,
        following: true,
      },
    });

    if (!profil) {
      throw new Error(`User not found`);
    }
    return profil;
  } catch (error: any) {
    throw new Error(`Error fetching profil: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

const updateProfile = async (userId: string, body: RequestBodyProfile) => {
  try {
    const employer = await profileTable.update({
      where: {
        userId: userId,
      },
      data: { ...body },
    });
    return employer;
  } catch (error: any) {
    throw new Error(`Error operating Profile: ${error.message}`);
  }
};

export { getSingleProfile, updateProfile };
