import { Vector3 as QVec3, Vector4 as QVec4 } from 'quarks.core';
import * as THREE from 'three';
import {
  BatchedRenderer,
  ParticleSystem,
  RenderMode,
  SphereEmitter,
  ConeEmitter,
  ConstantValue,
  IntervalValue,
  ColorRange,
  Gradient,
  ColorOverLife,
  SizeOverLife,
  ApplyForce,
  PiecewiseBezier,
  Bezier,
} from 'three.quarks';

import { addTicker, removeTicker } from './actionRuntime';

type Cleanup = () => void;
type TickFn = (delta: number) => void;

// Shared BatchedRenderer per scene
interface RendererEntry {
  renderer: BatchedRenderer;
  tick: TickFn;
  refCount: number;
}

const _entries = new Map<string, RendererEntry>();

function acquireRenderer(rootScene: THREE.Scene): RendererEntry {
  const key = rootScene.uuid;
  if (!_entries.has(key)) {
    const renderer = new BatchedRenderer();
    rootScene.add(renderer);
    const tick: TickFn = delta => renderer.update(delta);
    addTicker(tick);
    _entries.set(key, { renderer, tick, refCount: 0 });
  }
  const entry = _entries.get(key)!;
  entry.refCount++;
  return entry;
}

function releaseRenderer(rootScene: THREE.Scene): void {
  const key = rootScene.uuid;
  const entry = _entries.get(key);
  if (!entry) return;
  entry.refCount--;
  if (entry.refCount <= 0) {
    removeTicker(entry.tick);
    rootScene.remove(entry.renderer);
    _entries.delete(key);
  }
}

//  Scene traversal to get the main scene

function getRootScene(obj: THREE.Object3D): THREE.Scene | null {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (cur instanceof THREE.Scene) return cur;
    cur = cur.parent;
  }
  return null;
}

// Helpers
function hexToQ3(hex: string): QVec3 {
  const c = new THREE.Color(hex);
  return new QVec3(c.r, c.g, c.b);
}

function qv4(r: number, g: number, b: number, a = 1): QVec4 {
  return new QVec4(r, g, b, a);
}

function linearSize(from: number, to: number): PiecewiseBezier {
  return new PiecewiseBezier([[new Bezier(from, from, to, to), 0]]);
}

// emitter.position
function setEmitterPos(ps: ParticleSystem, v: THREE.Vector3): void {
  ps.emitter.position.set(v.x, v.y, v.z);
}

// Shared effect builder

function makeEffect(
  sceneObj: THREE.Object3D,
  build: (
    renderer: BatchedRenderer,
    rootScene: THREE.Scene
  ) => {
    ps: ParticleSystem;
    autoDestroyMs?: number;
  }
): Cleanup {
  const rootScene = getRootScene(sceneObj);
  if (!rootScene) return () => {};

  const entry = acquireRenderer(rootScene);
  const { ps, autoDestroyMs } = build(entry.renderer, rootScene);

  // The emitter MUST be added to the scene — without this particles never spawn
  sceneObj.add(ps.emitter);
  entry.renderer.addSystem(ps);
  ps.play();

  let timeout: ReturnType<typeof setTimeout> | null = null;
  if (autoDestroyMs) {
    timeout = setTimeout(() => {
      rootScene.remove(ps.emitter);
      entry.renderer.deleteSystem(ps);
      releaseRenderer(rootScene);
    }, autoDestroyMs);
  }

  return () => {
    if (timeout) clearTimeout(timeout);
    rootScene.remove(ps.emitter);
    entry.renderer.deleteSystem(ps);
    ps.stop();
    releaseRenderer(rootScene);
  };
}

// ---- EXPLOSION ----
export interface ExplosionOptions {
  count?: number;
  speed?: number;
  gravity?: number;
  lifespan?: number;
  colorA?: string;
  colorB?: string;
  pointSize?: number;
}

