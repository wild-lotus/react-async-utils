import React, { useMemo } from 'react';
import { AsyncDataOptions, useAsyncData } from '../hooks/useAsyncData';
import { AsyncView, RenderOptions } from './AsyncView';

interface Props<P, O> {
  getData: (options?: O) => Promise<P>;
  asyncDataOptions: AsyncDataOptions<P>;
  renderOptions: RenderOptions;
  children: (
    payload: P | undefined,
    triggerAsyncData: (options?: O) => Promise<void>,
    loading?: boolean,
  ) => React.ReactChildren;
}

export function AsyncDataView<P, O>({
  getData,
  asyncDataOptions,
  renderOptions,
  children,
}: Props<P, O>) {
  const [asyncData, triggerGetData] = useAsyncData(getData, asyncDataOptions);
  const asyncViewRenderProp = useMemo(
    () => (data: P | undefined, loading?: boolean) =>
      children(data, triggerGetData, loading),
    [],
  );
  return (
    <AsyncView asyncData={asyncData} renderOptions={renderOptions}>
      {asyncViewRenderProp}
    </AsyncView>
  );
}
