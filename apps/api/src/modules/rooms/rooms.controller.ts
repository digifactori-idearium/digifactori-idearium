import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { createRoom, getMyRooms, getRoomById, updateRoom } from './rooms.services';

const createRoomController = async (
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
        const room = await createRoom(user.userId);

        return res.status(201).json({
            status: 'success',
            message: 'Room créée avec succès',
            data: room,
            status_code: 201,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Erreur lors de la création de la room',
                error,
            },
            status_code: 500,
        });
    }
};


const getMyRoomsController = async (
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
        const rooms = await getMyRooms(user.userId);

        return res.status(200).json({
            status: 'success',
            data: rooms,
            status_code: 200,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Erreur lors de la récupération des rooms',
                error,
            },
            status_code: 500,
        });
    }
};

const getRoomByIdController = async (
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
        const room = await getRoomById(id, user.userId);

        if (!room) {
            return res.status(404).json({
                status: 'error',
                error: {
                    code: 'Not Found',
                    message: 'Room introuvable',
                },
                status_code: 404,
            });
        }

        return res.status(200).json({
            status: 'success',
            data: room,
            status_code: 200,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Erreur lors de la récupération de la room',
                error,
            },
            status_code: 500,
        });
    }
};

const updateRoomController = async (
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
        const updatedRoom = await updateRoom(
            id,
            user.userId,
            req.body
        );

        return res.status(200).json({
            status: 'success',
            message: 'Room mise à jour avec succès',
            data: updatedRoom,
            status_code: 200,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Erreur lors de la mise à jour de la room',
                error,
            },
            status_code: 500,
        });
    }
};

export { createRoomController, getMyRoomsController, getRoomByIdController, updateRoomController };