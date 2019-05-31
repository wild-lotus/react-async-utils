import { useRef } from 'react';

const CALLS_LIMIT = 5;
const TIME_LIMIT = 500;

let i = 0;

const noop = (): void => {};

interface AsyncDataDependencies<Payload> {
  getData: (singal?: AbortSignal) => Promise<Payload>;
  onSuccess?: ((payload: Payload) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

const useStopRunawayEffectDev = <Payload>({
  getData,
  onSuccess,
  onError,
}: AsyncDataDependencies<Payload>): void => {
  const prevDependenciesRef = useRef<AsyncDataDependencies<Payload>>();
  const prevDependencies = prevDependenciesRef.current;
  const countRef = useRef(0);
  if (
    !prevDependencies ||
    getData !== prevDependencies.getData ||
    onSuccess !== prevDependencies.onSuccess ||
    onError !== prevDependencies.onError
  ) {
    countRef.current++;
    if (countRef.current >= CALLS_LIMIT) {
      const causingArgs = [];
      if (getData !== prevDependencies!.getData) {
        causingArgs.push(`- The 1st argument: ${getData.toString()}`);
      }
      if (onSuccess !== prevDependencies!.onSuccess) {
        causingArgs.push(
          `- \`onSuccess\` in the 2nd argument: ${onSuccess &&
            onSuccess.toString()}`,
        );
      }
      if (onError !== prevDependencies!.onError) {
        causingArgs.push(
          `- \`onError\` in the 2nd argument: ${onError && onError.toString()}`,
        );
      }
      // eslint-disable-next-line no-console
      console.warn(
        `Info on detected runaway \`useAsyncData\`. Its input functions must keep their identity stable, since they are dependencies of a React effect.\n\nThe input functions causing this error probably are:\n${causingArgs.join(
          '\n',
        )}\n\nThey probably are inline functions. You must extract them outside of any component or memoize them using \`React.useCallback\`.`,
      );
      throw new Error(
        `Runaway \`useAsyncData\` detected. Check the console for more info. Make sure its input functions keep their identity stable. Also, this error message is from react-async-utils, not React.`,
      );
    }
    setTimeout(() => {
      countRef.current = 0;
    }, TIME_LIMIT);
    prevDependenciesRef.current = { getData, onSuccess, onError };
  }
};

export const useStopRunawayEffect =
  process.env.NODE_ENV === 'production' ? noop : useStopRunawayEffectDev;
