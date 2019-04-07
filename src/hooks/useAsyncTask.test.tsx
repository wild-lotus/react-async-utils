import React, { ReactElement, ReactNode } from 'react';
import {
  cleanup,
  fireEvent,
  render as testingRender,
  wait,
} from 'react-testing-library';
import {
  AsyncTask,
  useAsyncTask,
  UseAsyncTaskOptions,
  render as asyncRender,
} from '../index';

afterEach(cleanup);

interface Props<Payload, Args extends unknown[]> {
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Payload>;
  options?: UseAsyncTaskOptions<Payload>;
  children: (asyncTask: AsyncTask<Payload, Args>) => ReactNode;
}

function UseAsyncTaskComponent<Payload, Args extends unknown[]>({
  getTask,
  options,
  children,
}: Props<Payload, Args>): ReactElement {
  return <>{children(useAsyncTask(getTask, options))}</>;
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

it('forwards `triggerAsyncTask` args to task', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'cuifcawk';
  const ARGS = ['vipuzcuz', 'busadekg', 'fihidvol'];
  const task = jest.fn();
  const { getByTestId } = testingRender(
    <UseAsyncTaskComponent getTask={() => task}>
      {asyncTask => (
        <button
          onClick={() => asyncTask.trigger(...ARGS)}
          data-testid={TRIGGER_BUTTON_TEST_ID}
        />
      )}
    </UseAsyncTaskComponent>,
  );
  expect(task).toHaveBeenCalledTimes(0);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(task).toHaveBeenCalledTimes(1);
  expect(task).toHaveBeenCalledWith(...ARGS);
});

