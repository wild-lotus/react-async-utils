import * as React from 'react';
import * as async from '../helpers';
import { Async } from '../types';

export interface RenderOptions {
  topRenderLoading: () => React.ReactNode;
  bottomRenderLoading: () => React.ReactNode;
  topRenderError: (error: Error) => React.ReactNode;
  bottomRenderError: (error: Error) => React.ReactNode;
  forceInvalidated?: boolean;
}

interface Props<P> {
  asyncData: Async<P>;
  renderOptions: RenderOptions;
  children?: (data?: P, loading?: boolean) => React.ReactChildren;
}

export class AsyncView<P> extends React.PureComponent<Props<P>> {
  render() {
    const {
      asyncData,
      renderOptions: {
        topRenderLoading,
        bottomRenderLoading,
        topRenderError,
        bottomRenderError,
        forceInvalidated,
      },
      children,
    } = this.props;
    return async.render(
      asyncData,
      'Getting Async Data',
      () => children != null && children(),
      () => (
        <>
          {topRenderLoading && topRenderLoading()}
          {children != null && children(undefined, true)}
          {bottomRenderLoading && bottomRenderLoading()}
        </>
      ),
      (data, invalidated) => (
        <>
          {(invalidated || forceInvalidated) &&
            topRenderLoading &&
            topRenderLoading()}
          {children != null && children(data, invalidated || forceInvalidated)}
          {(invalidated || forceInvalidated) &&
            bottomRenderLoading &&
            bottomRenderLoading()}
        </>
      ),
      error => (
        <>
          {topRenderError != null && topRenderError(error)}
          {children != null && children()}
          {bottomRenderError != null && bottomRenderError(error)}
        </>
      ),
    );
  }
}
