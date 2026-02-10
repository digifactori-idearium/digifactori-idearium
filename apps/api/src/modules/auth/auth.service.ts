import { prisma, type User } from '../../config/client.config';

const userTable = prisma.user;

export class UserService {
  // Create user
  async createUser(data: User) {
    return await userTable.create({
      data,
      select: {
        id: true,
        email: true,
      },
    });
  }
}
