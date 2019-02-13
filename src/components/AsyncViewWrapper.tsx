import React, { ReactNode, memo } from 'react';
import * as async from '../helpers';
import { Async } from '../types';

interface PropsSingle {
  asyncData: Async<unknown>;
  renderLoading: () => ReactNode;
  renderLoadingBeforeContent?: boolean;
  forceLoading?: boolean;
  renderError: (error: Error) => ReactNode;
  renderErrorBeforeContent?: boolean;
  forceError?: Error;
  children: ReactNode;
}

interface PropsMulti {
  asyncData: Async<unknown>[];
  renderLoading: () => ReactNode;
  renderLoadingBeforeContent?: boolean;
  forceLoading?: boolean;
  renderError: (errors: Error[]) => ReactNode;
  renderErrorBeforeContent?: boolean;
  forceError?: Error[];
  children: ReactNode;
}

type Props = PropsSingle | PropsMulti;

export const AsyncViewWrapper = memo(function AsyncViewWrapper2({
  asyncData,
  renderLoading,
  renderLoadingBeforeContent = false,
  forceLoading,
  renderError,
  renderErrorBeforeContent = false,
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
      renderErrorBeforeContent
        ? (renderError as (error: Error | Error[]) => ReactNode)(error)
        : null}

      {loading && renderLoadingBeforeContent ? renderLoading() : null}

      {children}

      {loading && !renderLoadingBeforeContent ? renderLoading() : null}

      {error &&
      (!Array.isArray(error) || error.length > 0) &&
      renderErrorBeforeContent
        ? (renderError as (error: Error | Error[]) => ReactNode)(error)
        : null}
    </>
  );
});
