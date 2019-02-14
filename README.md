<h1 align="center">react-async-utils</h1>
Collection of utils to work with asynchronous data in React. It especially shines when used with TypeScript, but it can be used with JavaScript.

# Table of Contents

- [The problem](#the-problem)
- [This solution](#this-solution)
- [Installation](#installation)
- [Usage](#usage)
  - [ The 4 basic states](#the-4-basic-states)
  - [Rendering Async Data](#rendering-async-data)
    - [render](#render)
    - [AsyncViewContainer](#AsyncViewContainer)
  - [useAsyncData hook](#useAsyncData-hook)
- [API Reference (WIP)](<#api-reference-(wip)>)
- [Contributing](#contributing)
- [LICENSE](#license)

# The problem

Dealing with asynchronous data usually results in using a combination of variables/properties to keep track of the possible states:

```javascript
let loading;
let data;
let error;
let invalidated;
...
```

This a somehow complex construct for such an ubiquitous case. It can lead to verbose code, even more when dealing with multiple pieces of async data at the same time. On top of that, you probably need to repeat that "boilerplate" a lot in your app.

Plus, some of this combinations don't make sense (`loading === true && error != null`?) and so it can feel awkward to follow this pattern.

# This solution

The base of this library is "[making impossible states impossible](https://blog.kentcdodds.com/make-impossible-states-impossible-cf85b97795c1)" for async data, and building abstractions around it.

We do not separate the data itself from its asynchronous state, we consider it an intrinsic part of its nature. And so we put it all together as an object consistent with this async nature.

We named it an `Async` type object

```typescript
let asyncPerson: Async<Person>;
```

This leads us to some powerful abstractions like the `useAsyncData` custom hook:

```javascript
const [asyncData, triggerAsyncData] = useAsyncData(getData);
```

# Installation

```bash
npm install react-async-utls
```

# Usage

## The 4 basic states

We consider any async data can exist in one of this 4 states:

```javascript
import { async } from 'react-async-utls';

// Async process not started:
asyncPerson = async.init();

// Async process in progress:
asyncPerson = async.inProgress();

// Async process successfully completed:
asyncPerson = async.success({ name: 'Charlie' });
consoe.log(asyncPerson.payload); // { name: 'Charlie' }

// Async process failed:
asyncPerson = async.error(new Error('Bad stuff'));
consoe.log(asyncPerson.error.message); // 'Bad stuff'
```

BONUS: The successful state can also express an `invalidated` state:

```javascript
asyncPerson = async.success({ name: 'Charlie' }, true);
consoe.log(asyncPerson.invalidated); // true
```

We can query the async state of our data with these functions:

```javascript
async.isInit(asyncPerson);
async.isInProgress(asyncPerson);
async.isSuccess(asyncPerson);
async.isValidSuccess(asyncPerson);
async.isInvalidated(asyncPerson);
async.isInProgressOrInvalidated(asyncPerson);
async.isError(asyncPerson);
```

## Rendering Async Data

### render

A good option is the `render` helper method. One render method per state, with any React node as return type:

```javascript
import { async } from 'react-async-utls';

async.render(
  asyncPerson,
  () => 'Init state render. Nothing happened.',
  () => 'In Progress state render. We are fetching our Person.',
  (person, invalidated) =>
    `Successful state render. Please welcome ${person.name}!`,
  error => `Error state render. Something went wrong: ${error.message}`,
);
```

### AsyncViewContainer

Another option is the `AsyncViewContainer` component, which always displays its children:

```javascript
import { async, AsyncViewContainer } from 'react-async-utls';

function MyComponent({ asyncPerson }) {
  person = async.payloadOrUndefined(asyncPerson);
  return (
    <AsyncViewContainer
      asyncData={asyncPerson}
      loadingRender={() => 'Loading...'}
      errorRender={error => `Something went wrong: ${error.message}`}
    >
      {person ? <FancyPerson person={person} /> : 'No Data'}
    </AsyncViewContainer>
  );
}
```

BONUS: `asyncData` prop from `AsyncViewContainer` accepts an array of `Async<Data>` (I know, Suspense...)

```javascript
function MyComponent({ asyncPerson }) {
  return (
    <AsyncViewContainer
      asyncData={[asyncProfile, asyncContacts]}
      loadingRender={() => 'Loading...'}
      errorRender={errors => errors.map(error => error.message).join(' AND ')}
    >
      ...
    </AsyncViewContainer>
  );
}
```

## useAsyncData hook

A powerful abstraction to manage the whole async process:

```javascript
const [asyncData, triggerAsyncData] = useAsyncData(getData);

const triggerButton = (
  <button onClick={event => triggerAsyncData()}>Trigger it!</button>
);
```

`getData` must be a function with whatever args that returns a Promise.

`asyncData` will start in `init` state. When you `triggerAsyncData`,it will be updated to `inProgress`, and then to `success` or `error` states as the promise is resolved or rejected.

You can call `triggerAsyncData` many times with different args.

You can also trigger the async process automatically after the first render, providing an array of args to the `autoTriggerWith` option:

```javascript
const [asyncData] = useAsyncData(getData, { autoTriggerWith: [] });
```

ADVANCED: for the sake of simplicity, `useAsyncData` args are captured on the first render, and never considered again.

# API Reference (WIP)

Work in progress.

# Contributing

This is my first OSS. Open to contributions and willing to learn!

# LICENSE

MIT
