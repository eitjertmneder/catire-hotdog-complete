module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.jsx?$': babel-jest,
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/*.{test,spec}.{ts,tsx,js,jsx}'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  setupFilesAfterSetup: ['@testing-library/jest-native/extend-expect'],
};
