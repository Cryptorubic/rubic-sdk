module.exports = {
  preset: 'ts-jest',
  roots: [
    "src", "__tests__"
  ],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  transform: {
    "node_modules/(ethereum-cryptography|p-timeout)/.+\\.(j|t)sx?$": "ts-jest",
  },
  transformIgnorePatterns: [ 'node_modules/((?!ethereum-cryptography|p-timeout)/.*)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  moduleNameMapper: {
    '^src/(.*)$': '<root-dir>/.././src/$1',
    '@core/(.*)$': '<root-dir>/../../src/core/$1',
    '@common/(.*)$': '<root-dir>/../../src/common/$1',
    '@features/(.*)$': '<root-dir>/../../src/features/$1'
  }
};
