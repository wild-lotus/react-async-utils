import { ReactNode } from 'react';
import {
  Async,
  ErrorAsync,
  InitAsync,
  InProgressAsync,
  Progress,
  SuccessAsync,
} from './types';

export const init = <Payload>(): InitAsync => ({ progress: Progress.Init });
export const inProgress = <Payload>(): InProgressAsync => ({
  progress: Progress.InProgress,
});
export const success = <Payload>(
  payload: Payload,
  invalidated?: boolean,
): SuccessAsync<Payload> => ({
  invalidated: invalidated != null ? invalidated : false,
  payload,
  progress: Progress.Success,
});
export const error = (errorObj: Error): ErrorAsync => ({
  error: errorObj,
  progress: Progress.Error,
});

export const isInit = <Payload>(f: Async<Payload>): f is InitAsync =>
  f.progress === Progress.Init;
export const isInProgress = <Payload>(
  f: Async<Payload>,
): f is InProgressAsync => f.progress === Progress.InProgress;
export const isSuccess = <Payload>(
  f: Async<Payload>,
): f is SuccessAsync<Payload> => f.progress === Progress.Success;
export const isValidSuccess = <Payload>(f: Async<Payload>): boolean =>
  isSuccess(f) && !f.invalidated;
export const isInvalidated = <Payload>(f: Async<Payload>): boolean =>
  isSuccess(f) && f.invalidated === true;
export const isInProgressOrInvalidated = <Payload>(
  f: Async<Payload>,
): boolean => isInProgress(f) || isInvalidated(f);
export const isError = <Payload>(f: Async<Payload>): f is ErrorAsync =>
  f.progress === Progress.Error;

export const isAnyInit = (...args: Async<unknown>[]): boolean =>
  args.some(f => isInit(f));
export const isAnyInProgress = (...args: Async<unknown>[]): boolean =>
  args.some(f => isInProgress(f));
export const isAnySuccess = (...args: Async<unknown>[]): boolean =>
  args.some(f => isSuccess(f));
export const isAnyValidSuccess = (...args: Async<unknown>[]): boolean =>
  args.some(f => isValidSuccess(f));
export const isAnyInvalidated = (...args: Async<unknown>[]): boolean =>
  args.some(f => isInvalidated(f));
export const isAnyInProgressOrInvalidated = (
  ...args: Async<unknown>[]
): boolean => args.some(f => isInProgressOrInvalidated(f));
export const isAnyError = (...args: Async<unknown>[]): boolean =>
  args.some(f => isError(f));

export const safeAsyncSuccess = <Payload>(
  origin?: Async<Payload>,
): SuccessAsync<Payload> => {
  if (origin != null && isSuccess(origin)) {
    return origin;
  }
  throw new Error('Invalid cast from Async to SuccessAsync');
};
export const safeAsyncError = (origin?: Async<unknown>): ErrorAsync => {
  if (origin != null && isError(origin)) {
    return origin;
  }
  throw new Error('Invalid cast from Async to SuccessAsync');
};

export const safePayload = <Payload>(origin?: Async<Payload>): Payload =>
  safeAsyncSuccess(origin).payload;
export const safeError = (origin?: Async<unknown>): Error =>
  safeAsyncError(origin).error;

export const payloadOrUndefined = <Payload>(
  origin: Async<Payload>,
): Payload | undefined =>
  origin && isSuccess(origin) ? origin.payload : undefined;
export const errorOrUndefined = (origin: Async<unknown>): Error | undefined =>
  origin && isError(origin) ? origin.error : undefined;

export const invalidate = <Payload>(
  origin: SuccessAsync<Payload>,
): SuccessAsync<Payload> =>
  origin.invalidated ? origin : { ...origin, invalidated: true };

export const invalidateOrSetInProgress = <Payload>(
  origin: Async<Payload>,
): InProgressAsync | SuccessAsync<Payload> =>
  isSuccess(origin) ? invalidate(origin) : inProgress();

export const mapSuccess = <P1, P2>(
  origin: SuccessAsync<P1>,
  mapper: (payload: P1) => P2,
  invalidated?: boolean,
): SuccessAsync<P2> =>
  success(
    mapper(origin.payload),
    invalidated != null ? invalidated : origin.invalidated,
  );

export const mapIfSuccess = <Payload1, Payload2>(
  origin: Async<Payload1>,
  mapper: (payload: Payload1) => Payload2,
  invalidated?: boolean,
): Async<Payload2> =>
  isSuccess(origin)
    ? mapSuccess(
        origin,
        mapper,
        invalidated != null ? invalidated : origin.invalidated,
      )
    : origin;

export const renderIfSuccessOrNull = <Payload>(
  origin: Async<Payload>,
  renderSuccess: (payload: Payload, invalidated?: boolean) => ReactNode,
): ReactNode | null =>
  isSuccess(origin) ? renderSuccess(origin.payload, origin.invalidated) : null;
export const renderIfErrorOrNull = <Payload>(
  origin: Async<Payload>,
  renderError: (error: Error) => ReactNode,
): ReactNode | null => (isError(origin) ? renderError(origin.error) : null);

export const render = <Payload>(
  origin: Async<Payload>,
  renderInit: () => ReactNode,
  renderInProgress: () => ReactNode,
  renderSuccess: (payload: Payload, invalidated?: boolean) => ReactNode,
  renderError: (error: Error) => ReactNode,
): ReactNode => {
  switch (origin.progress) {
    case Progress.Init:
      return renderInit();
    case Progress.InProgress:
      return renderInProgress();
    case Progress.Success:
      return renderSuccess(origin.payload, origin.invalidated);
    case Progress.Error:
      return renderError(origin.error);
  }
};

interface AsyncTaskOptions<Payload> {
  currentState?: Async<Payload> | undefined;
  onChange?: (() => void) | undefined;
  onSuccess?: ((payload: Payload) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

export async function task<Payload>(
  asyncFunction: () => Promise<Payload>,
  callback: (asyncData: Async<Payload>) => void,
  {
    currentState,
    onChange,
    onSuccess,
    onError,
  }: AsyncTaskOptions<Payload> = {},
): Promise<void> {
  callback(
    currentState ? invalidateOrSetInProgress(currentState) : inProgress(),
  );
  onChange && onChange();
  try {
    const result = await asyncFunction();
    callback(success(result));
    onChange && onChange();
    onSuccess && onSuccess(result);
  } catch (err) {
    callback(error(err));
    onChange && onChange();
    onError && onError(err);
  }
}
