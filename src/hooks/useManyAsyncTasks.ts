import { useEffect, useRef, useState, useCallback } from 'react';
import { Async, InitAsync } from '../Asyncs';
import { triggerTask, setInitOrAborted, AsyncTaskOptions } from '../helpers';

const ABORT_DEFINED = typeof AbortController !== 'undefined';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseAsyncTaskOptions<Payload>
  extends AsyncTaskOptions<Payload> {}

export type AsyncTask<Payload, Args extends unknown[]> = Async<Payload> & {
  trigger: (...args: Args) => Promise<Async<Payload>>;
  abort: () => void;
};

export function useManyAsyncTasks<Payload, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Payload>,
  options?: UseAsyncTaskOptions<Payload>,
): (key: unknown) => AsyncTask<Payload, Args> {
  const [asyncResults, setAsyncResults] = useState(
    new Map<unknown, Async<Payload>>(),
  );

  const triggerIdsRef = useRef(new Map<unknown, number>());
  const abortControllersRef = useRef(new Map<unknown, AbortController>());

  const getTriggerAsyncTask = (
    key: unknown,
  ): ((...args: Args) => Promise<Async<Payload>>) => async (...args) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => triggerIdsRef.current.forEach((_, key) => cancelUpdates(key));
  }, [cancelUpdates]);

  return (key: unknown) => {
    const asyncTask = (asyncResults.get(key) || new InitAsync()) as AsyncTask<
      Payload,
      Args
    >;
    asyncTask.trigger = getTriggerAsyncTask(key);
    asyncTask.abort = getAbortAsyncTask(key);
    return asyncTask;
  };
}
