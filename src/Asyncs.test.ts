import {
  Async,
  InitAsync,
  InProgressAsync,
  SuccessAsync,
  ErrorAsync,
} from './index';

interface TestPayload {
  data: string;
}

it('can access properly typed payload from success state Async', () => {
  const INPUT_PAYLOAD: TestPayload = { data: 'stlo0cca' };
  const outputPayload: TestPayload | undefined = (new SuccessAsync(
    INPUT_PAYLOAD,
  ) as Async<TestPayload>).getPayload();
  expect(outputPayload).toBe(INPUT_PAYLOAD);
});

it('can access empty payload from init state Async', () => {
  const outputPayload: TestPayload | undefined = (new InitAsync() as Async<
    TestPayload
  >).getPayload();
  expect(outputPayload).toBe(undefined);
});

it('can access error from error state Async', () => {
  const inputError = new Error();
  const outputError: Error | undefined = (new ErrorAsync(inputError) as Async<
    TestPayload
  >).getError();
  expect(outputError).toBe(inputError);
});

it('can access empty error from error state Async', () => {
  const outputError: Error | undefined = (new InitAsync() as Async<
    TestPayload
  >).getError();
  expect(outputError).toBe(undefined);
});

describe('render', () => {
  it('returns `init` render result that provides `aborted` substate given an `InitAsync`', () => {
    const INIT_TEXT = 'INIT_zuscufhu';
    const ABORTED_TEXT = 'ABORTED_jamnobof';
    const renders = {
      init: (aborted?: boolean) => (aborted ? ABORTED_TEXT : INIT_TEXT),
    };
    // const initResult = render(new InitAsync(), renders);
    const initResult = new InitAsync().render(renders);
    expect(initResult).toBe(INIT_TEXT);
    const abortedResult = new InitAsync(true).render(renders);
    expect(abortedResult).toBe(ABORTED_TEXT);
  });

  it('returns `null` if no `init` render provided given an `InitAsync`', () => {
    const result = new InitAsync().render({});
    expect(result).toBeNull();
  });

  it('returns `inProgress` render result given an `InProgressAsync`', () => {
    const TEXT = 'tanfozem';
    const result = new InProgressAsync().render({ inProgress: () => TEXT });
    expect(result).toBe(TEXT);
  });

  it('returns `null` if no `inProgress` render provided given an `InProgressAsync`', () => {
    const result = new InProgressAsync().render({});
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
    const successResult = new SuccessAsync(PAYLOAD_TEXT).render(renders);
    expect(successResult).toBe(SUCCESS_TEXT + PAYLOAD_TEXT);
    const invalidatedResult = new SuccessAsync(PAYLOAD_TEXT, true).render(
      renders,
    );
    expect(invalidatedResult).toBe(INVALIDATED_TEXT + PAYLOAD_TEXT);
  });

  it('returns `success` render result that provides properly typed `payload` given a `Async` in success state', () => {
    const PAYLOAD: TestPayload = { data: 'nise0yx6' };
    const renders = {
      success: (payload: TestPayload) => payload.data,
    };
    const successResult = (new SuccessAsync(PAYLOAD) as Async<
      TestPayload
    >).render(renders);
    expect(successResult).toBe(PAYLOAD.data);
  });

  it('returns `null` if no `success` render provided given a `SuccessAsync`', () => {
    const result = new SuccessAsync(undefined).render({});
    expect(result).toBeNull();
  });

  it('returns `error` render result given an `ErrorAsync`', () => {
    const ERROR = new Error('tanfozem');
    const result = new ErrorAsync(ERROR).render({ error: error => error });
    expect(result).toBe(ERROR);
  });

  it('returns `null` if no `error` render provided given an `ErrorAsync`', () => {
    const result = new ErrorAsync(new Error()).render({});
    expect(result).toBeNull();
  });
});
