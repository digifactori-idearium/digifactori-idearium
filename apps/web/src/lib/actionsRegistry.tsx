import { gsap } from 'gsap';
import * as THREE from 'three';

import { clearTweens, addTween, playBlip } from './actionRuntime';
import { MusicSelector } from './MusicDialog';

import { FormInputData } from '@/components/global/Input';
import {
  createExplosion,
  createRain,
  createSnow,
  createFlame,
} from '@/lib/particles';

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
        name: 'direction',
        label: 'Direction',
        type: 'select',
        options: [
          { value: 'forward', text: 'Avant' },
          { value: 'backward', text: 'Arrière' },
          { value: 'left', text: 'Gauche' },
          { value: 'right', text: 'Droite' },
          { value: 'up', text: 'En Haut' },
          { value: 'down', text: 'En Bas' },
        ],
        default: 'forward',
      },
      {
        name: 'distance',
        label: 'Distance',
        type: 'slider',
        min: 1,
        max: 100,
        default: 10,
      },
      {
        name: 'duration',
        label: 'Temps',
        type: 'slider',
        min: 1,
        max: 15,
        step: 1,
        default: 5,
      },
    ],
    execute(ref, { direction, distance, duration }) {
      // clearTweens(ref);
      let x = ref.position.x;
      let y = ref.position.y;
      let z = ref.position.z;
      switch (direction) {
        case 'forward':
          x = ref.position.x - distance;
          break;
        case 'backward':
          x = ref.position.x + distance;
          break;
        case 'left':
          z = ref.position.z - distance;
          break;
        case 'right':
          z = ref.position.z + distance;
          break;
        case 'up':
          y = ref.position.y + distance;
          break;
        case 'down':
          y = ref.position.y - distance;
          break;
      }
      const tween = gsap.to(ref.position, {
        x,
        y,
        z,
        duration,
        ease: 'power1.out',
      });
      addTween(ref, tween);
      return () => tween.kill();
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
      // clearTweens(ref);

      const radians = (angle * Math.PI) / 180;
      const tween = gsap.to(ref.rotation, {
        y: ref.rotation.y + radians,
        duration: 0.5,
        ease: 'power2.out',
      });

      addTween(ref, tween);

      return () => tween.kill();
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
        step: 1,
        default: 2,
      },
      {
        name: 'axis',
        label: 'Comment tourner',
        type: 'select',
        options: [
          { value: 'x', text: 'En Haut en Bas' },
          { value: 'y', text: 'En Avant en Arrière' },
          { value: 'z', text: 'Gauche Droite' },
        ],
        default: 'y',
      },
    ],
    execute(ref, { speed, axis }) {
      // clearTweens(ref);

      const duration = 2 / Math.abs(speed || 1);

      const tween = gsap.to(ref.rotation, {
        [axis]: `+=${Math.PI * 2}`,
        duration,
        ease: 'linear',
        repeat: -1,
      });

      addTween(ref, tween);

      return () => tween.kill();
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
      // clearTweens(ref);

      const base = ref.scale.clone();

      const tween = gsap.to(ref.scale, {
        x: base.x * (1 + amplitude),
        y: base.y * (1 + amplitude),
        z: base.z * (1 + amplitude),
        duration: 1 / frequency,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      addTween(ref, tween);

      return () => {
        tween.kill();
        ref.scale.copy(base);
      };
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
      // clearTweens(ref);

      const base = ref.rotation.z;
      const tween = gsap.to(ref.rotation, {
        z: base + amplitude,
        duration: 1 / speed,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      addTween(ref, tween);

      return () => {
        tween.kill();
        ref.rotation.z = base;
      };
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
      // clearTweens(ref);

      const radians = (amplitude * Math.PI) / 180;
      const base = ref.rotation.y;

      const tween = gsap.to(ref.rotation, {
        y: base + radians,
        duration: 1 / speed,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      addTween(ref, tween);

      return () => {
        tween.kill();
        ref.rotation.y = base;
      };
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
        dialogueContent: <MusicSelector type="action" />,
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
      audio.loop = false;

      audio.play().catch(() => {});

      return () => {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.load();
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
    ],
    execute(ref, { text }) {
      const SPEED = 0.05;
      const DURATION = 3;

      ref.userData.speechBubble = {
        text,
        displayed: '',
        opacity: 0,
      };

      const bubble = ref.userData.speechBubble;
      let charIndex = 0;
      let typewriterTimer: ReturnType<typeof setTimeout> | null = null;
      let stopped = false;

      const fadeIn = gsap.to(bubble, {
        opacity: 1,
        duration: 0.25,
        ease: 'power1.out',
      });
      addTween(ref, fadeIn);

      function typeNextChar() {
        if (stopped) return;
        if (charIndex >= text.length) return;

        bubble.displayed = text.slice(0, charIndex + 1);
        charIndex++;

        if (text[charIndex - 1].trim() !== '') {
          playBlip();
        }

        if (charIndex < text.length) {
          typewriterTimer = setTimeout(typeNextChar, SPEED * 1000);
        }
      }

      typewriterTimer = setTimeout(typeNextChar, 250);

      const fadeOut = gsap.to(bubble, {
        opacity: 0,
        delay: DURATION,
        duration: 0.4,
        ease: 'power1.in',
        onComplete: () => {
          ref.userData.speechBubble = null;
        },
      });
      addTween(ref, fadeOut);

      return () => {
        stopped = true;
        if (typewriterTimer) clearTimeout(typewriterTimer);
        fadeIn.kill();
        fadeOut.kill();
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
      if (!ref) return () => {};
      return createExplosion(ref, {
        count: Math.floor(size * 24),
        speed: 2 + size * 0.3,
        gravity: 5,
        lifespan: 0.8 + size * 0.06,
        colorA: '#ff6600',
        colorB: '#ffdd00',
        pointSize: 4 + size * 0.4,
      });
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
      if (!ref) return () => {};
      return createRain(ref, {
        count: Math.floor(intensity * 20),
        speed: 2 + intensity * 0.15,
        spread: 3,
        height: 5,
        color: '#88ccff',
      });
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
      if (!ref) return () => {};
      return createSnow(ref, {
        count: 120,
        speed,
        spread: 3.5,
        height: 5,
      });
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
      if (!ref) return () => {};
      return createFlame(ref, {
        count: 80,
        height: height * 0.5,
        spread: 0.15,
        lifespan: 0.5 + height * 0.06,
      });
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
    execute(ref) {
      clearTweens(ref);

      const cleanups = ref.userData.cleanups || [];
      cleanups.forEach((fn: () => void) => fn());

      ref.userData.cleanups = [];

      return () => {};
    },
  },
};
