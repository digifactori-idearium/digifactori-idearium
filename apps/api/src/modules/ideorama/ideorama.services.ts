import { Ideorama } from '@prisma/client';

import { prisma } from '../../config/client.config';

export const createIdeorama = async (ideoramaData: Ideorama, uploadPath: string) => {
  const newIdeorama = await prisma.ideorama.create({
    data: {...ideoramaData, model: uploadPath},
  });
  return newIdeorama;
};

export const getIdeoramaById = async (ideoramaId: string, userId: string) => {
  return prisma.ideorama.findFirst({
    where: {
      id: ideoramaId,
    },
  });
};

export const getUserIdeoramas = async (userId: string) => {
  return prisma.ideorama.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const updateIdeorama = async (
  ideoramaId: string,
  data: Ideorama
) => {
  return prisma.ideorama.update({
    where: {
      id: ideoramaId,
    },
    data,
  });
};

export const isIdeoramaInBD = async (
  ideoramaId: string
) => {
  const ideorama = await prisma.ideorama.findUnique({
    where: {
      id: ideoramaId
    }
  })
  if (ideorama) {
    return true
  }
  return false
}
