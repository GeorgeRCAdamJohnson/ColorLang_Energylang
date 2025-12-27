module.exports = {
  extends: [
    './.eslintrc.cjs',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parserOptions: {
    project: './tsconfig.strict.json'
  },
  rules: {
    // Prevent common TypeScript issues
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    '@typescript-eslint/no-unused-imports': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Import/export validation
    'import/no-unused-modules': ['error', { unusedExports: true }],
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/order': ['error', {
      groups: [
        'builtin',
        'external', 
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' }
    }],
    
    // React-specific prevention
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-no-leaked-render': 'error',
    'react/no-array-index-key': 'warn',
    
    // General code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error'
  }
};