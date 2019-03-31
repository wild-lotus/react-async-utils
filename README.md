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

Collection of utils to work with asynchronous data in React in a more declarative way. Featuring `useAsyncTask` hook, especially useful to fetch data. It is delightful to use with TypeScript, but it can equally be used with JavaScript.

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [The problem](#the-problem)
- [This solution](#this-solution)
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
  - [Hooks](#hooks)
    - [`useAsyncData`](#useasyncdata)
    - [`useAsyncTask`](#useasynctask)
- [Contributing](#contributing)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# The problem

Dealing with asynchronous data or tasks is usually an imperative process, harder to express in a declarative manner, such as React promotes. It usually results in using a combination of variables/properties to keep track of the possible states:

```javascript
let loading;
let data;
let error;
// Even more...
...
```

This a somehow complex construct for such an ubiquitous case. It can lead to verbose code, even more when dealing with multiple pieces of async data at the same time. Some of these combinations don't even make sense (`loading === true && error !== undefined`?).

So, it can feel awkward to follow this pattern. And you probably need to repeat that "boilerplate" a lot in your app.

It may also have some more subtle requirements, like taking care of race conditions, or being able to abort the tasks.

# This solution

The base of this library is "[making impossible states impossible](https://blog.kentcdodds.com/make-impossible-states-impossible-cf85b97795c1)" for async data, and building rich abstractions around it.

We do not separate the data itself from its asynchronous state, we consider it an intrinsic part of its nature. And so we put it all together as a new data type consistent with this async nature.

We named this data type `Async`.

```typescript
let asyncPerson: Async<Person>;
```

It can be considered the declarative counterpart of a `Promise`.

This new data type allows us to create some powerful abstractions, like the `useAsyncData` custom hook

```typescript
const [asyncPerson] = useAsyncData(getPersonPromise);
```

which we will explain further down.

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

This library features 2 hooks: `useAsyncData` and `useAsyncTask`:

### `useAsyncData` hook

A powerful abstraction to manage querying or fetching data in a declarative way. It takes care of race conditions and it can be aborted. It looks like this:

```typescript
const [asyncPerson] = useAsyncData(getPersonPromise);
```

- **`asyncPerson`**: it is our `Async` data. It will be in the `InitAsync` state at the beginning, but will start getting updated as the data fetching task is triggered.
- **`getPersonPromise`**: input function to fetch data. It returns a `Promise` that resolves to the desired data.

This hook will run our data fetching task as an effect, so it will happen automatically after the first render. This effect will update `asyncPerson` state according to the state of the `Promise` returned by `getPersonPromise`.

⚠️ Be careful, since this hook can cause infinite loops if not handed carefully. The input function is a dependency of the effect. You want to use `useCallback` if needed to keep its identity and prevent these loops:

```typescript
const [asyncPerson] = useAsyncData(
  useCallback(() => getPersonPromise(personId), [personId]),
);
```

You can read more details of `useAsyncData` hook at the [API Reference](#useasyncdata).

### `useAsyncTask` hook

Similar to `useAsyncData`, this hook is used to manage posting or mutating data in a more declarative way. It also takes care of racing conditions and it can be aborted.

```typescript
const [asyncSubmitResult, triggerSubmit] = useAsyncTask(() => submitValues);

const triggerButton = (
  <button onClick={() => triggerSubmit(values)}>Submit</button>
);
```

- **`asyncSubmitResult`**: it is our `Async` data. It will be in the `InitAsync` state at the beginning, but will start getting updated once the async task is triggered.
- **`triggerSubmit`**: a function that triggers the async task. It will call `submitValues` when invoked with the same arguments it receives, and it will update `asyncSubmitResult` state according to the state of the `Promise` returned by `submitValues`.
- **`submitValues`**: input function that accepts input arguments and returns a `Promise` that resolves to the result of the operation.

Unlike `useAsyncData`, this task will not be triggered as an effect, you need to trigger it with the trigger funtion, and you can provide it with parameters for the task.

See the [API Reference](#useasynctask) for more details.

## Rendering `Async` data

### render

A good option is the `render` helper method. You can provide a render method per state. The corresponding one will be used:

```tsx
import { render } from 'react-async-utls';

render(asyncPerson, {
  init: () => <p>Init state render. Nothing happened yet.</p>,
  inProgress: () => (
    <p>In Progress state render. We are fetching our Person.</p>
  ),
  success: person => (
    <p>Successful state render. Please welcome {person.name}!</p>
  ),
  error: error => (
    <p>Error state render. Something went wrong: {error.message}</p>
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
): [Async<Payload>, () => void, () => void];
```

This hook is suitable for handling any kind of querying or data fetching tasks. It takes care of race conditions and it cleans up on component unmount.

⚠️ Be careful, all input functions (`getData`, `onSuccess`, `onError`) are dependencies of the effect it uses. You can create infinite loops if you do not hand them carefully. Wrap the input functions in `useCallback` if needed to prevent these infinite loops.

- **@param `getData`**

  _**You want to perform your fetch here**_. This input function is the async data fetching task that will be carried out. It must return a `Promise` that resolves to the desired data.

  It can use the `AbortSignal` that the hook provides (when browser supports it) if you want to make your task [abortable](https://developers.google.com/web/updates/2017/09/abortable-fetch).

- **@param `options.disabled`**

  While false (default), your task will be run as an effect (inside a `useEffect` hook) and via manual triggers (with the returned "trigger" function). If true, your task will not be run as an effect nor via manual triggers.

- **@param `options.onSuccess`**

  Callback function that will be called when the task reaches the `SuccessAsync` state.

- **@param `options.onError`**

  Callback function that will be called when the task reaches the `ErrorAsync` state.

- **@returns**

  A tuple with 3 values:

  1. **The `Async` data** corresponding to the current data state.
  2. **A _refreshAsyncData_ function** that can be used to manually trigger the task (i.e. from a "Refresh" button).
  3. **A _resetAsyncData_ function** that can be used to reset the data back to the `InitAsync` state, aborting it if it was in progress.

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
): [Async<Payload>, (...args: Args) => Promise<Async<Payload>>, () => void];
```

This hook is suitable for handling any kind of data posting or mutation task. It takes care of race conditions and it cleans up on component unmount.

- **@param `getTask`**

  This input function returns the async task that will be carried out. The returned task can have any input arguments, that will be provided when the task is triggered. The task must return a `Promise` that can resolve to the result of the operation (i.e. the new ID of a posted item) or to void.

  It can use the `AbortSignal` that the hook provides (when browser supports it) if you want to make your task [abortable](https://developers.google.com/web/updates/2017/09/abortable-fetch).

- **@param `options.onSuccess`**

  Callback function that will be called when the task reaches the `SuccessAsync` state.

- **@param `options.onError`**

  Callback function that will be called when the task reaches the `ErrorAsync` state.

- **@returns**

  A tuple with 3 values:

  1. **The `Async` result** of the corresponding async task.
  2. **A _triggerAsyncTask_ function** that is used to trigger the task (i.e. from a "Submit" button). It forwards its args to the task provided to the hook, and it returns a `Promise` of the `Async` result. You generally won't use this returned `Async` data —which is a escape hatch for some cases—, but the previous one, which is more declarative.
  3. **A _abortAsyncTask_ function** that can be used to abort the task, setting the `Async` back to the `InitAsync` state, and as "aborted" if it was in progress.

# Contributing

Open to contributions!

# LICENSE

MIT
