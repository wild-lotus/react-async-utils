import React, { ReactNode } from 'react';
import * as async from '../helpers';
import { Async } from '../types';

interface PropsSingle {
  asyncData: Async<unknown>;
  inProgressRender: (() => ReactNode) | null;
  setInProgressRenderBeforeChildren?: boolean;
  forceInProgress?: boolean;
  errorRender: ((error: Error) => ReactNode) | null;
  setErrorRenderBeforeChildren?: boolean;
  forceError?: Error;
  children: ReactNode;
}

interface PropsMulti {
  asyncData: Async<unknown>[];
  inProgressRender: (() => ReactNode) | null;
  setInProgressRenderBeforeChildren?: boolean;
  forceInProgress?: boolean;
  errorRender: ((errors: Error[]) => ReactNode) | null;
  setErrorRenderBeforeChildren?: boolean;
  forceError?: Error[];
  children: ReactNode;
}

type Props = PropsSingle | PropsMulti;

export function AsyncViewContainer({
  asyncData,
  inProgressRender,
  setInProgressRenderBeforeChildren = false,
  forceInProgress,
  errorRender,
  setErrorRenderBeforeChildren = false,
  forceError,
  children,
}: Props): ReactNode {
  const isInProgress =
    forceInProgress ||
    (Array.isArray(asyncData)
      ? async.isAnyInProgressOrInvalidated(...asyncData)
      : async.isInProgressOrInvalidated(asyncData));
  const errors =
    forceError ||
    (Array.isArray(asyncData)
      ? asyncData.filter(async.isError).map(ad => ad.error)
      : async.getError(asyncData));
  return (
    <>
      {errors &&
      (!Array.isArray(errors) || errors.length > 0) &&
      errorRender &&
      setErrorRenderBeforeChildren
        ? (errorRender as (error: Error | Error[]) => ReactNode)(errors)
        : null}

      {isInProgress && inProgressRender && setInProgressRenderBeforeChildren
        ? inProgressRender()
        : null}

      {children}

      {isInProgress && inProgressRender && !setInProgressRenderBeforeChildren
        ? inProgressRender()
        : null}

      {errors &&
      (!Array.isArray(errors) || errors.length > 0) &&
      errorRender &&
      !setErrorRenderBeforeChildren
        ? (errorRender as (error: Error | Error[]) => ReactNode)(errors)
        : null}
    </>
  );
}
