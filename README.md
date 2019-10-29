<div align="center">
<h1>react-async-utils</h1>
<a href="https://www.emojione.com/emoji/1f422"><img height="80" width="80" alt="turtle" src="https://raw.githubusercontent.com/CarlosGines/react-async-utils/master/other/turtle.png" /></a>

<p>
<a href="https://www.npmjs.com/package/react-async-utils"><img alt="npm" src="https://img.shields.io/npm/v/react-async-utils.svg"></a>
<a href="https://travis-ci.com/CarlosGines/react-async-utils"><img alt="Travis (.com)" src="https://img.shields.io/travis/com/CarlosGines/react-async-utils/master.svg"></a>
<a href="https://coveralls.io/github/CarlosGines/react-async-utils"><img alt="Coveralls github" src="https://img.shields.io/coveralls/github/CarlosGines/react-async-utils.svg"></a>
<a href="https://snyk.io/vuln/npm:react-async-utils"><img alt="Snyk Vulnerabilities for npm package" src="https://img.shields.io/snyk/vulnerabilities/npm/react-async-utils.svg"></a>
<a href="https://github.com/CarlosGines/react-async-utils/blob/master/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/carlosgines/react-async-utils.svg"></a>
</p>
</div>

Collection of utils to work with asynchronous data and tasks in React in a more declarative way. Featuring `useAsyncData` and `useAsyncTask` hooks for this purpose. It is delightful to use with TypeScript, but it can equally be used with JavaScript.

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [The difficulties](#the-difficulties)
  - [Data structure](#data-structure)
  - [Features (React and non-React)](#features-react-and-non-react)
- [This solution](#this-solution)
  - [Data structure](#data-structure-1)
  - [Features (React and non-React)](#features-react-and-non-react-1)
- [Installation](#installation)
- [The new `Async` data concept](#the-new-async-data-concept)
  - [The 4 basic states of `Async` data](#the-4-basic-states-of-async-data)
  - [The hooks](#the-hooks)
    - [`useAsyncData` hook](#useasyncdata-hook)
    - [`useAsyncTask` hook](#useasynctask-hook)
  - [Rendering `Async` data](#rendering-async-data)
    - [render](#render)
    - [AsyncViewContainer](#asyncviewcontainer)
- [API Reference (WIP)](#api-reference-wip)
  - [InitAsync](#initasync)
  - [InProgressAsync](#inprogressasync)
  - [SuccessAsync](#successasync)
  - [ErrorAsync](#errorasync)
  - [Async](#async)
    - [`isInit`](#isinit)
    - [`isInProgress`](#isinprogress)
    - [`isSuccess`](#issuccess)
    - [`isError`](#iserror)
    - [`isInProgressOrInvalidated`](#isinprogressorinvalidated)
    - [`isAborted`](#isaborted)
    - [`getPayload`](#getpayload)
    - [`getError`](#geterror)
  - [Hooks](#hooks)
    - [`useAsyncData`](#useasyncdata)
    - [`useAsyncTask`](#useasynctask)
    - [`useManyAsyncTasks`](#usemanyasynctasks)
- [Contributing](#contributing)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# The difficulties

## Data structure

Dealing with asynchronous data or tasks is usually an imperative process, harder to express in a declarative manner, such as React promotes. It usually results in using a combination of variables/properties to keep track of the possible states:

```javascript
let loading;
let data;
let error;
// Maybe more...
...
```

This a somehow complex construct for such an ubiquitous case. It can lead to verbose code, even more when dealing with multiple pieces of async data at the same time. Some of these combinations don't even make sense (`loading === true && error !== undefined`?). It can feel awkward to follow this pattern.

## Features (React and non-React)

You want to stay up to date with the state of art in our domain (Hooks, Concurrent Mode, Suspense...). You also want to take care of the more subtle requirements, like race conditions, or aborting. And you want to do it the right way. And that is not trivial.

# This solution

## Data structure

The base of this library is "[making impossible states impossible](https://blog.kentcdodds.com/make-impossible-states-impossible-cf85b97795c1)" for async data, and building rich abstractions around it.

We do not separate the data itself from its asynchronous state, we consider it an intrinsic part of its nature. And so we put it all together as a new data type consistent with this async nature.

We named this data type `Async`.

```typescript
let asyncPerson: Async<Person>;
```

It can be considered the declarative counterpart of a `Promise`.

This new data type allows us to create some powerful abstractions, like the `useAsyncData` custom hook

```typescript
const asyncPerson = useAsyncData(getPersonPromise);
```

which we will explain further down.

## Features (React and non-React)

Our utils use the latest **stable** React capabilities to make working properly with async data and tasks **easy and direct**. They also take care of stuff like race conditions, cleaning up and easy aborting.

# Installation

```bash
npm install react-async-utils
```

# The new `Async` data concept

We are going to deal with async data in all of its possible states as a single entity. This entity includes all possible states and related data within it, in an ordered (and type-safe) manner.

## The 4 basic states of `Async` data

We consider any `Async` data can exist in one of this 4 states:

- **INIT**: nothing has happened yet. This is time 0 of our async process:

```typescript
interface InitAsync {
  progress: Progress.Init;
}
```

- **IN PROGRESS**: our async process is happening. We are waiting for its outcome:

```typescript
interface InProgressAsync {
  progress: Progress.InProgress;
}
```

- **SUCCESS**: our async process is successfully completed. The actual data will be available in its **payload**:

```typescript
interface SuccessAsync<Payload> {
  progress: Progress.Success;
  payload: Payload;
}
```

- **ERROR**: our async process failed. There will be an **error**, the cause of this failure:

```typescript
interface ErrorAsync {
  progress: Progress.Error;
  error: Error;
}
```

And so, an `Async` data encapsulates the 4 states of a piece of data along the async process within a single data type:

```typescript
export type Async<Payload> =
  | InitAsync
  | InProgressAsync
  | SuccessAsync<Payload>
  | ErrorAsync;
```

This data type is the base of our library. Take your time to understand it, and we will be able to do great things with it.

## The hooks

This library features 2 main hooks: `useAsyncData` and `useAsyncTask`:

### `useAsyncData` hook

A powerful abstraction to manage querying or fetching data in a declarative way. It takes care of race conditions and it can get aborted. It looks like this:

```typescript
const asyncPerson = useAsyncData(getPersonPromise);
```

- **`getPersonPromise`**: input function to fetch data. It returns a `Promise` that resolves to the desired data.
- **`asyncPerson`**: it is our `Async` data. It will be in the INIT state at the beginning, but will start getting updated as the data fetching task is triggered.

This hook will run our data fetching task as an effect, so it will happen automatically after the first render. This effect will update `asyncPerson` state according to the state of the `Promise` returned by `getPersonPromise`.

⚠️ Be careful, this hook can cause infinite loops. The input function is a dependency of the effect. You want to use `React.useCallback` if needed to keep its identity and prevent these loops:

```typescript
const asyncPerson = useAsyncData(
  React.useCallback(() => getPersonPromise(personId), [personId]),
);
```

You can read more details of `useAsyncData` hook at the [API Reference](#useasyncdata).

### `useAsyncTask` hook

Similar to `useAsyncData`, this hook is used to manage posting or mutating data in a more declarative way. It can be aborted.

```typescript
const asyncSubmitValues = useAsyncTask(() => submitValues);

const triggerButton = (
  <button onClick={() => asyncSubmitValues.trigger(values)}>Submit</button>
);
```

- **`submitValues`**: input function that accepts input arguments and returns a `Promise` that resolves to the result of the operation.
- **`asyncSubmitValues`**: it is our `Async` data. It will be in the INIT state at the beginning, but will start getting updated once the async task is triggered.
- **`asyncSubmit.trigger`**: a function that triggers the async task. When invoked, it will call `submitValues` with the same arguments it receives, and it will update `asyncSubmit` state according to the state of the `Promise` returned by `submitValues`.

Unlike `useAsyncData`, this task will not be triggered as an effect, you will trigger it with the `trigger` funtion, and you can provide it with any parameters.

See the [API Reference](#useasynctask) for more details.

## Rendering `Async` data

### render

A good option is the `render` class method. You can provide a specific render method per state. The corresponding one will be used:

```tsx
asyncPerson.render({
  init: () => <p>INIT state render. Nothing happened yet.</p>,
  inProgress: () => (
    <p>IN PROGRESS state render. We are fetching our Person.</p>
  ),
  success: person => <p>SUCCESS state render. Please welcome {person.name}!</p>,
  error: error => (
    <p>ERROR state render. Something went wrong: {error.message}</p>
  ),
});
```

### AsyncViewContainer

Another option is the `AsyncViewContainer` component:

```tsx
import { AsyncViewContainer, getPayload } from 'react-async-utls';

function MyComponent({ asyncPerson }) {
  person = getPayload(asyncPerson);
  return (
    <AsyncViewContainer
      asyncData={asyncPerson}
      inProgressRender={() => 'Loading person...'}
      errorRender={error => `Something went wrong: ${error.message}`}
    >
      {person ? <FancyPerson person={person} /> : 'No Data'}
    </AsyncViewContainer>
  );
}
```

Apart from its children, it will render the render method of the corresponding `Async` data state.

BONUS: `AsyncViewContainer` accepts an array at the `asyncData` prop :

```tsx
function MyComponent({ asyncPerson }) {
  return (
    <AsyncViewContainer
      asyncData={[asyncProfile, asyncContacts, asyncNotifications]}
      inProgressRender={() => 'Loading stuff...'}
      errorRender={errors => errors.map(error => error.message).join(' AND ')}
    >
      // ...
    </AsyncViewContainer>
  );
}
```

It will render the corresponding render method if _any_ `Async` data is on that state.

# API Reference (WIP)

Work in progress.

## InitAsync

```typescript
class InitAsync<Payload> {
  public progress: Progress.Init;
  public aborted?: boolean;
  public constructor(aborted?: boolean);
}
```

Represents the INIT state **and** the ABORTED sub-state.

## InProgressAsync

```typescript
class InProgressAsync<Payload> {
  public progress: Progress.InProgress;
  public constructor();
}
```

Represents the IN PROGRESS state.

## SuccessAsync

```typescript
class SuccessAsync<Payload> {
  public progress: Progress.Success;
  public payload: Payload;
  public invalidated?: boolean;
  public constructor(aborted?: boolean);
}
```

Represents the SUCCESS state, with its corresponding payload **and** the INVALIDATED sub-state (payload outdated, new one in progress).

## ErrorAsync

```typescript
class ErrorAsync<Payload> {
  public progress: Progress.Error;
  public error: Error;
  public constructor(error: Error);
}
```

Represents the ERROR state, with its corresponding error.

## Async

All `Async` objects have these methods:

### `isInit`

```typescript
public isInit(): this is InitAsync
```

- **@returns** `true` if async object is in INIT state and act as type guard.

### `isInProgress`

```typescript
public isInProgress(): this is InProgressAsync
```

- **@returns** `true` if async object is in IN PROGRESS state and act as type guard.

### `isSuccess`

```typescript
public isSuccess(): this is SuccessAsync<Payload>
```

- **@returns** `true` if async object is in SUCCESS state and act as type guard.

### `isError`

```typescript
public isError(): this is ErrorAsync
```

- **@returns** `true` if async object is in ERROR state and act as type guard.

### `isInProgressOrInvalidated`

```typescript
public isInProgressOrInvalidated(): this is InProgressAsync | SuccessAsync<Payload>
```

- **@returns** `true` if async object is in IN PROGRESS state or INVALIDATED sub-state and act as type guard.

### `isAborted`

```typescript
public isAborted(): this is InitAsync
```

- **@returns** `true` if async object is in ABORTED sub-state and act as type guard.

### `getPayload`

```typescript
public getPayload(): Payload | undefined
```

- **@returns** corresponding payload (generic) if async object is in SUCCESS state or `undefined` otherwise.

### `getError`

```typescript
public getError(): Error | undefined
```

- **@returns** corresponding `Error` if async object is in ERROR state or `undefined` otherwise.

### `render`

```typescript
  public render({
    init?: (aborted?: boolean) => ReactNode;
    inProgress?: () => ReactNode;
    success?: (payload: Payload, invalidated?: boolean) => ReactNode;
    error?: (error: Error) => ReactNode;
  }): ReactNode
```

- **@returns** the `ReactNode` corresponding to the render function of the async object current state, or `null` if not provided.

## Hooks

### `useAsyncData`

```typescript
function useAsyncData<Payload>(
  getData: (singal?: AbortSignal) => Promise<Payload>,
  {
    disabled,
    onSuccess,
    onError,
  }: {
    disabled?: boolean;
    onSuccess?: (payload: Payload) => void;
    onError?: (error: Error) => void;
  },
): AsyncData<Payload>;

type AsyncData<Payload> = Async<Payload> & {
  refresh: () => void;
};
```

This hook is suitable for handling any kind of querying or data fetching. It takes care of race conditions and it cleans up on component unmount.

⚠️ Be careful, all input functions (`getData`, `onSuccess`, `onError`) are dependencies of the effect it uses. You can create infinite loops if you do not hand them carefully. Wrap the input functions in `React.useCallback` if needed to prevent these infinite loops. **But don't worry too much**: we produce an error with detailed info in case this happens.

Definition:

- **@param `getData`**

  _**You want to perform your fetch here**_. This input function is the async data fetching task that will be carried out. It must return a `Promise` that resolves to the desired data.

  It can use the `AbortSignal` that the hook provides (when browser supports it) if you want to make your task [abortable](https://developers.google.com/web/updates/2017/09/abortable-fetch).

- **@param `options.disabled`**

  While false (default), your task will be run as an effect (inside a `useEffect` hook). If true, your task will not be run as an effect, it will always return an `InitAsync`.

- **@param `options.onSuccess`**

  Callback function that will be called when the task reaches the SUCCESS state.

- **@param `options.onError`**

  Callback function that will be called when the task reaches the ERROR state.

- **@returns**

  The `AsyncData<Payload>`, which is the `Async<Payload>` corresponding to the current state of the data, extended with this function:

  - **refresh:** function that can be used to trigger the fetch manually (i.e. from a "Refresh" button).

### `useAsyncTask`

```typescript
function useAsyncTask<Payload, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Payload>,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (payload: Payload) => void;
    onError?: (error: Error) => void;
  },
): AsyncTask<Payload, Args>;

type AsyncTask<Payload, Args extends unknown[]> = Async<Payload> & {
  trigger: (...args: Args) => Promise<Async<Payload>>;
  abort: () => void;
};
```

This hook is suitable for handling any kind of data posting or mutation task. On component unmount it cleans up, but it does not abort flying requests (this can be done with the provided function).

If triggered multiple times in a row:

- All triggered tasks will happen.
- The returned `Aync<Payload>` will only track the state of the last triggered tasks. See [`useManyAsyncTasks`](#usemanyasynctasks) if you want to trigger and track the state of many tasks.
- `abort` will abort all existing tasks.

Definition:

- **@param `getTask`**

  This input function returns the async task that will be carried out. The returned task can have any input arguments, that will be provided when the task is triggered. The task must return a `Promise` that can resolve to the result of the operation (i.e. the new ID of a posted item) or to void.

  It can use the `AbortSignal` that the hook provides (when browser supports it) if you want to make your task [abortable](https://developers.google.com/web/updates/2017/09/abortable-fetch).

- **@param `options.onSuccess`**

  Callback function that will be called when the task reaches the SUCCESS state.

- **@param `options.onError`**

  Callback function that will be called when the task reaches the ERROR state.

- **@returns**

  The `AsyncTask<Payload>`, which is the `Async<Payload>` corresponding to the current state of the task, extended with these functions:

  - **trigger:** function that triggers the task (i.e. from a "Submit" button). It forwards its args to the task that you provided to the hook, and it returns a `Promise` of the `Async` result. You generally won't use this returned `Async`, it is a escape hatch for some cases.
  - **abort:** function that aborts the task, setting the `Async` back to the INIT state, and as ABORTED if it was IN PROGRESS or INVALIDTED.

### `useManyAsyncTasks`

```typescript
function useManyAsyncTasks<Payload, Args extends unknown[]>(
  getTask: (singal?: AbortSignal) => (...args: Args) => Promise<Payload>,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (payload: Payload) => void;
    onError?: (error: Error) => void;
  },
): (key: any) => AsyncTask<Payload, Args>;
```

It works exactly the same way `useAsyncTask` does, but this hook can be used to track multiple async tasks of the same type. Instead of returning an `AsyncTask`, it returns an `AsyncTask` getter. Use any key as input to obtain the associated `AsyncTask`.

# Contributing

Open to contributions!

# LICENSE

MIT
