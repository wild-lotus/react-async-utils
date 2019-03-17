import React from 'react';
import {
  cleanup,
  fireEvent,
  render as testingRender,
  wait,
} from 'react-testing-library';
import { useAsyncTask } from './useAsyncTask';
import { render as asyncRender } from '../render';

afterEach(cleanup);

function UseAsyncTaskComponent({ getData, options, children }) {
  const result = useAsyncTask(getData, options);
  return children(...result);
}

it('updates async data to `SuccessAsync` state after being triggered and invokes `onSuccess` callback', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'sezcahie';
  const INIT_TEXT = 'INIT_abocawut';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_bonihzes';
  const SUCCESS_TEXT = 'SUCCESS_ukejemuo';
  const PAYLOAD = 'PAYLOAD_ezhihnoi';
  const handleSuccessCallback = jest.fn();
  const { container, getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getData={() => Promise.resolve(PAYLOAD)}
      options={{ onSuccess: handleSuccessCallback }}
    >
      {(asyncData, triggerAsycTask) => (
        <>
          <button
            onClick={triggerAsycTask}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
          {asyncRender(asyncData, {
            init: () => INIT_TEXT,
            inProgress: () => IN_PROGRESS_TEXT,
            success: () => SUCCESS_TEXT,
          })}
        </>
      )}
    </UseAsyncTaskComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT);
  await wait();
  expect(container).toHaveTextContent(INIT_TEXT);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(handleSuccessCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT);
  expect(handleSuccessCallback).toHaveBeenCalledTimes(1);
  expect(handleSuccessCallback).toHaveBeenCalledWith(PAYLOAD);
});

it('updates async data to `ErrorAsync` state after being triggered and invokes `onError` callback', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'fihmekja';
  const INIT_TEXT = 'INIT_vagavtet';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_tokunalf';
  const ERROR_TEXT = 'ERROR_vaowdenz';
  const ERROR = new Error();
  const handleErrorCallback = jest.fn();
  const { container, getByTestId } = testingRender(
    <UseAsyncTaskComponent
      getData={() => Promise.reject(ERROR)}
      options={{ onError: handleErrorCallback }}
    >
      {(asyncData, triggerAsycTask) => (
        <>
          <button
            onClick={triggerAsycTask}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
          {asyncRender(asyncData, {
            init: () => INIT_TEXT,
            inProgress: () => IN_PROGRESS_TEXT,
            error: () => ERROR_TEXT,
          })}
        </>
      )}
    </UseAsyncTaskComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT);
  await wait();
  expect(container).toHaveTextContent(INIT_TEXT);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(handleErrorCallback).toHaveBeenCalledTimes(0);
  await wait();
  expect(container).toHaveTextContent(ERROR_TEXT);
  expect(handleErrorCallback).toHaveBeenCalledTimes(1);
  expect(handleErrorCallback).toHaveBeenCalledWith(ERROR);
});

it('updates async data state as an effect', async () => {
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_uddokbof';
  const SUCCESS_TEXT = 'SUCCESS_efemibes';
  const { container } = testingRender(
    <UseAsyncTaskComponent
      getData={() => Promise.resolve()}
      options={{ triggerAsEffect: true }}
    >
      {asyncData => (
        <>
          {asyncRender(asyncData, {
            inProgress: () => IN_PROGRESS_TEXT,
            success: () => SUCCESS_TEXT,
          })}
        </>
      )}
    </UseAsyncTaskComponent>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT);
});

it('updates async data to `InitAsync` or aborted `InitAsync` state after being reset', async () => {
  const TRIGGER_BUTTON_TEST_ID = 'wivalcij';
  const RESET_BUTTON_TEST_ID = 'kusjiuck';
  const INIT_TEXT = 'INIT_ohihuwda';
  const ABORTED_TEXT = 'ABORTED_fisozkuc';
  const IN_PROGRESS_TEXT = 'IN_PROGRESS_bizkopoz';
  const SUCCESS_TEXT = 'SUCCESS_wukdaajo';
  const { container, getByTestId } = testingRender(
    <UseAsyncTaskComponent getData={() => Promise.resolve()}>
      {(asyncData, triggerAsycTask, resetAsyncTask) => (
        <>
          <button
            onClick={triggerAsycTask}
            data-testid={TRIGGER_BUTTON_TEST_ID}
          />
          <button onClick={resetAsyncTask} data-testid={RESET_BUTTON_TEST_ID} />
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
  fireEvent.click(getByTestId(RESET_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(INIT_TEXT);
  fireEvent.click(getByTestId(TRIGGER_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  fireEvent.click(getByTestId(RESET_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(ABORTED_TEXT);
});
