import { useEffect, useRef, useState, useCallback } from 'react';
import { AsyncTaskOptions, triggerTask, setInitOrAborted } from '../helpers';
import { Async, InitAsync } from '../Asyncs';
import { AsyncTask } from './useAsyncTask';

const ABORT_DEFINED = typeof AbortController !== 'undefined';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseAsyncTaskOptions<Payload>
  extends AsyncTaskOptions<Payload> {}

export function useManyAsyncTasks<Result, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Result>,
  options?: UseAsyncTaskOptions<Result>,
): (key: string) => AsyncTask<Result, Args> {
  const [asyncResults, setAsyncResults] = useState<{
    [key: string]: Async<Result>;
  }>({});

  const triggerIdsRef = useRef<{ [key: string]: number }>({});
  const abortControllersRef = useRef<{
    [key: string]: AbortController | undefined;
  }>({});

  const getTriggerAsyncTask = (
    key: string,
  ): ((...args: Args) => Promise<Async<Result>>) => async (...args) => {
    const triggerId = (triggerIdsRef.current[key] || 0) + 1;
    triggerIdsRef.current[key] = triggerId;

    let abortController: AbortController | undefined;
    if (ABORT_DEFINED) {
      abortController =
        abortControllersRef.current[key] || new AbortController();
      abortControllersRef.current[key] = abortController;
    }
    return await triggerTask(
      () => getTask(abortController && abortController.signal)(...args),
      setNewAsyncData => {
        if (triggerId === triggerIdsRef.current[key]) {
          setAsyncResults({
            ...asyncResults,
            [key]: setNewAsyncData(asyncResults[key]),
          });
        } else {
          return true;
        }
      },
      options,
    );
  };

  const cancelUpdates = useCallback((key: string): void => {
    triggerIdsRef.current[key]++;
  }, []);

  const getAbortAsyncTask = (key: string): (() => void) => () => {
    cancelUpdates(key);
    const abortController = abortControllersRef.current[key];
    abortController && abortController.abort();
    abortControllersRef.current[key] = undefined;
    setAsyncResults({
      ...asyncResults,
      [key]: setInitOrAborted(asyncResults[key]),
    });
  };

  useEffect(() => {
    Object.keys(triggerIdsRef.current).forEach(cancelUpdates);
  }, [cancelUpdates]);

  return (key: string) => {
    const asyncTask = (asyncResults[key] || new InitAsync()) as AsyncTask<
      Result,
      Args
    >;
    asyncTask.trigger = getTriggerAsyncTask(key);
    asyncTask.abort = getAbortAsyncTask(key);
    return asyncTask;
  };
}
