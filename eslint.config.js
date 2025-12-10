import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  // Ignore build artifacts
  {
    ignores: ['node_modules', 'dist', 'build', 'public', '.turbo', 'docs'],
  },

  // Base JS rules
  eslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: [
          './tsconfig.json',
          './apps/*/tsconfig.json',
          './packages/*/tsconfig.json',
        ],
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      'unused-imports': unusedImports,
    },

    settings: {
      // Resolve TS path aliases
      'import/resolver': {
        typescript: {},
      },
    },

    rules: {
      // --- TypeScript ---
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // --- ES ---
      'no-unused-vars': 'off',

      // --- Import rules ---
      'unused-imports/no-unused-imports': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],

      // Domain boundaries (your custom rules)
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/**/domain/**.*ts',
              from: './src/**/infra/**/*.ts',
            },
            {
              target: './src/**/domain/**.*ts',
              from: './src/**/usecases/**/*.ts',
            },
            {
              target: './src/**/domain/**.*ts',
              from: './src/**/app/**/*.ts',
            },
          ],
        },
      ],
    },
  },
];
