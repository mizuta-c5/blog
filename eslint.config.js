// eslint.config.js (ESM)
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // 好みで
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
