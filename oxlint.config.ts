import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'react', 'import', 'jsx-a11y'],
  ignorePatterns: ['.wxt/**', '.output/**', 'dist/**', 'dist-firefox/**', 'build/**'],
  settings: {
    react: {
      version: '19.2',
    },
  },
  rules: {
    'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
    'react/rules-of-hooks': 'error',
  },
  options: {
    typeAware: true,
  },
})
