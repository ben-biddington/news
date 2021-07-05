// [i] https://github.com/Microsoft/TypeScript/issues/14877
// [i] https://felixgerschau.com/how-to-communicate-with-service-workers/ (messaging)
// [i] about:debugging#/runtime/this-firefox
/// <reference no-default-lib="true"/>
/// <reference lib="WebWorker" />
const sw = self;
sw.addEventListener('fetch', (event) => {
    console.log('[service-worker]', event);
    event.respondWith(fetch(event.request));
});
// sw.addEventListener('message', (event: ExtendableMessageEvent) => {
//   console.log('[service-worker]', event);
//   event.respondWith(fetch(event.request));
// });
sw.addEventListener('activate', (event) => {
    console.log('[service-worker]', event);
});
sw.addEventListener('install', (event) => {
    console.log('[service-worker]', event);
});
