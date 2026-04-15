import { Ideorama, Profile, Role, User, VoxelModel } from '@prisma/client';

export interface UserPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface RequestBodyProfile {
  pseudo?: string;
  avatar?: string;
  bio?: string;
}

export interface IAuthService {
  createUser(input: UserInput): Promise<User>;
  createProfile: (input: ProfileInput, userId: string) => Promise<Profile>;
  createAccount: (
    data: RegisterInput
  ) => Promise<{ profile: Profile; user: User }>;
  loginEmail: (email: string, password: string) => Promise<User | null>;
  loginPseudo: (email: string, password: string) => Promise<User | null>;
}

export interface IIdeoramaService {
  createIdeorama(ideoramaData: Ideorama): Promise<Ideorama>;
  updateIdeoramaModelPath(
    ideoramaId: string,
    uploadPath: string
  ): Promise<Ideorama>;
  getIdeoramaById(ideoramaId: string): Promise<Ideorama | null>;
  getUserIdeoramas(userId: string): Promise<Ideorama[]>;
  updateIdeorama(ideoramaId: string, data: Ideorama): Promise<Ideorama>;
  isIdeoramaInBD(ideoramaId: string): Promise<boolean>;
  deleteIdeorama(ideoramaId: string): Promise<Ideorama>;
}

export interface IProfileService {
  verifyPassword(userId: string, password: string): Promise<boolean>;
  getSingleProfile(userId: string): Promise<Profile | null>;
  getSingleUser(userId: string): Promise<User | null>;
  updateProfile(
    userId: string,
    body: SetProfileInput
  ): Promise<{ user?: User; profile: Profile }>;
  deleteUser(userId: string): Promise<{ user: User; profile: Profile }>;
}

export interface IVoxelService {
  createVoxelModel(data: {
    name?: string;
    userId: string;
  }): Promise<VoxelModel>;
  updateVoxelModelPath(
    voxelModelId: string,
    uploadPath: string
  ): Promise<VoxelModel>;
  getVoxelModelById(
    voxelModelId: string,
    userId: string
  ): Promise<VoxelModel | null>;
  getUserVoxelModels(userId: string): Promise<VoxelModel[]>;
  deleteVoxelModel(voxelModelId: string, userId: string): Promise<VoxelModel>;
}
