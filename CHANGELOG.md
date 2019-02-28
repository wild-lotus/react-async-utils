## 0.7.0 (Feb 28, 2019)

### Breaking changes

- `useAsyncData` hook now includes all inputs as dependencies. Be specially careful if you use `autoTriggerWith`, since it might trigger `getData` on every render.

### New features

- `render` accepts `null` as parameter to render nothing at the corresponding async state render.
