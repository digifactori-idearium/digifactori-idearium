import fs from 'fs';
import path from 'path';

import { Response } from 'express';

import { AuthenticatedRequest } from '../../types';
import {
    createVoxelModel,
    deleteVoxelModel,
    getUserVoxelModels,
    getVoxelModelById,
    updateVoxelModelPath,
} from './voxel.service';

const getUploadPath = (voxelModelId: string) => {
    const id = String(voxelModelId);

    if (!/^[a-z0-9]+$/i.test(id)) {
        throw new Error('Invalid voxelModelId');
    }

    const fileName = `model-${id}.json`;
    return path.join(process.cwd(), 'uploads/voxel-models', fileName);
};

const saveVoxelModelController = async (
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
        if (!req.body.voxelModelId) {
            const newVoxelModel = await createVoxelModel({
                name: req.body.voxelModel?.name,
                userId: user.userId,
            });

            const uploadPath = getUploadPath(newVoxelModel.id);
            await updateVoxelModelPath(newVoxelModel.id, uploadPath);

            const emptyModel = fs.readFileSync(
                path.join(process.cwd(), 'uploads/voxel-models', 'model-empty.json'),
                'utf-8'
            );

            fs.writeFileSync(uploadPath, emptyModel);

            return res.status(200).json({
                status: 'success',
                message: 'Voxel model créé avec succès',
                data: newVoxelModel,
                status_code: 200,
            });
        } else {
            const uploadPath = getUploadPath(req.body.voxelModelId);

            fs.writeFileSync(uploadPath, req.body.voxelModel.model);

            return res.status(200).json({
                status: 'success',
                message: 'Voxel model mis à jour avec succès',
                data: null,
                status_code: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Erreur lors de la sauvegarde du voxel model',
                error,
            },
            status_code: 500,
        });
    }
};

const getVoxelModelByIdController = async (
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
        const voxelModel = await getVoxelModelById(
            req.body.voxelModelId,
            user.userId
        );

        if (!voxelModel) {
            return res.status(404).json({
                status: 'error',
                error: {
                    code: 'Not Found',
                    message: 'Voxel model introuvable',
                },
                status_code: 404,
            });
        }

        const fileContent = fs.readFileSync(voxelModel.model, 'utf-8');

        return res.status(200).json({
            status: 'success',
            data: {
                ...voxelModel,
                model: JSON.parse(fileContent),
            },
            status_code: 200,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Erreur lors de la récupération du voxel model',
                error,
            },
            status_code: 500,
        });
    }
};

const getUserVoxelModelsController = async (
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
        const voxelModels = await getUserVoxelModels(user.userId);

        return res.status(200).json({
            status: 'success',
            data: voxelModels,
            status_code: 200,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Erreur lors de la récupération des voxel models',
                error,
            },
            status_code: 500,
        });
    }
};

const deleteVoxelModelController = async (
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
        const uploadPath = getUploadPath(req.body.voxelModelId);

        await deleteVoxelModel(req.body.voxelModelId, user.userId);

        fs.unlink(uploadPath, err => {
            if (err) {
                console.log(err);
            }
        });

        return res.status(200).json({
            status: 'success',
            message: 'Voxel model supprimé avec succès',
            data: null,
            status_code: 200,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Erreur lors de la suppression du voxel model',
                error,
            },
            status_code: 500,
        });
    }
};

export {
    deleteVoxelModelController,
    getUserVoxelModelsController,
    getVoxelModelByIdController,
    saveVoxelModelController,
};