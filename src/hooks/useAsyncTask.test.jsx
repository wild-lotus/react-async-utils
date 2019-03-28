import React from 'react';
import {
  cleanup,
  fireEvent,
  render as testingRender,
  wait,
} from 'react-testing-library';
import { useAsyncTask } from './useAsyncTask';
import { render as asyncRender } from '../render';
import { isSuccess, getPayload, getError, isError } from '../helpers';

afterEach(cleanup);

function UseAsyncTaskComponent({ getTask, options, children }) {
  return children(...useAsyncTask(getTask, options));
}

function getAbortablePromise({
  resolveWith,
  rejectWith,
  signal,
  onAbortCallback,
}) {
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }
  return new Promise((resolve, reject) => {
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
      {(asyncData, triggerAsycTask) => (
        <button
          onClick={() => triggerAsycTask(...ARGS)}
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
      {(asyncData, triggerAsycTask) => (
        <>
          {asyncRender(asyncData, {
            init: () => INIT_TEXT,
            inProgress: () => IN_PROGRESS_TEXT,
            success: () => SUCCESS_TEXT,
          })}
          <button
            onClick={async () => {
              const asyncResult = await triggerAsycTask();
              isSuccess(asyncResult) &&
                imperativeOnSuccessCallback(getPayload(asyncResult));
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
      {(asyncData, triggerAsycTask) => (
        <>
          {asyncRender(asyncData, {
            init: () => INIT_TEXT,
            inProgress: () => IN_PROGRESS_TEXT,
            error: () => ERROR_TEXT,
          })}
          <button
            onClick={async () => {
              const asyncResult = await triggerAsycTask();
              isError(asyncResult) &&
                imperatieOnErrorCallback(getError(asyncResult));
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
        getAbortablePromise({ resolveWith: null, signal, onAbortCallback })}
    >
      {(asyncData, triggerAsyncTask, abortAsyncTask) => (
        <>
          <button
            onClick={triggerAsyncTask}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
          <button onClick={abortAsyncTask} data-testid={RESET_BUTTON_TEST_ID} />
          {asyncRender(asyncData, {
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

it('prevents racing conditions', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'luirdeub';
  const onSuccessCallback = jest.fn();
  const onAbortCallback = jest.fn();
  let counter = 1;
  const { getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getTask={signal => () => {
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
      {(asyncData, triggerAsycTask) => (
        <button
          onClick={triggerAsycTask}
          data-testid={TRIGGER_BUTTON_TEST_ID}
        />
      )}
    </UseAsyncTaskComponent>,
  );
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(onAbortCallback).toHaveBeenCalledTimes(0);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(onAbortCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(onSuccessCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledWith(2);
});

it('updates `SuccessAsync` data to invalidated `SuccessAsync` state after being re-triggered', async () => {
  const TRIGGER_BUTTON_1_TEST_ID = 'vaihikat';
  const TRIGGER_BUTTON_2_TEST_ID = 'fogceuko';
  const INIT_TEXT = 'INIT_tapujabf';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_atoluboz';
  const PAYLOAD_1 = 'PAYLOAD_1_fozkeuje';
  const PAYLOAD_2 = 'PAYLOAD_2_lividtel';
  const INVALIDATED_TEXT = 'INVALIDATED_buapioru';
  const children = (asyncData, triggerAsycTask) => (
    <>
      {asyncRender(asyncData, {
        init: () => INIT_TEXT,
        inProgress: () => IN_PROGRESS_TEXT,
        success: (payload, invalidated) =>
          invalidated ? INVALIDATED_TEXT : payload,
      })}
      <button
        onClick={() => triggerAsycTask(PAYLOAD_1)}
        data-testid={TRIGGER_BUTTON_1_TEST_ID}
      />
      <button
        onClick={() => triggerAsycTask(PAYLOAD_2)}
        data-testid={TRIGGER_BUTTON_2_TEST_ID}
      />
    </>
  );
  const { container, getByTestId } = testingRender(
    <UseAsyncTaskComponent getTask={() => payload => Promise.resolve(payload)}>
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
