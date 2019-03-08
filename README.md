<h1 align="center">react-async-utils</h1>
<p align="center">
<a href="https://www.npmjs.com/package/react-async-utils"><img alt="npm" src="https://img.shields.io/npm/v/react-async-utils.svg"></a>
<a href="https://snyk.io/vuln/npm:react-async-utils"><img alt="Snyk Vulnerabilities for npm package" src="https://img.shields.io/snyk/vulnerabilities/npm/react-async-utils.svg"></a>
<a href="https://david-dm.org/carlosgines/react-async-utils"><img alt="David" src="https://img.shields.io/david/carlosgines/react-async-utils.svg"></a>
<a href="https://github.com/CarlosGines/react-async-utils/blob/master/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/carlosgines/react-async-utils.svg"></a>
<img alt="GitHub top language" src="https://img.shields.io/github/languages/top/carlosgines/react-async-utils.svg">
</p>

Collection of utils to work with asynchronous data in React in a more declarative way. Featuring an especially useful `useAsyncTask` hook. It is delightful to use with TypeScript, but it can equally be used with JavaScript.

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [The problem](#the-problem)
- [This solution](#this-solution)
- [Installation](#installation)
- [The new Async Data concept](#the-new-async-data-concept)
  - [The 4 basic states of Async Data](#the-4-basic-states-of-async-data)
  - [useAsyncTask hook](#useasynctask-hook)
    - [Auto-trigger effect](#auto-trigger-effect)
  - [Rendering Async Data](#rendering-async-data)
    - [render](#render)
    - [AsyncViewContainer](#asyncviewcontainer)
- [API Reference (WIP)](#api-reference-wip)
- [Contributing](#contributing)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# The problem

Dealing with asynchronous data is usually an imperative process, harder to express in a declarative manner, such as React promotes. It usually results in using a combination of variables/properties to keep track of the possible states:

```javascript
let loading;
let data;
let error;
let invalidated;
...
```

This a somehow complex construct for such an ubiquitous case. It can lead to verbose code, even more when dealing with multiple pieces of async data at the same time. Some of these combinations don't even make sense (`loading === true && error != null`?).

So, it can feel awkward to follow this pattern. And you probably need to repeat that "boilerplate" a lot in your app.

# This solution

The base of this library is "[making impossible states impossible](https://blog.kentcdodds.com/make-impossible-states-impossible-cf85b97795c1)" for async data, and building abstractions around it.

We do not separate the data itself from its asynchronous state, we consider it an intrinsic part of its nature. And so we put it all together as a new data type consistent with this async nature.

We named this data type `Async`.

```typescript
let asyncPerson: Async<Person>;
```

It can be considered the declarative counterpart of a `Promise`.

This new data type allows us to create some powerful abstractions like the `useAsyncTask` custom hook

```typescript
const [asyncPerson, triggerGetPerson] = useAsyncTask(getPersonPromise);
```

which we will explain further down.

# Installation

```bash
npm install react-async-utils
```

# The new Async Data concept

We are going to deal with async data in all of its possible states as a single entity. This entity includes all possible states and related data within it, in an ordered (and type-safe) manner.

## The 4 basic states of Async Data

We consider any Async Data can exist in one of this 4 states:

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
  invalidated?: boolean;
}
```

A successful Async can also be **invalidated**, meaning its current payload is stale and we should receive a new one.

- **ERROR**: our async process failed. There will be an **error**, the cause of this failure:

```typescript
interface ErrorAsync {
  progress: Progress.Error;
  error: Error;
}
```

And so, an Async Data encapsulates the 4 states of a piece of data along the async process within a single data type:

```typescript
export type Async<Payload> =
  | InitAsync
  | InProgressAsync
  | SuccessAsync<Payload>
  | ErrorAsync;
```

This data type is the base of our library. Take your time to understand it, and we will be able to do great things with it.

## useAsyncTask hook

A powerful abstraction to manage the whole async process in a declarative way:

```typescript
const [asyncPerson, triggerGetPerson] = useAsyncTask(getPersonPromise);

const triggerButton = (
  <button onClick={e => triggerGetPerson(personId)}>Get me that person!</button>
);
```

- **`getPersonPromise`**: input function that returns a `Promise`.
- **`asyncPerson`**: it is our Async Data. It will be in `init` state at the beginning, but will get updated when it is triggered.
- **`triggerGetPerson`**: a function that will call `getPersonPromise` when invoked, using the given args, and it will update `asyncPerson` state according to the returned `Promise` state.

You can call the same `triggerGetPerson` as many times as needed even with different args.

### Auto-trigger effect

You can also trigger the async task automatically after the first render, providing an `autoTriggerWith` option with an array of args for the input function:

```typescript
const [asyncPerson] = useAsyncTask(
  getPersonPromise,
  { autoTriggerWith: [personId] },
  [personId],
);
```

The third parameter is the dependencies for the auto-trigger effect. Any change in the dependenies will cause the auto-trigger to happen again (just like `useEffect`, which used for this effect and receives these dependencies).

<hr/>

You can combine using both _auto-trigger_ effect and _triggerAsyncTask_ function.

For example: you auto-trigger fetching a paginated list of people on first render. Then you "manually" trigger the task again with different args, according to user input, to filter the list or change page.

## Rendering Async Data

### render

A good option is the `render` helper method. You can provide a render method per state. The corresponding one will be used:

```tsx
import { render } from 'react-async-utls';

render(asyncPerson, {
  init: () => <p>Init state render. Nothing happened yet.</p>,
  inProgress: () => (
    <p>In Progress state render. We are fetching our Person.</p>
  ),
  success: (person, invalidated) => (
    <p>{`Successful state render. Please welcome ${person.name}!`}</p>
  ),
  error: error => (
    <p>{`Error state render. Something went wrong: ${error.message}`}</p>
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

Apart from its children, it will render the render method corresponding to the Async Data state.

BONUS: `AsyncViewContainer` accepts an array of `Async<Data>` at the `asyncData` prop :

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

It will render the corresponding render method if _any_ Async Data is on that state.

# API Reference (WIP)

Work in progress.

# Contributing

This is my first OSS. Open to contributions and willing to learn!

# LICENSE

MIT
