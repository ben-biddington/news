## Build 

```bash
./build.sh
```

Keeping the build dir [pristine](https://github.com/android-js/sample-app/tree/master/web-view-app-template) at the moment until I work out how the apk is built.

## Deploy

Copy to Google Drive and install manually.

## Server

```bash
cd server && npx ts-node-dev ./src/server.ts
```

### Run in browser

```
localhost:3000/views/index.html?use-local=true
```

## Basic idea

It starts up at `build/views/index.html` and we can include scripts by adding them to `build/assets`.

## Webview

https://developer.android.com/guide/webapps

TODO: print the keys of [`window.android`](https://github.com/android-js/androidjs/blob/master/src/webview/androidjs/api/app.ts)