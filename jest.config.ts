import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    magiclogger$: '<rootDir>/src/index.ts',
    'magiclogger/(.*)$': '<rootDir>/src/$1',
  '^mongodb$': '<rootDir>/tests/__mocks__/mongodb.js'
  },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  // Add this to use the setup file
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Configure different test environments based on file patterns
  projects: [
    {
      displayName: 'node',
      testMatch: ['<rootDir>/tests/**/!(Browser)*.test.ts'],
      testEnvironment: 'node',
      preset: 'ts-jest',
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.jest.json',
          },
        ],
      },
      moduleNameMapper: {
        magiclogger$: '<rootDir>/src/index.ts',
        'magiclogger/(.*)$': '<rootDir>/src/$1',
  '^mongodb$': '<rootDir>/tests/__mocks__/mongodb.js'
      },
      setupFiles: ['<rootDir>/jest.polyfills.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    {
      displayName: 'jsdom',
      testMatch: ['<rootDir>/tests/**/Browser*.test.ts'],
      testEnvironment: 'jsdom',
      preset: 'ts-jest',
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.jest.json',
          },
        ],
      },
      moduleNameMapper: {
        magiclogger$: '<rootDir>/src/index.ts',
        'magiclogger/(.*)$': '<rootDir>/src/$1',
  '^mongodb$': '<rootDir>/tests/__mocks__/mongodb.js'
      },
      setupFiles: ['<rootDir>/jest.polyfills.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
  ],
};

export default config;