it('updates async data up to `SuccessAsync` state, invokes `onSuccess` callback and `triggerAsyncTask` returns the `SuccessAsync`', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'cuifcawk';
  const INIT_TEXT = 'INIT_gobhazev';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_gitiemid';
  const SUCCESS_TEXT = 'SUCCESS_hanecota';
  const PAYLOAD = 'PAYLOAD_cerzegbo';
  const declarativeOnSuccessCallback = jest.fn();
  const imperativeOnSuccessCallback = jest.fn();
  const { container, getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getTask={() => () => Promise.resolve(PAYLOAD)}
      options={{ onSuccess: declarativeOnSuccessCallback }}
    >
      {asyncTask => (
        <>
          {asyncRender(asyncTask, {
            init: () => INIT_TEXT,
            inProgress: () => IN_PROGRESS_TEXT,
            success: () => SUCCESS_TEXT,
          })}
          <button
            onClick={async () => {
              const asyncResult = await asyncTask.trigger();
              asyncResult.isSuccess() &&
                imperativeOnSuccessCallback(asyncResult.payload);
            }}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseAsyncTaskComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledTimes(0);
  expect(imperativeOnSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledTimes(1);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledWith(PAYLOAD);
  expect(imperativeOnSuccessCallback).toHaveBeenCalledTimes(1);
  expect(imperativeOnSuccessCallback).toHaveBeenCalledWith(PAYLOAD);
});

it('updates async data up to `ErrorAsync` state, invokes `onError` callback and `triggerAsyncTask` returns the `ErrorAsync`', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'lelvehho';
  const INIT_TEXT = 'INIT_kofwuraf';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_fedhatus';
  const ERROR_TEXT = 'ERROR_ekfulena';
  const ERROR = new Error();
  const declarativeOnErrorCallback = jest.fn();
  const imperatieOnErrorCallback = jest.fn();
  const { container, getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getTask={() => () => Promise.reject(ERROR)}
      options={{ onError: declarativeOnErrorCallback }}
    >
      {asyncTask => (
        <>
          {asyncRender(asyncTask, {
            init: () => INIT_TEXT,
            inProgress: () => IN_PROGRESS_TEXT,
            error: () => ERROR_TEXT,
          })}
          <button
            onClick={async () => {
              const asyncResult = await asyncTask.trigger();
              asyncResult.isError() &&
                imperatieOnErrorCallback(asyncResult.error);
            }}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseAsyncTaskComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(declarativeOnErrorCallback).toHaveBeenCalledTimes(0);
  expect(imperatieOnErrorCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(container).toHaveTextContent(ERROR_TEXT);
  expect(declarativeOnErrorCallback).toHaveBeenCalledTimes(1);
  expect(declarativeOnErrorCallback).toHaveBeenCalledWith(ERROR);
  expect(imperatieOnErrorCallback).toHaveBeenCalledTimes(1);
  expect(imperatieOnErrorCallback).toHaveBeenCalledWith(ERROR);
});

it('updates async data to `InitAsync` and aborted `InitAsync` state and fires the `abort` event of the `AbortSignal` after being aborted', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'ropugwub';
  const RESET_BUTTON_TEST_ID = 'otuhagno';
  const INIT_TEXT = 'INIT_bummetal';
  const ABORTED_TEXT = 'ABORTED_nimuzsol';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_ewukaela';
  const SUCCESS_TEXT = 'SUCCESS_covsuujv';
  const onAbortCallback = jest.fn();

  const { container, getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getTask={signal => () =>
        getAbortablePromise({ resolveWith: {}, signal, onAbortCallback })}
    >
      {asyncTask => (
        <>
          <button
            onClick={asyncTask.trigger}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
          <button
            onClick={asyncTask.abort}
            data-testid={RESET_BUTTON_TEST_ID}
          />
          {asyncRender(asyncTask, {
            init: aborted => (aborted ? ABORTED_TEXT : INIT_TEXT),
            inProgress: () => IN_PROGRESS_TEXT,
            success: () => SUCCESS_TEXT,
          })}
        </>
      )}
    </UseAsyncTaskComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT);
  expect(onAbortCallback).toHaveBeenCalledTimes(0);
  fireEvent.click(getByTestId(RESET_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(INIT_TEXT);
  expect(onAbortCallback).toHaveBeenCalledTimes(1);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  fireEvent.click(getByTestId(RESET_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(ABORTED_TEXT);
  expect(onAbortCallback).toHaveBeenCalledTimes(2);
});

it('runs the same task multiple times at the same time', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'luirdeub';
  const onSuccessCallback = jest.fn();
  const onAbortCallback = jest.fn();
  let counter = 1;
  const { getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getTask={signal => payload =>
        getAbortablePromise({ resolveWith: payload, signal, onAbortCallback })}
      options={{ onSuccess: onSuccessCallback }}
    >
      {asyncTask => (
        <button
          onClick={() => {
            asyncTask.trigger(counter++);
          }}
          data-testid={TRIGGER_BUTTON_TEST_ID}
        />
      )}
    </UseAsyncTaskComponent>,
  );
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(onSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(onAbortCallback).toHaveBeenCalledTimes(0);
  expect(onSuccessCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledWith(2);
});

it('can re-trigger a task afetr being aborted', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'mulebekm';
  const ABORT_BUTTON_TEST_ID = 'daswociz';
  const onSuccessCallback = jest.fn();
  const onAbortCallback = jest.fn();
  const { getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getTask={signal => () =>
        getAbortablePromise({ resolveWith: 0, signal, onAbortCallback })}
      options={{ onSuccess: onSuccessCallback }}
    >
      {asyncTask => (
        <>
          <button
            onClick={asyncTask.trigger}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
          <button
            onClick={asyncTask.abort}
            data-testid={ABORT_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseAsyncTaskComponent>,
  );
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(onAbortCallback).toHaveBeenCalledTimes(0);
  fireEvent.click(getByTestId(ABORT_BUTTON_TEST_ID));
  expect(onAbortCallback).toHaveBeenCalledTimes(2);
  await wait();
  expect(onSuccessCallback).toHaveBeenCalledTimes(0);
});

it('aborts all instances of the same task when triggered multiple times at the same time', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'ihucafoc';
  const ABORT_BUTTON_TEST_ID = 'kilnopro';
  const onSuccessCallback = jest.fn();
  const onAbortCallback = jest.fn();
  const { getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getTask={signal => () =>
        getAbortablePromise({ resolveWith: 0, signal, onAbortCallback })}
      options={{ onSuccess: onSuccessCallback }}
    >
      {asyncTask => (
        <>
          <button
            onClick={asyncTask.trigger}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
          <button
            onClick={asyncTask.abort}
            data-testid={ABORT_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseAsyncTaskComponent>,
  );
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(onAbortCallback).toHaveBeenCalledTimes(0);
  fireEvent.click(getByTestId(ABORT_BUTTON_TEST_ID));
  expect(onAbortCallback).toHaveBeenCalledTimes(1);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(onSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(onSuccessCallback).toHaveBeenCalledTimes(1);
});

it('updates `SuccessAsync` data to invalidated `SuccessAsync` state after being re-triggered', async () => {
  const TRIGGER_BUTTON_1_TEST_ID = 'vaihikat';
  const TRIGGER_BUTTON_2_TEST_ID = 'fogceuko';
  const INIT_TEXT = 'INIT_tapujabf';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_atoluboz';
  const PAYLOAD_1 = 'PAYLOAD_1_fozkeuje';
  const PAYLOAD_2 = 'PAYLOAD_2_lividtel';
  const INVALIDATED_TEXT = 'INVALIDATED_buapioru';
  const children = function(asyncTask: AsyncTask<string, [string]>): ReactNode {
    return (
      <>
        {asyncRender(asyncTask, {
          init: () => INIT_TEXT,
          inProgress: () => IN_PROGRESS_TEXT,
          success: (payload, invalidated) =>
            invalidated ? INVALIDATED_TEXT : payload,
        })}
        <button
          onClick={() => asyncTask.trigger(PAYLOAD_1)}
          data-testid={TRIGGER_BUTTON_1_TEST_ID}
        />
        <button
          onClick={() => asyncTask.trigger(PAYLOAD_2)}
          data-testid={TRIGGER_BUTTON_2_TEST_ID}
        />
      </>
    );
  };
  const { container, getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getTask={() => (payload: string) => Promise.resolve(payload)}
    >
      {children}
    </UseAsyncTaskComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_1_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  await wait();
  expect(container).toHaveTextContent(PAYLOAD_1);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_2_TEST_ID));
  expect(container).toHaveTextContent(INVALIDATED_TEXT);
  await wait();
  expect(container).toHaveTextContent(PAYLOAD_2);
});
