export default {
    preset: 'ts-jest/presets/js-with-ts', // Utilise un preset qui inclut JSX
    testEnvironment: 'jsdom',
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest', // Assure que ts-jest traite les fichiers .ts et .tsx
    },
  };