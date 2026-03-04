import * as three from 'three';

/**
 * Convert a vector 3 coordinate to a flat array index
 * @param x {number} The x coordinate
 * @param y {number} The y coordinate
 * @param z {number} The z coordinate
 * @param size {number} The size of each dimension, the size is the same for each one
 */
export function vector3ToArrayIndex(
  x: number,
  y: number,
  z: number,
  size: number = 32
) {
  return size * size * x + size * y + z;
}

/**
 * Convert a flat array index to a 3D coordinate representation
 * @param index {number} The array index
 * @param size {number} The size of x,y,z dimension
 */
export function arrayIndexToVector3(index: number, size: number = 32) {
  return new three.Vector3(
    (index / (size * size)) >> 0,
    ((index / size) % size) >> 0,
    (index % size) >> 0
  );
}

export function getContrastColor(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? 'text-black' : 'text-white';
}
