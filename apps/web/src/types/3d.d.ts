// VOXEL 3D TYPES

type Environement = {
  name: string;
};
type Block = {
  name: string; // Block name
  guid: string; // Unique global Id
  uid: number; // Unique local id
  sidesTex: [
    // Array of textures
    string, // BACK
    string, // FRONT
    string, // RIGHT
    string, // LEFT
    string, // TOP
    string, // BOTTOM
  ];
  size: [
    // Edges size
    number, // WIDTH
    number, // HEIGHT
    number, // DEPTH
  ];
  type: string; // GAZ, LIQUID, BLOCK
  opacity: number;
  speed: number; // 0 - 1
};

enum Side {
  Left = 1,
  Right = 2,
  Forward = 4,
  Backward = 8,
  Top = 16,
  Bottom = 32,
  Z_Axis = 3,
  X_Axis = 12,
  Y_Axis = 48,
  All = 63,
}

type Chunk = {
  position: Vector3; // 3D position in the world
  size: number; // Size of the chunk, default will be 32
  data: Array<number>; // The original data
  dataSize: number; // The number of non empty blocks
  rcData: Array<number>; // An optimized version of visible only visible data
  rcDataSize: number; // The number of visible blocks
  hasRc: boolean; // Define if a chunk has been optimized or not
};

// GLOBAL ROOM TYPES
interface PartSettings {
  color: string;
  hidden: boolean;
  texture: string;
}

interface RoomState {
  // Global State
  global: {
    brightness: 'bright' | 'dim' | 'dark';
    visible: boolean;
    theme: 'customized' | 'black-orange' | 'pink-blue' | 'white';
  };

  background: { color: string; accent: string };

  // Info State
  info: {
    description: string;
    category?: string;
  };

  // Environment Parts
  leftWall: PartSettings;
  rightWall: PartSettings;
  floor: PartSettings;

  // Actions
  update: (path: keyof Omit<RoomState, 'update'>, values: Partial<any>) => void;
}

// OBJECT ASSETS TYPES

interface TransformSettings {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
}

interface StyleSettings {
  tint: string;
  opacity: number;
  glow: number;
  threshold: number;
}

interface AdvancedSettings {
  parent: string | null;
  physics: boolean;
  hidden: boolean;
  locked: boolean;
}

interface ObjectState {
  // Info
  info: {
    name: string;
    category?: string;
  };

  // Transform
  transform: TransformSettings;

  // Style
  style: StyleSettings;

  // Advanced
  advanced: AdvancedSettings;

  // Actions
  update: (
    path: keyof Omit<ObjectState, 'update'>,
    values: Partial<any>
  ) => void;
}
