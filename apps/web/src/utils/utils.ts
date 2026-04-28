/**
 * Safely serializes a value, filtering out circular references, Promises, and functions
 */
export const createReplacer = () => {
  const visited = new WeakSet();
  return (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) {
        return undefined;
      }
      visited.add(value);
    }
    if (value instanceof Promise || typeof value === 'function') {
      return undefined;
    }
    return value;
  };
};