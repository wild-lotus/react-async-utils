import { SuccessAsync } from './index';
import { InitAsync, Async, ErrorAsync } from './Asyncs';

interface TestPayload {
  x: string;
}

it('can access payload from success state Async', () => {
  const inputPayload: TestPayload = { x: 'stlo0cca' };
  const getAsync: () => Async<TestPayload> = (): Async<TestPayload> =>
    new SuccessAsync(inputPayload);
  const async: Async<TestPayload> = getAsync();
  const outputPayload: TestPayload | undefined = async.getPayload();
  expect(outputPayload).toBe(inputPayload);
});

it('can access empty payload from init state Async', () => {
  const getAsync: () => Async<TestPayload> = (): Async<TestPayload> =>
    new InitAsync();
  const async: Async<TestPayload> = getAsync();
  const outputPayload: TestPayload | undefined = async.getPayload();
  expect(outputPayload).toBe(undefined);
});

it('can access error from error Async', () => {
  const inputError = new Error();
  const getAsync: () => Async<TestPayload> = (): Async<TestPayload> =>
    new ErrorAsync(inputError);
  const async: Async<TestPayload> = getAsync();
  const outputError: Error | undefined = async.getError();
  expect(outputError).toBe(inputError);
});

it('can access empty error from error state Async', () => {
  const getAsync: () => Async<TestPayload> = (): Async<TestPayload> =>
    new InitAsync();
  const async: Async<TestPayload> = getAsync();
  const outputError: Error | undefined = async.getError();
  expect(outputError).toBe(undefined);
});
