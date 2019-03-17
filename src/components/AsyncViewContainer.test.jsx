import React from 'react';
import { render, cleanup } from 'react-testing-library';
import { AsyncViewContainer } from './AsyncViewContainer';
import { newInit, newInProgress, newError } from '../helpers';

afterEach(cleanup);

it('renders only children given an `InitAsync`', () => {
  const CHILDREN = 'dargorav';
  const IN_PROGRESS = 'ufedussu';
  const ERROR = 'povahaer';
  const { container } = render(
    <AsyncViewContainer
      asyncData={newInit()}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      errorRender={() => <p>{ERROR}</p>}
    >
      <p>{CHILDREN}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(CHILDREN);
  expect(container).not.toHaveTextContent(IN_PROGRESS);
  expect(container).not.toHaveTextContent(IN_PROGRESS);
});

it('renders only children and `inProgressRender` after it given an `InProgressAsync`', () => {
  const CHILDREN = 'nopedudo';
  const IN_PROGRESS = 'jugaprom';
  const ERROR = 'zebozcur';
  const { container } = render(
    <AsyncViewContainer
      asyncData={newInProgress()}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      errorRender={() => <p>{ERROR}</p>}
    >
      <p>{CHILDREN}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${CHILDREN}.*${IN_PROGRESS}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${IN_PROGRESS}.*${CHILDREN}`),
  );
  expect(container).not.toHaveTextContent(ERROR);
});

it('renders only children and `inProgressRender` before it given an `InProgressAsync` and `setInProgressRenderBeforeChildren`', () => {
  const CHILDREN = 'agjotawt';
  const IN_PROGRESS = 'dokfesje';
  const ERROR = 'obhiweng';
  const { container } = render(
    <AsyncViewContainer
      asyncData={newInProgress()}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      setInProgressRenderBeforeChildren
      errorRender={() => <p>{ERROR}</p>}
    >
      <p>{CHILDREN}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${IN_PROGRESS}.*${CHILDREN}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${CHILDREN}.*${IN_PROGRESS}`),
  );
  expect(container).not.toHaveTextContent(ERROR);
});

it('renders only children and `errorRender` after it given an `ErrorAsync`', () => {
  const CHILDREN = 'dehujije';
  const IN_PROGRESS = 'vasaefmi';
  const ERROR = 'vibelgas';
  const { container } = render(
    <AsyncViewContainer
      asyncData={newError(new Error())}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      errorRender={() => <p>{ERROR}</p>}
    >
      <p>{CHILDREN}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(new RegExp(`${CHILDREN}.*${ERROR}`));
  expect(container).not.toHaveTextContent(new RegExp(`${ERROR}.*${CHILDREN}`));
  expect(container).not.toHaveTextContent(IN_PROGRESS);
});

it('renders only children and `errorRender` before it given an `ErrorAsync` and `setErrorRenderBeforeChildren`', () => {
  const CHILDREN = 'ifipkodm';
  const IN_PROGRESS = 'galweham';
  const ERROR = 'gukokubi';
  const { container } = render(
    <AsyncViewContainer
      asyncData={newError(new Error())}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      errorRender={() => <p>{ERROR}</p>}
      setErrorRenderBeforeChildren
    >
      <p>{CHILDREN}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(new RegExp(`${ERROR}.*${CHILDREN}`));
  expect(container).not.toHaveTextContent(new RegExp(`${CHILDREN}.*${ERROR}`));
  expect(container).not.toHaveTextContent(IN_PROGRESS);
});

it('renders only children and `inProgressRender` after it given an array with any `InProgressAsync` and no `ErrorAsync`', () => {
  const CHILDREN = 'kegvevlu';
  const IN_PROGRESS = 'kafafdeh';
  const ERROR = 'favseufp';
  const { container } = render(
    <AsyncViewContainer
      asyncData={[newInit(), newInProgress()]}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      errorRender={() => <p>{ERROR}</p>}
    >
      <p>{CHILDREN}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${CHILDREN}.*${IN_PROGRESS}`),
  );
  expect(container).not.toHaveTextContent(
    new RegExp(`${IN_PROGRESS}.*${CHILDREN}`),
  );
  expect(container).not.toHaveTextContent(ERROR);
});

it('renders only children and `errorRender` after it given an array with any `ErrorAsync` and no `InProgressAsync`', () => {
  const CHILDREN = 'avejarit';
  const IN_PROGRESS = 'tivekzio';
  const ERROR = 'juzpecto';
  const { container } = render(
    <AsyncViewContainer
      asyncData={[newInit(), newError(new Error())]}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      errorRender={() => <p>{ERROR}</p>}
    >
      <p>{CHILDREN}</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(new RegExp(`${CHILDREN}.*${ERROR}`));
  expect(container).not.toHaveTextContent(new RegExp(`${ERROR}.*${CHILDREN}`));
  expect(container).not.toHaveTextContent(IN_PROGRESS);
});

it('renders both `inProgressRender` and `errorRender`given an array with a `InProgressAsync` and a `ErrorAsync`', () => {
  const IN_PROGRESS = 'tivekzio';
  const ERROR = 'juzpecto';
  const { container } = render(
    <AsyncViewContainer
      asyncData={[newInProgress(), newError(new Error())]}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      errorRender={() => <p>{ERROR}</p>}
    >
      <p>zubihora</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS);
  expect(container).toHaveTextContent(ERROR);
});

it('renders one `errorRender` per `ErrorAsync` in the given an array', () => {
  const ERROR_1 = 'cenafret';
  const ERROR_2 = 'calkoagu';
  const ERROR_3 = 'nihuugep';
  const { container } = render(
    <AsyncViewContainer
      asyncData={[
        newError(new Error(ERROR_1)),
        newError(new Error(ERROR_2)),
        newError(new Error(ERROR_3)),
      ]}
      inProgressRender={null}
      errorRender={errors =>
        errors.map((error, i) => <p key={i}>{error.message}</p>)
      }
    >
      <p>gubupgen</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(
    new RegExp(`${ERROR_1}.*${ERROR_2}.*${ERROR_3}`),
  );
});

it('renders `inProgressRender` given no `InProgressAsync` but `forceInProgress`', () => {
  const IN_PROGRESS = 'rofmomeb';
  const { container } = render(
    <AsyncViewContainer
      asyncData={newInit()}
      inProgressRender={() => <p>{IN_PROGRESS}</p>}
      forceInProgress
      errorRender={null}
    >
      <p>ozepejhu</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(IN_PROGRESS);
});

it('renders `errorRender` given no `ErrorAsync` but `forceError`', () => {
  const ERROR = 'nafbuvim';
  const { container } = render(
    <AsyncViewContainer
      asyncData={newInit()}
      inProgressRender={null}
      errorRender={() => <p>{ERROR}</p>}
      forceError={new Error()}
    >
      <p>lihasaze</p>
    </AsyncViewContainer>,
  );
  expect(container).toHaveTextContent(ERROR);
});
