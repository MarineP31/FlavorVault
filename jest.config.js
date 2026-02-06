module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(expo-sqlite|uuid|react-native|@react-native|react-native-gesture-handler|@gorhom|react-native-reanimated|react-native-safe-area-context)/)',
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'lib/db/**/*.ts',
    '!lib/db/**/*.d.ts',
    '!lib/db/seed/**',
    '!lib/db/**/*.test.ts',
    '!lib/db/index.ts',
    '!lib/db/init.ts',
    'components/**/*.tsx',
    '!components/**/*.test.tsx',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/lib/db/services/',
    '/lib/db/migrations/',
    '/lib/db/connection.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: false,
          skipLibCheck: true,
        },
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },
};
