export enum Progress {
  Init,
  InProgress,
  Success,
  Error,
}

export interface InitAsync {
  progress: Progress.Init;
}
export interface InProgressAsync {
  progress: Progress.InProgress;
}
export interface SuccessAsync<P> {
  progress: Progress.Success;
  payload: P;
  invalidated?: boolean;
}
export interface ErrorAsync {
  progress: Progress.Error;
  error: Error;
}
export type Async<P> =
  | InitAsync
  | InProgressAsync
  | SuccessAsync<P>
  | ErrorAsync;
