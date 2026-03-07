import { prisma } from '../../config/client.config';

export const createIdeorama = async (userId: string) => {
  const ideorama = await prisma.ideorama.create({
    data: {
      name: 'New Ideorama',
      userId: userId,
    },
  });

  return ideorama;
};

export const getMyIdeoramas = async (userId: string) => {
  return prisma.ideorama.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getIdeoramaById = async (ideoramaId: string, userId: string) => {
  return prisma.ideorama.findFirst({
    where: {
      id: ideoramaId,
      userId: userId,
    },
  });
};

export const updateIdeorama = async (
  ideoramaId: string,
  userId: string,
  data: any
) => {
  return prisma.ideorama.update({
    where: {
      id: ideoramaId,
    },
    data,
  });
};
