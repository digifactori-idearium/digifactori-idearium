import { Ideorama } from '@prisma/client';

import { prisma } from '../../config/client.config';

const ideoramaTable = prisma.ideorama;

export const createIdeorama = async (ideoramaData: Ideorama) => {
  const newIdeorama = await ideoramaTable.create({
    data: {...ideoramaData, model: ""},
  });
  return newIdeorama;
};

export const updateIdeoramaModelPath= async (ideoramaId: string, uploadPath: string) => {
  await ideoramaTable.update({
    where: {
      id: ideoramaId
    },
    data: {
      model: uploadPath
    }
  })
}

export const getIdeoramaById = async (ideoramaId: string, userId: string) => {
  return ideoramaTable.findFirst({
    where: {
      id: ideoramaId,
    },
  });
};

export const getUserIdeoramas = async (userId: string) => {
  return ideoramaTable.findMany({
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
  return ideoramaTable.update({
    where: {
      id: ideoramaId,
    },
    data,
  });
};

export const isIdeoramaInBD = async (
  ideoramaId: string
) => {
  const ideorama = await ideoramaTable.findUnique({
    where: {
      id: ideoramaId
    }
  })
  if (ideorama) {
    return true
  }
  return false
}


export const deleteIdeorama = async (
  ideoramaId: string
) => {
  const ideorama = await ideoramaTable.delete({
    where: {
      id: ideoramaId
    }
  })
  return ideorama
}