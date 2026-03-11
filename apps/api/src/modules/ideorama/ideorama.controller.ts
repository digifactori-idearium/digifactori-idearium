import fs from "fs";
import path from "path";

import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';
import {
  getSingleProfile
} from "../profile/profile.service";

import {
  createIdeorama,
  getIdeoramaById,
  getUserIdeoramas,
  updateIdeorama
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
    const ideorama = await createIdeorama(req.body.ideorama, "uploadPath");

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
    // const filePath = path.join(ideorama.model)

    console.log("path.join(process.cwd(), ideorama.model): ", path.join(process.cwd(), ideorama.model))
    const fileContent = fs.readFileSync(path.join(process.cwd(), ideorama.model), "utf-8")
    ideorama.model = JSON.parse(fileContent)
    console.log("get: ", ideorama)
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
    // const exist = await isIdeoramaInBD(req.body.ideoramaId)
    // const neww = true
    if (!req.body.ideoramaId) {
      console.log("create, ideoramaId = ", req.body.ideoramaId)

      const fileName = `scene-${req.body.ideorama.name}.json`
      const uploadPath = path.join(process.cwd(), "uploads", fileName)
      console.log(uploadPath)
      fs.writeFileSync(uploadPath, JSON.stringify(req.body.ideorama.model, null, 2))


      const newIdeorama = await createIdeorama(req.body.ideorama, `/uploads/${fileName}`)
      console.log("created: ", newIdeorama)
      return res.status(200).json({
        status: 'success',
        message: 'Ideorama mise à jour avec succès',
        data: newIdeorama,
        status_code: 200,
      });
    } else {
      console.log("update, ideoramaId = ", req.body.ideoramaId)
      const updatedIdeorama = await updateIdeorama(req.body.ideoramaId, req.body.ideorama)
      console.log("updated: ", updatedIdeorama)
      return res.status(200).json({
        status: 'success',
        message: 'Ideorama mise à jour avec succès',
        data: updatedIdeorama,
        status_code: 200,
      });
    }
  } catch (error) {
    console.log(error)
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
  getIdeoramaByIdController, getUserIdeoramasController, saveIdeoramaController
};

