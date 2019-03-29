import { useEffect, useRef, useState } from 'react';
import {
  AsyncTaskOptions,
  newInit,
  triggerTask,
  setInitOrAborted,
} from '../helpers';
import { Async } from '../types';

const ABORT_DEFINED = typeof AbortController !== 'undefined';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseAsyncTaskOptions<Payload>
  extends AsyncTaskOptions<Payload> {}

export function useAsyncTask<Payload, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Payload>,
  options?: UseAsyncTaskOptions<Payload>,
): [Async<Payload>, (...args: Args) => Promise<Async<Payload>>, () => void] {
  const [asyncPayload, setAsyncPayload] = useState<Async<Payload>>(newInit());

  const triggerIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  const triggerAsyncTask = async (...args: Args): Promise<Async<Payload>> => {
    triggerIdRef.current++;
    const triggerId = triggerIdRef.current;
    abortControllerRef.current && abortControllerRef.current.abort();
    const abortController = ABORT_DEFINED ? new AbortController() : undefined;
    abortControllerRef.current = abortController;
    return await triggerTask(
      () => getTask(abortController && abortController.signal)(...args),
      setNewAsyncData => {
        if (triggerId === triggerIdRef.current) {
          setAsyncPayload(setNewAsyncData);
        } else {
          return true;
        }
      },
      options,
    );
  };

  const abortAsyncTask = (): void => {
    triggerIdRef.current++;
    abortControllerRef.current && abortControllerRef.current.abort();
    abortControllerRef.current = undefined;
    setAsyncPayload(setInitOrAborted);
  };

  useEffect(() => abortAsyncTask, []);

  return [asyncPayload, triggerAsyncTask, abortAsyncTask];
}
