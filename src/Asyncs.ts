import { ReactNode } from 'react';

export enum Progress {
  Init,
  InProgress,
  Success,
  Error,
}

class BaseAsnyc<Payload> {
  protected progress: unknown;
  public isInit(): this is InitAsync<Payload> {
    return this.progress === Progress.Init;
  }
  public isInProgress(): this is InProgressAsync<Payload> {
    return this.progress === Progress.InProgress;
  }
  public isSuccess(): this is SuccessAsync<Payload> {
    return this.progress === Progress.Success;
  }
  public isError(): this is ErrorAsync<Payload> {
    return this.progress === Progress.Error;
  }
  public isInProgressOrInvalidated(): this is
    | InProgressAsync<Payload>
    | SuccessAsync<Payload> {
    return this.isInProgress() || (this.isSuccess() && !!this.invalidated);
  }
  public isAborted(): this is InitAsync<Payload> {
    return this.isInit() && !!this.aborted;
  }

  public getPayload(): Payload | undefined {
    return this.isSuccess() ? this.payload : undefined;
  }

  public getError(): Error | undefined {
    return this.isError() ? this.error : undefined;
  }

  public render({
    init,
    inProgress,
    success,
    error,
  }: {
    init?: (aborted?: boolean) => ReactNode;
    inProgress?: () => ReactNode;
    success?: (payload: Payload, invalidated?: boolean) => ReactNode;
    error?: (error: Error) => ReactNode;
  }): ReactNode {
    switch (this.progress) {
      case Progress.Init:
        return this.isInit() && init ? init(this.aborted) : null;
      case Progress.InProgress:
        return inProgress ? inProgress() : null;
      case Progress.Success:
        return this.isSuccess() && success
          ? success(this.payload, this.invalidated)
          : null;
      case Progress.Error:
        return this.isError() && error ? error(this.error) : null;
    }
  }
}

export class InitAsync<Payload> extends BaseAsnyc<Payload> {
  public progress: Progress.Init;
  public aborted?: boolean;

  public constructor(aborted?: boolean) {
    super();
    this.progress = Progress.Init;
    this.aborted = aborted;
  }
}

export class InProgressAsync<Payload> extends BaseAsnyc<Payload> {
  public progress: Progress.InProgress;

  public constructor() {
    super();
    this.progress = Progress.InProgress;
  }
}

export class SuccessAsync<Payload> extends BaseAsnyc<Payload> {
  public progress: Progress.Success;
  public payload: Payload;
  public invalidated?: boolean;

  public constructor(payload: Payload, invalidated?: boolean) {
    super();
    this.progress = Progress.Success;
    this.payload = payload;
    this.invalidated = invalidated;
  }
}

export class ErrorAsync<Payload> extends BaseAsnyc<Payload> {
  public progress: Progress.Error;
  public error: Error;

  public constructor(error: Error) {
    super();
    this.progress = Progress.Error;
    this.error = error;
  }
}

export type Async<Payload> =
  | InitAsync<Payload>
  | InProgressAsync<Payload>
  | SuccessAsync<Payload>
  | ErrorAsync<Payload>;
