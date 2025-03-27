/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest', 
      {
        tsconfig: 'tsconfig.jest.json'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    "magiclogger$": "<rootDir>/src/index.ts",
    "magiclogger/(.*)$": "<rootDir>/src/$1"
  },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  }
};