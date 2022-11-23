module.exports = {
  preset: 'ts-jest',
  roots: [
    "src", "__tests__"
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testEnvironment: 'node',
  transform: {
    "node_modules/(ethereum-cryptography)/.+\\.(j|t)sx?$": "ts-jest",
  },
  transformIgnorePatterns: [ 'node_modules/((?!ethereum-cryptography)/.*)'],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json'
    }
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '__tests__/(.*)$': '<rootDir>/__tests__/$1',
  },
  testTimeout: 300_000
};
