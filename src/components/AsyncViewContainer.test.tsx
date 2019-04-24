import React from 'react';
import { render, cleanup } from 'react-testing-library';
import {
  InitAsync,
  InProgressAsync,
  ErrorAsync,
  AsyncViewContainer,
} from '../index';

afterEach(cleanup);

it('renders only children given an `InitAsync`', () => {
  const CHILDREN_TEXT = 'dargorav';
  const IN_PROGRESS_TEXT = 'ufedussu';
  const ERROR_TEXT = 'povahaer';
  const { container } = render(
    <AsyncViewContainer
      asyncData={new InitAsync()}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      errorRender={() => <p>{ERROR_TEXT}</p>}
    >
      <p>{CHILDREN_TEXT}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(CHILDREN_TEXT);
  expect(container).not.toHaveTextContent(IN_PROGRESS_TEXT);
  expect(container).not.toHaveTextContent(IN_PROGRESS_TEXT);
});

it('renders only children and `inProgressRender` after it given an `InProgressAsync`', () => {
  const CHILDREN_TEXT = 'nopedudo';
  const IN_PROGRESS_TEXT = 'jugaprom';
  const ERROR_TEXT = 'zebozcur';
  const { container } = render(
    <AsyncViewContainer
      asyncData={new InProgressAsync()}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      errorRender={() => <p>{ERROR_TEXT}</p>}
    >
      <p>{CHILDREN_TEXT}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${CHILDREN_TEXT}.*${IN_PROGRESS_TEXT}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${IN_PROGRESS_TEXT}.*${CHILDREN_TEXT}`),
  );
  expect(container).not.toHaveTextContent(ERROR_TEXT);
});

it('renders only children and `inProgressRender` before it given an `InProgressAsync` and `setInProgressRenderBeforeChildren`', () => {
  const CHILDREN_TEXT = 'agjotawt';
  const IN_PROGRESS_TEXT = 'dokfesje';
  const ERROR_TEXT = 'obhiweng';
  const { container } = render(
    <AsyncViewContainer
      asyncData={new InProgressAsync()}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      setInProgressRenderBeforeChildren
      errorRender={() => <p>{ERROR_TEXT}</p>}
    >
      <p>{CHILDREN_TEXT}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${IN_PROGRESS_TEXT}.*${CHILDREN_TEXT}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${CHILDREN_TEXT}.*${IN_PROGRESS_TEXT}`),
  );
  expect(container).not.toHaveTextContent(ERROR_TEXT);
});

it('renders only children and `errorRender` after it given an `ErrorAsync`', () => {
  const CHILDREN_TEXT = 'dehujije';
  const IN_PROGRESS_TEXT = 'vasaefmi';
  const ERROR_TEXT = 'vibelgas';
  const { container } = render(
    <AsyncViewContainer
      asyncData={new ErrorAsync(new Error())}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      errorRender={() => <p>{ERROR_TEXT}</p>}
    >
      <p>{CHILDREN_TEXT}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${CHILDREN_TEXT}.*${ERROR_TEXT}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${ERROR_TEXT}.*${CHILDREN_TEXT}`),
  );
  expect(container).not.toHaveTextContent(IN_PROGRESS_TEXT);
});

it('renders only children and `errorRender` before it given an `ErrorAsync` and `setErrorRenderBeforeChildren`', () => {
  const CHILDREN_TEXT = 'ifipkodm';
  const IN_PROGRESS_TEXT = 'galweham';
  const ERROR_TEXT = 'gukokubi';
  const { container } = render(
    <AsyncViewContainer
      asyncData={new ErrorAsync(new Error())}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      errorRender={() => <p>{ERROR_TEXT}</p>}
      setErrorRenderBeforeChildren
    >
      <p>{CHILDREN_TEXT}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${ERROR_TEXT}.*${CHILDREN_TEXT}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${CHILDREN_TEXT}.*${ERROR_TEXT}`),
  );
  expect(container).not.toHaveTextContent(IN_PROGRESS_TEXT);
});

