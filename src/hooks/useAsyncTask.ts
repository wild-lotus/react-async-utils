import {
  AsyncTask,
  UseAsyncTaskOptions,
  useManyAsyncTasks,
} from './useManyAsyncTasks';

export function useAsyncTask<Result, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Result>,
  options?: UseAsyncTaskOptions<Result>,
): AsyncTask<Result, Args> {
  return useManyAsyncTasks(getTask, options)(0);
}
