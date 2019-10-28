/* eslint-disable no-console */
import '@testing-library/jest-dom/extend-expect';

const originalError = console.error;
beforeAll(() => {
  console.error = (...args: string[]) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
