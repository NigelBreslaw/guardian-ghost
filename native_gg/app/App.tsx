import Director from "./screens/Director";

export function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Director />
    </SafeAreaProvider>
  );
}
