import * as THREE from 'three';

import { MusicSelector } from './MusicDialog';

import { FormInputData } from '@/components/global/Input';
import { addTicker } from '@/lib/actionRuntime';

export type ActionExecuteFn = (
  ref: THREE.Object3D,
  config: Record<string, any>
) => () => void;

// Shared helpers
function collectMeshes(ref: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  ref.traverse(c => {
    if ((c as THREE.Mesh).isMesh) meshes.push(c as THREE.Mesh);
  });
  return meshes;
}

export const ActionRegistry: Record<
  string,
  {
    label: string;
    icon: string;
    category: ActionType;
    description: string;
    inputs: FormInputData[];
    execute: ActionExecuteFn;
  }
> = {
  // --- MOTION ---
  move: {
    label: 'Avancer',
    icon: '🚶',
    category: 'motion',
    description: "Fait bouger l'objet dans une direction.",
    inputs: [
      {
        name: 'distance',
        label: 'Distance',
        type: 'slider',
        min: 1,
        max: 100,
        default: 10,
      },
      {
        name: 'speed',
        label: 'Vitesse',
        type: 'slider',
        min: 1,
        max: 10,
        default: 5,
      },
    ],
    execute(ref, { distance, speed }) {
      let travelled = 0;
      return addTicker(delta => {
        if (travelled >= distance) return;
        const step = speed * delta;
        ref.position.x += step;
        travelled += step;
      });
    },
  },

  turn: {
    label: 'Tourner',
    icon: '↪️',
    category: 'motion',
    description: "Fait pivoter l'objet une seule fois.",
    inputs: [
      {
        name: 'angle',
        label: 'Angle',
        type: 'slider',
        min: 0,
        max: 360,
        default: 90,
      },
    ],
    execute(ref, { angle }) {
      const target = ref.rotation.y + (angle * Math.PI) / 180;
      const rotSpeed = Math.PI;
      let done = false;
      return addTicker(delta => {
        if (done) return;
        const diff = target - ref.rotation.y;
        if (Math.abs(diff) < 0.001) {
          ref.rotation.y = target;
          done = true;
          return;
        }
        ref.rotation.y +=
          Math.sign(diff) * Math.min(rotSpeed * delta, Math.abs(diff));
      });
    },
  },

  spin: {
    label: 'Tourniquet',
    icon: '💃',
    category: 'motion',
    description: "Fait tourner l'objet sur lui-même sans s'arrêter.",
    inputs: [
      {
        name: 'speed',
        label: 'Vitesse',
        type: 'slider',
        min: -10,
        max: 10,
        default: 2,
      },
    ],
    execute(ref, { speed }) {
      return addTicker(delta => {
        ref.rotation.y += speed * delta;
      });
    },
  },

  pulsate: {
    label: 'Battement',
    icon: '💓',
    category: 'motion',
    description: "Fait grossir et rétrécir l'objet comme un cœur.",
    inputs: [
      {
        name: 'amplitude',
        label: 'Taille',
        type: 'slider',
        min: 0.1,
        max: 2,
        step: 0.1,
        default: 0.5,
      },
      {
        name: 'frequency',
        label: 'Vitesse',
        type: 'slider',
        min: 0.1,
        max: 5,
        default: 1,
      },
    ],
    execute(ref, { amplitude, frequency }) {
      const base = ref.scale.x;
      let t = 0;
      return addTicker(delta => {
        t += delta;
        ref.scale.setScalar(
          base + Math.sin(t * frequency * Math.PI * 2) * amplitude
        );
      });
    },
  },

  sway: {
    label: 'Balançoire',
    icon: '🌴',
    category: 'motion',
    description: "L'objet penche de gauche à droite doucement.",
    inputs: [
      {
        name: 'amplitude',
        label: 'Inclinaison',
        type: 'slider',
        min: 0.1,
        max: 1,
        default: 0.3,
      },
      {
        name: 'speed',
        label: 'Vitesse',
        type: 'slider',
        min: 0.1,
        max: 5,
        default: 1,
      },
    ],
    execute(ref, { amplitude, speed }) {
      const base = ref.rotation.z;
      let t = 0;
      return addTicker(delta => {
        t += delta;
        ref.rotation.z = base + Math.sin(t * speed) * amplitude;
      });
    },
  },

  swivel: {
    label: 'Pivoter',
    icon: '💺',
    category: 'motion',
    description: "L'objet pivote à gauche et à droite.",
    inputs: [
      {
        name: 'amplitude',
        label: 'Angle',
        type: 'slider',
        min: 10,
        max: 180,
        default: 45,
      },
      {
        name: 'speed',
        label: 'Vitesse',
        type: 'slider',
        min: 0.1,
        max: 5,
        default: 1,
      },
    ],
    execute(ref, { amplitude, speed }) {
      const base = ref.rotation.y;
      const radians = (amplitude * Math.PI) / 180;
      let t = 0;
      return addTicker(delta => {
        t += delta;
        ref.rotation.y = base + Math.sin(t * speed) * radians;
      });
    },
  },

  // --- SOUND ---
  playSound: {
    label: 'Jouer un son',
    icon: '🎵',
    category: 'sound',
    description: 'Lance une musique ou un bruitage.',
    inputs: [
      {
        name: 'music',
        label: 'Choisis le son',
        type: 'dialog',
        placeholder: 'Choisir la Music',
        required: false,
        dialogueContent: <MusicSelector />,
      },
      {
        name: 'volume',
        label: 'Volume',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.5,
      },
    ],
    execute(_ref, { music, volume }) {
      if (!music) return () => {};
      const audio = new Audio(music);
      audio.volume = volume ?? 0.5;
      audio.loop = true;
      audio.play().catch(() => {});
      return () => {
        audio.pause();
        audio.src = '';
      };
    },
  },

  stopSound: {
    label: 'Arrêter le son',
    icon: '🔇',
    category: 'sound',
    description: 'Coupe tous les bruits de cet objet.',
    inputs: [],
    execute: () => () => {},
  },

  // --- SAY ---
  say: {
    label: 'Dire',
    icon: '💬',
    category: 'say',
    description: 'Affiche une bulle de texte.',
    inputs: [
      {
        name: 'text',
        label: 'Message',
        type: 'text',
        options: [],
        default: 'Bonjour !',
      },
      {
        name: 'duration',
        label: 'Temps',
        type: 'slider',
        min: 1,
        max: 10,
        default: 3,
      },
    ],
    execute(ref, { text, duration }) {
      // Attach a CSS2D-style label via a custom userData flag.
      // Your renderer layer reads ref.userData.speechBubble to render the bubble.
      ref.userData.speechBubble = text;
      const timer = setTimeout(() => {
        ref.userData.speechBubble = null;
      }, duration * 1000);
      return () => {
        clearTimeout(timer);
        ref.userData.speechBubble = null;
      };
    },
  },

  // --- PHYSICS ---
  velocity: {
    label: 'Propulser',
    icon: '🚀',
    category: 'physics',
    description: "Donne une poussée soudaine à l'objet.",
    inputs: [
      {
        name: 'force',
        label: 'Puissance',
        type: 'slider',
        min: 1,
        max: 50,
        default: 10,
      },
    ],
    execute(ref, { force }) {
      // Stores impulse in userData for your physics loop to consume on next tick.
      // The physics loop should read and zero this out after applying.
      ref.userData.pendingImpulse = new THREE.Vector3(0, force * 0.05, 0);
      return () => {
        ref.userData.pendingImpulse = null;
      };
    },
  },

  force: {
    label: 'Pousser',
    icon: '🧲',
    category: 'physics',
    description: 'Applique une force continue.',
    inputs: [
      {
        name: 'strength',
        label: 'Force',
        type: 'slider',
        min: -20,
        max: 20,
        default: 5,
      },
    ],
    execute(ref, { strength }) {
      // Stores a continuous force in userData for your physics loop to apply each frame.
      ref.userData.continuousForce = new THREE.Vector3(strength * 0.01, 0, 0);
      return () => {
        ref.userData.continuousForce = null;
      };
    },
  },

  // --- PARTICLES ---
  explosion: {
    label: 'Explosion',
    icon: '💥',
    category: 'particles',
    description: 'Fait exploser des confettis ou des débris.',
    inputs: [
      {
        name: 'size',
        label: 'Taille',
        type: 'slider',
        min: 1,
        max: 10,
        default: 5,
      },
    ],
    execute(ref, { size }) {
      const scene = ref.parent;
      if (!scene) return () => {};
      const count = Math.floor(size * 8);
      const particles = Array.from({ length: count }, () => {
        const geo = new THREE.SphereGeometry(0.05, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
          color: Math.random() * 0xffffff,
          transparent: true,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(ref.position);
        (scene as THREE.Scene).add(mesh);
        return {
          mesh,
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            Math.random() * 4,
            (Math.random() - 0.5) * 4
          ),
          life: 0,
        };
      });

      const gravity = new THREE.Vector3(0, -4, 0); // units/sec²
      const duration = 0.8; // seconds

      const removeTicker = addTicker(delta => {
        let allDone = true;
        particles.forEach(p => {
          if (p.life > duration) return;
          allDone = false;
          p.life += delta;
          p.vel.addScaledVector(gravity, delta);
          p.mesh.position.addScaledVector(p.vel, delta);
          (p.mesh.material as THREE.MeshBasicMaterial).opacity =
            1 - p.life / duration;
        });
        if (allDone) cleanup();
      });

      const cleanup = () => {
        removeTicker();
        particles.forEach(p => {
          (scene as THREE.Scene).remove(p.mesh);
          p.mesh.geometry.dispose();
        });
      };
      return cleanup;
    },
  },

  rain: {
    label: 'Pluie',
    icon: '🌧️',
    category: 'particles',
    description: "Fait tomber de l'eau.",
    inputs: [
      {
        name: 'intensity',
        label: 'Débit',
        type: 'slider',
        min: 1,
        max: 20,
        default: 10,
      },
    ],
    execute(ref, { intensity }) {
      const scene = ref.parent;
      if (!scene) return () => {};
      const drops: { mesh: THREE.Mesh; vy: number }[] = [];
      let accumulator = 0;
      const spawnInterval = 1 / intensity; // seconds between spawns

      const removeTicker = addTicker(delta => {
        accumulator += delta;
        while (accumulator >= spawnInterval) {
          accumulator -= spawnInterval;
          const geo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 4);
          const mat = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.7,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(
            ref.position.x + (Math.random() - 0.5) * 2,
            ref.position.y + 3,
            ref.position.z + (Math.random() - 0.5) * 2
          );
          (scene as THREE.Scene).add(mesh);
          drops.push({ mesh, vy: 3 + Math.random() });
        }

        for (let i = drops.length - 1; i >= 0; i--) {
          drops[i].mesh.position.y -= drops[i].vy * delta;
          if (drops[i].mesh.position.y < ref.position.y - 1) {
            (scene as THREE.Scene).remove(drops[i].mesh);
            drops[i].mesh.geometry.dispose();
            drops.splice(i, 1);
          }
        }
      });

      return () => {
        removeTicker();
        drops.forEach(d => {
          (scene as THREE.Scene).remove(d.mesh);
          d.mesh.geometry.dispose();
        });
      };
    },
  },

  snow: {
    label: 'Neige',
    icon: '❄️',
    category: 'particles',
    description: 'Fait tomber des flocons.',
    inputs: [
      {
        name: 'speed',
        label: 'Vitesse de chute',
        type: 'slider',
        min: 0.1,
        max: 2,
        default: 0.5,
      },
    ],
    execute(ref, { speed }) {
      const scene = ref.parent;
      if (!scene) return () => {};
      const flakes: {
        mesh: THREE.Mesh;
        vy: number;
        drift: number;
        t: number;
      }[] = [];
      let accumulator = 0;

      const removeTicker = addTicker(delta => {
        accumulator += delta;
        while (accumulator >= 0.25) {
          // spawn every 250ms
          accumulator -= 0.25;
          const geo = new THREE.SphereGeometry(0.04, 4, 4);
          const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(
            ref.position.x + (Math.random() - 0.5) * 3,
            ref.position.y + 3,
            ref.position.z + (Math.random() - 0.5) * 3
          );
          (scene as THREE.Scene).add(mesh);
          flakes.push({
            mesh,
            vy: speed * (0.5 + Math.random() * 0.5),
            drift: Math.random() * 2,
            t: 0,
          });
        }

        for (let i = flakes.length - 1; i >= 0; i--) {
          const f = flakes[i];
          f.t += delta;
          f.mesh.position.y -= f.vy * delta;
          f.mesh.position.x += Math.sin(f.t * f.drift) * 0.01;
          if (f.mesh.position.y < ref.position.y - 1) {
            (scene as THREE.Scene).remove(f.mesh);
            f.mesh.geometry.dispose();
            flakes.splice(i, 1);
          }
        }
      });

      return () => {
        removeTicker();
        flakes.forEach(f => {
          (scene as THREE.Scene).remove(f.mesh);
          f.mesh.geometry.dispose();
        });
      };
    },
  },

  flame: {
    label: 'Feu',
    icon: '🔥',
    category: 'particles',
    description: 'Allume des flammes.',
    inputs: [
      {
        name: 'height',
        label: 'Hauteur',
        type: 'slider',
        min: 1,
        max: 5,
        default: 2,
      },
    ],
    execute(ref, { height }) {
      const scene = ref.parent;
      if (!scene) return () => {};
      const embers: {
        mesh: THREE.Mesh;
        vel: THREE.Vector3;
        life: number;
        maxLife: number;
      }[] = [];
      let accumulator = 0;

      const removeTicker = addTicker(delta => {
        accumulator += delta;
        while (accumulator >= 0.05) {
          // spawn every 50ms
          accumulator -= 0.05;
          const geo = new THREE.SphereGeometry(
            0.04 + Math.random() * 0.04,
            4,
            4
          );
          const mat = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0xff4400 : 0xff8800,
            transparent: true,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position
            .copy(ref.position)
            .add(
              new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                0,
                (Math.random() - 0.5) * 0.3
              )
            );
          (scene as THREE.Scene).add(mesh);
          embers.push({
            mesh,
            vel: new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              height * 0.8,
              (Math.random() - 0.5) * 0.3
            ),
            life: 0,
            maxLife: 0.4 + Math.random() * 0.4, // seconds
          });
        }

        for (let i = embers.length - 1; i >= 0; i--) {
          const e = embers[i];
          e.life += delta;
          e.mesh.position.addScaledVector(e.vel, delta);
          e.vel.x += (Math.random() - 0.5) * 0.1 * delta;
          const progress = e.life / e.maxLife;
          (e.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - progress;
          e.mesh.scale.setScalar(1 - progress * 0.5);
          if (e.life >= e.maxLife) {
            (scene as THREE.Scene).remove(e.mesh);
            e.mesh.geometry.dispose();
            embers.splice(i, 1);
          }
        }
      });

      return () => {
        removeTicker();
        embers.forEach(e => {
          (scene as THREE.Scene).remove(e.mesh);
          e.mesh.geometry.dispose();
        });
      };
    },
  },

  // --- APPEARANCE ---
  tint: {
    label: 'Peinture',
    icon: '🎨',
    category: 'appearance',
    description: "Change la couleur de l'objet.",
    inputs: [
      { name: 'color', label: 'Couleur', type: 'color', default: '#3d61ee' },
    ],
    execute(ref, { color }) {
      const meshes = collectMeshes(ref);
      const originals = meshes.map(m =>
        (m.material as THREE.MeshStandardMaterial).color.clone()
      );
      meshes.forEach(m =>
        (m.material as THREE.MeshStandardMaterial).color.set(color)
      );
      return () =>
        meshes.forEach((m, i) =>
          (m.material as THREE.MeshStandardMaterial).color.copy(originals[i])
        );
    },
  },

  size: {
    label: 'Grandir / Rétrécir',
    icon: '📏',
    category: 'appearance',
    description: "Change la taille de l'objet.",
    inputs: [
      {
        name: 'scale',
        label: 'Taille',
        type: 'slider',
        min: 0.1,
        max: 5,
        step: 0.1,
        default: 1,
      },
    ],
    execute(ref, { scale }) {
      const original = ref.scale.clone();
      ref.scale.setScalar(scale);
      return () => ref.scale.copy(original);
    },
  },

  opacity: {
    label: 'Fantôme',
    icon: '👻',
    category: 'appearance',
    description: "Rend l'objet transparent ou solide.",
    inputs: [
      {
        name: 'alpha',
        label: 'Visibilité',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.5,
      },
    ],
    execute(ref, { alpha }) {
      const meshes = collectMeshes(ref);
      const orig = meshes.map(m => ({
        opacity: (m.material as THREE.MeshStandardMaterial).opacity,
        transparent: (m.material as THREE.MeshStandardMaterial).transparent,
      }));
      meshes.forEach(m => {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = alpha;
        mat.needsUpdate = true;
      });
      return () =>
        meshes.forEach((m, i) => {
          const mat = m.material as THREE.MeshStandardMaterial;
          mat.transparent = orig[i].transparent;
          mat.opacity = orig[i].opacity;
          mat.needsUpdate = true;
        });
    },
  },

  glow: {
    label: 'Lumière',
    icon: '✨',
    category: 'appearance',
    description: "Fait briller l'objet.",
    inputs: [
      {
        name: 'intensity',
        label: 'Brillance',
        type: 'slider',
        min: 0,
        max: 10,
        default: 2,
      },
    ],
    execute(ref, { intensity }) {
      const meshes = collectMeshes(ref);
      const orig = meshes.map(m => ({
        emissive: (m.material as THREE.MeshStandardMaterial).emissive.clone(),
        emissiveIntensity: (m.material as THREE.MeshStandardMaterial)
          .emissiveIntensity,
      }));
      meshes.forEach(m => {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.emissive.set('#ffffff');
        mat.emissiveIntensity = intensity;
        mat.needsUpdate = true;
      });
      return () =>
        meshes.forEach((m, i) => {
          const mat = m.material as THREE.MeshStandardMaterial;
          mat.emissive.copy(orig[i].emissive);
          mat.emissiveIntensity = orig[i].emissiveIntensity;
          mat.needsUpdate = true;
        });
    },
  },

  // --- UTILS ---
  stop: {
    label: 'Tout arrêter',
    icon: '🛑',
    category: 'stop',
    description: 'Arrête toutes les animations de cet objet.',
    inputs: [],
    execute: () => () => {},
  },
};
