import fs from "fs";
import path from "path";

import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';
import {
  getSingleProfile
} from "../profile/profile.service";

import {
  createIdeorama,
  deleteIdeorama,
  getIdeoramaById,
  getUserIdeoramas,
  updateIdeoramaModelPath
} from './ideorama.services';

const getUploadPath = (ideoramaId: string) => {
  const id = String(ideoramaId)
  // The id must be alphanumerical
  if (!/^[a-z0-9]+$/i.test(id)) {
    throw new Error("Invalid ideoramaId");
  }
  const fileName = `scene-${id}.json`
  return path.join(process.cwd(), "uploads", fileName)
}

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
    const ideorama = await createIdeorama(req.body.ideorama);

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

const getUserIdeoramasController = async (
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
    const ideoramas = await getUserIdeoramas(user.userId);
    const response = await getSingleProfile(user.userId, null)
    console.log("len: ", ideoramas.length)

    return res.status(200).json({
      status: 'success',
      data: {
        ideoramas: ideoramas,
        profile: response.profile
      },
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
    const ideorama = await getIdeoramaById(req.body.ideoramaId, user.userId);

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
    const fileContent = fs.readFileSync(ideorama.model, "utf-8")
    ideorama.model = JSON.parse(fileContent)
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

const saveIdeoramaController = async (
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
    if (!req.body.ideoramaId) {
      // Save in BD
      const newIdeorama = await createIdeorama(req.body.ideorama)
      const uploadPath = getUploadPath(newIdeorama.id)
      await updateIdeoramaModelPath(newIdeorama.id, uploadPath)

      // Save in uploads dir
      const emptyScene = fs.readFileSync('uploads/scene-empty.json')
      fs.writeFileSync(uploadPath, emptyScene)

      return res.status(200).json({
        status: 'success',
        message: 'Ideorama mise à jour avec succès',
        data: newIdeorama,
        status_code: 200,
      });
    } else {
      const uploadPath = getUploadPath(req.body.ideoramaId)

      fs.writeFileSync(uploadPath, JSON.stringify(req.body.ideorama.model, null, 2))
      return res.status(200).json({
        status: 'success',
        message: 'Ideorama mis à jour avec succès',
        data: null,
        status_code: 200,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la mise à jour de l\'idéorama',
        error,
      },
      status_code: 500,
    });
  }
};

const deleteIdeoramaController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
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
    deleteIdeorama(req.body.ideoramaId)
    const uploadPath = getUploadPath(req.body.ideoramaId)

    fs.unlink(uploadPath, (err) => {if (err) {console.log(err)}})
    return res.status(200).json({
        status: 'success',
        message: 'Ideorama supprimer avec succès',
        data: null,
        status_code: 200,
      });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la suppression de l\'idéorama',
        error,
      },
      status_code: 500,
    });
  }
};

export { deleteIdeoramaController, getIdeoramaByIdController, getUserIdeoramasController, saveIdeoramaController };

