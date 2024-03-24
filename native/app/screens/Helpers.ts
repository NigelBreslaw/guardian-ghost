import { useGGStore } from "@/app/store/GGStore.ts";

export function calcCurrentListIndex(posX: number, PAGE_WIDTH: number) {
  const internalOffset = posX - PAGE_WIDTH / 2;
  let index = 0;
  if (posX > 0) {
    const newIndex = Math.ceil(internalOffset / PAGE_WIDTH);
    if (newIndex > 0) {
      index = newIndex;
    }
  }
  useGGStore.getState().setCurrentListIndex(index);
}
