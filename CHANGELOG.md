## 0.7.1 (Mar 1, 2019)

### New features

- `useAsyncData` hook now accepts a 3rd parameter as dependencies for the hook, overriding the first 2 parameters as dependencies.
- `AsyncViewContainer` render props accept `null` to render nothing.

## 0.7.0 (Feb 28, 2019)

### Breaking changes

- `useAsyncData` hook now includes all inputs as dependencies. Be specially careful if you use `autoTriggerWith`, since it might trigger `getData` on every render.

### New features

- `render` accepts `null` as parameter to render nothing at the corresponding async state render.
