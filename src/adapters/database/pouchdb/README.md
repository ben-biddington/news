# Build

Separate build because `pouchdb` types depend on `WebWorker`.

And [`WebWorker` and `DOM` are incompatible](https://github.com/microsoft/TypeScript/issues/20595).