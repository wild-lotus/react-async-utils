## 0.10.0 (Mar 17, 2019)

This is a relevant new verion. We have reached a more stable version of `useAsyncTask` hook: it finally meets `exhaustive-deps` rule, avoiding some bugs and making its API more intuitive. There are also new features regarding aborting tasks and race conditions. We have also added tests.

### Breaking changes

- Updated `useAsyncTask`:
  - New boolean `triggerAsEffect` option instead of `autoTriggerWith` to trigger the async task automatcally.
  - Removed `onChange` option.

### New features

- `useAsyncTask` handles race condition prevention.
- `useAsyncTask` provides an `AbortSignal` at the input function to make it abortable.
- Added `aborted` substate to `InitAsync`. Adapted helper methods, `render` and `useAsyncTask` accordingly.
- Added tests.

### Bug fixes

- Fixed `errorRender` not being rendered at `AsyncViewContainer` in some cases.
- Fixed `AsyncViewContainer` properly accepting `null` as render props.

## 0.9.0 (Mar 7, 2019)

### Breaking changes

- Renamed `useAsyncData` to `useAsyncTask`
- The `trigger` function returned by `useAsyncData` and the helper method `task` now return a promise of the resulting `Async` instead of `void`.

### New features

- Prevented racing conditions in `useAsyncData` when triggering an Async task times.
- Prevented undesired state updates from `useAsyncData` when reseting an `InProgress` Async.

### Bug fixes

- Deleted `useAsyncData` broken infinite loops detection in auto-trigger effect. We might add a ne one in the future.

## 0.8.0 (Mar 4, 2019)

Big refactor for the sake of simplicity and understandability. Significantly revamped README.md to to explain the library more clearly.

### Breaking changes

- `useAsyncData`: always returns new trigger and reset functions. Dependencies in 3rd arg only affect the auto-trigger effect now.
- `AsyncViewContainer`: renamed most props to be more consistent and descriptive.
- `render`: args 2 to 5 (render functions) have become just one single arg: an object with one optional property per render function.
- Helper functions:
  - Now exported directly at top level, instead of under the `async` object.
  - Renamed many of them, and merged some of them into one.

### New features

- `useAsyncData` now detects, prevents and logs (`console.error`) infinite loops caused by inappropriate dependencies for the auto-trigger effect.

## 0.7.1 (Mar 1, 2019)

### New features

- `useAsyncData` hook now accepts a 3rd parameter as dependencies for the hook, overriding the first 2 parameters as dependencies.
- `AsyncViewContainer` render props accept `null` to render nothing.

## 0.7.0 (Feb 28, 2019)

### Breaking changes

- `useAsyncData` hook now includes all inputs as dependencies. Be specially careful if you use `autoTriggerWith`, since it might trigger `getData` on every render.

### New features

- `render` accepts `null` as parameter to render nothing at the corresponding async state render.
