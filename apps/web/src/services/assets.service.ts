export type AssetItem = {
  id: string;
  name: string;
  category: string;
  file: string;
};

export const assetsLibrary: AssetItem[] = [
  {
    id: 'speaker',
    name: 'Speaker',
    category: 'audio',
    file: '/models/person.glb',
  },
  {
    id: 'laptop',
    name: 'Laptop',
    category: 'audio',
    file: '/models/person.glb',
  },
  {
    id: 'plant',
    name: 'Plant',
    category: 'decor',
    file: '/models/Table.gltf',
  },
  {
    id: 'car',
    name: 'Car',
    category: 'vehicle',
    file: '/models/Table.gltf',
  },
];
