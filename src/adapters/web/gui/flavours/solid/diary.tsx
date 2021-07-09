import { render } from "solid-js/web";

export const DiaryApplication = () => {
  return <div class="container-fluid m5">Diary</div>
}

export const mount = (el) => {
  render(() => <DiaryApplication />, el);
}

module.exports.DiaryApplication = DiaryApplication;