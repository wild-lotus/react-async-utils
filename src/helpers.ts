import {
  Async,
  ErrorAsync,
  InitAsync,
  InProgressAsync,
  SuccessAsync,
} from './Asyncs';

//
// Async Data state checkers
//

export const isAnyInit = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => asyncData.isInit());
export const isAnyInProgress = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => asyncData.isInProgress());
export const isAnySuccess = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => asyncData.isSuccess());
export const isAnyError = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => asyncData.isError());

export const isAnyInProgressOrInvalidated = (
  ...args: Async<unknown>[]
): boolean => args.some(asyncData => asyncData.isInProgressOrInvalidated());
export const isAnyaborted = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => asyncData.isAborted());

//
// Async Data transformations
//

export const setInProgressOrInvalidated = <Payload>(
  origin: Async<Payload>,
): InProgressAsync<Payload> | SuccessAsync<Payload> =>
  origin.isSuccess()
    ? new SuccessAsync(origin.payload, true)
    : new InProgressAsync();

export const setInitOrAborted = <Payload>(
  origin: Async<Payload>,
): InitAsync<Payload> => new InitAsync(origin.isInProgressOrInvalidated());

export const map = <Payload1, Payload2>(
  origin: Async<Payload1>,
  mapper: (payload: Payload1) => Payload2,
  invalidated?: boolean,
): Async<Payload2> =>
  origin.isSuccess()
    ? new SuccessAsync(
        mapper(origin.payload),
        invalidated !== undefined ? invalidated : origin.invalidated,
      )
    : ((origin as unknown) as Async<Payload2>);

//
// Higher level helpers
//

export interface AsyncTaskOptions<Payload> {
  onSuccess?: ((payload: Payload) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

export async function triggerTask<Payload>(
  task: () => Promise<Payload>,
  callback: (
    setNewAsyncData: (prevAsyncData?: Async<Payload>) => Async<Payload>,
  ) => boolean | void,
  { onSuccess, onError }: AsyncTaskOptions<Payload> = {},
): Promise<Async<Payload>> {
  callback(prevAsyncData =>
    prevAsyncData
      ? setInProgressOrInvalidated(prevAsyncData)
      : new InProgressAsync(),
  );
  try {
    const result = await task();
    const successAsync = new SuccessAsync(result);
    const cancalUpdates = callback(() => successAsync);
    !cancalUpdates && onSuccess && onSuccess(result);
    return successAsync;
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const abortedAsync = new InitAsync<Payload>(true);
      callback(() => abortedAsync);
      return abortedAsync;
    } else {
      const errorAsync = new ErrorAsync<Payload>(error);
      const cancalUpdates = callback(() => errorAsync);
      !cancalUpdates && onError && onError(error);
      return errorAsync;
    }
  }
}
