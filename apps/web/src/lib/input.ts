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
    placeholder: 'Enter your pseudo',
    required: true,
    icon: Fingerprint,
  },
  {
    label: 'Password',
    type: 'password',
    name: 'password',
    placeholder: 'Enter your password',
    required: true,
    icon: Lock,
  },
];

/* =========================
   REGISTER INPUTS
========================= */
export const registerInputs = [
  {
    label: 'First Name',
    type: 'text',
    name: 'user.first_name',
    placeholder: 'Enter first name',
    required: true,
    icon: User,
  },
  {
    label: 'Last Name',
    type: 'text',
    name: 'user.last_name',
    placeholder: 'Enter last name',
    required: true,
    icon: User,
  },
  {
    label: 'Email',
    type: 'email',
    name: 'user.email',
    placeholder: 'Enter email',
    required: true,
    icon: Mail,
  },
  {
    label: 'Role',
    type: 'select',
    name: 'user.role',
    placeholder: 'Select role',
    required: true,
    icon: Briefcase,
    options: [
      { value: 'CHILD', text: 'Enfant' },
      { value: 'SUPERVISOR', text: 'Superviseur' },
    ],
  },
  {
    label: 'Password',
    type: 'password',
    name: 'user.password',
    placeholder: 'Create password',
    required: true,
    icon: Lock,
  },
  {
    label: 'Parental Code',
    type: 'number',
    name: 'user.parental_code',
    placeholder: 'Enter parental code',
    required: false,
    icon: ShieldCheck,
  },
  {
    label: 'Pseudo',
    type: 'text',
    name: 'profile.pseudo',
    placeholder: 'Choose a pseudo',
    required: true,
    icon: Users,
  },
];

/* =========================
   RESET INPUTS
========================= */
export const resetInputs = [
  {
    label: 'Email Address',
    type: 'email',
    name: 'email',
    placeholder: 'Recovery email',
    required: true,
    icon: Mail,
  },
  {
    label: 'Verification Code',
    type: 'text',
    name: 'code',
    placeholder: 'Enter 6-digit code',
    required: false,
    icon: KeyRound,
  },
];
