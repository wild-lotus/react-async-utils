import React, { ReactNode, memo } from 'react';
import * as async from '../helpers';
import { Async } from '../types';

interface PropsSingle {
  asyncData: Async<unknown>;
  inProgressRender: () => ReactNode;
  setInProgressRenderBeforeChildren?: boolean;
  forceInProgress?: boolean;
  errorRender: (error: Error) => ReactNode;
  setErrorRenderBeforeChildren?: boolean;
  forceError?: Error;
  children: ReactNode;
}

interface PropsMulti {
  asyncData: Async<unknown>[];
  inProgressRender: () => ReactNode | null;
  setInProgressRenderBeforeChildren?: boolean;
  forceInProgress?: boolean;
  errorRender: (errors: Error[]) => ReactNode | null;
  setErrorRenderBeforeChildren?: boolean;
  forceError?: Error[];
  children: ReactNode;
}

type Props = PropsSingle | PropsMulti;

export const AsyncViewContainer = memo(function AsyncViewWrapper2({
  asyncData,
  inProgressRender,
  setInProgressRenderBeforeChildren = false,
  forceInProgress,
  errorRender,
  setErrorRenderBeforeChildren = false,
  forceError,
  children,
}: Props) {
  const inProgress =
    forceInProgress ||
    (Array.isArray(asyncData)
      ? async.isAnyInProgressOrInvalidated(...asyncData)
      : async.isInProgressOrInvalidated(asyncData));
  const error =
    forceError ||
    (Array.isArray(asyncData)
      ? asyncData.filter(async.isError).map(ad => ad.error)
      : async.getError(asyncData));
  return (
    <>
      {error &&
      (!Array.isArray(error) || error.length > 0) &&
      errorRender &&
      setErrorRenderBeforeChildren
        ? (errorRender as (error: Error | Error[]) => ReactNode)(error)
        : null}

      {inProgress && inProgressRender && setInProgressRenderBeforeChildren
        ? inProgressRender()
        : null}

      {children}

      {inProgress && inProgressRender && !setInProgressRenderBeforeChildren
        ? inProgressRender()
        : null}

      {error &&
      (!Array.isArray(error) || error.length > 0) &&
      errorRender &&
      setErrorRenderBeforeChildren
        ? (errorRender as (error: Error | Error[]) => ReactNode)(error)
        : null}
    </>
  );
});
