export const themesToColors = {
  customized: {
    label: 'Personnalisé',
    floor: '#100101',
    background: '#332b00',
    accent: '#fcca44',
  },

  white: {
    label: 'Blanc',
    floor: '#25252f',
    background: '#d1d1d1',
    accent: '#ffffff',
  },

  black: {
    label: 'Noir',
    floor: '#111115',
    background: '#1f1f23',
    accent: '#4a4a5a',
  },

  night: {
    label: 'Nuit',
    floor: '#6DC7ED',
    background: '#140d26',
    accent: '#3d2b7a',
  },

  'black-orange': {
    label: 'Noir et Orange',
    floor: '#fb8500',
    background: '#1f1f23',
    accent: '#1a1a1b',
  },

  'pink-blue': {
    label: 'Rose et Bleu',
    floor: '#3d61ee',
    background: '#F76DD1',
    accent: '#DE83C5',
  },

  'blue-yellow': {
    label: 'Bleu et Jaune',
    floor: '#ffbe0b',
    background: '#4066f7',
    accent: '#2a88f7',
  },

  'yellow-gray': {
    label: 'Jaune et Gris',
    floor: '#343a40',
    background: '#EDED6D',
    accent: '#ffd166',
  },

  day: {
    label: 'Jour',
    floor: '#53ED83',
    background: '#8ecae6',
    accent: '#8ecae6',
  },

  'sunny-day': {
    label: 'Journée Ensoleillée',
    floor: '#e69500',
    background: '#ffb703',
    accent: '#fff3b0',
  },

  desert: {
    label: 'Désert',
    floor: '#7a5430',
    background: '#a47148',
    accent: '#f4e1c1',
  },

  forest: {
    label: 'Forêt',
    floor: '#1b4332',
    background: '#2d6a4f',
    accent: '#95d5b2',
  },

  ocean: {
    label: 'Océan',
    floor: '#023047',
    background: '#1b4965',
    accent: '#8ecae6',
  },

  tropical: {
    label: 'Tropical',
    floor: '#006d77',
    background: '#06d6a0',
    accent: '#ccffef',
  },

  sunset: {
    label: 'Coucher de soleil',
    floor: '#3c096c',
    background: '#9d0208',
    accent: '#ffb703',
  },

  moon: {
    label: 'Lune',
    floor: '#1a1a1a',
    background: '#12121a',
    accent: '#6c757d',
  },

  galaxy: {
    label: 'Galaxie',
    floor: '#10002b',
    background: '#240046',
    accent: '#7b2cbf',
  },

  'deep-space': {
    label: 'Espace profond',
    floor: '#010409',
    background: '#0d1117',
    accent: '#30363d',
  },

  future: {
    label: 'Futuriste',
    floor: '#240046',
    background: '#0a0a14',
    accent: '#9b5de5',
  },

  cyborg: {
    label: 'Cyborg',
    floor: '#011627',
    background: '#0b132b',
    accent: '#00f5d4',
  },

  'neon-city': {
    label: 'Ville néon',
    floor: '#111',
    background: '#050505',
    accent: '#ff00ff',
  },

  hacker: {
    label: 'Hacker',
    floor: '#000c00',
    background: '#000000',
    accent: '#00ff41',
  },

  ice: {
    label: 'Glace',
    floor: '#0077b6',
    background: '#90e0ef',
    accent: '#caf0f8',
  },

  lava: {
    label: 'Lave',
    floor: '#200101',
    background: '#370617',
    accent: '#ff4d00',
  },

  candy: {
    label: 'Bonbon',
    floor: '#a44a6a',
    background: '#ff70a6',
    accent: '#ffd6e0',
  },

  pastel: {
    label: 'Pastel',
    floor: '#9a8c98',
    background: '#cdb4db',
    accent: '#ffafcc',
  },

  retro: {
    label: 'Rétro',
    floor: '#3a0ca3',
    background: '#4361ee',
    accent: '#4cc9f0',
  },

  minimal: {
    label: 'Minimaliste',
    floor: '#dee2e6',
    background: '#f8f9fa',
    accent: '#adb5bd',
  },
};

export const themeOptions = Object.entries(themesToColors).map(
  ([value, theme]) => ({
    value,
    text: theme.label,
  })
);
