import React, { ReactElement, ReactNode } from 'react';
import {
  cleanup,
  fireEvent,
  render as testingRender,
  wait,
} from 'react-testing-library';
import {
  AsyncTask,
  useManyAsyncTasks,
  UseAsyncTaskOptions,
  render as asyncRender,
} from '../index';

afterEach(cleanup);

interface Props<Payload, Args extends unknown[]> {
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Payload>;
  options?: UseAsyncTaskOptions<Payload>;
  children: (
    getAsyncTask: (key: string) => AsyncTask<Payload, Args>,
  ) => ReactNode;
}

function UseManyAsyncTasksComponent<Payload, Args extends unknown[]>({
  getTask,
  options,
  children,
}: Props<Payload, Args>): ReactElement {
  return <>{children(useManyAsyncTasks(getTask, options))}</>;
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

it('forwards all `trigger` args to task', async () => {
  const TRIGGER_A_BUTTON_TEST_ID = 'tiseduoh';
  const TRIGGER_B_BUTTON_TEST_ID = 'obupazat';
  const ARGS_A = ['sicopowh', 'sizejviw', 'walujako'];
  const ARGS_B = ['ibacudag', 'kupeafot', 'lugzahof'];
  const task = jest.fn();
  const { getByTestId } = testingRender(
    <UseManyAsyncTasksComponent getTask={() => task}>
      {getAsyncTask => (
        <>
          <button
            onClick={() => getAsyncTask('A').trigger(...ARGS_A)}
            data-testid={TRIGGER_A_BUTTON_TEST_ID}
          />
          <button
            onClick={() => getAsyncTask('B').trigger(...ARGS_B)}
            data-testid={TRIGGER_B_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseManyAsyncTasksComponent>,
  );
  expect(task).toHaveBeenCalledTimes(0);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(task).toHaveBeenCalledTimes(2);
  expect(task).toHaveBeenCalledWith(...ARGS_A);
  expect(task).toHaveBeenCalledWith(...ARGS_B);
});

it('updates parallel async tasks up to `SuccessAsync` state, invokes `onSuccess` callback and `trigger`s returns the `SuccessAsync`', async () => {
  const TRIGGER_A_BUTTON_TEST_ID = 'ohvivdep';
  const TRIGGER_B_BUTTON_TEST_ID = 'zeterceo';
  const INIT_TEXT_A = 'INIT_A_pakmatid';
  const INIT_TEXT_B = 'INIT_B_guglizhu';
  const IN_PROGRESS_TEXT_A = 'IN_PROGRESS_A_udafugen';
  const IN_PROGRESS_TEXT_B = 'IN_PROGRESS_B_vefirzuw';
  const SUCCESS_TEXT_A = 'SUCCESS_A_matadunt';
  const SUCCESS_TEXT_B = 'SUCCESS_B_elnudvad';
  const PAYLOAD_A = 'PAYLOAD_A_osiizira';
  const PAYLOAD_B = 'PAYLOAD_B_otjivwaw';
  const declarativeOnSuccessCallback = jest.fn();
  const imperativeOnSuccessCallbackA = jest.fn();
  const imperativeOnSuccessCallbackB = jest.fn();
  const { container, getByTestId } = testingRender(
    <UseManyAsyncTasksComponent
      getTask={() => payload => Promise.resolve(payload)}
      options={{ onSuccess: declarativeOnSuccessCallback }}
    >
      {getAsyncTask => (
        <>
          {asyncRender(getAsyncTask('A'), {
            init: () => INIT_TEXT_A,
            inProgress: () => IN_PROGRESS_TEXT_A,
            success: () => SUCCESS_TEXT_A,
          })}
          {asyncRender(getAsyncTask('B'), {
            init: () => INIT_TEXT_B,
            inProgress: () => IN_PROGRESS_TEXT_B,
            success: () => SUCCESS_TEXT_B,
          })}
          <button
            onClick={async () => {
              const asyncResult = await getAsyncTask('A').trigger(PAYLOAD_A);
              asyncResult.isSuccess() &&
                imperativeOnSuccessCallbackA(asyncResult.payload);
            }}
            data-testid={TRIGGER_A_BUTTON_TEST_ID}
          />
          <button
            onClick={async () => {
              const asyncResult = await getAsyncTask('B').trigger(PAYLOAD_B);
              asyncResult.isSuccess() &&
                imperativeOnSuccessCallbackB(asyncResult.payload);
            }}
            data-testid={TRIGGER_B_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseManyAsyncTasksComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + IN_PROGRESS_TEXT_B);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledTimes(0);
  expect(imperativeOnSuccessCallbackA).toHaveBeenCalledTimes(0);
  expect(imperativeOnSuccessCallbackB).toHaveBeenCalledTimes(0);

  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT_A + SUCCESS_TEXT_B);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledTimes(2);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledWith(PAYLOAD_A);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledWith(PAYLOAD_B);
  expect(imperativeOnSuccessCallbackA).toHaveBeenCalledTimes(1);
  expect(imperativeOnSuccessCallbackA).toHaveBeenCalledWith(PAYLOAD_A);
  expect(imperativeOnSuccessCallbackB).toHaveBeenCalledTimes(1);
  expect(imperativeOnSuccessCallbackB).toHaveBeenCalledWith(PAYLOAD_B);
});

it('updates sequential async tasks up to `SuccessAsync` state, invokes `onSuccess` callback and `trigger`s returns the `SuccessAsync`', async () => {
  const TRIGGER_A_BUTTON_TEST_ID = 'tohkoefi';
  const TRIGGER_B_BUTTON_TEST_ID = 'sirpuzog';
  const INIT_TEXT_A = 'INIT_A_sopwocir';
  const INIT_TEXT_B = 'INIT_B_mesalmov';
  const IN_PROGRESS_TEXT_A = 'IN_PROGRESS_A_ziicpudm';
  const IN_PROGRESS_TEXT_B = 'IN_PROGRESS_B_sigluzes';
  const SUCCESS_TEXT_A = 'SUCCESS_A_pefjerva';
  const SUCCESS_TEXT_B = 'SUCCESS_B_viamuvip';
  const PAYLOAD_A = 'PAYLOAD_A_timbobcu';
  const PAYLOAD_B = 'PAYLOAD_B_gukufhog';
  const declarativeOnSuccessCallback = jest.fn();
  const imperativeOnSuccessCallbackA = jest.fn();
  const imperativeOnSuccessCallbackB = jest.fn();
  const { container, getByTestId } = testingRender(
    <UseManyAsyncTasksComponent
      getTask={() => payload => Promise.resolve(payload)}
      options={{ onSuccess: declarativeOnSuccessCallback }}
    >
      {getAsyncTask => (
        <>
          {asyncRender(getAsyncTask('A'), {
            init: () => INIT_TEXT_A,
            inProgress: () => IN_PROGRESS_TEXT_A,
            success: () => SUCCESS_TEXT_A,
          })}
          {asyncRender(getAsyncTask('B'), {
            init: () => INIT_TEXT_B,
            inProgress: () => IN_PROGRESS_TEXT_B,
            success: () => SUCCESS_TEXT_B,
          })}
          <button
            onClick={async () => {
              const asyncResult = await getAsyncTask('A').trigger(PAYLOAD_A);
              asyncResult.isSuccess() &&
                imperativeOnSuccessCallbackA(asyncResult.payload);
            }}
            data-testid={TRIGGER_A_BUTTON_TEST_ID}
          />
          <button
            onClick={async () => {
              const asyncResult = await getAsyncTask('B').trigger(PAYLOAD_B);
              asyncResult.isSuccess() &&
                imperativeOnSuccessCallbackB(asyncResult.payload);
            }}
            data-testid={TRIGGER_B_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseManyAsyncTasksComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + INIT_TEXT_B);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledTimes(0);
  expect(imperativeOnSuccessCallbackA).toHaveBeenCalledTimes(0);

  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT_A + INIT_TEXT_B);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledTimes(1);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledWith(PAYLOAD_A);
  expect(imperativeOnSuccessCallbackA).toHaveBeenCalledTimes(1);
  expect(imperativeOnSuccessCallbackA).toHaveBeenCalledWith(PAYLOAD_A);
  expect(imperativeOnSuccessCallbackB).toHaveBeenCalledTimes(0);

  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(SUCCESS_TEXT_A + IN_PROGRESS_TEXT_B);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledTimes(1);
  expect(imperativeOnSuccessCallbackB).toHaveBeenCalledTimes(0);

  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT_A + SUCCESS_TEXT_B);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledTimes(2);
  expect(declarativeOnSuccessCallback).toHaveBeenCalledWith(PAYLOAD_B);
  expect(imperativeOnSuccessCallbackA).toHaveBeenCalledTimes(1);
  expect(imperativeOnSuccessCallbackB).toHaveBeenCalledTimes(1);
  expect(imperativeOnSuccessCallbackB).toHaveBeenCalledWith(PAYLOAD_B);
});

it('updates parallel async tasks up to `ErrorAsync` state, invokes `onError` callback and `trigger`s returns the `ErrorAsync`', async () => {
  const TRIGGER_A_BUTTON_TEST_ID = 'indadaag';
  const TRIGGER_B_BUTTON_TEST_ID = 'gojtiavp';
  const INIT_TEXT_A = 'INIT_A_lanevkak';
  const INIT_TEXT_B = 'INIT_B_uvoazopi';
  const IN_PROGRESS_TEXT_A = 'IN_PROGRESS_A_titilesk';
  const IN_PROGRESS_TEXT_B = 'IN_PROGRESS_B_locduogi';
  const ERROR_TEXT_A = 'ERROR_A_ahorowat';
  const ERROR_TEXT_B = 'ERROR_B_kesakavo';
  const ERROR_A = new Error('PERROR_A_fariwofo');
  const ERROR_B = new Error('ERROR_B_ajaojosf');
  const declarativeOnErrorCallback = jest.fn();
  const imperativeOnErrorCallbackA = jest.fn();
  const imperativeOnErrorCallbackB = jest.fn();
  const { container, getByTestId } = testingRender(
    <UseManyAsyncTasksComponent
      getTask={() => error => Promise.reject(error)}
      options={{ onError: declarativeOnErrorCallback }}
    >
      {getAsyncTask => (
        <>
          {asyncRender(getAsyncTask('A'), {
            init: () => INIT_TEXT_A,
            inProgress: () => IN_PROGRESS_TEXT_A,
            error: () => ERROR_TEXT_A,
          })}
          {asyncRender(getAsyncTask('B'), {
            init: () => INIT_TEXT_B,
            inProgress: () => IN_PROGRESS_TEXT_B,
            error: () => ERROR_TEXT_B,
          })}
          <button
            onClick={async () => {
              const asyncResult = await getAsyncTask('A').trigger(ERROR_A);
              asyncResult.isError() &&
                imperativeOnErrorCallbackA(asyncResult.error);
            }}
            data-testid={TRIGGER_A_BUTTON_TEST_ID}
          />
          <button
            onClick={async () => {
              const asyncResult = await getAsyncTask('B').trigger(ERROR_B);
              asyncResult.isError() &&
                imperativeOnErrorCallbackB(asyncResult.error);
            }}
            data-testid={TRIGGER_B_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseManyAsyncTasksComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + IN_PROGRESS_TEXT_B);
  expect(declarativeOnErrorCallback).toHaveBeenCalledTimes(0);
  expect(imperativeOnErrorCallbackA).toHaveBeenCalledTimes(0);
  expect(imperativeOnErrorCallbackB).toHaveBeenCalledTimes(0);

  await wait();
  expect(container).toHaveTextContent(ERROR_TEXT_A + ERROR_TEXT_B);
  expect(declarativeOnErrorCallback).toHaveBeenCalledTimes(2);
  expect(declarativeOnErrorCallback).toHaveBeenCalledWith(ERROR_A);
  expect(declarativeOnErrorCallback).toHaveBeenCalledWith(ERROR_B);
  expect(imperativeOnErrorCallbackA).toHaveBeenCalledTimes(1);
  expect(imperativeOnErrorCallbackA).toHaveBeenCalledWith(ERROR_A);
  expect(imperativeOnErrorCallbackB).toHaveBeenCalledTimes(1);
  expect(imperativeOnErrorCallbackB).toHaveBeenCalledWith(ERROR_B);
});

it('updates parallel async task to `InitAsync` and aborted `InitAsync` state and fires the `abort` event of the `AbortSignal` after being aborted', async () => {
  const TRIGGER_A_BUTTON_TEST_ID = 'felpagus';
  const TRIGGER_B_BUTTON_TEST_ID = 'tobusfuo';
  const ABORT_A_BUTTON_TEST_ID = 'fumkaedd';
  const ABORT_B_BUTTON_TEST_ID = 'baawwevl';
  const INIT_TEXT_A = 'INIT_A_cukowtug';
  const INIT_TEXT_B = 'INIT_B_cirzadpi';
  const ABORTED_TEXT_A = 'ABORTED_A_foggifop';
  const ABORTED_TEXT_B = 'ABORTED_B_junawapo';
  const IN_PROGRESS_TEXT_A = 'IN_PROGRESS_A_jujpibeb';
  const IN_PROGRESS_TEXT_B = 'IN_PROGRESS_B_huacuzea';
  const SUCCESS_TEXT_A = 'SUCCESS_A_bojojcoc';
  const SUCCESS_TEXT_B = 'SUCCESS_B_ugruvewk';
  const onAbortCallback = jest.fn();

  const { container, getByTestId } = testingRender(
    <UseManyAsyncTasksComponent
      getTask={signal => () =>
        getAbortablePromise({ resolveWith: {}, signal, onAbortCallback })}
    >
      {getAsyncTask => (
        <>
          {asyncRender(getAsyncTask('A'), {
            init: aborted => (aborted ? ABORTED_TEXT_A : INIT_TEXT_A),
            inProgress: () => IN_PROGRESS_TEXT_A,
            success: () => SUCCESS_TEXT_A,
          })}
          {asyncRender(getAsyncTask('B'), {
            init: aborted => (aborted ? ABORTED_TEXT_B : INIT_TEXT_B),
            inProgress: () => IN_PROGRESS_TEXT_B,
            success: () => SUCCESS_TEXT_B,
          })}
          <button
            onClick={getAsyncTask('A').trigger}
            data-testid={TRIGGER_A_BUTTON_TEST_ID}
          />
          <button
            onClick={getAsyncTask('A').abort}
            data-testid={ABORT_A_BUTTON_TEST_ID}
          />
          <button
            onClick={getAsyncTask('B').trigger}
            data-testid={TRIGGER_B_BUTTON_TEST_ID}
          />
          <button
            onClick={getAsyncTask('B').abort}
            data-testid={ABORT_B_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseManyAsyncTasksComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + IN_PROGRESS_TEXT_B);

  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT_A + SUCCESS_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(0);

  fireEvent.click(getByTestId(ABORT_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(ABORT_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(2);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + IN_PROGRESS_TEXT_B);

  fireEvent.click(getByTestId(ABORT_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(ABORT_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(ABORTED_TEXT_A + ABORTED_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(4);
});

it('updates sequential async task to `InitAsync` and aborted `InitAsync` state and fires the `abort` event of the `AbortSignal` after being aborted', async () => {
  const TRIGGER_A_BUTTON_TEST_ID = 'eruphici';
  const TRIGGER_B_BUTTON_TEST_ID = 'nibircak';
  const ABORT_A_BUTTON_TEST_ID = 'iroacceb';
  const ABORT_B_BUTTON_TEST_ID = 'ehimalhu';
  const INIT_TEXT_A = 'INIT_A_izkuwgek';
  const INIT_TEXT_B = 'INIT_B_amiohogt';
  const ABORTED_TEXT_A = 'ABORTED_A_reoknerh';
  const ABORTED_TEXT_B = 'ABORTED_B_pohtaura';
  const IN_PROGRESS_TEXT_A = 'IN_PROGRESS_A_merjictu';
  const IN_PROGRESS_TEXT_B = 'IN_PROGRESS_B_uvanutev';
  const SUCCESS_TEXT_A = 'SUCCESS_A_vuvnaijo';
  const SUCCESS_TEXT_B = 'SUCCESS_B_lepolhen';
  const onAbortCallback = jest.fn();
  const { container, getByTestId } = testingRender(
    <UseManyAsyncTasksComponent
      getTask={signal => () =>
        getAbortablePromise({ resolveWith: {}, signal, onAbortCallback })}
    >
      {getAsyncTask => (
        <>
          {asyncRender(getAsyncTask('A'), {
            init: aborted => (aborted ? ABORTED_TEXT_A : INIT_TEXT_A),
            inProgress: () => IN_PROGRESS_TEXT_A,
            success: () => SUCCESS_TEXT_A,
          })}
          {asyncRender(getAsyncTask('B'), {
            init: aborted => (aborted ? ABORTED_TEXT_B : INIT_TEXT_B),
            inProgress: () => IN_PROGRESS_TEXT_B,
            success: () => SUCCESS_TEXT_B,
          })}
          <button
            onClick={getAsyncTask('A').trigger}
            data-testid={TRIGGER_A_BUTTON_TEST_ID}
          />
          <button
            onClick={getAsyncTask('A').abort}
            data-testid={ABORT_A_BUTTON_TEST_ID}
          />
          <button
            onClick={getAsyncTask('B').trigger}
            data-testid={TRIGGER_B_BUTTON_TEST_ID}
          />
          <button
            onClick={getAsyncTask('B').abort}
            data-testid={ABORT_B_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseManyAsyncTasksComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + INIT_TEXT_B);

  await wait();
  expect(container).toHaveTextContent(SUCCESS_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(SUCCESS_TEXT_A + IN_PROGRESS_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(0);

  fireEvent.click(getByTestId(ABORT_A_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(INIT_TEXT_A + IN_PROGRESS_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(1);

  await wait();
  expect(container).toHaveTextContent(INIT_TEXT_A + SUCCESS_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(1);

  fireEvent.click(getByTestId(ABORT_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(2);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(ABORT_A_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(ABORTED_TEXT_A + INIT_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(3);

  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(ABORTED_TEXT_A + IN_PROGRESS_TEXT_B);

  fireEvent.click(getByTestId(ABORT_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(ABORTED_TEXT_A + ABORTED_TEXT_B);
  expect(onAbortCallback).toHaveBeenCalledTimes(4);
});

it('updates parallel `SuccessAsync` task to invalidated `SuccessAsync` state after being re-triggered', async () => {
  const TRIGGER_A_BUTTON_TEST_ID = 'dijuwed';
  const TRIGGER_B_BUTTON_TEST_ID = 'uwozajua';
  const INIT_TEXT_A = 'INIT_A_bekushaw';
  const INIT_TEXT_B = 'INIT_B_zahsiwem';
  const IN_PROGRESS_TEXT_A = 'IN_PROGRESS_A_obovukdu';
  const IN_PROGRESS_TEXT_B = 'IN_PROGRESS_B_kumawikm';
  const INVALIDATED_TEXT_A = 'INVALIDATED_A_soazeisk';
  const INVALIDATED_TEXT_B = 'INVALIDATED_B_utmusole';
  let counterA = 0;
  let counterB = 0;
  const { container, getByTestId } = testingRender(
    <UseManyAsyncTasksComponent
      getTask={() => (payload: number) => Promise.resolve(payload)}
    >
      {getAsyncTask => (
        <>
          {asyncRender(getAsyncTask('A'), {
            init: () => INIT_TEXT_A,
            inProgress: () => IN_PROGRESS_TEXT_A,
            success: (payload, invalidated) =>
              invalidated ? INVALIDATED_TEXT_A : payload,
          })}
          {asyncRender(getAsyncTask('B'), {
            init: () => INIT_TEXT_B,
            inProgress: () => IN_PROGRESS_TEXT_B,
            success: (payload, invalidated) =>
              invalidated ? INVALIDATED_TEXT_B : payload,
          })}
          <button
            onClick={() => getAsyncTask('A').trigger(counterA++)}
            data-testid={TRIGGER_A_BUTTON_TEST_ID}
          />
          <button
            onClick={() => getAsyncTask('B').trigger(counterB++)}
            data-testid={TRIGGER_B_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseManyAsyncTasksComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + IN_PROGRESS_TEXT_B);

  await wait();
  expect(container).toHaveTextContent('00');

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(INVALIDATED_TEXT_A + INVALIDATED_TEXT_B);

  await wait();
  expect(container).toHaveTextContent('11');
});

it('updates sequential `SuccessAsync` task to invalidated `SuccessAsync` state after being re-triggered', async () => {
  const TRIGGER_A_BUTTON_TEST_ID = 'tulutmah';
  const TRIGGER_B_BUTTON_TEST_ID = 'wonupmuk';
  const INIT_TEXT_A = 'INIT_A_numsefud';
  const INIT_TEXT_B = 'INIT_B_duecevar';
  const IN_PROGRESS_TEXT_A = 'IN_PROGRESS_A_uhninvef';
  const IN_PROGRESS_TEXT_B = 'IN_PROGRESS_B_bohjofod';
  const INVALIDATED_TEXT_A = 'INVALIDATED_A_gucciriw';
  const INVALIDATED_TEXT_B = 'INVALIDATED_B_agkucosc';
  let counterA = 0;
  let counterB = 0;
  const { container, getByTestId } = testingRender(
    <UseManyAsyncTasksComponent
      getTask={() => (payload: number) => Promise.resolve(payload)}
    >
      {getAsyncTask => (
        <>
          {asyncRender(getAsyncTask('A'), {
            init: () => INIT_TEXT_A,
            inProgress: () => IN_PROGRESS_TEXT_A,
            success: (payload, invalidated) =>
              invalidated ? INVALIDATED_TEXT_A : payload,
          })}
          {asyncRender(getAsyncTask('B'), {
            init: () => INIT_TEXT_B,
            inProgress: () => IN_PROGRESS_TEXT_B,
            success: (payload, invalidated) =>
              invalidated ? INVALIDATED_TEXT_B : payload,
          })}
          <button
            onClick={() => getAsyncTask('A').trigger(counterA++)}
            data-testid={TRIGGER_A_BUTTON_TEST_ID}
          />
          <button
            onClick={() => getAsyncTask('B').trigger(counterB++)}
            data-testid={TRIGGER_B_BUTTON_TEST_ID}
          />
        </>
      )}
    </UseManyAsyncTasksComponent>,
  );
  expect(container).toHaveTextContent(INIT_TEXT_A + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT_A + INIT_TEXT_B);

  await wait();
  expect(container).toHaveTextContent('0' + INIT_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent('0' + IN_PROGRESS_TEXT_B);

  fireEvent.click(getByTestId(TRIGGER_A_BUTTON_TEST_ID));
  expect(container).toHaveTextContent(INVALIDATED_TEXT_A + IN_PROGRESS_TEXT_B);

  await wait();
  expect(container).toHaveTextContent('10');

  fireEvent.click(getByTestId(TRIGGER_B_BUTTON_TEST_ID));
  expect(container).toHaveTextContent('1' + INVALIDATED_TEXT_B);

  await wait();
  expect(container).toHaveTextContent('11');
});
