import bcrypt from 'bcrypt';

import { prisma } from '../../config/client.config';

const profileTable = prisma.profile;
const userTable = prisma.user;

const getSingleProfile = async (
  userId: string,
  parental_code: string | null
) => {
	try {
		
		const response: { profile; user? } = { profile: {} };
		response.profile = await profileTable.findUnique({
			where: {
				userId: userId,
			},
			include: {
				followers: true,
				following: true,
			},
		});

    if (!response.profile) {
      throw new Error(`Utilisateur introuvable`);
    }

    const userInfo = await userTable.findUnique({
      where: {
        id: userId,
      },
    });
    if (!userInfo) {
      throw new Error('Utilisateur introuvable');
    }

    let isParentalCodeValid = false;

    if (parental_code && userInfo.parental_code) {
      isParentalCodeValid = await bcrypt.compare(
        parental_code,
        userInfo.parental_code
      );
    }

    if (userInfo.role !== 'CHILD' || isParentalCodeValid) {
      response.user = userInfo;
    }

    return response;
  } catch (error: any) {
    console.log('err: ', error);
    throw new Error(
      `Erreur lors de la récupération du profil: ${error.message}`
    );
  } finally {
    await prisma.$disconnect();
  }
};

const updateProfile = async (userId: string, body: SetProfileInput) => {
  try {
    const response: { user?; profile } = { profile: {} };
    if (body.user) {
      const user = await userTable.findUnique({
        where: {
          id: userId,
        },
      });
      const { password, parental_code, ...data } = {
        ...body.user,
      };
      const hashedPassword: string | undefined = password
        ? await bcrypt.hash(password, 10)
        : user?.password;
      const hashedParentalCode: string | undefined = parental_code
        ? await bcrypt.hash(parental_code, 10)
        : user?.parental_code;
      response.user = await userTable.update({
        where: {
          id: userId,
        },
        data: {
          ...data,
          password: hashedPassword,
          parental_code: hashedParentalCode,
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
  } catch (error: any) {
    throw new Error(
      `Erreur lors du fonctionnement du profil: ${error.message}`
    );
  }
};

const verifyPassword = async (userId: string, password: string) => {
	const correctPassword = await userTable
		.findUnique({
			where: {
				id: userId,
			},
		})
		.then(res => res?.password);
	const result = await bcrypt.compare(password, correctPassword)
	return result;
};

const deleteUser = async (userId: string) => {
  const response = { user: {}, profile: {} };
  response.user = await profileTable.delete({
    where: {
      userId: userId,
    },
  });
  response.profile = await userTable.delete({
    where: {
      id: userId,
    },
  });
  return response;
};

export { deleteUser, getSingleProfile, updateProfile, verifyPassword };

