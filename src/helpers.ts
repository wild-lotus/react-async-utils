import {
  Async,
  ErrorAsync,
  InitAsync,
  InProgressAsync,
  Progress,
  SuccessAsync,
} from './types';

//
// Async Data "constructors"
//

export const newInit = (aborted?: boolean): InitAsync => ({
  progress: Progress.Init,
  aborted,
});

export const newInProgress = (): InProgressAsync => ({
  progress: Progress.InProgress,
});

export const newSuccess = <Payload>(
  payload: Payload,
  invalidated?: boolean,
): SuccessAsync<Payload> => ({
  invalidated: invalidated != null ? invalidated : false,
  payload,
  progress: Progress.Success,
});

export const newError = (errorObj: Error): ErrorAsync => ({
  error: errorObj,
  progress: Progress.Error,
});

//
// Async Data state checkers
//

export const isInit = <Payload>(
  asyncData: Async<Payload>,
): asyncData is InitAsync => asyncData.progress === Progress.Init;
export const isInProgress = <Payload>(
  asyncData: Async<Payload>,
): asyncData is InProgressAsync => asyncData.progress === Progress.InProgress;
export const isSuccess = <Payload>(
  asyncData: Async<Payload>,
): asyncData is SuccessAsync<Payload> =>
  asyncData.progress === Progress.Success;
export const isError = <Payload>(
  asyncData: Async<Payload>,
): asyncData is ErrorAsync => asyncData.progress === Progress.Error;

export const isAborted = <Payload>(
  asyncData: Async<Payload>,
): asyncData is InitAsync => isInit(asyncData) && !!asyncData.aborted;
export const isValidSuccess = <Payload>(
  asyncData: Async<Payload>,
): asyncData is SuccessAsync<Payload> =>
  isSuccess(asyncData) && !asyncData.invalidated;
export const isInvalidated = <Payload>(
  asyncData: Async<Payload>,
): asyncData is SuccessAsync<Payload> =>
  isSuccess(asyncData) && !!asyncData.invalidated;
export const isInProgressOrInvalidated = <Payload>(
  asyncData: Async<Payload>,
): asyncData is InProgressAsync | SuccessAsync<Payload> =>
  isInProgress(asyncData) || isInvalidated(asyncData);

export const isAnyInit = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => isInit(asyncData));
export const isAnyInProgress = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => isInProgress(asyncData));
export const isAnySuccess = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => isSuccess(asyncData));
export const isAnyError = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => isError(asyncData));

export const isAnyaborted = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => isAborted(asyncData));
export const isAnyValidSuccess = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => isValidSuccess(asyncData));
export const isAnyInvalidated = (...args: Async<unknown>[]): boolean =>
  args.some(asyncData => isInvalidated(asyncData));
export const isAnyInProgressOrInvalidated = (
  ...args: Async<unknown>[]
): boolean => args.some(asyncData => isInProgressOrInvalidated(asyncData));

//
// Async Data transformations
//

export const getPayload = <Payload>(
  origin: Async<Payload>,
): Payload | undefined => (isSuccess(origin) ? origin.payload : undefined);

export const getError = (origin: Async<unknown>): Error | undefined =>
  isError(origin) ? origin.error : undefined;

export const setInProgressOrInvalidated = <Payload>(
  origin: Async<Payload>,
): InProgressAsync | SuccessAsync<Payload> =>
  isSuccess(origin) ? { ...origin, invalidated: true } : newInProgress();

export const setInitOrAborted = <Payload>(origin: Async<Payload>): InitAsync =>
  newInit(isInProgressOrInvalidated(origin));

export const map = <Payload1, Payload2>(
  origin: Async<Payload1>,
  mapper: (payload: Payload1) => Payload2,
  invalidated?: boolean,
): Async<Payload2> =>
  isSuccess(origin)
    ? newSuccess(
        mapper(origin.payload),
        invalidated !== undefined ? invalidated : origin.invalidated,
      )
    : origin;

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
    prevAsyncData ? setInProgressOrInvalidated(prevAsyncData) : newInProgress(),
  );
  try {
    const result = await task();
    const successAsync = newSuccess(result);
    const aborted = callback(() => successAsync);
    !aborted && onSuccess && onSuccess(result);
    return successAsync;
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const abortedAsync = newInit(true);
      callback(() => abortedAsync);
      return abortedAsync;
    } else {
      const errorAsync = newError(error);
      const aborted = callback(() => errorAsync);
      !aborted && onError && onError(error);
      return errorAsync;
    }
  }
}
