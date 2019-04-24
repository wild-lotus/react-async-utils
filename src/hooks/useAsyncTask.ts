import {
  AsyncTask,
  UseAsyncTaskOptions,
  useManyAsyncTasks,
} from './useManyAsyncTasks';

export function useAsyncTask<Payload, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Payload>,
  options?: UseAsyncTaskOptions<Payload>,
): AsyncTask<Payload, Args> {
  return useManyAsyncTasks(getTask, options)(0);
}
