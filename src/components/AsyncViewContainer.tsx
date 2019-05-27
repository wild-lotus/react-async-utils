import React, { ReactNode, ReactElement } from 'react';
import { isAnyInProgressOrInvalidated } from '../helpers';
import { Async, ErrorAsync } from '../Asyncs';

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
}: Props): ReactElement {
  const isInProgress =
    forceInProgress ||
    (Array.isArray(asyncData)
      ? isAnyInProgressOrInvalidated(...asyncData)
      : asyncData.isInProgressOrInvalidated());
  const errors =
    forceError ||
    (Array.isArray(asyncData)
      ? asyncData
          .filter(
            (singleAsyncData): singleAsyncData is ErrorAsync<unknown> =>
              singleAsyncData.isError(),
          )
          .map(singleAsyncData => singleAsyncData.error)
      : asyncData.getError());
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
