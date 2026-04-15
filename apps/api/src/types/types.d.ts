interface ValidationError {
  field: string;
  message: string;
}

interface LoginInput {
  email: string;
  pseudo: string;
  password: string;
}

interface UserInput {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  parental_code?: number;
  role: 'CHILD' | 'SUPERVISOR';
}

interface ProfileInput {
  pseudo: string;
  bio?: string;
  avatar?: string;
}

type RegisterInput = {
  user: UserInput;
  profile: ProfileInput;
};

type SetProfileInput = {
  user?: Partial<UserInput>;
  profile: Partial<ProfileInput>;
};

type ModelInfo = {
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
  floor: {
    color: string;
    hidden: boolean;
    texture: string;
  };
  objects: Record<string, ObjectState>;
};

interface ObjectState {
  // Info
  info: {
    name: string;
    category?: string;
    file?: string;
  };

  // Transform
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
  };

  // Style
  style: {
    tint: string;
    opacity: number;
    glow: number;
    threshold: number;
  };

  // Advanced
  advanced: {
    parent: string | null;
    physics: boolean;
    hidden: boolean;
    locked: boolean;
  };

  actions?: ActionConfig[];
  actionsVersion?: number;
}

type TriggerType = 'onStart' | 'onTap';

interface ActionConfig {
  id: string;
  type: ActionType;
  active?: boolean;
  subType: string;
  trigger: TriggerType;
  config: Record<string, any>;
}
