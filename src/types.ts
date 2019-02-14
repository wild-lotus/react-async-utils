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
export interface SuccessAsync<Payload> {
  progress: Progress.Success;
  payload: Payload;
  invalidated?: boolean;
}
export interface ErrorAsync {
  progress: Progress.Error;
  error: Error;
}
export type Async<Payload> =
  | InitAsync
  | InProgressAsync
  | SuccessAsync<Payload>
  | ErrorAsync;
