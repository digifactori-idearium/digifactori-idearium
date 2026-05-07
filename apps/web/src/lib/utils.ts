import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const round = (v: number, decimals = 1) =>
  Math.round(v * 10 ** decimals) / 10 ** decimals;
