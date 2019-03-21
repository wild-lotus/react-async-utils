import { useCallback, useEffect, useRef, useState } from 'react';
import { newInit, task, setInitOrAborted } from '../helpers';
import { Async } from '../types';

const ABORT_DEFINED = typeof AbortController !== 'undefined';

export interface UseAsyncTaskOptions<Payload> {
  triggerAsEffect?: boolean;
  onSuccess?: (payload: Payload) => void;
  onError?: (error: Error) => void;
}

export function useAsyncTask<Payload>(
  getData: (singal?: AbortSignal) => Promise<Payload>,
  { triggerAsEffect, onSuccess, onError }: UseAsyncTaskOptions<Payload> = {},
): [Async<Payload>, () => Promise<Async<Payload>>, () => void] {
  const [asyncData, setAsyncData] = useState<Async<Payload>>(newInit());

  const triggerIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  const triggerAsyncTask = useCallback(async (): Promise<Async<Payload>> => {
    triggerIdRef.current++;
    const triggerId = triggerIdRef.current;
    abortControllerRef.current && abortControllerRef.current.abort();
    const abortController = ABORT_DEFINED ? new AbortController() : undefined;
    abortControllerRef.current = abortController;
    return await task(
      () => getData(abortController && abortController.signal),
      setNewAsyncData => {
        if (triggerId === triggerIdRef.current) {
          setAsyncData(setNewAsyncData);
        } else {
          return true;
        }
      },
      { onSuccess, onError },
    );
  }, [getData, onError, onSuccess]);

  const abortTask = useCallback((): void => {
    triggerIdRef.current++;
    abortControllerRef.current && abortControllerRef.current.abort();
    abortControllerRef.current = undefined;
  }, []);

  const resetAsyncTask = (): void => {
    abortTask();
    setAsyncData(setInitOrAborted);
  };

  useEffect(() => {
    triggerAsEffect && triggerAsyncTask();
    return abortTask;
  }, [triggerAsEffect, triggerAsyncTask, abortTask]);

  return [asyncData, triggerAsyncTask, resetAsyncTask];
}
