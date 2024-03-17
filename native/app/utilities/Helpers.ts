// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const debounce = (func: Function, delay = 0) => {
  let timeoutId: string | number | NodeJS.Timeout | undefined;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (...args: any) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};
