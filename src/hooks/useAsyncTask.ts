import { useCallback, useEffect, useRef, useState } from 'react';
import { newInit, task, setInitOrAborted } from '../helpers';
import { Async } from '../types';

export interface UseAsyncTaskOptions<Payload> {
  triggerAsEffect?: boolean;
  onSuccess?: (payload: Payload) => void;
  onError?: (error: Error) => void;
}

export function useAsyncTask<Payload>(
  getData: (singal: AbortSignal) => Promise<Payload>,
  { triggerAsEffect, onSuccess, onError }: UseAsyncTaskOptions<Payload> = {},
): [Async<Payload>, () => Promise<Async<Payload>>, () => void] {
  const [asyncData, setAsyncData] = useState<Async<Payload>>(newInit());

  const triggerIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  const triggerAsyncTask = useCallback(async (): Promise<Async<Payload>> => {
    triggerIdRef.current++;
    const triggerId = triggerIdRef.current;
    abortControllerRef.current && abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    return await task(
      () => getData(abortController.signal),
      setNewAsyncData => {
        if (triggerId === triggerIdRef.current) {
          setAsyncData(setNewAsyncData);
        }
      },
      { onSuccess, onError },
    );
  }, [getData, onError, onSuccess]);

  const resetAsyncTask = useCallback((): void => {
    triggerIdRef.current++;
    abortControllerRef.current && abortControllerRef.current.abort();
    abortControllerRef.current = undefined;
    setAsyncData(setInitOrAborted);
  }, []);

  useEffect(() => {
    triggerAsEffect && triggerAsyncTask();
    return resetAsyncTask;
  }, [triggerAsEffect, triggerAsyncTask, resetAsyncTask]);

  return [asyncData, triggerAsyncTask, resetAsyncTask];
}
