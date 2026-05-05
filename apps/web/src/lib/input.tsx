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
  Box,
  ChartBarStacked,
  FileBox,
  LockKeyhole,
} from 'lucide-react';

import { themeOptions } from './theme';

import {
  FormInputData,
  MusicSelector,
  ObjectSelector,
} from '@/components/common/form';

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
    min: 6,
    required: true,
    icon: Lock,
  },
];

/* =========================
   REGISTER INPUTS
========================= */
export const registerBaseInputs: FormInputData[] = [
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
    label: 'Mot de passe',
    type: 'password',
    name: 'user.password',
    placeholder: 'Créez votre mot de passe',
    min: 6,

    required: true,
    icon: Lock,
  },
  {
    label: 'Pseudo',
    type: 'text',
    name: 'profile.pseudo',
    placeholder: 'Choisissez un pseudo',
    required: true,
    icon: Users,
  },
  {
    label: 'Rôle',
    type: 'select',
    name: 'user.role',
    placeholder: 'Sélectionnez un rôle',
    required: true,
    icon: Briefcase,
    options: [
      { value: 'ADMIN', text: 'Administrateur' },
      { value: 'SUPERVISOR', text: 'Superviseur' },
      { value: 'INTERN', text: 'Stagiaire' },
    ],
  },
];

export const adminCodeInput: FormInputData = {
  label: 'Code administrateur',
  type: 'password',
  name: 'user.admin_code',
  placeholder: 'Entrez le code administrateur',
  required: true,
  icon: ShieldCheck,
};

export const orgCodeInput: FormInputData = {
  label: 'Code organisation',
  type: 'password',
  name: 'user.orgCode',
  placeholder: "Entrez le code de l'organisation",
  max: 6,
  required: true,
  icon: KeyRound,
};

export const parentalCodeInput: FormInputData = {
  label: 'Code parental',
  type: 'password',
  name: 'user.parental_code',
  placeholder: 'Entrez le code parental (min. 4 chiffres)',
  required: true,
  max: 6,
  icon: ShieldCheck,
};

