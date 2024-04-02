import { useGGStore } from "@/app/store/GGStore.ts";
import { Portal, Snackbar } from "react-native-paper";

export default function GGSnackBar() {
  const snackBarVisible = useGGStore((state) => state.snackBarVisible);
  const snackBarMessage = useGGStore((state) => state.snackBarMessage);
  const setSnackBarVisible = useGGStore((state) => state.setSnackBarVisible);

  return (
    <Portal>
      <Snackbar
        visible={snackBarVisible}
        onDismiss={() => setSnackBarVisible(false)}
        action={{
          label: "close",
        }}
      >
        {snackBarMessage}
      </Snackbar>
    </Portal>
  );
}