export function createExplosion(
  sceneObj: THREE.Object3D,
  opts: ExplosionOptions = {}
): Cleanup {
  const {
    count = 80,
    speed = 4,
    lifespan = 1.2,
    gravity = 5,
    colorA = '#ff6600',
    colorB = '#ffdd00',
    pointSize = 6,
  } = opts;

  const scale = (sceneObj.scale.x + sceneObj.scale.y + sceneObj.scale.z) / 3;
  const ca = hexToQ3(colorA);
  const cb = hexToQ3(colorB);

  return makeEffect(sceneObj, () => {
    const ps = new ParticleSystem({
      duration: lifespan,
      looping: false,
      autoDestroy: true,
      startLife: new ConstantValue(lifespan),
      startSpeed: new IntervalValue(speed * scale * 0.4, speed * scale * 1.1),
      startSize: new IntervalValue(
        pointSize * 0.01 * scale,
        pointSize * 0.04 * scale
      ),
      startColor: new ColorRange(qv4(ca.x, ca.y, ca.z), qv4(cb.x, cb.y, cb.z)),
      worldSpace: false,
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [
        {
          time: 0,
          count: new ConstantValue(count),
          cycle: 1,
          interval: 0.01,
          probability: 1,
        },
      ],
      shape: new SphereEmitter({
        radius: 0.03 * scale,
        thickness: 1,
        arc: Math.PI * 2,
      }),
      material: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      }),
      renderMode: RenderMode.BillBoard,
      renderOrder: 2,
    });

    ps.addBehavior(
      new ColorOverLife(
        new Gradient(
          [
            [ca, 0],
            [cb, 1],
          ],
          [
            [1, 0],
            [0, 1],
          ]
        )
      )
    );

    ps.addBehavior(new SizeOverLife(linearSize(1, 0)));
    ps.addBehavior(
      new ApplyForce(new QVec3(0, -1, 0), new ConstantValue(gravity * scale))
    );

    ps.emitter.position.set(0, 0, 0);

    return { ps, autoDestroyMs: (lifespan + 0.5) * 1000 };
  });
}

// ---- RAIN ----

export interface RainOptions {
  count?: number;
  speed?: number;
  spread?: number;
  height?: number;
  color?: string;
}

export function createRain(
  sceneObj: THREE.Object3D,
  opts: RainOptions = {}
): Cleanup {
  const {
    count = 200,
    speed = 3,
    spread = 3,
    height = 5,
    color = '#88ccff',
  } = opts;
  const origin = sceneObj.position.clone();
  const life = height / speed;
  const cq = hexToQ3(color);

  return makeEffect(sceneObj, () => {
    const ps = new ParticleSystem({
      duration: 10,
      looping: true,
      startLife: new IntervalValue(life * 0.9, life * 1.1),
      startSpeed: new IntervalValue(speed * 0.9, speed * 1.1),
      startSize: new ConstantValue(0.04),
      startColor: new ColorRange(
        qv4(cq.x, cq.y, cq.z, 0.6),
        qv4(cq.x, cq.y, cq.z, 0.9)
      ),
      worldSpace: true,
      emissionOverTime: new ConstantValue(count / life),
      shape: new ConeEmitter({
        radius: spread,
        arc: Math.PI * 2,
        thickness: 1,
        angle: 0,
      }),
      material: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
      }),
      renderMode: RenderMode.StretchedBillBoard,
      rendererEmitterSettings: { speedFactor: 0.5, lengthFactor: 0.3 },
      renderOrder: 1,
    });

    ps.addBehavior(
      new ApplyForce(new QVec3(0, -1, 0), new ConstantValue(speed * 2))
    );

    // Spawn above origin, cone pointing downward
    const spawnPos = origin.clone().add(new THREE.Vector3(0, height, 0));
    setEmitterPos(ps, spawnPos);
    ps.emitter.rotation.set(Math.PI / 2, 0, 0);
    return { ps };
  });
}

// ---- SNOW ----

export interface SnowOptions {
  count?: number;
  speed?: number;
  spread?: number;
  height?: number;
}

