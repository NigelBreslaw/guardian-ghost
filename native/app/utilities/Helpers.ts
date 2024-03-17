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

import StorageGG from "@/storage/StorageGG";

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
