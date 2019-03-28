import { useCallback, useEffect, useRef, useState } from 'react';
import { newInit, triggerTask, setInitOrAborted } from '../helpers';
import { Async } from '../types';

const ABORT_DEFINED = typeof AbortController !== 'undefined';

interface UseAsyncDataOptions<Payload> {
  onSuccess?: ((payload: Payload) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
  disabled?: boolean;
}

export function useAsyncData<Payload>(
  getData: (singal?: AbortSignal) => Promise<Payload>,
  { onSuccess, onError, disabled }: UseAsyncDataOptions<Payload> = {},
): [Async<Payload>, () => void, () => void] {
  const [asyncData, setAsyncData] = useState<Async<Payload>>(newInit());

  const triggerIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  const triggerGetData = useCallback(async (): Promise<void> => {
    if (disabled) {
      return;
    }
    triggerIdRef.current++;
    const triggerId = triggerIdRef.current;
    abortControllerRef.current && abortControllerRef.current.abort();
    const abortController = ABORT_DEFINED ? new AbortController() : undefined;
    abortControllerRef.current = abortController;
    await triggerTask(
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
  }, [disabled, getData, onError, onSuccess]);

  const abortGetData = useCallback((): void => {
    triggerIdRef.current++;
    abortControllerRef.current && abortControllerRef.current.abort();
    abortControllerRef.current = undefined;
  }, []);

  const resetAsyncData = (): void => {
    abortGetData();
    setAsyncData(setInitOrAborted);
  };

  useEffect(() => {
    if (disabled) {
      setAsyncData(setInitOrAborted);
    } else {
      triggerGetData();
      return abortGetData;
    }
  }, [disabled, triggerGetData, abortGetData]);

  return [asyncData, triggerGetData, resetAsyncData];
}
