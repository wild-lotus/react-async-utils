import { map, newSuccess, newError } from './helpers';
// import { Async } from './types';

describe('map', () => {
  it('maps `SuccessAsync`s', () => {
    const SOME_NUMBER = 49;
    expect(map(newSuccess({ x: SOME_NUMBER }), payload => payload.x)).toEqual(
      newSuccess(SOME_NUMBER),
    );
  });

  it('does not map `ErrorAsync`s', () => {
    const SOME_ERROR_ASYNC = newError(new Error('Oh shit'));
    expect(map(SOME_ERROR_ASYNC, payload => payload.x)).toEqual(
      SOME_ERROR_ASYNC,
    );
  });
});
