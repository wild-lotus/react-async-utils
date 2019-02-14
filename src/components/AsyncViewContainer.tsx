import React, { ReactNode, memo } from 'react';
import * as async from '../helpers';
import { Async } from '../types';

interface PropsSingle {
  asyncData: Async<unknown>;
  loadingRender: () => ReactNode;
  loadingRenderBeforeContent?: boolean;
  forceLoading?: boolean;
  errorRender: (error: Error) => ReactNode;
  errorRenderBeforeContent?: boolean;
  forceError?: Error;
  children: ReactNode;
}

interface PropsMulti {
  asyncData: Async<unknown>[];
  loadingRender: () => ReactNode;
  loadingRenderBeforeContent?: boolean;
  forceLoading?: boolean;
  errorRender: (errors: Error[]) => ReactNode;
  errorRenderBeforeContent?: boolean;
  forceError?: Error[];
  children: ReactNode;
}

type Props = PropsSingle | PropsMulti;

export const AsyncViewContainer = memo(function AsyncViewWrapper2({
  asyncData,
  loadingRender,
  loadingRenderBeforeContent = false,
  forceLoading,
  errorRender,
  errorRenderBeforeContent = false,
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
      : async.errorOrUndefined(asyncData));
  return (
    <>
      {error &&
      (!Array.isArray(error) || error.length > 0) &&
      errorRenderBeforeContent
        ? (errorRender as (error: Error | Error[]) => ReactNode)(error)
        : null}

      {loading && loadingRenderBeforeContent ? loadingRender() : null}

      {children}

      {loading && !loadingRenderBeforeContent ? loadingRender() : null}

      {error &&
      (!Array.isArray(error) || error.length > 0) &&
      errorRenderBeforeContent
        ? (errorRender as (error: Error | Error[]) => ReactNode)(error)
        : null}
    </>
  );
});
