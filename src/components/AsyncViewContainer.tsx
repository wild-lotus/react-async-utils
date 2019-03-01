import React, { ReactNode, memo } from 'react';
import * as async from '../helpers';
import { Async } from '../types';

interface PropsSingle {
  asyncData: Async<unknown>;
  loadingRender: () => ReactNode;
  setLoadingRenderBeforeChildren?: boolean;
  forceLoading?: boolean;
  errorRender: (error: Error) => ReactNode;
  setErrorRenderBeforeChildren?: boolean;
  forceError?: Error;
  children: ReactNode;
}

interface PropsMulti {
  asyncData: Async<unknown>[];
  loadingRender: () => ReactNode | null;
  setLoadingRenderBeforeChildren?: boolean;
  forceLoading?: boolean;
  errorRender: (errors: Error[]) => ReactNode | null;
  setErrorRenderBeforeChildren?: boolean;
  forceError?: Error[];
  children: ReactNode;
}

type Props = PropsSingle | PropsMulti;

export const AsyncViewContainer = memo(function AsyncViewWrapper2({
  asyncData,
  loadingRender,
  setLoadingRenderBeforeChildren = false,
  forceLoading,
  errorRender,
  setErrorRenderBeforeChildren = false,
  forceError,
  children,
}: Props) {
  const loading =
    forceLoading ||
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

      {loading && loadingRender && setLoadingRenderBeforeChildren
        ? loadingRender()
        : null}

      {children}

      {loading && loadingRender && !setLoadingRenderBeforeChildren
        ? loadingRender()
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
