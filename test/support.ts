export const delay = ms => new Promise(res => setTimeout(res, ms));
export const until = async (condition: () => boolean) => {
  while(false == condition()) {
    await delay(500);
  }
};
export const random = (min, max) => {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}
export const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));