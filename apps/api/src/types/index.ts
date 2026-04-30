import {
  CloudStorage,
  Document,
  Ideorama,
  Integration,
  Profile,
  Role,
  Setting,
  User,
  VoxelModel,
} from '@prisma/client';

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
  changePassword: (
    userId: string,
    currentPassword: string,
    newPassword: string
  ) => Promise<true>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<true>;
}

export interface IIdeoramaService {
  createIdeorama(ideoramaData: Ideorama): Promise<Ideorama>;
  updateIdeoramaModelFileKey(
    ideoramaId: string,
    fileKey: string
  ): Promise<Ideorama>;
  updateIdeoramaModelPath(
    ideoramaId: string,
    uploadPath: string
  ): Promise<Ideorama>;
  getIdeoramaById(ideoramaId: string): Promise<Ideorama | null>;
  getUserIdeoramas(userId: string): Promise<Ideorama[]>;
  updateIdeorama(ideoramaId: string, data: Ideorama): Promise<Ideorama>;
  isIdeoramaInBD(ideoramaId: string): Promise<boolean>;
  likeIdeorama(ideoramaId: string, userId: string): Promise<boolean>;
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
  followUser(userId: string, followedUserId: string): Promise<boolean>;
  getFollowers(
    userId: string
  ): Promise<{ pseudo: string; avatar: string | null }[]>;
  getFollowing(
    userId: string
  ): Promise<{ pseudo: string; avatar: string | null }[]>;
  deleteUser(userId: string): Promise<{ user: User; profile: Profile }>;
}

export interface IVoxelService {
  createVoxelModel(data: {
    name?: string;
    userId: string;
  }): Promise<VoxelModel>;
  updateVoxelModelFileKey(
    voxelModelId: string,
    fileKey: string
  ): Promise<VoxelModel>;
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

export interface IEditorService {
  createDocument(data: {
    title?: string;
    content?: string;
    json?: Record<string, any>;
    wordCount?: number;
    emoji?: string;
    color?: string;
    userId: string;
  }): Promise<Document>;
  getUserDocuments(userId: string): Promise<Document[]>;
  getDocumentById(documentId: string): Promise<Document | null>;
  updateDocument(
    documentId: string,
    data: {
      title?: string;
      content?: string;
      json?: Record<string, any>;
      wordCount?: number;
      emoji?: string;
      color?: string;
    }
  ): Promise<Document>;
  deleteDocument(documentId: string): Promise<Document>;
  saveDocument(
    documentId: string,
    data: {
      title?: string;
      content?: string;
      json?: Record<string, any>;
      wordCount?: number;
      emoji?: string;
      color?: string;
    }
  ): Promise<Document>;
}

export interface ISettingsService {
  // Settings (singleton)
  getSettings(): Promise<
    Setting & { integrations: Integration[] } & { storage: CloudStorage | null }
  >;
  updateSettings(data: {
    orgCode?: number;
    orgParentalCode?: number;
  }): Promise<
    Setting & { integrations: Integration[] } & { storage: CloudStorage | null }
  >;

  // Integrations
  getIntegrations(type?: string): Promise<Integration[]>;
  getIntegrationById(integrationId: string): Promise<Integration>;
  createIntegration(data: {
    name: string;
    url: string;
    type: string;
    key?: string;
    isActive?: boolean;
    fieldMapping?: Record<string, any>;
  }): Promise<Integration>;
  updateIntegration(
    integrationId: string,
    data: {
      name?: string;
      url?: string;
      type?: string;
      key?: string;
      isActive?: boolean;
      fieldMapping?: Record<string, any>;
    }
  ): Promise<Integration>;
  toggleIntegration(integrationId: string): Promise<Integration>;
  deleteIntegration(integrationId: string): Promise<Integration>;
}

export interface IUserService {
  getUsers(requesterRole: Role): Promise<User[]>;
  getUserById(id: string, requesterRole: Role): Promise<User | null>;
  createUser(data: {
    email: string;
    first_name: string;
    last_name: string;
    pseudo: string;
    role: Role;
  }): Promise<{ user: User }>;
  updateUser(
    id: string,
    data: Partial<Pick<User, 'email' | 'first_name' | 'last_name'>>
  ): Promise<User>;
  setActive(id: string, isActive: boolean): Promise<User>;
  updateRole(id: string, role: Role): Promise<User>;
  deleteUser(id: string): Promise<{ user: User }>;
}

export interface IAssetService {
  getAssets(filter: ListAssetsFilter): Promise<PaginatedAssets>;
  getAssetById(id: string): Promise<AssetRecord>;
  createAsset(input: CreateAssetInput): Promise<AssetRecord>;
  bulkCreateAssets(
    descriptors: BulkCreateAssetInput[],
    files: UploadedFile[],
    thumbnails: UploadedFile[]
  ): Promise<BulkCreateResult>;
  updateAsset(id: string, input: UpdateAssetInput): Promise<AssetRecord>;
  deleteAsset(id: string): Promise<AssetRecord>;
  bulkDeleteAssets(ids: string[]): Promise<BulkDeleteResult>;
}
