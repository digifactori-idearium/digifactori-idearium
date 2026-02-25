import {
  Mail,
  Lock,
  User,
  Users,
  Fingerprint,
  ShieldCheck,
  Briefcase,
  KeyRound,
} from 'lucide-react';

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
   ROOM CONFIGURATION FORM INPUTS
========================= */

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
  },
  {
    label: 'Thème couleur',
    type: 'select',
    name: 'theme',
    placeholder: 'Choisir le thème',
    options: [
      { value: 'black-orange', text: 'Noir Orange' },
      { value: 'Pink-blue', text: 'Rose Bleu' },
      { value: 'white', text: 'Blanc' },
    ],
    required: false,
  },
];

const partConfigInput = [
  { name: 'hidden', label: 'Cacher', type: 'switch' },
  { name: 'color', label: 'Couleur', type: 'text' },
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
];

export const roomConfigInputs = {
  global: globalConfigInputs,
  info: infoConfig,
  part: partConfigInput,
};
