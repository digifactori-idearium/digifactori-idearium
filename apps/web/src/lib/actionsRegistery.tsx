import { MusicSelector } from './MusicDialog';

import { FormInputData } from '@/components/global/Input';

export const ActionRegistry: Record<
  string,
  {
    label: string;
    icon: string;
    category: ActionType;
    description: string;
    inputs: FormInputData[];
  }
> = {
  // --- MOTION (MOUVEMENT) ---
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
  },

  // --- SOUND (SON) ---
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
  },
  stopSound: {
    label: 'Arrêter le son',
    icon: '🔇',
    category: 'sound',
    description: 'Coupe tous les bruits de cet objet.',
    inputs: [],
  },

  // --- SAY (PARLER) ---
  say: {
    label: 'Dire',
    icon: '💬',
    category: 'say',
    description: 'Affiche une bulle de texte.',
    inputs: [
      {
        name: 'text',
        label: 'Message',
        type: 'select',
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
  },

  // --- PHYSICS (PHYSIQUE) ---
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
  },

  // --- PARTICLES (EFFETS) ---
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
  },

  // --- APPEARANCE (APPARENCE) ---
  tint: {
    label: 'Peinture',
    icon: '🎨',
    category: 'appearance',
    description: "Change la couleur de l'objet.",
    inputs: [
      { name: 'color', label: 'Couleur', type: 'color', default: '#3d61ee' },
    ],
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
  },

  // --- UTILS ---
  stop: {
    label: 'Tout arrêter',
    icon: '🛑',
    category: 'stop',
    description: 'Arrête toutes les animations de cet objet.',
    inputs: [],
  },
};
