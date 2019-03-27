import { useRef, useState } from 'react';
import {
  AsyncTaskOptions,
  newInit,
  triggerTask,
  setInitOrAborted,
} from '../helpers';
import { Async } from '../types';

const ABORT_DEFINED = typeof AbortController !== 'undefined';

export function useAsyncTask<Result, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Result>,
  options?: AsyncTaskOptions<Result>,
): [Async<Result>, (...args: Args) => Promise<Async<Result>>, () => void] {
  const [asyncResult, setAsyncResult] = useState<Async<Result>>(newInit());

  const triggerIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  const triggerAsyncTask = async (...args: Args): Promise<Async<Result>> => {
    triggerIdRef.current++;
    const triggerId = triggerIdRef.current;
    abortControllerRef.current && abortControllerRef.current.abort();
    const abortController = ABORT_DEFINED ? new AbortController() : undefined;
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

  const abortAsyncTask = (): void => {
    triggerIdRef.current++;
    abortControllerRef.current && abortControllerRef.current.abort();
    abortControllerRef.current = undefined;
    setAsyncResult(setInitOrAborted);
  };

  return [asyncResult, triggerAsyncTask, abortAsyncTask];
}
