// const { defaults } = require('jest-config');
module.exports = {
  setupFilesAfterEnv: ['./testsSetup.js'],
  testPathIgnorePatterns: [
    // ...defaults.testPathIgnorePatterns,
    './node_modules/',
    './lib/',
  ],
};
