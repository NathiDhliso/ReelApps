const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/*.d.ts',
      '**/coverage/**',
      '**/.next/**',
      '**/out/**',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/.pnpm/**',
      'packages/**/dist/**',
      'apps/**/dist/**',
      'packages/auth/dist/**',
      'packages/ui/dist/**',
      'packages/config/dist/**',
      'packages/supabase/dist/**',
      'packages/types/dist/**',
      'supabase/functions/**',
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-undef': 'error',
      'no-empty': 'warn',
      'no-prototype-builtins': 'warn',
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}', '**/jest.setup.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.browser,
        ...globals.node,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
  // Supabase functions configuration - completely separate
  {
    files: ['**/supabase/functions/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        Deno: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-unused-vars': 'off',
      'no-undef': 'error',
      'no-empty': 'warn',
    },
  },
  // Ignore dist and generated files completely
  {
    ignores: [
      '**/dist/**/*',
      '**/build/**/*',
      '**/node_modules/**/*',
      '**/.pnpm/**/*',
      'packages/auth/dist/**/*',
      'packages/ui/dist/**/*',
      'packages/config/dist/**/*',
      'packages/supabase/dist/**/*',
      'packages/types/dist/**/*',
      'supabase/functions/**/*',
    ],
  },
];
