import { Router, type Router as ExpressRouter } from 'express';
import authenticate from '../../middlewares/authenticate';
import { createRoomController, getMyRoomsController, getRoomByIdController, updateRoomController } from './rooms.controller';

const roomsRoutes: ExpressRouter = Router();

roomsRoutes.post('/', authenticate, createRoomController);
roomsRoutes.get('/my', authenticate, getMyRoomsController);
roomsRoutes.get('/:id', authenticate, getRoomByIdController);
roomsRoutes.patch('/:id', authenticate, updateRoomController);
export default roomsRoutes;