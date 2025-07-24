const js = require('@eslint/js');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  // 🧽 Ignorer les fichiers/dossiers inutiles
  {
    ignores: ['node_modules', 'dist', 'coverage'],
  },

  // 📦 Base : règles JS recommandées + Prettier
  js.configs.recommended,
  prettierRecommended,

  // 🧠 Configuration générale pour tous les fichiers .js
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        require: true,
        module: true,
        __dirname: true,
        process: true,
        setInterval: true,
        clearInterval: true,
        setTimeout: true,
        clearTimeout: true,
        console: true,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-useless-catch': 'off', // tu as des catchs dans register.controller.js
    },
  },

  // 🧪 Config spécifique pour les tests dans /tests/
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        describe: true,
        it: true,
        test: true,
        expect: true,
        beforeAll: true,
        afterAll: true,
        beforeEach: true,
        afterEach: true,
      },
    },
  },
];
