// https://android-js.github.io/docs/toast_api.
// https://github.com/android-js/android-native-apis/blob/6b3cd0ae31ac2610cd443baea7a8d1a3222f6af9/androidjs/src/main/java/com/android/js/api/Toast.java
export const show = (msg: string) => {
  //@ts-ignore
  if (app && app.toast) {
    //@ts-ignore
    app.toast.show(msg, 1000);
  }
};
