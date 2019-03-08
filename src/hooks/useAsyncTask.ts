import { useEffect, useState, useRef } from 'react';
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

  const triggerAsyncTask = async (...args: Args): Promise<Async<Payload>> => {
    callsCounterRef.current++;
    const currentCallsCounter = callsCounterRef.current;
    return await task(
      () => getData(...args),
      newAsyncData => {
        if (callsCounterRef.current === currentCallsCounter) {
          setAsyncData(newAsyncData);
        }
      },
      {
        currentAsync: asyncData,
        onChange,
        onSuccess,
        onError,
      },
    );
  };

  useEffect(() => {
    autoTriggerWith && triggerAsyncTask(...autoTriggerWith);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || [autoTriggerWith, getData, onChange, onError, onSuccess]);

  return [asyncData, triggerAsyncTask, resetAsyncTask];
}
