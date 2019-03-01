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
  deps?: unknown[],
): [Async<Payload>, (...args: Args) => Promise<void>, () => void] {
  const [asyncData, setAsyncData] = useState<Async<Payload>>(async.newInit());

  const asyncDataRef = useRef(asyncData);

  const reset = useCallback(() => {
    setAsyncData(async.newInit());
    onChange && onChange();
  }, deps || [onChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const trigger = useMemo(
    () => async (...args: Args) =>
      await async.task(() => getData(...args), setAsyncData, {
        currentState: asyncDataRef.current,
        onChange,
        onError,
        onSuccess,
      }),
    deps || [onChange, onError, onSuccess], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    asyncDataRef.current = asyncData;
  }, [asyncData]);

  useEffect(() => {
    autoTriggerWith && trigger(...autoTriggerWith);
  }, deps || [autoTriggerWith, trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return [asyncData, trigger, reset];
}
