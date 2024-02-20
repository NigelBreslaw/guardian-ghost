import { getProfile, profileComponents } from "../bungie/BungieApi";
import StorageGG from "@/storage/StorageGG";

export function getCustomItemDefinition(language = "en"): Promise<JSON> {
  const requestOptions: RequestInit = {
    method: "GET",
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

export async function saveItemDefinition() {
  const p1 = performance.now();
  const jsonDefinition = await getCustomItemDefinition();
  StorageGG.setData(jsonDefinition, "item_definition", "saveItemDefinition()");
  const p2 = performance.now();
  console.log("saveItemDefinition) took:", (p2 - p1).toFixed(4), "ms");
}

export async function getItemDefinition() {
  const p1 = performance.now();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const jsonDefinition: any = await StorageGG.getData("item_definition", "getItemDefinition()");
  const p2 = performance.now();
  console.log("getItemDefinition) took:", (p2 - p1).toFixed(4), "ms");
  console.log(jsonDefinition["236588"]);
}

export async function getProfileTest() {
  const p1 = performance.now();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const jsonDefinition: any = await getProfile(profileComponents);
  const p2 = performance.now();
  console.log("getProfileTest) took:", (p2 - p1).toFixed(4), "ms");
  console.log(jsonDefinition);
}
