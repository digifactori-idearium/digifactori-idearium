interface Option {
  text: string;
  value: string;
}

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
  password: string;
  parental_code: string | null;
  role: 'CHILD' | 'SUPERVISOR';
};

type UserSession = {
  id: string;
  email: string;
  role: 'CHILD' | 'SUPERVISOR';
  token: string;
};

type Profile = {
  id: string;
  userId: string;
  pseudo: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Role = 'CHILD' | 'SUPERVISOR';

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
};

type IdeoramaModel = {
  model: ModelsInfo;
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
