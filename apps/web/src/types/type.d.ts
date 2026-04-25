interface Option {
  text: string;
  value: string;
}

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
  // followers: { followingId: string }[];
  // following: { followedById: string }[];
  followers: string[];
  following: string[];
  ideoramaLiked: {
    ideoramaId: string;
  }[];
  ideoramas: {
    id: string;
    name: string;
  }[];
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
  _count: {
    likers: number;
  };
};

type ModelsInfo = {
  global: {
    brightness: 'bright' | 'dim' | 'dark';
    visible: boolean;
    music: { currentTrack: string; volume: number };
    theme: string;
  };
  background: { color: string; accent: string };
  info: {
    name: string;
    description: string;
    category?: string;
  };
  floor: PartSettings;
  objects: Record<string, ObjectState>;
};

type Asset = {
  name: string;
  category: string;
  description: string;
  source?: string;
  preview?: source;
  createdAt?: Date;
  updatedAt?: Date;
};

// My space
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

interface Integration {
  id: string;
  name: string;
}

interface CurrentStatusProps {
  status: Status;
}

// Settings and Integration
type IntegrationType = 'ASSET' | 'MUSIC' | 'OTHER';

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
  key: string;
  isActive: boolean;
  fieldMapping?: FieldMapping;
  createdAt?: string;
}

interface Settings {
  storeName?: string;
  storeURL?: string;
  integrations?: Integration[];
}
