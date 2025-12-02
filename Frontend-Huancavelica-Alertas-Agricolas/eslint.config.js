import js from '@eslint/js'
import globals from 'globals'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Helper to build globals for TSX files (merge browser globals and React)
const tsxGlobals = { ...globals.browser, React: 'readonly' }

export default [
  // Global ignore (flat config prefers `ignores` here instead of .eslintignore)
  {
    ignores: ['dist', 'public', 'node_modules', '.cache', 'coverage'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TSX-specific relaxations so we don't modify frontend source files:
  // - expose `React` as a readonly global to avoid "React is not defined"
  // - make unused-vars a warning and ignore identifiers starting with `_`
  // - downgrade exhaustive-deps to warning
  {
    files: ['**/*.tsx'],
    languageOptions: {
      globals: tsxGlobals,
      parser: tsParser,
      parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off', // disable base rule for TSX files; use TypeScript-aware rule below
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Project-specific flat config for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Keep react-refresh warning similar to previous config
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Allow underscore-prefixed variables to be unused in TS files (non-invasive)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Merge recommended rules from react-hooks plugin when available
      ...(reactHooks.configs?.recommended?.rules || {}),
    },
  },
]