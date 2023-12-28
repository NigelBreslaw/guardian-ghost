import { createSignal } from "solid-js";
import viteLogo from "/vite.svg";
import "./App.css";
import solidLogo from "./assets/solid.svg";

function App() {
    const [count, setCount] = createSignal(0);

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
                    <img src={viteLogo} class="logo" alt="Vite logo" />
                </a>
                <a href="https://solidjs.com" target="_blank" rel="noreferrer">
                    <img src={solidLogo} class="logo solid" alt="Solid logo" />
                </a>
            </div>
            <h1>Placeholder for dashboard!</h1>
            <div class="card">
                <button type="button" onClick={() => setCount((count) => count + 1)}>
                    count is {count()}
                </button>
                <p>Developer stats coming soon.</p>
            </div>
        </>
    );
}

export default App;
