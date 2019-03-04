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
