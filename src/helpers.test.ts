import { Async, SuccessAsync, ErrorAsync, map } from './index';

describe('map', () => {
  it('maps `SuccessAsync`s', () => {
    const SOME_NUMBER = 49;
    expect(
      map(new SuccessAsync({ x: SOME_NUMBER }), payload => payload.x),
    ).toEqual(new SuccessAsync(SOME_NUMBER));
  });

  it('does not map `ErrorAsync`s', () => {
    const SOME_ERROR_ASYNC = new ErrorAsync(new Error('Oh shit')) as Async<{
      x: number;
    }>;
    expect(map(SOME_ERROR_ASYNC, payload => payload.x)).toEqual(
      SOME_ERROR_ASYNC,
    );
  });
});
