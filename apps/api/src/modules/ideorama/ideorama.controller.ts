import fs from "node:fs";

import { Request, Response } from 'express';
import { getUploadPath } from "utils/ideorama";

import { AuthenticatedRequest } from '../../types';



import {
  createIdeorama,
  deleteIdeorama,
  getIdeoramaById,
  getUserIdeoramas,
  updateIdeoramaModelPath
} from './ideorama.services';


/**
 * creates a new ideorama.
 *
 * @param req - Express request object. Expects 'req.body.ideorama' (Ideorama)
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: "Idéorama mis à jour avec succès",
 *    data: the new ideorama (Ideorama),
 *    status_code: 200
 *  }
 * - 401 if the user is not authenticated
 * - 500 if an unexpected error occurs
 */
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
      // Save in BD
      const newIdeorama = await createIdeorama(req.body.ideorama)
      const uploadPath = getUploadPath(newIdeorama.id)
      await updateIdeoramaModelPath(newIdeorama.id, uploadPath)

      // Save in uploads dir
      const emptyScene = fs.readFileSync('uploads/scenes/scene-empty.json')
      fs.writeFileSync(uploadPath, emptyScene)

      return res.status(200).json({
        status: 'success',
        message: 'Idéorama mis à jour avec succès',
        data: newIdeorama,
        status_code: 200,
      });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la création de l\'idéorama',
        error,
      },
      status_code: 500,
    });
  }
};

/**
 * Finds all ideoramas of the authenticated user.
 *
 * @param req - Express request object. Expects 'req.body.ideoramaId' (string)
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: "Idéoramas récupéré avec succès"
 *    data: the ideoramas (Ideorama[]),
 *    status_code: 200
 *  }
 * - 401 if the user is not authenticated
 * - 500 if an unexpected error occurs
 */
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

    return res.status(200).json({
      status: 'success',
      message: "Idéoramas récupéré avec succès",
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

/**
 * Finds an ideorama based on its ID.
 *
 * @param req - Express request object. Expects 'req.body.ideoramaId' (string)
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: "Idéorama récupéré avec succès",
 *    data: the ideorama (Ideorama),
 *    status_code: 200
 *  }
 * - 401 if the user is not authenticated
 * - 404 if ideorama not found
 * - 500 if an unexpected error occurs
 */
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
    const ideorama = await getIdeoramaById(req.body.ideoramaId);

    if (!ideorama) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'Not Found',
          message: 'Idéorama introuvable',
        },
        status_code: 404,
      });
    }
    const fileContent = fs.readFileSync(ideorama.model, "utf-8")
    ideorama.model = JSON.parse(fileContent)
    return res.status(200).json({
      status: 'success',
      message: "Idéorama récupéré avec succès",
      data: ideorama,
      status_code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la récupération de l\'idéorama',
        error,
      },
      status_code: 500,
    });
  }
};

/**
 * Saves the changes in uploads/scenes/scene-<ID>.
 *
 * @param req - Express request object. Expects 'req.body.ideoramaId' (string)
 *                                      Expects 'req.body.model' (ModelInfo)
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: 'Idéorama mis à jour avec succès',
 *    data: the ideorama (Ideorama),
 *    status_code: 200
 *  }
 * - 401 if the user is not authenticated
 * - 500 if an unexpected error occurs
 */
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
      const uploadPath = getUploadPath(req.body.ideoramaId)

      fs.writeFileSync(uploadPath, req.body.ideorama.model)
      return res.status(200).json({
        status: 'success',
        message: 'Idéorama mis à jour avec succès',
        data: null,
        status_code: 200,
      });
    
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

/**
 * Deletes an ideorama from the database based its ID.
 * Deletes its corresponding scene in uploads/scenes
 *
 * @param req - Express request object. Expects 'req.body.ideoramaId' (string).
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: 'Ideorama supprimé avec succès',
 *    data: null,
 *    status_code: 200
 *  }
 * - 401 if the user is not authenticated
 * - 500 if an unexpected error occurs
 */
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
    await deleteIdeorama(req.body.ideoramaId)
    const uploadPath = getUploadPath(req.body.ideoramaId)

    fs.unlink(uploadPath, (err) => {if (err) {console.log(err)}})
    return res.status(200).json({
        status: 'success',
        message: 'Ideorama supprimé avec succès',
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

/**
 * @param req - Express request object.
 * @param res - Express response object.
 *
 * @returns Sends an HTTP response:
 * - 200 with:
 *  {
 *    status: "success",
 *    message: 'Ideorama vide récupéré avec succès',
 *    data: the model of the ideorama (ModelInfo),
 *    status_code: 200
 *  }
 * - 500 otherwise
 */
const getEmptyIdeorama = async(
  req: Request,
  res: Response
) => {
  try {
    const model = JSON.parse(fs.readFileSync(getUploadPath("empty"), "utf-8"))
    return res.status(200).json({
      status: 'success',
      message: 'Ideorama vide récupéré avec succès',
      data: {model: model},
      status_code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'Internal Server Error',
        message: 'Erreur lors de la récupération de l\'idéorama vide',
        error,
      },
      status_code: 500,
    });
  }
}


export { createIdeoramaController, deleteIdeoramaController, getEmptyIdeorama, getIdeoramaByIdController, getUserIdeoramasController, saveIdeoramaController };

