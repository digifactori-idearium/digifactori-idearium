import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';

import {
  createIdeorama,
  getMyIdeoramas,
  getIdeoramaById,
  updateIdeorama,
} from './ideorama.services';

const createIdeoramaController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "Vous n'avez pas les droits d'accès",
      },
      status_code: 401,
    });
  }

  try {
    const ideorama = await createIdeorama(user.userId);

    return res.status(201).json({
      status: 'success',
      message: 'Ideorama créée avec succès',
      data: ideorama,
      status_code: 201,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la création de la ideorama',
        error,
      },
      status_code: 500,
    });
  }
};

const getMyIdeoramasController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "Vous n'avez pas les droits d'accès",
      },
      status_code: 401,
    });
  }

  try {
    const ideoramas = await getMyIdeoramas(user.userId);

    return res.status(200).json({
      status: 'success',
      data: ideoramas,
      status_code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la récupération des ideoramas',
        error,
      },
      status_code: 500,
    });
  }
};

const getIdeoramaByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;
  const { id } = req.params;

  if (!user) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "Vous n'avez pas les droits d'accès",
      },
      status_code: 401,
    });
  }

  try {
    const ideorama = await getIdeoramaById(id, user.userId);

    if (!ideorama) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'Not Found',
          message: 'Ideorama introuvable',
        },
        status_code: 404,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: ideorama,
      status_code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la récupération de la ideorama',
        error,
      },
      status_code: 500,
    });
  }
};

const updateIdeoramaController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;
  const { id } = req.params;

  if (!user) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'Unauthorized',
        message: "Vous n'avez pas les droits d'accès",
      },
      status_code: 401,
    });
  }

  try {
    const updatedIdeorama = await updateIdeorama(id, user.userId, req.body);

    return res.status(200).json({
      status: 'success',
      message: 'Ideorama mise à jour avec succès',
      data: updatedIdeorama,
      status_code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la mise à jour de la ideorama',
        error,
      },
      status_code: 500,
    });
  }
};

export {
  createIdeoramaController,
  getMyIdeoramasController,
  getIdeoramaByIdController,
  updateIdeoramaController,
};
