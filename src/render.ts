import { ReactNode } from 'react';
import { Async, Progress } from './types';

export const render = <Payload>(
  origin: Async<Payload>,
  render: {
    init?: (aborted?: boolean) => ReactNode;
    inProgress?: () => ReactNode;
    success?: (payload: Payload, invalidated?: boolean) => ReactNode;
    error?: (error: Error) => ReactNode;
  },
): ReactNode => {
  switch (origin.progress) {
    case Progress.Init:
      return render.init ? render.init(origin.aborted) : null;
    case Progress.InProgress:
      return render.inProgress ? render.inProgress() : null;
    case Progress.Success:
      return render.success
        ? render.success(origin.payload, origin.invalidated)
        : null;
    case Progress.Error:
      return render.error ? render.error(origin.error) : null;
  }
};
