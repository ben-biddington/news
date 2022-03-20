## Build 

```bash
./build.sh
```

Keeping the build dir [pristine](https://github.com/android-js/sample-app/tree/master/web-view-app-template) at the moment until I work out how the apk is built.

## Deploy

Copy to Google Drive and install manually.

## Server

```bash
npx ts-node-dev ./src/server.ts
```

## Basic idea

It starts up at `build/views/index.html` and we can include scripts by adding them to `build/assets`.