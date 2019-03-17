import { ReactNode } from 'react';
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

export const render = <Payload>(
  origin: Async<Payload>,
  render: {
    init?: (aborted?: boolean) => ReactNode;
    inProgress?: () => ReactNode;
    success?: (payload: Payload, invalidated?: boolean) => ReactNode;
    error?: (error: Error) => ReactNode;
  },
): ReactNode => {
  switch (origin.progress) {
    case Progress.Init:
      return render.init ? render.init(origin.aborted) : null;
    case Progress.InProgress:
      return render.inProgress ? render.inProgress() : null;
    case Progress.Success:
      return render.success
        ? render.success(origin.payload, origin.invalidated)
        : null;
    case Progress.Error:
      return render.error ? render.error(origin.error) : null;
  }
};

interface AsyncTaskOptions<Payload> {
  onSuccess?: ((payload: Payload) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

export async function task<Payload>(
  asyncFunction: () => Promise<Payload>,
  callback: (
    setNewAsyncData: (prevAsyncData?: Async<Payload>) => Async<Payload>,
  ) => void,
  { onSuccess, onError }: AsyncTaskOptions<Payload> = {},
): Promise<Async<Payload>> {
  callback(prevAsyncData =>
    prevAsyncData ? setInProgressOrInvalidated(prevAsyncData) : newInProgress(),
  );
  try {
    const result = await asyncFunction();
    const successAsync = newSuccess(result);
    callback(() => successAsync);
    onSuccess && onSuccess(result);
    return successAsync;
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const abortedAsync = newInit(true);
      callback(() => abortedAsync);
      return abortedAsync;
    } else {
      const errorAsync = newError(error);
      callback(() => errorAsync);
      onError && onError(error);
      return errorAsync;
    }
  }
}
