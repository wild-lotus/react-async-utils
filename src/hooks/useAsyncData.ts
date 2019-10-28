import { useCallback, useEffect, useRef, useState } from 'react';
import { AsyncTaskOptions, triggerTask, setInitOrAborted } from '../helpers';
import { Async, InitAsync } from '../Asyncs';
import { useStopRunawayEffect } from './useStopRunawayEffect';

const ABORT_DEFINED = typeof AbortController !== 'undefined';

export interface UseAsyncDataOptions<Payload>
  extends AsyncTaskOptions<Payload> {
  disabled?: boolean;
}

export type AsyncData<Payload> = Async<Payload> & {
  refresh: () => void;
};

export function useAsyncData<Payload>(
  getData: (singal?: AbortSignal) => Promise<Payload>,
  { onSuccess, onError, disabled }: UseAsyncDataOptions<Payload> = {},
): AsyncData<Payload> {
  useStopRunawayEffect({ getData, onError, onSuccess });
  const [asyncPayload, setAsyncPayload] = useState<Async<Payload>>(
    new InitAsync() as AsyncData<Payload>,
  );

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
          setAsyncPayload(setNewAsyncData);
        } else {
          return true;
        }
      },
      { onSuccess, onError },
    );
  }, [disabled, getData, onError, onSuccess]);

  const asyncData = asyncPayload as AsyncData<Payload>;
  asyncData.refresh = triggerGetData;

  const abortGetData = useCallback((): void => {
    triggerIdRef.current++;
    abortControllerRef.current && abortControllerRef.current.abort();
    abortControllerRef.current = undefined;
  }, []);

  useEffect(() => {
    if (disabled) {
      setAsyncPayload(setInitOrAborted);
    } else {
      triggerGetData();
      return abortGetData;
    }
  }, [disabled, triggerGetData, abortGetData]);

  return asyncData;
}
