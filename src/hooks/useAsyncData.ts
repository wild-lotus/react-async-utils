import { useEffect, useState, useRef } from 'react';
import { newInit, task } from '../helpers';
import { Async } from '../types';

export interface AsyncDataOptions<Payload, Args extends unknown[]> {
  autoTriggerWith?: Args;
  onChange?: () => void;
  onSuccess?: (payload: Payload) => void;
  onError?: (error: Error) => void;
}

function usePrevious<T>(value: T): T | undefined {
  const valueRef = useRef<T | undefined>(undefined);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef.current;
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
  const [asyncData, setAsyncData] = useState<Async<Payload>>(newInit());

  const resetAsyncData = (): void => {
    setAsyncData(newInit());
    onChange && onChange();
  };

  const triggerAsyncData = async (...args: Args): Promise<void> =>
    await task(() => getData(...args), setAsyncData, {
      currentAsync: asyncData,
      onChange,
      onSuccess,
      onError,
    });

  const prevAsyncData = usePrevious(asyncData);

  useEffect(() => {
    if (prevAsyncData && asyncData !== prevAsyncData) {
      // eslint-disable-next-line no-console
      console.error(
        'Infinite loop catched at `useAsyncData` auto-trigger effect. Use `useAsyncData` 3rd argument to explicitly control the dependencies of this effect.',
      );
      return;
    }
    autoTriggerWith && triggerAsyncData(...autoTriggerWith);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || [autoTriggerWith, getData, onChange, onError, onSuccess]);

  return [asyncData, triggerAsyncData, resetAsyncData];
}
