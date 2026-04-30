// ===== Inputs
interface Option {
  text: string;
  value: string;
}

interface SearchOption {
  value: string;
  label: string;
}

// ===== User and auth management
type Role = 'INTERN' | 'SUPERVISOR' | 'ADMIN';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  first_name: string;
  last_name: string;
  isActive: boolean;
  password: string;
  parental_code: string | null;
  role: Role;
  profile?: Profile;
};

type UserSession = {
  id: string;
  email: string;
  role: Role;
  token: string;
};

type Profile = {
  id: string;
  userId: string;
  pseudo: string;
  avatar: string | null;
  bio: string | null;
  followers: string[];
  following: string[];
  ideoramaLiked: { ideoramaId: string }[];
  ideoramas: { id: string; name: string }[];
};

interface CreateUserInput {
  email: string;
  first_name: string;
  last_name: string;
  pseudo: string;
  role: Role;
}

interface UpdateUserInput {
  email?: string;
  first_name?: string;
  last_name?: string;
}

// ===== 3D space management
type Ideorama = {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  brightness: string;
  isPublic: boolean;
  backgroundColor: string;
  leftWallColor: string;
  rightWallColor: string;
  floorColor: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  model: ModelsInfo;
  _count: { likers: number };
};

type ModelsInfo = {
  global: {
    brightness: 'bright' | 'dim' | 'dark';
    visible: boolean;
    music: { currentTrack: string; volume: number };
    theme: string;
  };
  background: { color: string; accent: string };
  info: { name: string; description: string; category?: string };
  floor: PartSettings;
  objects: Record<string, ObjectState>;
};

// ===== My space
interface CardDef {
  id: string;
  title: string;
  emoji: string;
  link: string;
  count: number;
  accentColor: string;
  tooltipCreate: string;
  orbit: 1 | 2;
  onActionClick: () => void;
}

interface MySpaceSceneDims {
  w: number;
  h: number;
}

interface ThemePalette {
  backgrounds: { label: string; thumb: string; value: string }[];
  defaultBg: string;
  orbitRingColor: string;
  pulseRingColor: string;
  greetingText: string;
  greetingBg: string;
  greetingBorder: string;
  statText: string;
  statBg: string;
  statBorder: string;
  loadingBg: string;
  loadingText: string;
  loadingSpinner: string;
}

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  dAlpha: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  active: boolean;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  alpha: number;
  puffs: { dx: number; dy: number; r: number }[];
}

// ===== Text editor
interface Document {
  id: string;
  title: string;
  content: string;
  json?: Record<string, unknown>;
  wordCount: number;
  emoji: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

type DocumentListItem = Omit<Document, 'content' | 'json'>;

interface CreateDocumentPayload {
  userId: string;
  title?: string;
  content?: string;
  json?: Record<string, unknown>;
  emoji?: string;
  color?: string;
}

interface UpdateDocumentPayload {
  title?: string;
  content?: string;
  json?: Record<string, unknown>;
  emoji?: string;
  color?: string;
}

type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
type TextAlign = 'left' | 'center' | 'right';

interface EditorToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  bulletList: boolean;
  orderedList: boolean;
  heading: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
}

interface CurrentStatusProps {
  status: Status;
}

// ===== Settings and integrations
type IntegrationType = 'MODEL_3D' | 'SOUND' | 'IMAGE' | 'OTHER';

interface FieldMapping {
  id: string;
  name: string;
  category?: string;
  file: string;
  thumbnail?: string;
}

interface Integration {
  id: string;
  name: string;
  url: string;
  type: IntegrationType;
  key?: string;
  isActive: boolean;
  fieldMapping: Record<string, string>;
  createdAt?: string;
}

interface MediaItem {
  id: string;
  name: string;
  category: string;
  file: string;
  thumbnail?: string;
}

interface FetchResult {
  items: MediaItem[];
  hasMore: boolean;
}

type StorageProvider = 'S3' | 'R2' | 'GCS' | 'AZURE' | 'MINIO' | 'LOCAL';

interface CloudStorage {
  id: number;
  name?: string | null;
  provider: StorageProvider;
  region?: string | null;
  endpoint?: string | null;
  bucket?: string | null;
  accessKey?: string | null;
  secretKey?: string | null;
  publicUrl?: string | null;
  settingId: number;
  createdAt: string;
  updatedAt: string;
}

interface Settings {
  id: number;
  orgCode: number;
  orgParentalCode: number;
  storage: CloudStorage | null;
  integrations: Integration[];
  createdAt: string;
  updatedAt: string;
}

// ===== Internal Assets Management
type AssetCategory = 'MODEL_3D' | 'SOUND' | 'IMAGE' | 'OTHER';

type AssetType =
  | 'FOOD_AND_DRINK'
  | 'CLUTTER'
  | 'WEAPONS'
  | 'TRANSPORT'
  | 'FURNITURE_AND_DECOR'
  | 'OBJECTS'
  | 'NATURE'
  | 'ANIMALS'
  | 'BUILDINGS'
  | 'PEOPLE_AND_CHARACTERS'
  | 'SCENES_AND_LEVELS'
  | 'OTHER';

type Asset = {
  id: string;
  name: string;
  category: AssetCategory;
  assetType: AssetType;
  tags: string[];
  file: string;
  fileUrl: string;
  thumbnail: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

interface PaginatedAssets {
  items: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ListAssetsParams {
  category?: AssetCategory;
  assetType?: AssetType;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

interface CreateAssetInput {
  name: string;
  category: AssetCategory;
  assetType?: AssetType;
  tags?: string[];
  file: File;
  thumbnail?: File;
}

interface BulkAssetDescriptor {
  name: string;
  category: AssetCategory;
  assetType?: AssetType;
  tags?: string[];
  fileIndex: number;
  thumbnailIndex?: number;
}

interface AssetUploadEntry {
  name: string;
  category: AssetCategory;
  assetType?: AssetType;
  tags?: string[];
  file: File;
  thumbnail?: File;
}

interface BulkCreateAssetInput {
  assets: AssetUploadEntry[];
}

interface BulkCreateResult {
  succeeded: Asset[];
  failed: { index: number; name: string; reason: string }[];
}

interface BulkDeleteResult {
  deleted: number;
  failed: { id: string; reason: string }[];
}

interface UpdateAssetInput {
  name?: string;
  category?: AssetCategory;
  assetType?: AssetType;
  tags?: string[];
  file?: File;
  thumbnail?: File;
}
