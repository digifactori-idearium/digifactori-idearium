import {
  Briefcase,
  Fingerprint,
  KeyRound,
  Lock,
  Mail,
  Pencil,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

import { MusicSelector } from './MusicDialog';

/* =========================
   LOGIN INPUTS
========================= */
export const loginInputs = [
  // {
  //   label: 'Email',
  //   type: 'email',
  //   name: 'email',
  //   placeholder: 'Enter your email',
  //   required: false,
  //   icon: Mail,
  // },
  {
    label: 'Pseudo',
    type: 'text',
    name: 'pseudo',
    placeholder: 'Entrez votre pseudo',
    required: true,
    icon: Fingerprint,
  },
  {
    label: 'Mot de passe',
    type: 'password',
    name: 'password',
    placeholder: 'Entrez votre mot de passe',
    required: true,
    icon: Lock,
  },
];

/* =========================
   REGISTER INPUTS
========================= */
export const registerInputs = [
  {
    label: 'Prénom',
    type: 'text',
    name: 'user.first_name',
    placeholder: 'Entrez votre prénom',
    required: true,
    icon: User,
  },
  {
    label: 'Nom de famille',
    type: 'text',
    name: 'user.last_name',
    placeholder: 'Entrez votre nom de famille',
    required: true,
    icon: User,
  },
  {
    label: 'Email',
    type: 'email',
    name: 'user.email',
    placeholder: 'Entrez votre adresse mail',
    required: true,
    icon: Mail,
  },
  {
    label: 'Rôle',
    type: 'select',
    name: 'user.role',
    placeholder: 'Sélectionnez un rôle',
    required: true,
    icon: Briefcase,
    options: [
      { value: 'CHILD', text: 'Enfant' },
      { value: 'SUPERVISOR', text: 'Superviseur' },
    ],
  },
  {
    label: 'Mot de passe',
    type: 'password',
    name: 'user.password',
    placeholder: 'Créez votre mot de passe',
    required: true,
    icon: Lock,
  },
  {
    label: 'Code parental',
    type: 'number',
    name: 'user.parental_code',
    placeholder: 'Entrez votre code parental',
    required: false,
    icon: ShieldCheck,
  },
  {
    label: 'Pseudo',
    type: 'text',
    name: 'profile.pseudo',
    placeholder: 'Choisissez un pseudo',
    required: true,
    icon: Users,
  },
];

/* =========================
   RESET INPUTS
========================= */
export const resetInputs = [
  {
    label: 'Adresse mail',
    type: 'email',
    name: 'email',
    placeholder: 'Adresse mail de secours',
    required: true,
    icon: Mail,
  },
  {
    label: 'Code de vérification',
    type: 'text',
    name: 'code',
    placeholder: 'Entrez le code à 6 chiffres',
    required: false,
    icon: KeyRound,
  },
];

/* =========================
   ROOM CREATION FORM INPUTS
========================= */
export const IdeoramaCreationInputs = [
  { label: 'Nom de l\'idéorama',
    type: 'text',
    name: 'name',
    placeholder: 'Monstre bleu',
    required: true,
    icon: Pencil,}
]

/* =========================
   ROOM CONFIGURATION FORM INPUTS
========================= */

//Tags
const ideoramaTags = [
  { value: 'none', text: 'Aucun' },
  { value: 'music', text: 'Musique' },
  { value: 'lofi', text: 'Lo-Fi' },
  { value: 'story', text: 'Histoire' },
  { value: 'gaming', text: 'Jeux Vidéo' },
  { value: 'chill', text: 'Détente' },
  { value: 'focus', text: 'Productivité' },
  { value: 'art', text: 'Art' },
  { value: 'design', text: 'Design' },
  { value: 'coding', text: 'Programmation' },
  { value: 'education', text: 'Éducation' },
  { value: 'podcast', text: 'Podcast' },
  { value: 'movie', text: 'Cinéma' },
  { value: 'anime', text: 'Anime' },
  { value: 'social', text: 'Social' },
  { value: 'business', text: 'Affaires' },
  { value: 'fitness', text: 'Fitness' },
  { value: 'cooking', text: 'Cuisine' },
  { value: 'tech', text: 'Technologie' },
  { value: 'writing', text: 'Écriture' },
  { value: 'crypto', text: 'Crypto / Web3' },
  { value: 'nature', text: 'Nature' },
  { value: 'travel', text: 'Voyage' },
  { value: 'mentalhealth', text: 'Santé Mentale' },
  { value: 'meditation', text: 'Méditation' },
  { value: 'fashion', text: 'Mode' },
  { value: 'photography', text: 'Photographie' },
  { value: 'debate', text: 'Débat' },
  { value: 'science', text: 'Science' },
  { value: 'history', text: 'Histoire (Sujet)' },
];

const globalConfigInputs = [
  {
    label: 'Visibilité(Public)',
    type: 'switch',
    name: 'visible',
    placeholder: 'Public ou pas',
    required: false,
  },
  {
    label: 'Éclairage',
    type: 'select',
    name: 'brightness',
    placeholder: "Choisir l'Éclairage",
    options: [
      { value: 'bright', text: 'Lumineux' },
      { value: 'dim', text: 'Faible' },
      { value: 'dark', text: 'Sombre' },
    ],
    required: false,
  },
  {
    label: 'Music',
    type: 'dialog',
    name: 'music',
    placeholder: 'Choisir la Music',
    required: false,
    dialogueContent: <MusicSelector />,
  },
  {
    label: 'Thème couleur',
    type: 'select',
    name: 'theme',
    placeholder: 'Choisir le thème',
    options: [
      { value: 'white', text: 'Blanc' },
      { value: 'black', text: 'Noir' },
      { value: 'night', text: 'Nuit' },
      { value: 'black-orange', text: 'Noir Orange' },
      { value: 'pink-blue', text: 'Rose Bleu' },
      { value: 'yellow-gray', text: 'Jaune Gris' },
      { value: 'blue-yellow', text: 'Blue Jaune' },
      { value: 'customized', text: 'Personnalisé' },
    ],
    required: false,
  },
];

const partConfigInput = [
  { name: 'hidden', label: 'Cacher', type: 'switch' },
  { name: 'color', label: 'Couleur', type: 'color' },
  {
    name: 'texture',
    label: 'Texture',
    type: 'select',
    options: [
      { value: 'none', text: 'Aucun' },
      { value: 'bricks', text: 'Bricks' },
      { value: 'wood', text: 'Bois' },
    ],
  },
];
const infoConfig = [
  { name: 'description', label: 'Description', type: 'textarea' },
  {
    name: 'category',
    label: 'Catégorie',
    type: 'select',
    options: ideoramaTags,
  },
];

const backConfig = [
  { name: 'color', label: 'Couleur', type: 'color' },
  { name: 'accent', label: 'Accent', type: 'color' },
];

export const ideoramaConfigInputs = {
  global: globalConfigInputs,
  info: infoConfig,
  background: backConfig,
  part: partConfigInput,
};

/* =========================
   OBJECT ASSETS CONFIGURATION FORM INPUTS
========================= */
const objectInfoInputs = [
  {
    name: 'name',
    label: "Nom de l'objet",
    type: 'text',
    required: true,
  },
  {
    name: 'category',
    label: 'Catégorie',
    type: 'select',
    options: [
      { value: 'voxel', text: 'Voxel' },
      { value: 'furniture', text: 'Furniture' },
      { value: 'decoration', text: 'Decoration' },
    ],
  },
];

const transformInputs = [
  { name: 'position', label: 'Position (x,y,z)', type: 'vector3' },
  { name: 'rotation', label: 'Rotation (x,y,z)', type: 'vector3' },
  { name: 'scale', label: 'Échelle', type: 'slider', max: 8 },
];

const styleInputs = [
  { name: 'tint', label: 'Couleur (Teinte)', type: 'color' },
  {
    name: 'opacity',
    label: 'Opacité (transparence)',
    type: 'slider',
    nim: 0,
    step: 0.01,
    max: 1,
  },
  { name: 'glow', label: 'Lueur', type: 'slider', max: 4 },
  {
    name: 'threshold',
    label: 'Seuil',
    type: 'slider',
    nim: 0,
    step: 0.01,
    max: 1,
  },
];

const advancedInputs = [
  { name: 'parent', label: 'Contenant(Parent)', type: 'dialog' },
  {
    name: 'physics',
    label: 'Physique',
    type: 'select',
    options: [
      { value: 'kinematic', text: 'Cinématique' },
      { value: 'upright', text: 'Droit / Vertical' },
      { value: 'tumbly', text: 'Bascule' },
      { value: 'passthrough', text: 'Passage' },
      { value: 'trigger', text: 'Déclencheur' },
    ],
  },
  { name: 'hidden', label: 'Caché', type: 'switch' },
  { name: 'locked', label: 'Verrouiller en mode édition', type: 'switch' },
];

export const objectConfigInputs = {
  info: objectInfoInputs,
  transform: transformInputs,
  style: styleInputs,
  advanced: advancedInputs,
};
