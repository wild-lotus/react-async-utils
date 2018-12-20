import { useEffect, useMemo, useState } from 'react';
import * as async from '../helpers';
import { Async } from '../types';

export interface AsyncDataOptions<P> {
  autoTrigger?: boolean;
  onChange?: () => void;
  onSuccess?: (payload: P) => void;
  onError?: (error: Error) => void;
}

export function useAsyncData<P, O>(
  getData: (options?: O) => Promise<P>,
  {
    autoTrigger = true,
    onChange,
    onSuccess,
    onError,
  }: AsyncDataOptions<P> = {},
): [Async<P>, (options?: O) => Promise<void>, () => void] {
  const [asyncData, setAsyncData] = useState<Async<P>>(async.init());
  const memo = useMemo(
    () => ({
      trigger: async (options?: O) =>
        await async.task(() => getData(options), setAsyncData, {
          currentState: asyncData,
          onChange,
          onError,
          onSuccess,
        }),
      reset: () => setAsyncData(async.init()),
    }),
    [],
  );
  useEffect(
    () => {
      autoTrigger && memo.trigger();
    },
    [autoTrigger],
  );
  return [asyncData, memo.trigger, memo.reset];
}