export function createSnow(
  sceneObj: THREE.Object3D,
  opts: SnowOptions = {}
): Cleanup {
  const origin = sceneObj.position.clone();
  const { count = 120, speed = 0.5, spread = 3.5, height = 5 } = opts;
  const life = height / speed;

  return makeEffect(sceneObj, () => {
    const ps = new ParticleSystem({
      duration: 10,
      looping: true,
      startLife: new IntervalValue(life * 0.9, life * 1.3),
      startSpeed: new ConstantValue(speed),
      startSize: new IntervalValue(0.04, 0.1),
      startColor: new ColorRange(qv4(0.85, 0.92, 1, 0.7), qv4(1, 1, 1, 0.9)),
      worldSpace: true,
      emissionOverTime: new ConstantValue(count / life),
      shape: new ConeEmitter({
        radius: spread,
        arc: Math.PI * 2,
        thickness: 1,
        angle: 0,
      }),
      material: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
      }),
      renderMode: RenderMode.BillBoard,
      renderOrder: 1,
    });

    ps.addBehavior(
      new ApplyForce(new QVec3(0.2, 0, 0.1), new ConstantValue(0.3))
    );
    ps.addBehavior(
      new SizeOverLife(
        new PiecewiseBezier([
          [new Bezier(0.4, 0.4, 1, 1), 0],
          [new Bezier(1, 1, 0.6, 0.6), 0.5],
        ])
      )
    );

    // Spawn above origin, cone pointing downward
    const spawnPos = origin.clone().add(new THREE.Vector3(0, height, 0));
    setEmitterPos(ps, spawnPos);
    ps.emitter.rotation.set(Math.PI / 2, 0, 0);

    return { ps };
  });
}

// ---- FLAME ----

export interface FlameOptions {
  count?: number;
  height?: number;
  spread?: number;
  lifespan?: number;
}

export function createFlame(
  sceneObj: THREE.Object3D,
  opts: FlameOptions = {}
): Cleanup {
  const { count = 100, height = 1.5, spread = 0.1, lifespan = 0.7 } = opts;
  const origin = sceneObj.position.clone();
  const scale = (sceneObj.scale.x + sceneObj.scale.y + sceneObj.scale.z) / 3;

  return makeEffect(sceneObj, () => {
    const ps = new ParticleSystem({
      duration: 10,
      looping: true,
      startLife: new IntervalValue(lifespan * 0.7, lifespan * 1.3),
      startSpeed: new IntervalValue(height * scale * 0.5, height * scale * 1.2), //
      startSize: new IntervalValue(0.08, 0.18), // ✅
      startRotation: new IntervalValue(0, Math.PI * 2),
      startColor: new ColorRange(qv4(1, 0.5, 0.1), qv4(1, 0.9, 0.3)),
      worldSpace: false,
      emissionOverTime: new ConstantValue(count / lifespan),
      shape: new ConeEmitter({
        radius: spread * scale,
        arc: Math.PI * 2,
        thickness: 0.2,
        angle: 0.05,
      }),
      material: new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      renderMode: RenderMode.BillBoard,
      renderOrder: 3,
    });

    ps.addBehavior(
      new ColorOverLife(
        new Gradient(
          [
            [new QVec3(1, 1, 0.8), 0],
            [new QVec3(1, 0.6, 0), 0.2],
            [new QVec3(0.8, 0.2, 0), 0.5],
            [new QVec3(0.1, 0.1, 0.1), 1],
          ],
          [
            [0, 0],
            [1, 0.1],
            [0.7, 0.5],
            [0, 1],
          ]
        )
      )
    );

    ps.addBehavior(
      new SizeOverLife(
        new PiecewiseBezier([
          [new Bezier(0.5, 0.8, 1, 1), 0],
          [new Bezier(1, 1, 0.2, 0), 0.4],
        ])
      )
    );

    ps.addBehavior(
      new ApplyForce(new QVec3(0, 1, 0), new ConstantValue(height * scale * 2))
    );

    ps.emitter.position.set(0, origin.y * 0.5, 0);
    ps.emitter.rotation.set(-Math.PI / 2, 0, 0);

    return { ps };
  });
}
