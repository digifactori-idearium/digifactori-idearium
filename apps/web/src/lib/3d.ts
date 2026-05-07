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
  const sizeSq = size * size;
  return new three.Vector3(
    Math.floor(index / sizeSq),
    Math.floor((index / size) % size),
    index % size
  );
}

export function getContrastColor(hex: string): 'text-black' | 'text-white' {
  // Validate and normalize hex
  let color = hex.replace('#', '').trim();
  if (!/^[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(color)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  // Handle shorthand #RGB -> #RRGGBB
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? 'text-black' : 'text-white';
}

// Returns true if making `childId`'s parent = `newParentId` would create a cycle
export function wouldCreateParentCycle(
  objects: Record<string, ObjectState>,
  childId: string,
  newParentId: string
): boolean {
  let current: string | null = newParentId;
  while (current) {
    if (current === childId) return true;
    current = objects[current]?.advanced?.parent ?? null;
  }
  return false;
}
