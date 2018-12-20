import * as React from 'react';
import * as async from '../helpers';
import { Async } from '../types';

export interface RenderOptions {
  topRenderLoading?: () => React.ReactNode;
  bottomRenderLoading?: () => React.ReactNode;
  topRenderError?: (error: Error) => React.ReactNode;
  bottomRenderError?: (error: Error) => React.ReactNode;
  forceInvalidated?: boolean;
}

interface Props<P> {
  asyncData: Async<P>;
  renderOptions?: RenderOptions;
  children?: (data?: P, loading?: boolean) => React.ReactNode;
}

export class AsyncView<P> extends React.PureComponent<Props<P>> {
  render() {
    const {
      asyncData,
      renderOptions: {
        topRenderLoading = undefined,
        bottomRenderLoading = undefined,
        topRenderError = undefined,
        bottomRenderError = undefined,
        forceInvalidated = false,
      } = {},
      children,
    } = this.props;
    return async.render(
      asyncData,
      'Getting Async Data',
      () => children != null && children(),
      () => (
        <>
          {topRenderLoading
            ? topRenderLoading()
            : bottomRenderLoading
            ? null
            : 'Loading...'}
          {children != null && children(undefined, true)}
          {bottomRenderLoading
            ? bottomRenderLoading()
            : topRenderLoading
            ? null
            : 'Loading...'}
        </>
      ),
      (data, invalidated) => (
        <>
          {(invalidated || forceInvalidated) &&
            (topRenderLoading
              ? topRenderLoading()
              : bottomRenderLoading
              ? null
              : 'Loading...')}
          {children != null && children(data, invalidated || forceInvalidated)}
          {(invalidated || forceInvalidated) &&
            (bottomRenderLoading
              ? bottomRenderLoading()
              : topRenderLoading
              ? null
              : 'Loading...')}
        </>
      ),
      error => (
        <>
          {topRenderError ? (
            topRenderError(error)
          ) : bottomRenderError ? null : (
            <span>Error: {error}</span>
          )}
          {children != null && children()}
          {bottomRenderError ? (
            bottomRenderError(error)
          ) : topRenderError ? null : (
            <span>Error: {error}</span>
          )}
        </>
      ),
    );
  }
}
