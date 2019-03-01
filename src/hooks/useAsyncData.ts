import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import * as async from '../helpers';
import { Async } from '../types';

export interface AsyncDataOptions<Payload, Args extends unknown[]> {
  autoTriggerWith?: Args;
  onChange?: () => void;
  onSuccess?: (payload: Payload) => void;
  onError?: (error: Error) => void;
}

export function useAsyncData<Payload, Args extends unknown[]>(
  getData: (...args: Args) => Promise<Payload>,
  {
    autoTriggerWith,
    onChange,
    onSuccess,
    onError,
  }: AsyncDataOptions<Payload, Args> = {},
  deps: unknown[],
): [Async<Payload>, (...args: Args) => Promise<void>, () => void] {
  const [asyncData, setAsyncData] = useState<Async<Payload>>(async.init());
  const asyncDataRef = useRef(asyncData);
  const reset = useCallback(() => {
    setAsyncData(async.init());
    onChange && onChange();
  }, [deps]);
  const trigger = useMemo(
    () => async (...args: Args) =>
      await async.task(() => getData(...args), setAsyncData, {
        currentState: asyncDataRef.current,
        onChange,
        onError,
        onSuccess,
      }),
    [deps],
  );
  useEffect(() => {
    asyncDataRef.current = asyncData;
  }, [asyncData]);
  useEffect(() => {
    autoTriggerWith && trigger(...autoTriggerWith);
  }, [deps]);
  return [asyncData, trigger, reset];
}
