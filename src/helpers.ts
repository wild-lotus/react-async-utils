import * as React from 'react';
import {
  Async,
  ErrorAsync,
  InitAsync,
  InProgressAsync,
  Progress,
  SuccessAsync,
} from './types';

export const init = <P>(): InitAsync => ({ progress: Progress.Init });
export const inProgress = <P>(): InProgressAsync => ({
  progress: Progress.InProgress,
});
export const success = <P>(
  payload: P,
  invalidated?: boolean,
): SuccessAsync<P> => ({
  invalidated: invalidated != null ? invalidated : false,
  payload,
  progress: Progress.Success,
});
export const error = (errorObj: Error): ErrorAsync => ({
  error: errorObj,
  progress: Progress.Error,
});

export const isInit = <P>(f: Async<P>): f is InitAsync =>
  f.progress === Progress.Init;
export const isInProgress = <P>(f: Async<P>): f is InProgressAsync =>
  f.progress === Progress.InProgress;
export const isSuccess = <P>(f: Async<P>): f is SuccessAsync<P> =>
  f.progress === Progress.Success;
export const isValidSuccess = <P>(f: Async<P>) =>
  isSuccess(f) && !f.invalidated;
export const isInvalidated = <P>(f: Async<P>) =>
  isSuccess(f) && f.invalidated === true;
export const isInProgressOrInvalidated = <P>(f: Async<P>) =>
  isInProgress(f) || isInvalidated(f);
export const isError = <P>(f: Async<P>): f is ErrorAsync =>
  f.progress === Progress.Error;

export const isAnyInit = (...args: Array<Async<any>>) =>
  args.some(f => isInit(f));
export const isAnyInProgress = (...args: Array<Async<any>>) =>
  args.some(f => isInProgress(f));
export const isAnySuccess = (...args: Array<Async<any>>) =>
  args.some(f => isSuccess(f));
export const isAnyValidSuccess = (...args: Array<Async<any>>) =>
  args.some(f => isValidSuccess(f));
export const isAnyInvalidated = (...args: Array<Async<any>>) =>
  args.some(f => isInvalidated(f));
export const isAnyInProgressOrInvalidated = (...args: Array<Async<any>>) =>
  args.some(f => isInProgressOrInvalidated(f));
export const isAnyError = (...args: Array<Async<any>>) =>
  args.some(f => isError(f));

export const safeSuccess = <P>(origin?: Async<P>): SuccessAsync<P> => {
  if (origin != null && isSuccess(origin)) {
    return origin;
  }
  throw new Error('Invalid cast from Async to SuccessAsync');
};

export const safePayload = <P>(origin?: Async<P>): P =>
  safeSuccess(origin).payload;

export const payloadOrUndefined = <P, D>(origin: Async<P>): P | undefined =>
  origin && isSuccess(origin) ? origin.payload : undefined;

export const invalidate = <P>(origin: SuccessAsync<P>): SuccessAsync<P> =>
  origin.invalidated ? origin : { ...origin, invalidated: true };

export const invalidateOrSetInProgress = <P>(
  origin: Async<P>,
): InProgressAsync | SuccessAsync<P> =>
  isSuccess(origin) ? invalidate(origin) : inProgress();

export const update = <P>(
  origin: SuccessAsync<P>,
  updatePayload: (payload: P) => P,
  invalidated?: boolean,
): SuccessAsync<P> =>
  success(
    updatePayload(origin.payload),
    invalidated != null ? invalidated : origin.invalidated,
  );

export const map = <P, T>(
  origin: Async<P>,
  mapper: (payload: P) => T,
): Async<T> =>
  isSuccess(origin)
    ? success(mapper(origin.payload), origin.invalidated)
    : origin;

export const renderIfSuccess = <P>(
  origin: Async<P>,
  renderSuccess: (payload: P, invalidated?: boolean) => React.ReactNode,
): React.ReactNode =>
  isSuccess(origin) ? renderSuccess(origin.payload, origin.invalidated) : null;

export const renderIfError = <P>(
  origin: Async<P>,
  renderError: (error: Error) => React.ReactNode,
): React.ReactNode => (isError(origin) ? renderError(origin.error) : null);

export const render = <P>(
  origin: Async<P>,
  name: string,
  renderInit?: () => React.ReactNode,
  renderInProgress?: () => React.ReactNode,
  renderSuccess?: (payload: P, invalidated?: boolean) => React.ReactNode,
  renderError?: (error: Error) => React.ReactNode,
): React.ReactNode => {
  switch (origin.progress) {
    case Progress.Init:
      return renderInit === undefined ? `Not started ${name}` : renderInit();
    case Progress.InProgress:
      return renderInProgress === undefined ? `${name}...` : renderInProgress();
    case Progress.Success:
      const { payload, invalidated } = origin;
      return renderSuccess === undefined
        ? `Success ${name}!:\n${
            typeof payload === 'object'
              ? JSON.stringify(payload, null, 2)
              : String(payload)
          }`
        : renderSuccess(payload, invalidated);
    case Progress.Error:
      // tslint:disable-next-line:no-console
      console.error('async data render', origin.error);
      return renderError === undefined
        ? `Error ${name}: ${origin.error.message}`
        : renderError(origin.error);
  }
};

interface AsyncTaskOptions<P> {
  currentState?: Async<P> | undefined;
  onChange?: (() => void) | undefined;
  onSuccess?: ((payload: P) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

export async function task<P>(
  asyncFunction: () => Promise<P>,
  callback: (asyncData: Async<P>) => void,
  options: AsyncTaskOptions<P> = {},
): Promise<void> {
  callback(
    options.currentState
      ? invalidateOrSetInProgress(options.currentState)
      : inProgress(),
  );
  options.onChange && options.onChange();
  try {
    const result = await asyncFunction();
    callback(success(result));
    options.onChange && options.onChange();
    if (options.onChange) {
      options.onChange();
    }
    options.onSuccess && options.onSuccess(result);
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error('asyncTask', err);
    callback(error(err));
    options.onChange && options.onChange();
    options.onError && options.onError(err);
  }
}
