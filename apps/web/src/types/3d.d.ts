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

type RoomMode = 'edit' | 'play';

interface RoomState {
  // Global State
  mode: RoomMode;
  global: {
    brightness: 'bright' | 'dim' | 'dark';
    visible: boolean;
    music: { currentTrack: string; volume: number };
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

  // Objects managements
  objects: Record<string, ObjectState>;
  selectedObjectId: string | null;

  //Objects movement managemet
  isDragging: boolean;
  // setIsDragging: (isDragging: boolean) => void;

  // // Actions
  // update: (path: keyof Omit<RoomState, 'update'>, values: Partial<any>) => void;
  // setMode: (mode: RoomMode) => void;

  // //Object states managements
  // selectObject: (id?: string) => void;
  // clearSelection: () => void;
  // // addObject: (id: string, object: ObjectState) => void;
  // addObject: (type?: string) => void;

  // updateObjectSlice: (
  //   id: string,
  //   slice: keyof ObjectState,
  //   values: Partial<any>
  // ) => void;
  // removeObject: (id: string) => void;
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
}
type Node = 'translate' | 'rotate' | 'scale';
type ObjectSliceKey = keyof ObjectState;
type RootSliceKey = keyof Omit<RoomState, 'objects'>;
