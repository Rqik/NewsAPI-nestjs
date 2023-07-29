module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'prettier',
    'simple-import-sort',
    'import'
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'simple-import-sort/imports': 'error',
    'max-len': [
      'error',
      110,
      {
        'ignorePattern': '^import\\s.+\\sfrom\\s.+;$',
        'ignoreUrls': true,
        'ignoreTemplateLiterals': true
      }
    ],
    'no-console': 'warn',
    'no-empty': 'error',
    'no-shadow': 'off',
    'newline-before-return': 'warn',
    'import/prefer-default-export': 'off',
  },
};