/* =========================
   Change password INPUTS
========================= */
export const changePasswordInputs = [
  {
    label: 'Ancien Mot de passe',
    type: 'password',
    name: 'currentPassword',
    placeholder: 'Saisissez votre mot de passe actuel',
    min: 6,
    required: true,
    icon: LockKeyhole,
  },
  {
    label: 'Nouveau Mot de passe',
    type: 'password',
    name: 'newPassword',
    placeholder: 'Saisissez votre nouveau mot de passe',
    min: 6,
    required: true,
    icon: Lock,
  },
  {
    label: 'Confirmation Mot de passe',
    type: 'password',
    name: 'confirmPassword',
    placeholder: 'Confirmez votre nouveau mot de passe',
    min: 6,
    required: true,
    icon: Lock,
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
];
/* =========================
   ADMIN CREATE USER IMPUTS
========================= */

export const manageUserInputs = [
  {
    label: 'Prénom',
    type: 'text',
    name: 'first_name',
    placeholder: 'Entrez votre prénom',
    required: true,
    icon: User,
  },
  {
    label: 'Nom de famille',
    type: 'text',
    name: 'last_name',
    placeholder: 'Entrez votre nom de famille',
    required: true,
    icon: User,
  },
  {
    label: 'Email',
    type: 'email',
    name: 'email',
    placeholder: 'Entrez votre adresse mail',
    required: true,
    icon: Mail,
  },
  {
    label: 'Pseudo',
    type: 'text',
    name: 'pseudo',
    placeholder: 'Choisissez un pseudo',
    required: true,
    icon: Users,
  },
];

export const adminUserRole = {
  label: 'Rôle',
  type: 'select',
  name: 'role',
  placeholder: 'Sélectionnez un rôle',
  required: true,
  icon: Briefcase,
  options: [
    { value: 'INTERN', text: 'Stagiaire' },
    { value: 'SUPERVISOR', text: 'Superviseur' },
  ],
};

export const supervisorUserRole = {
  label: 'Rôle',
  type: 'select',
  name: 'role',
  placeholder: 'Sélectionnez un rôle',
  required: true,
  icon: Briefcase,
  options: [{ value: 'INTERN', text: 'Stagiaire' }],
};
/* =========================
   IDEORAMA CREATION FORM INPUTS
========================= */
export const ideoramaCreationInputs = [
  {
    label: "Nom de l'idéorama",
    type: 'text',
    name: 'name',
    placeholder: 'Monstre bleu',
    required: true,
    icon: Pencil,
  },
];

/* =========================
   MODEL CREATION FORM INPUTS
========================= */
export const modelCreationInputs = [
  {
    label: 'Nom du modèle',
    type: 'text',
    name: 'name',
    placeholder: 'Monstre bleu',
    required: true,
    icon: Pencil,
  },
];

/* =========================
   EDITOR CREATION FORM INPUTS
========================= */
export const editorCreationInputs = [
  {
    label: 'Le titre du document ',
    type: 'text',
    name: 'title',
    placeholder: 'Le Petit Chaperon rouge',
    required: true,
    icon: Pencil,
  },
  {
    label: "L'Emoji",
    type: 'emoji',
    name: 'emoji',
    required: false,
    icon: Pencil,
  },
  {
    label: 'Couleur du document ',
    type: 'color',
    name: 'color',
    required: false,
    icon: Pencil,
  },
];

/* =========================
   IDEORAMA CONFIGURATION FORM INPUTS
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
    label: 'Rendre public',
    type: 'switch',
    name: 'isPublic',
    placeholder: 'Visible par tous',
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
    label: 'Choisir la musique de fond',
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
    options: themeOptions,
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
  {
    name: 'name',
    label: "Nom de l'idéorama",
    type: 'text',
    placeholder: 'Mon idéorama',
  },
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
      { value: 'FOOD_AND_DRINK', text: 'Nourriture & Boissons' },
      { value: 'CLUTTER', text: 'Divers' },
      { value: 'WEAPONS', text: 'Armes' },
      { value: 'TRANSPORT', text: 'Transport' },
      { value: 'FURNITURE_AND_DECOR', text: 'Meubles & Décoration' },
      { value: 'OBJECTS', text: 'Objets' },
      { value: 'NATURE', text: 'Nature' },
      { value: 'ANIMALS', text: 'Animaux' },
      { value: 'BUILDINGS', text: 'Architecture' },
      { value: 'PEOPLE_AND_CHARACTERS', text: 'Personnages' },
      { value: 'SCENES_AND_LEVELS', text: 'Scènes & Niveaux' },
      { value: 'OTHER', text: 'Autre' },
    ],
  },
];

const transformInputs = [
  { name: 'position', label: 'Position (x,y,z)', type: 'vector3', step: 0.1 },
  { name: 'rotation', label: 'Rotation (x,y,z)', type: 'vector3', step: 0.1 },
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
  {
    name: 'parent',
    label: 'Contenant(Parent)',
    type: 'dialog',
    dialogueContent: <ObjectSelector type="parent" />,
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

/* =========================
   ASSET INPUTS
========================= */
export const assetInputs = [
  {
    label: 'Nom',
    type: 'text',
    name: 'name',
    placeholder: "Entrez le nom de l'asset",
    required: false,
    icon: Box,
  },
  {
    label: 'Catégorie',
    type: 'select',
    name: 'category',
    placeholder: "Sélectionnez la catégorie de l'asset",
    required: false,
    icon: ChartBarStacked,
    options: [
      { value: 'FOOD_AND_DRINK', text: 'Nourriture & Boissons' },
      { value: 'CLUTTER', text: 'Divers' },
      { value: 'WEAPONS', text: 'Armes' },
      { value: 'TRANSPORT', text: 'Transport' },
      { value: 'FURNITURE_AND_DECOR', text: 'Meubles & Décoration' },
      { value: 'OBJECTS', text: 'Objets' },
      { value: 'NATURE', text: 'Nature' },
      { value: 'ANIMALS', text: 'Animaux' },
      { value: 'BUILDINGS', text: 'Architecture' },
      { value: 'PEOPLE_AND_CHARACTERS', text: 'Personnages' },
      { value: 'SCENES_AND_LEVELS', text: 'Scènes & Niveaux' },
      { value: 'OTHER', text: 'Autre' },
    ],
  },
  {
    label: 'Tags',
    type: 'tags',
    name: 'tags',
    placeholder: 'Entrez les tags',
    required: false,
    icon: Box,
  },
  {
    label: 'Fichier',
    type: 'assets',
    name: 'file',
    placeholder: "Entrez le nom de l'asset",
    required: false,
    multiple: false,
    icon: Box,
  },
  {
    label: 'Apercu',
    type: 'assets',
    name: 'thumbnail',
    placeholder: "Entrez le nom de l'asset",
    required: false,
    multiple: false,
    icon: Box,
  },
];

/* =========================
   INTEGRATION INPUTS
========================= */
export const integrationInputs = [
  {
    label: 'Active ?',
    type: 'switch',
    name: 'isActive',
    placeholder: "Entrez le nom de l'intégration",
    required: false,
    default: true,
    icon: Box,
  },
  {
    label: 'Nom',
    type: 'text',
    name: 'name',
    placeholder: "Entrez le nom de l'intégration",
    required: true,
    icon: Box,
  },
  {
    label: 'Source',
    type: 'text',
    name: 'url',
    placeholder: "Entrez la source de l'intégration",
    required: true,
    icon: FileBox,
  },
  {
    label: 'Clé',
    type: 'password',
    name: 'key',
    placeholder: "Entrez la clé de l'intégration",
    required: false,
    icon: KeyRound,
  },
  {
    label: 'Type',
    type: 'select',
    name: 'type',
    placeholder: "Entrez le type de l'intégration",
    required: true,
    options: [
      { value: 'MODEL_3D', text: 'Modèle 3D' },
      { value: 'SOUND', text: 'Son' },
      { value: 'IMAGE', text: 'Image' },
      { value: 'OTHER', text: 'Autre' },
    ],
    icon: ChartBarStacked,
  },

  {
    label: 'Configuration',
    type: 'fieldMapping',
    name: 'fieldMapping',
    placeholder: "Entrez la configuration de l'intégration",
    required: false,
    mappingFields: {
      id: {
        label: 'Identifiant',
        placeholder: 'ex: product_id',
        required: true,
      },
      name: { label: 'Nom', placeholder: 'ex: product_name', required: true },
      file: { label: 'Fichier', placeholder: 'ex: file_url', required: true },
      category: {
        label: 'Catégorie',
        placeholder: 'ex: category',
        required: false,
      },
      thumbnail: {
        label: 'Miniature',
        placeholder: 'ex: thumb_url',
        required: false,
      },
    },
  },
];

/* =========================
   STORE INPUTS
========================= */
export const storeInputs = [
  {
    label: 'Fournisseur',
    type: 'select',
    name: 'provider',
    placeholder: 'Sélectionner le fournisseur cloud',
    options: [
      { value: 'LOCAL', text: 'Local' },
      { value: 'S3', text: 'Amazon S3' },
      { value: 'R2', text: 'Cloudflare R2' },
      { value: 'GCS', text: 'Google Cloud Storage' },
      { value: 'AZURE', text: 'Azure Blob Storage' },
      { value: 'MINIO', text: 'MinIO' },
    ],
    required: true,
    icon: Box,
  },

  {
    label: 'Nom',
    type: 'text',
    name: 'name',
    placeholder: 'Entrez le nom du stockage',
    required: true,
    icon: Box,
  },

  {
    label: 'Région',
    type: 'text',
    name: 'region',
    placeholder: 'ex: us-east-1',
    required: false,
    icon: FileBox,
  },

  {
    label: 'Endpoint',
    type: 'text',
    name: 'endpoint',
    placeholder: 'https://...',
    required: false,
    icon: FileBox,
  },

  {
    label: 'Bucket / Container',
    type: 'text',
    name: 'bucket',
    placeholder: 'Nom du bucket ou container',
    required: false,
    icon: Box,
  },

  {
    label: 'Access Key',
    type: 'text',
    name: 'accessKey',
    placeholder: "Entrez l'accessKey",
    required: false,
    icon: KeyRound,
  },

  {
    label: 'Secret Key',
    type: 'password',
    name: 'secretKey',
    placeholder: 'Entrez la secretKey',
    required: false,
    icon: KeyRound,
  },

  {
    label: 'URL publique',
    type: 'text',
    name: 'publicUrl',
    placeholder: 'https://cdn.example.com',
    required: false,
    icon: FileBox,
  },
];

export const orgInputs = [
  {
    label: "Code de l'organisation",
    type: 'password',
    name: 'orgCode',
    placeholder: "Code d'accès de l'organisation",
    max: 6,
    min: 6,
    required: true,
    icon: Box,
  },
  {
    label: 'Code parental Stagiaires',
    type: 'password',
    name: 'orgParentalCode',
    placeholder: "Code d'accès pour les stagiaires",
    max: 4,
    min: 4,
    required: true,
    icon: FileBox,
  },
];
