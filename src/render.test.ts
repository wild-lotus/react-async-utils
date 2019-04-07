import {
  InitAsync,
  InProgressAsync,
  SuccessAsync,
  ErrorAsync,
  render,
} from './index';

it('returns `init` render result that provides `aborted` substate given an `InitAsync`', () => {
  const INIT_TEXT = 'INIT_zuscufhu';
  const ABORTED_TEXT = 'ABORTED_jamnobof';
  const renders = {
    init: (aborted?: boolean) => (aborted ? ABORTED_TEXT : INIT_TEXT),
  };
  const initResult = render(new InitAsync(), renders);
  expect(initResult).toBe(INIT_TEXT);
  const abortedResult = render(new InitAsync(true), renders);
  expect(abortedResult).toBe(ABORTED_TEXT);
});

it('returns `null` if no `init` render provided given an `InitAsync`', () => {
  const result = render(new InitAsync(), {});
  expect(result).toBeNull();
});

it('returns `inProgress` render result given an `InProgressAsync`', () => {
  const TEXT = 'tanfozem';
  const result = render(new InProgressAsync(), { inProgress: () => TEXT });
  expect(result).toBe(TEXT);
});

it('returns `null` if no `inProgress` render provided given an `InProgressAsync`', () => {
  const result = render(new InProgressAsync(), {});
  expect(result).toBeNull();
});

it('returns `success` render result that provides `payload` and `invalidated` substate given a `SuccessAsync`', () => {
  const SUCCESS_TEXT = 'SUCCESS_jacofduc';
  const INVALIDATED_TEXT = 'INVALIDATED_ceszimem';
  const PAYLOAD_TEXT = 'PAYLOAD_osulboci';
  const renders = {
    success: <T>(payload: T, invalidated?: boolean) =>
      invalidated ? INVALIDATED_TEXT + payload : SUCCESS_TEXT + payload,
  };
  const successResult = render(new SuccessAsync(PAYLOAD_TEXT), renders);
  expect(successResult).toBe(SUCCESS_TEXT + PAYLOAD_TEXT);
  const invalidatedResult = render(
    new SuccessAsync(PAYLOAD_TEXT, true),
    renders,
  );
  expect(invalidatedResult).toBe(INVALIDATED_TEXT + PAYLOAD_TEXT);
});

it('returns `null` if no `success` render provided given a `SuccessAsync`', () => {
  const result = render(new SuccessAsync(undefined), {});
  expect(result).toBeNull();
});

it('returns `error` render result given an `ErrorAsync`', () => {
  const ERROR = new Error('tanfozem');
  const result = render(new ErrorAsync(ERROR), { error: error => error });
  expect(result).toBe(ERROR);
});

it('returns `null` if no `error` render provided given an `ErrorAsync`', () => {
  const result = render(new ErrorAsync(new Error()), {});
  expect(result).toBeNull();
});
