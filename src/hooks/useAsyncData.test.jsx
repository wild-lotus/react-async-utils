import React from 'react';
import {
  cleanup,
  fireEvent,
  render as testingRender,
  wait,
} from 'react-testing-library';
import { useAsyncData } from './useAsyncData';
import { render as asyncRender } from '../render';

afterEach(cleanup);

function UseAsyncDataComponent({ getData, options, children }) {
  return children(...useAsyncData(getData, options));
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

it('updates async data up to `SuccessAsync` state after being triggered and invokes `onSuccess` callback', async () => {
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_bonihzes';
  const SUCCESS_TEXT = 'SUCCESS_ukejemuo';
  const PAYLOAD = 'PAYLOAD_ezhihnoi';
  const onSuccessCallback = jest.fn();
  const getData = () => Promise.resolve(PAYLOAD);
  const { container } = testingRender(
    <UseAsyncDataComponent
      getData={getData}
      options={{ onSuccess: onSuccessCallback }}
    >
      {asyncData => (
        <>
          {asyncRender(asyncData, {
            inProgress: () => IN_PROGRESS_TEXT,
            success: () => SUCCESS_TEXT,
          })}
        </>
      )}
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(onSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT);
  expect(onSuccessCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledWith(PAYLOAD);
});

it('updates async data up to `ErrorAsync` state after being triggered and invokes `onError` callback', async () => {
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_tokunalf';
  const ERROR_TEXT = 'ERROR_vaowdenz';
  const ERROR = new Error();
  const onErrorCallback = jest.fn();
  const getData = () => Promise.reject(ERROR);
  const { container } = testingRender(
    <UseAsyncDataComponent
      getData={getData}
      options={{ onError: onErrorCallback }}
    >
      {asyncData => (
        <>
          {asyncRender(asyncData, {
            inProgress: () => IN_PROGRESS_TEXT,
            error: () => ERROR_TEXT,
          })}
        </>
      )}
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(onErrorCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(container).toHaveTextContent(ERROR_TEXT);
  expect(onErrorCallback).toHaveBeenCalledTimes(1);
  expect(onErrorCallback).toHaveBeenCalledWith(ERROR);
});

// it('updates async data state as an effect', async () => {
//   const IN_PROGRESS_TEXT = 'IN_PROGRESS_uddokbof';
//   const SUCCESS_TEXT = 'SUCCESS_efemibes';
//   const { container } = testingRender(
//     <UseAsyncDataComponent
//       getData={() => Promise.resolve()}
//       options={{ triggerAsEffect: true }}
//     >
//       {asyncData => (
//         <>
//           {asyncRender(asyncData, {
//             inProgress: () => IN_PROGRESS_TEXT,
//             success: () => SUCCESS_TEXT,
//           })}
//         </>
//       )}
//     </UseAsyncDataComponent>,
//   );
//   expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
//   await wait();
//   expect(container).toHaveTextContent(SUCCESS_TEXT);
// });

it('updates async data to `InitAsync` or aborted `InitAsync` state and fires the provided `AbortSignal` after being reset', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'wivalcij';
  const RESET_BUTTON_TEST_ID = 'kusjiuck';
  const INIT_TEXT = 'INIT_ohihuwda';
  const ABORTED_TEXT = 'ABORTED_fisozkuc';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_bizkopoz';
  const SUCCESS_TEXT = 'SUCCESS_wukdaajo';
  const onAbortCallback = jest.fn();
  const getData = signal =>
    getAbortablePromise({ resolveWith: null, signal, onAbortCallback });

  const { container, getByTestId } = testingRender(
    <UseAsyncDataComponent getData={getData}>
      {(asyncData, triggerGetData, resetAsyncData) => (
        <>
          <button
            onClick={triggerGetData}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
          <button onClick={resetAsyncData} data-testid={RESET_BUTTON_TEST_ID} />
          {asyncRender(asyncData, {
            init: aborted => (aborted ? ABORTED_TEXT : INIT_TEXT),
            inProgress: () => IN_PROGRESS_TEXT,
            success: () => SUCCESS_TEXT,
          })}
        </>
      )}
    </UseAsyncDataComponent>,
  );
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
  const TRIGGER_BUTTON_TEST_ID = 'esusodba';
  const onSuccessCallback = jest.fn();
  const onAbortCallback = jest.fn();
  let counter = 1;
  const getData = signal => {
    const payload = counter;
    counter++;
    return getAbortablePromise({
      resolveWith: payload,
      signal,
      onAbortCallback,
    });
  };
  const { getByTestId } = testingRender(
    <UseAsyncDataComponent
      getData={getData}
      options={{ onSuccess: onSuccessCallback }}
    >
      {(asyncData, triggerAsycTask) => (
        <>
          <button
            onClick={triggerAsycTask}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseAsyncDataComponent>,
  );
  expect(onAbortCallback).toHaveBeenCalledTimes(0);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(onAbortCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(onSuccessCallback).toHaveBeenCalledTimes(1);
  expect(onSuccessCallback).toHaveBeenCalledWith(2);
});

it('updates `SuccessAsync` data to invalidated `SuccessAsync` state after being triggered as an effect', async () => {
  const INIT_TEXT = 'INIT_vocucluh';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_hiepurer';
  const PAYLOAD1_TEXT = 'PAYLOAD1_reuwagge';
  const PAYLOAD2_TEXT = 'PAYLOAD2_zawejobr';
  const INVALIDATED_TEXT = 'INVALIDATED_zaluwobu';
  const getData1 = () => Promise.resolve(PAYLOAD1_TEXT);
  const getData2 = () => Promise.resolve(PAYLOAD2_TEXT);
  const children = asyncData => (
    <>
      {asyncRender(asyncData, {
        init: () => INIT_TEXT,
        inProgress: () => IN_PROGRESS_TEXT,
        success: (payload, invalidated) =>
          invalidated ? INVALIDATED_TEXT : payload,
      })}
    </>
  );
  const { container, rerender } = testingRender(
    <UseAsyncDataComponent getData={getData1}>
      {children}
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  await wait();
  expect(container).toHaveTextContent(PAYLOAD1_TEXT);
  rerender(
    <UseAsyncDataComponent getData={getData2}>
      {children}
    </UseAsyncDataComponent>,
  );
  expect(container).toHaveTextContent(INVALIDATED_TEXT);
  await wait();
  expect(container).toHaveTextContent(PAYLOAD2_TEXT);
});
