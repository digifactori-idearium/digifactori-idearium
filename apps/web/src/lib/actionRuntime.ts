import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

//  Types
type CleanupFn = () => void;
type TickFn = (delta: number) => void;

// Helpers
const cleanupFns = new Map<string, CleanupFn>();
const objectIndex = new Map<string, Set<string>>();

function _link(actionId: string, objectId: string): void {
  let bucket = objectIndex.get(objectId);
  if (!bucket) {
    bucket = new Set();
    objectIndex.set(objectId, bucket);
  }
  bucket.add(actionId);
}

function _unlink(actionId: string): void {
  objectIndex.forEach(bucket => bucket.delete(actionId));
}

// Actions Cleanup
/**
 * Register a cleanup function for an action.
 * Kills any previously registered cleanup for the same actionId first.
 * Pass objectId to enable bulk cleanup via cleanObject / cleanAll.
 */
export function setCleanup(
  actionId: string,
  fn: CleanupFn,
  objectId?: string
): void {
  runCleanup(actionId);
  cleanupFns.set(actionId, fn);
  if (objectId) _link(actionId, objectId);
}

/** Run and remove the cleanup for a single action. */
export function runCleanup(actionId: string): void {
  cleanupFns.get(actionId)?.();
  cleanupFns.delete(actionId);
  _unlink(actionId);
}

/**
 * Kill all actions belonging to one object.
 * Call from Model on unmount and whenever entering edit mode.
 */
export function cleanObject(objectId: string): void {
  const ids = objectIndex.get(objectId);
  if (!ids) return;
  [...ids].forEach(runCleanup);
  objectIndex.delete(objectId);
}

/** Kill every active action across all objects. */
export function cleanAll(): void {
  [...cleanupFns.keys()].forEach(runCleanup);
  objectIndex.clear();
}

//  tween helpers

/** Kill all gsap tweens stored on a Three.js object and clear the list. */
export function clearTweens(ref: THREE.Object3D): void {
  const tweens: gsap.core.Tween[] = ref.userData.tweens ?? [];
  tweens.forEach(t => t.kill());
  ref.userData.tweens = [];
}

/** Attach a tween to a Three.js object so killTweens can reach it later. */
export function addTween(ref: THREE.Object3D, tween: gsap.core.Tween): void {
  if (!ref.userData.tweens) ref.userData.tweens = [];
  ref.userData.tweens.push(tween);
}

// ---- Per-frame tick registry ----

const _tickers = new Set<TickFn>();

/** Register a per-frame callback. Returns an unsubscribe fn. */
export function addTicker(fn: TickFn): () => void {
  _tickers.add(fn);
  return () => _tickers.delete(fn);
}

/** Directly remove a ticker */
export function removeTicker(fn: TickFn): void {
  _tickers.delete(fn);
}

export function tickAll(delta: number): void {
  _tickers.forEach(fn => fn(delta));
}

export function activeTickerCount(): number {
  return _tickers.size;
}

/**
 * Inside <Canvas> at the top level.
 * It drives every registered ticker in sync with R3F's render loop.
 */
export function ActionTicker(): null {
  useFrame((_, delta) => tickAll(delta));
  return null;
}
