import * as React from 'react';
import * as async from '../helpers';
import { Async } from '../types';

const getDefaultErrorNode = (error: Error) => (
  <span style={{ color: 'red' }}>Error: {error.message}</span>
);

const getDefaultErrorsNode = (error: Error | Error[]) =>
  Array.isArray(error)
    ? error.map((e, i) => (
        <React.Fragment key={i}>
          {i ? <br /> : null}
          {getDefaultErrorNode(e)}
        </React.Fragment>
      ))
    : getDefaultErrorNode(error);

interface PropsSingle {
  asyncData: Async<unknown>;
  renderOptions?: {
    topRenderLoading?: () => React.ReactNode;
    bottomRenderLoading?: () => React.ReactNode;
    topRenderError?: (error: Error) => React.ReactNode;
    bottomRenderError?: (error: Error) => React.ReactNode;
    forceLoading?: boolean;
    forceError?: Error;
  };
  children: React.ReactNode;
}

interface PropsMulti {
  asyncData: Array<Async<unknown>>;
  renderOptions?: {
    topRenderLoading?: () => React.ReactNode;
    bottomRenderLoading?: () => React.ReactNode;
    topRenderError?: (errors: Error[]) => React.ReactNode;
    bottomRenderError?: (errors: Error[]) => React.ReactNode;
    forceLoading?: boolean;
    forceError?: Error[];
  };
  children: React.ReactNode;
}

type Props = PropsSingle | PropsMulti;

export class AsyncViewWrapper extends React.PureComponent<Props> {
  render() {
    const {
      asyncData,
      renderOptions: {
        topRenderLoading = undefined,
        bottomRenderLoading = undefined,
        forceLoading = false,
        topRenderError = undefined,
        bottomRenderError = undefined,
        forceError = undefined,
      } = {},
      children,
    } = this.props;
    const loading =
      forceLoading ||
      (Array.isArray(asyncData)
        ? async.isAnyInProgressOrInvalidated(...asyncData)
        : async.isInProgressOrInvalidated(asyncData));
    const error =
      forceError ||
      (Array.isArray(asyncData)
        ? asyncData.filter(async.isError).map(ad => ad.error)
        : async.isError(asyncData)
        ? asyncData.error
        : undefined);

    return (
      <>
        {(Array.isArray(error) ? error.length : error) &&
          (topRenderError
            ? (topRenderError as any)(error)
            : bottomRenderError
            ? null
            : getDefaultErrorsNode(error!))}

        {loading &&
          (topRenderLoading
            ? topRenderLoading()
            : bottomRenderLoading
            ? null
            : 'Loading...')}

        {children}

        {(loading || forceLoading) &&
          (bottomRenderLoading
            ? bottomRenderLoading()
            : topRenderError
            ? null
            : 'Loading...')}

        {error &&
          (bottomRenderError
            ? (bottomRenderError as any)(error)
            : topRenderError
            ? null
            : getDefaultErrorsNode(error))}
      </>
    );
  }
}
