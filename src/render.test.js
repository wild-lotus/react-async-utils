import { newInit, newInProgress, newSuccess, newError } from './helpers';
import { render } from './render';

it('returns `init` render result that provides `aborted` substate given an `InitAsync`', () => {
  const INIT_TEXT = 'INIT_zuscufhu';
  const ABORTED_TEXT = 'ABORTED_jamnobof';
  const renders = { init: aborted => (aborted ? ABORTED_TEXT : INIT_TEXT) };
  const initResult = render(newInit(), renders);
  expect(initResult).toBe(INIT_TEXT);
  const abortedResult = render(newInit(true), renders);
  expect(abortedResult).toBe(ABORTED_TEXT);
});

it('returns `null` if no `init` render provided given an `InitAsync`', () => {
  const result = render(newInit(), {});
  expect(result).toBeNull();
})

it('returns `inProgress` render result given an `InProgressAsync`', () => {
  const TEXT = 'tanfozem';
  const result = render(newInProgress(), { inProgress: () => TEXT });
  expect(result).toBe(TEXT);
});

it('returns `null` if no `inProgress` render provided given an `InProgressAsync`', () => {
  const result = render(newInProgress(), {});
  expect(result).toBeNull();
})

it('returns `success` render result that provides `payload` and `invalidated` substate given a `SuccessAsync`', () => {
  const SUCCESS_TEXT = 'SUCCESS_jacofduc';
  const INVALIDATED_TEXT = 'INVALIDATED_ceszimem';
  const PAYLOAD_TEXT = 'PAYLOAD_osulboci';
  const renders = {
    success: (payload, invalidated) =>
      invalidated ? INVALIDATED_TEXT + payload : SUCCESS_TEXT + payload,
  };
  const successResult = render(newSuccess(PAYLOAD_TEXT), renders);
  expect(successResult).toBe(SUCCESS_TEXT + PAYLOAD_TEXT);
  const invalidatedResult = render(newSuccess(PAYLOAD_TEXT, true), renders);
  expect(invalidatedResult).toBe(INVALIDATED_TEXT + PAYLOAD_TEXT);
});

it('returns `null` if no `success` render provided given a `SuccessAsync`', () => {
  const result = render(newSuccess(), {});
  expect(result).toBeNull();
})

it('returns `error` render result given an `ErrorAsync`', () => {
  const TEXT = 'tanfozem';
  const result = render(newError(TEXT), { error: error => error });
  expect(result).toBe(TEXT);
});

it('returns `null` if no `error` render provided given an `ErrorAsync`', () => {
  const result = render(newError(), {});
  expect(result).toBeNull();
})
