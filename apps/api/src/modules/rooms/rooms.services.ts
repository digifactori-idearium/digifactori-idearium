import { prisma } from '../../config/client.config';

export const createRoom = async (userId: string) => {
    const room = await prisma.room.create({
        data: {
            name: 'New Room',
            userId: userId,
        },
    });

    return room;
};

export const getMyRooms = async (userId: string) => {
    return prisma.room.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const getRoomById = async (roomId: string, userId: string) => {
    return prisma.room.findFirst({
        where: {
            id: roomId,
            userId: userId,
        },
    });
};

export const updateRoom = async (
    roomId: string,
    userId: string,
    data: any
) => {
    return prisma.room.update({
        where: {
            id: roomId,
        },
        data,
    });
};