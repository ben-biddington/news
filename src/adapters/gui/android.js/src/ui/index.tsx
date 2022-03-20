import { render } from "solid-js/web";

export const Application = () => {
  return (<>
    <div>Ben rules</div>
  </>)
}

export const mount = (el) => {
  render(() => <Application />, el);
}