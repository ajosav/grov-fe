import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * One config for the whole workspace. Project boundaries are enforced with Nx
 * tags (see each project.json):
 *
 *   type:app     → may use every lib, never another app
 *   type:feature → @grov/shared            (ui, hooks, api, store, models)
 *   type:data    → @grov/api, hooks, store (models, and api for hooks)
 *   type:ui      → @grov/ui                (models only)
 *   type:util    → @grov/models            (nothing)
 */
/** Tokens only (styling.md): Tailwind palette shades and bare white/black. Token names such as `sky-tint` are allowed. */
const PALETTE_COLOURS = {
  selector:
    'Literal[value=/\\b(bg|text|border|ring|fill|stroke|from|to|via|outline|divide|placeholder)-((gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}|white|black)\\b/]',
  message:
    'Use Grov tokens (bg-surface, text-ink, border-line, bg-primary, text-danger …), not Tailwind palette colours. See references/styling.md.',
};

/** Named exports only (code-style.md). Route modules and config files are the exception. */
const DEFAULT_EXPORT = {
  selector: 'ExportDefaultDeclaration',
  message:
    'Use a named export. Default exports are only for route modules and config files (references/code-style.md).',
};

/** No focused tests on shared branches (testing.md). */
const FOCUSED_TEST = {
  selector: "MemberExpression[object.name=/^(it|test|describe)$/][property.name='only']",
  message: 'Remove .only before committing (references/testing.md).',
};

/** One library per job (tooling.md → Dependencies). */
const BANNED_PACKAGES = [
  {name: 'moment', message: 'Use date-fns.'},
  {name: 'moment-timezone', message: 'Use date-fns with Intl and Africa/Lagos.'},
  {name: 'formik', message: 'Use react-hook-form (references/forms.md).'},
  {name: 'yup', message: 'Use zod (references/forms.md).'},
  {
    name: 'js-cookie',
    message: 'Auth lives in httpOnly cookies; never handle tokens in JS (references/security.md).',
  },
  {
    name: 'crypto-js',
    message: 'No client-side "encryption" of user data (references/security.md).',
  },
  {name: 'lodash', message: 'Use the platform (Array, Object, Intl) or a small local function.'},
  {name: 'classnames', message: 'Use cn() from @grov/ui.'},
  {name: 'react-router-dom', message: 'Import from react-router (v7).'},
];
const BANNED_PATTERNS = [
  {group: ['@radix-ui/*'], message: 'Import primitives from the radix-ui package.'},
  {group: ['lodash/*', 'lodash.*'], message: 'Use the platform or a small local function.'},
];

export default tseslint.config(
  {
    ignores: [
      '**/dist',
      '**/build',
      '**/coverage',
      '**/.react-router',
      '**/node_modules',
      '.yarn',
      '.nx',
      '**/generated/**',
      '**/public/**',
      '**/vite.config.*.timestamp*',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    plugins: {'@nx': nx, react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y},
    languageOptions: {
      globals: {...globals.browser, ...globals.node},
      parserOptions: {ecmaFeatures: {jsx: true}},
    },
    settings: {react: {version: 'detect'}},
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...jsxA11y.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/prop-types': 'off',
      // Curly quotes and apostrophes in copy are fine; React escapes text.
      'react/no-unescaped-entities': 'off',
      'react/no-danger': 'error',
      'no-console': ['error', {allow: ['warn', 'error']}],
      'no-multiple-empty-lines': ['error', {max: 1, maxBOF: 0, maxEOF: 0}],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {fixStyle: 'inline-type-imports'}],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none'},
      ],
      // See the constants above the config for what each restriction is for.
      'no-restricted-syntax': ['error', PALETTE_COLOURS, DEFAULT_EXPORT, FOCUSED_TEST],
      'no-restricted-imports': ['error', {paths: BANNED_PACKAGES, patterns: BANNED_PATTERNS}],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:data',
                'type:ui',
                'type:util',
                'type:test',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:data', 'type:ui', 'type:util'],
            },
            {sourceTag: 'type:data', onlyDependOnLibsWithTags: ['type:data', 'type:util']},
            {sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:util']},
            {sourceTag: 'type:util', onlyDependOnLibsWithTags: []},
            {
              sourceTag: 'type:test',
              onlyDependOnLibsWithTags: ['type:data', 'type:ui', 'type:util', 'type:feature'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**', 'libs/test-utils/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  {
    // Sign-in screens ask one question per screen (D38): focusing that field is the point.
    files: [
      'libs/shared/src/lib/auth/**',
      'apps/*/app/routes/auth/**',
      'apps/*/app/pages/auth/**',
      'apps/admin/app/components/**',
    ],
    rules: {'jsx-a11y/no-autofocus': 'off'},
  },
  {
    // Route modules, React Router entry files and tool configs are default-exported by convention.
    files: [
      'apps/*/app/root.tsx',
      'apps/*/app/routes.ts',
      'apps/*/app/routes/**',
      'apps/*/app/pages/**',
      'apps/*/app/layouts/**',
      '**/*.config.{ts,mjs,js}',
    ],
    rules: {'no-restricted-syntax': ['error', PALETTE_COLOURS, FOCUSED_TEST]},
  },
  {
    // The theme script must run before first paint; it is a constant string we own.
    files: ['apps/*/app/root.tsx'],
    rules: {'react/no-danger': 'off'},
  },
  {
    // Ported marketing markup: decorative mock-ups of app screens, not real controls.
    files: ['apps/website/app/site/sections/**'],
    rules: {'jsx-a11y/anchor-is-valid': 'off'},
  },
  {
    files: ['tools/**', '**/*.config.{ts,mjs,js}', '**/scripts/**'],
    rules: {'no-console': 'off'},
  },
  prettier
);
