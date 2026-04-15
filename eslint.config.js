const config = require('@rubensworks/eslint-config');

module.exports = config([
  {
    files: [ '**/*.ts' ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ './tsconfig.eslint.json' ],
      },
    },
  },
  {
    rules: {
      'import/no-nodejs-modules': 'off',
      'style/quotes': 'off',
      'ts/consistent-type-assertions': 'off',
      'ts/no-require-imports': 'off',
      'ts/no-var-requires': 'off',
      'ts/no-empty-interface': 'off',
    },
  },
  {
    files: [ 'test/**/*.ts' ],
    rules: {
      'ts/no-unused-expressions': 'off',
    },
  },
]);
