import { useCallback, useEffect, useRef, useState } from 'react';
import { newInit, task } from '../helpers';
import { Async } from '../types';

export interface AsyncDataOptions<Payload> {
  triggerAsEffect?: boolean;
  onChange?: () => void;
  onSuccess?: (payload: Payload) => void;
  onError?: (error: Error) => void;
}

export function useAsyncTask<Payload>(
  getData: () => Promise<Payload>,
  {
    triggerAsEffect,
    onChange,
    onSuccess,
    onError,
  }: AsyncDataOptions<Payload> = {},
): [Async<Payload>, () => Promise<Async<Payload>>, () => void] {
  const [asyncData, setAsyncData] = useState<Async<Payload>>(newInit());

  const raceConditionCounterRef = useRef(0);

  const triggerAsyncTask = useCallback(async (): Promise<Async<Payload>> => {
    raceConditionCounterRef.current++;
    const currentRaceCounditionCounter = raceConditionCounterRef.current;
    return await task(
      getData,
      getNewAsyncData => {
        if (raceConditionCounterRef.current === currentRaceCounditionCounter) {
          setAsyncData(getNewAsyncData);
        }
      },
      {
        onChange,
        onSuccess,
        onError,
      },
    );
  }, [getData, onChange, onError, onSuccess]);

  const resetAsyncTask = useCallback((): void => {
    raceConditionCounterRef.current++;
    setAsyncData(newInit());
    onChange && onChange();
  }, [onChange]);

  useEffect(() => {
    triggerAsEffect && triggerAsyncTask();
    return resetAsyncTask;
  }, [triggerAsEffect, triggerAsyncTask, resetAsyncTask]);

  return [asyncData, triggerAsyncTask, resetAsyncTask];
}
