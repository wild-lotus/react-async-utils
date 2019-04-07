import { useEffect, useRef, useState, useCallback } from 'react';
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

export type AsyncTask<Result, Args extends unknown[]> = Async<Result> & {
  trigger: (...args: Args) => Promise<Async<Result>>;
  abort: () => void;
};

export function useAsyncTask<Result, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Result>,
  options?: UseAsyncTaskOptions<Result>,
): AsyncTask<Result, Args> {
  const [asyncResult, setAsyncResult] = useState<Async<Result>>(newInit());

  const triggerIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  const triggerAsyncTask = async (...args: Args): Promise<Async<Result>> => {
    triggerIdRef.current++;
    const triggerId = triggerIdRef.current;
    const abortController = ABORT_DEFINED
      ? abortControllerRef.current || new AbortController()
      : undefined;
    abortControllerRef.current = abortController;
    return await triggerTask(
      () => getTask(abortController && abortController.signal)(...args),
      setNewAsyncData => {
        if (triggerId === triggerIdRef.current) {
          setAsyncResult(setNewAsyncData);
        } else {
          return true;
        }
      },
      options,
    );
  };

  const cancelUpdates = useCallback((): void => {
    triggerIdRef.current++;
  }, []);

  const abortAsyncTask = (): void => {
    cancelUpdates();
    abortControllerRef.current && abortControllerRef.current.abort();
    abortControllerRef.current = undefined;
    setAsyncResult(setInitOrAborted);
  };

  useEffect(() => cancelUpdates, [cancelUpdates]);

  return {
    ...asyncResult,
    trigger: triggerAsyncTask,
    abort: abortAsyncTask,
  };
}
