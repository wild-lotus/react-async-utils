import React, { ReactNode, ReactElement } from 'react';
import {
  cleanup,
  fireEvent,
  render as testingRender,
  wait,
} from 'react-testing-library';
import {
  Async,
  AsyncData,
  useAsyncData,
  UseAsyncDataOptions,
  render as asyncRender,
} from '../index';

afterEach(cleanup);

interface Props<Payload> {
  getData: (singal?: AbortSignal) => Promise<Payload>;
  options?: UseAsyncDataOptions<Payload>;
  children: (asyncData: AsyncData<Payload>) => ReactNode;
}

function UseAsyncDataComponent<Payload>({
  getData,
  options,
  children,
}: Props<Payload>): ReactElement {
  return <>{children(useAsyncData(getData, options))}</>;
}

function getAbortablePromise<Payload>({
  resolveWith,
  rejectWith,
  signal,
  onAbortCallback,
}: {
  resolveWith?: Payload;
  rejectWith?: Error;
  signal: AbortSignal | undefined;
  onAbortCallback: () => void;
}): Promise<Payload> {
  if (signal && signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }
  return new Promise((resolve, reject) => {
    signal &&
      signal.addEventListener('abort', () => {
        onAbortCallback && onAbortCallback();
        reject(new DOMException('Aborted', 'AbortError'));
      });
    resolveWith !== undefined && resolve(resolveWith);
    rejectWith !== undefined && reject(rejectWith);
  });
}

it('updates async data up to `SuccessAsync` state and invokes `onSuccess` callback', async () => {
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_bonihzes';
  const SUCCESS_TEXT = 'SUCCESS_ukejemuo';
  const PAYLOAD = 'PAYLOAD_ezhihnoi';
  const onSuccessCallback = jest.fn();
  const { container } = testingRender(
    <UseAsyncDataComponent
      getData={() => Promise.resolve(PAYLOAD)}
      options={{ onSuccess: onSuccessCallback }}
    >
      {asyncData =>
        asyncRender(asyncData, {
          inProgress: () => IN_PROGRESS_TEXT,
          success: () => SUCCESS_TEXT,
        })
      }
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(onSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT);
  expect(onSuccessCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledWith(PAYLOAD);
});

it('updates async data up to `ErrorAsync` state and invokes `onError` callback', async () => {
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_tokunalf';
  const ERROR_TEXT = 'ERROR_vaowdenz';
  const ERROR = new Error();
  const onErrorCallback = jest.fn();
  const { container } = testingRender(
    <UseAsyncDataComponent
      getData={() => Promise.reject(ERROR)}
      options={{ onError: onErrorCallback }}
    >
      {asyncData =>
        asyncRender(asyncData, {
          inProgress: () => IN_PROGRESS_TEXT,
          error: () => ERROR_TEXT,
        })
      }
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(onErrorCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(container).toHaveTextContent(ERROR_TEXT);
  expect(onErrorCallback).toHaveBeenCalledTimes(1);
  expect(onErrorCallback).toHaveBeenCalledWith(ERROR);
});

it('does not update async data state if disabled', async () => {
  const REFRESH_BUTTON_TEST_ID = 'gohsuzog';
  const INIT_TEXT = 'INIT_uddokbof';
  const { container, getByTestId } = testingRender(
    <UseAsyncDataComponent
      getData={() => Promise.resolve()}
      options={{ disabled: true }}
    >
      {asyncData => (
        <>
          {asyncRender(asyncData, { init: () => INIT_TEXT })}
          <button
            onClick={asyncData.refresh}
            data-testid={REFRESH_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT);
  await wait();
  expect(container).toHaveTextContent(INIT_TEXT);
  fireEvent.click(getByTestId(REFRESH_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(INIT_TEXT);
});

it('updates async data to `InitAsync` or aborted `InitAsync` state and fires the `abort` event of the `AbortSignal`  after being disabled', async () => {
  const INIT_TEXT = 'INIT_puzmesoj';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_wonillug';
  const SUCCESS_TEXT = 'SUCCESS_wukdaajo';
  const ABORTED_TEXT = 'ABORTED_fisozkuc';
  const onAbortCallback = jest.fn();

  const children = function<Payload>(asyncData: Async<Payload>): ReactNode {
    return asyncRender(asyncData, {
      init: aborted => (aborted ? ABORTED_TEXT : INIT_TEXT),
      inProgress: () => IN_PROGRESS_TEXT,
      success: () => SUCCESS_TEXT,
    });
  };
  const getData = (signal?: AbortSignal): Promise<{}> =>
    getAbortablePromise({ resolveWith: {}, signal, onAbortCallback });

  const enabledComponent = (
    <UseAsyncDataComponent getData={getData}>{children}</UseAsyncDataComponent>
  );
  const disabledComponent = (
    <UseAsyncDataComponent getData={getData} options={{ disabled: true }}>
      {children}
    </UseAsyncDataComponent>
  );
  const { container, rerender } = testingRender(enabledComponent);

  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT);
  expect(onAbortCallback).toHaveBeenCalledTimes(0);
  rerender(disabledComponent);
  expect(container).toHaveTextContent(INIT_TEXT);
  expect(onAbortCallback).toHaveBeenCalledTimes(1);
  rerender(enabledComponent);
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  rerender(disabledComponent);
  expect(container).toHaveTextContent(ABORTED_TEXT);
  expect(onAbortCallback).toHaveBeenCalledTimes(2);
});

it('prevents racing conditions', async () => {
  const REFRESH_BUTTON_TEST_ID = 'esusodba';
  const onSuccessCallback = jest.fn();
  const onAbortCallback = jest.fn();
  let counter = 1;
  const { getByTestId } = testingRender(
    <UseAsyncDataComponent
      getData={signal => {
        const payload = counter;
        counter++;
        return getAbortablePromise({
          resolveWith: payload,
          signal,
          onAbortCallback,
        });
      }}
      options={{ onSuccess: onSuccessCallback }}
    >
      {asyncData => (
        <button
          onClick={asyncData.refresh}
          data-testid={REFRESH_BUTTON_TEST_ID}
        />
      )}
    </UseAsyncDataComponent>,
  );
  expect(onAbortCallback).toHaveBeenCalledTimes(0);
  fireEvent.click(getByTestId(REFRESH_BUTTON_TEST_ID));
  expect(onAbortCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(onSuccessCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledWith(2);
});

it('updates `SuccessAsync` data to invalidated `SuccessAsync` state after being re-triggered as an effect', async () => {
  const INIT_TEXT = 'INIT_vocucluh';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_hiepurer';
  const PAYLOAD_1 = 'PAYLOAD_1_reuwagge';
  const PAYLOAD_2 = 'PAYLOAD_2_zawejobr';
  const INVALIDATED_TEXT = 'INVALIDATED_zaluwobu';
  const children = function<Payload>(asyncData: Async<Payload>): ReactNode {
    return asyncRender(asyncData, {
      init: () => INIT_TEXT,
      inProgress: () => IN_PROGRESS_TEXT,
      success: (payload, invalidated) =>
        invalidated ? INVALIDATED_TEXT : payload,
    });
  };
  const { container, rerender } = testingRender(
    <UseAsyncDataComponent getData={() => Promise.resolve(PAYLOAD_1)}>
      {children}
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  await wait();
  expect(container).toHaveTextContent(PAYLOAD_1);
  rerender(
    <UseAsyncDataComponent getData={() => Promise.resolve(PAYLOAD_2)}>
      {children}
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(INVALIDATED_TEXT);
  await wait();
  expect(container).toHaveTextContent(PAYLOAD_2);
});
