import { useEffect, useRef, useState, useCallback } from 'react';
import { Async, InitAsync } from '../Asyncs';
import { triggerTask, setInitOrAborted, AsyncTaskOptions } from '../helpers';

const ABORT_DEFINED = typeof AbortController !== 'undefined';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseAsyncTaskOptions<Payload>
  extends AsyncTaskOptions<Payload> {}

export type AsyncTask<Result, Args extends unknown[]> = Async<Result> & {
  trigger: (...args: Args) => Promise<Async<Result>>;
  abort: () => void;
};

export function useManyAsyncTasks<Result, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Result>,
  options?: UseAsyncTaskOptions<Result>,
): (key: unknown) => AsyncTask<Result, Args> {
  const [asyncResults, setAsyncResults] = useState(
    new Map<unknown, Async<Result>>(),
  );

  const triggerIdsRef = useRef(new Map<unknown, number>());
  const abortControllersRef = useRef(new Map<unknown, AbortController>());

  const getTriggerAsyncTask = (
    key: unknown,
  ): ((...args: Args) => Promise<Async<Result>>) => async (...args) => {
    const triggerId = (triggerIdsRef.current.get(key) || 0) + 1;
    triggerIdsRef.current.set(key, triggerId);

    let abortController: AbortController | undefined;
    if (ABORT_DEFINED) {
      abortController =
        abortControllersRef.current.get(key) || new AbortController();
      abortControllersRef.current.set(key, abortController);
    }
    return await triggerTask(
      () => getTask(abortController && abortController.signal)(...args),
      setNewAsyncData => {
        if (triggerId === triggerIdsRef.current.get(key)) {
          setAsyncResults(prevAsyncResults =>
            new Map(prevAsyncResults).set(
              key,
              setNewAsyncData(prevAsyncResults.get(key) || new InitAsync()),
            ),
          );
        } else {
          return true;
        }
      },
      options,
    );
  };

  const cancelUpdates = useCallback((key: unknown): void => {
    triggerIdsRef.current.set(key, (triggerIdsRef.current.get(key) || 0) + 1);
  }, []);

  const getAbortAsyncTask = (key: unknown): (() => void) => () => {
    cancelUpdates(key);
    const abortController = abortControllersRef.current.get(key);
    abortController && abortController.abort();
    abortControllersRef.current.delete(key);
    setAsyncResults(
      new Map(asyncResults).set(
        key,
        setInitOrAborted(asyncResults.get(key) || new InitAsync()),
      ),
    );
  };

  useEffect(() => {
    triggerIdsRef.current.forEach((_, key) => cancelUpdates(key));
  }, [cancelUpdates]);

  return (key: unknown) => {
    const asyncTask = (asyncResults.get(key) || new InitAsync()) as AsyncTask<
      Result,
      Args
    >;
    asyncTask.trigger = getTriggerAsyncTask(key);
    asyncTask.abort = getAbortAsyncTask(key);
    return asyncTask;
  };
}
