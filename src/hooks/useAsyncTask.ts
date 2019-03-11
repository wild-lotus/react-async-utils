import { useEffect, useMemo, useState, useRef } from 'react';
import { newInit, task } from '../helpers';
import { Async } from '../types';

export interface AsyncDataOptions<Payload, Args extends unknown[]> {
  autoTriggerWith?: Args;
  onChange?: () => void;
  onSuccess?: (payload: Payload) => void;
  onError?: (error: Error) => void;
}

export function useAsyncTask<Payload, Args extends unknown[]>(
  getData: (...args: Args) => Promise<Payload>,
  {
    autoTriggerWith,
    onChange,
    onSuccess,
    onError,
  }: AsyncDataOptions<Payload, Args> = {},
  deps?: unknown[],
): [Async<Payload>, (...args: Args) => Promise<Async<Payload>>, () => void] {
  const [asyncData, setAsyncData] = useState<Async<Payload>>(newInit());

  const callsCounterRef = useRef(0);

  const resetAsyncTask = (): void => {
    callsCounterRef.current++;
    setAsyncData(newInit());
    onChange && onChange();
  };

  const triggerAsyncTask = useMemo(
    () => async (...args: Args): Promise<Async<Payload>> => {
      callsCounterRef.current++;
      const currentCallsCounter = callsCounterRef.current;
      return await task(
        () => getData(...args),
        getNewAsyncData => {
          if (callsCounterRef.current === currentCallsCounter) {
            setAsyncData(getNewAsyncData);
          }
        },
        {
          onChange,
          onSuccess,
          onError,
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps || [getData, onChange, onError, onSuccess],
  );

  useEffect(() => {
    autoTriggerWith && triggerAsyncTask(...autoTriggerWith);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || [autoTriggerWith, triggerAsyncTask]);

  return [asyncData, triggerAsyncTask, resetAsyncTask];
}
