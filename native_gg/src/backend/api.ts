export function getCustomItemDefinition(language = "en"): Promise<JSON> {
  const headers = new Headers();
  headers.append("Cache-Control", "no-cache");
  headers.append("Pragma", "no-cache");
  headers.append("Content-Type", "application/json");

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    fetch(`https://ishtar-commander.com/json/${language}.json`, requestOptions)
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

function updateItemDefinition(language = "en"): Promise<JSON> {
  return getCustomItemDefinition(language).then((data) => {
    const itemDefinition = data;
    return itemDefinition;
  });
}

export async function testItemDefinition() {
  const p1 = performance.now();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const def: any = await updateItemDefinition();
  const p2 = performance.now();
  console.log("download) took:", (p2 - p1).toFixed(4), "ms");
}