it('renders only children and `inProgressRender` after it given an array with any `InProgressAsync` and no `ErrorAsync`', () => {
  const CHILDREN_TEXT = 'kegvevlu';
  const IN_PROGRESS_TEXT = 'kafafdeh';
  const ERROR_TEXT = 'favseufp';
  const { container } = render(
    <AsyncViewContainer
      asyncData={[new InitAsync(), new InProgressAsync()]}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      errorRender={() => <p>{ERROR_TEXT}</p>}
    >
      <p>{CHILDREN_TEXT}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${CHILDREN_TEXT}.*${IN_PROGRESS_TEXT}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${IN_PROGRESS_TEXT}.*${CHILDREN_TEXT}`),
  );
  expect(container).not.toHaveTextContent(ERROR_TEXT);
});

it('renders only children and `errorRender` after it given an array with any `ErrorAsync` and no `InProgressAsync`', () => {
  const CHILDREN_TEXT = 'avejarit';
  const IN_PROGRESS_TEXT = 'tivekzio';
  const ERROR_TEXT = 'juzpecto';
  const { container } = render(
    <AsyncViewContainer
      asyncData={[new InitAsync(), new ErrorAsync(new Error())]}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      errorRender={() => <p>{ERROR_TEXT}</p>}
    >
      <p>{CHILDREN_TEXT}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${CHILDREN_TEXT}.*${ERROR_TEXT}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${ERROR_TEXT}.*${CHILDREN_TEXT}`),
  );
  expect(container).not.toHaveTextContent(IN_PROGRESS_TEXT);
});

it('renders both `inProgressRender` and `errorRender`given an array with a `InProgressAsync` and a `ErrorAsync`', () => {
  const IN_PROGRESS_TEXT = 'tivekzio';
  const ERROR_TEXT = 'juzpecto';
  const { container } = render(
    <AsyncViewContainer
      asyncData={[new InProgressAsync(), new ErrorAsync(new Error())]}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      errorRender={() => <p>{ERROR_TEXT}</p>}
    >
      <p>zubihora</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
  expect(container).toHaveTextContent(ERROR_TEXT);
});

it('renders one `errorRender` per `ErrorAsync` in the given an array', () => {
  const ERROR_1_TEXT = 'cenafret';
  const ERROR_2_TEXT = 'calkoagu';
  const ERROR_3_TEXT = 'nihuugep';
  const { container } = render(
    <AsyncViewContainer
      asyncData={[
        new ErrorAsync(new Error(ERROR_1_TEXT)),
        new ErrorAsync(new Error(ERROR_2_TEXT)),
        new ErrorAsync(new Error(ERROR_3_TEXT)),
      ]}
      inProgressRender={null}
      errorRender={(errors: Error[]) =>
        errors.map((error, i) => <p key={i}>{error.message}</p>)
      }
    >
      <p>gubupgen</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${ERROR_1_TEXT}.*${ERROR_2_TEXT}.*${ERROR_3_TEXT}`),
  );
});

it('renders `inProgressRender` given no `InProgressAsync` but `forceInProgress`', () => {
  const IN_PROGRESS_TEXT = 'rofmomeb';
  const { container } = render(
    <AsyncViewContainer
      asyncData={new InitAsync()}
      inProgressRender={() => <p>{IN_PROGRESS_TEXT}</p>}
      forceInProgress
      errorRender={null}
    >
      <p>ozepejhu</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS_TEXT);
});

it('renders `errorRender` given no `ErrorAsync` but `forceError`', () => {
  const ERROR_TEXT = 'nafbuvim';
  const { container } = render(
    <AsyncViewContainer
      asyncData={new InitAsync()}
      inProgressRender={null}
      errorRender={() => <p>{ERROR_TEXT}</p>}
      forceError={new Error()}
    >
      <p>lihasaze</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(ERROR_TEXT);
});
