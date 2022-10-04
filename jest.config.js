module.exports = {
  preset: 'ts-jest',
  roots: [
    "src", "__tests__"
  ],
  moduleDirectories: ['node_modules', '<root-dir>/src'],
  testEnvironment: 'node',
  transform: {
    "node_modules/(ethereum-cryptography)/.+\\.(j|t)sx?$": "ts-jest",
  },
  transformIgnorePatterns: [ 'node_modules/((?!ethereum-cryptography)/.*)'],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  moduleNameMapper: {
    '^src/(.*)$': '<root-dir>/../../src/$1',
    '__tests__/(.*)$': '<root-dir>/../../__tests__/$1',
  },
  testTimeout: 300_000
};
