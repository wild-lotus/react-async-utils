// const { defaults } = require('jest-config');
module.exports = {
  setupFilesAfterEnv: ['./testsSetup.ts'],
  testPathIgnorePatterns: [
    // ...defaults.testPathIgnorePatterns,
    './node_modules/',
    './lib/',
  ],
};
