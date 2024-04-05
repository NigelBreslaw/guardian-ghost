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

export function getCustomItemDefinition(language = "en"): Promise<JSON> {
  const requestOptions: RequestInit = {
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    fetch(`https://app.guardianghost.com/json/${language}.json`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          console.error(response);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.error("Failed to download custom Item Definition", error);
        reject(error);
      });
  });
}

// biome-ignore lint/suspicious/noExplicitAny: <Generic function>
export function benchmark<T extends any[], R>(func: (...args: T) => R, ...args: T): R {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  console.log(`${func.name}() took: ${(end - start).toFixed(4)} ms`);
  return result;
}

// biome-ignore lint/suspicious/noExplicitAny: <Generic function>
export async function benchmarkAsync<T extends any[], R>(func: (...args: T) => Promise<R>, ...args: T): Promise<R> {
  const start = performance.now();
  const result = await func(...args);
  const end = performance.now();
  console.log(`${func.name}() took: ${(end - start).toFixed(4)} ms`);
  return result;
}

export function bitmaskContains(bitmask: number, value: number): boolean {
	return (bitmask & value) === value;
}
