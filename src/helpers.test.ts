import { map, newSuccess, newError } from './helpers';
import { Async } from './types';

describe('map', () => {
  test('maps Success Asyncs', () => {
    const SOME_NUMBER = 49;
    expect(map(newSuccess({ x: SOME_NUMBER }), payload => payload.x)).toEqual(
      newSuccess(SOME_NUMBER),
    );
  });

  test('does not map Error Asyncs', () => {
    const SOME_ERROR_ASYNC = newError(new Error('Oh shit')) as Async<{
      x: number;
    }>;
    expect(map(SOME_ERROR_ASYNC, payload => payload.x)).toEqual(
      SOME_ERROR_ASYNC,
    );
  });
});
