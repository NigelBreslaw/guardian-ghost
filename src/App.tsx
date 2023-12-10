import { useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "./Utilities";

type AuthState =
	| "pre-auth"
	| "waiting-for-auth"
	| "waiting-for-token"
	| "authorized";

const App: React.FC = () => {
	const [authState, setAuthState] = useState<AuthState>("pre-auth");

	const cookieName = "auth-state";

	const startAuth = () => {
		const stateID = crypto.randomUUID();
		deleteCookie(cookieName);
		setCookie(cookieName, stateID, { sameSite: "strict", maxAge: 20 });

		const bungieURL = `https://www.bungie.net/en/oauth/authorize?client_id=45432&response_type=code&state=${stateID}`;
		window.location.href = bungieURL;
	};

	const determineState = () => {
		const cookie = getCookie(cookieName);

		if (cookie) {
			setAuthState("waiting-for-auth");
		}
		console.log("cookie", cookie);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: Should run once on mount
	useEffect(() => {
		determineState();
	}, []);

	useEffect(() => {
		if (authState === "waiting-for-auth") {
			const currentUrl = new URL(window.location.href);
			const code = currentUrl.searchParams.get("code");
			const state = currentUrl.searchParams.get("state");

			if (code && state) {
				console.log("Authorization successful!");
				console.log("Code:", code);
				console.log("State:", state);
				setAuthState("waiting-for-token");
				// Stop showing the returned token in the url
				// window.location.href = currentUrl.origin
			} else {
				deleteCookie(cookieName);
				console.error("Authorization failed. State mismatch.");
			}
		}

		if (authState === "waiting-for-token") {
			const currentUrl = new URL(window.location.href);
			window.location.href = currentUrl.origin;
			console.log("waiting for token");
		}
	}, [authState]);
	// useEffect(() => {
	//   // Function to parse URL parameters
	//   const getCodeFromUrl = (url: URL): string | null => {
	//     const state = url.searchParams.get("state")

	//     if (originalState.current === state) {
	//       const code = url.searchParams.get("code")
	//       if (code) {
	//         return code
	//       } else {
	//         throw new Error("No code in URL")
	//       }
	//     } else {
	//       throw new Error("State mismatch")
	//     }
	//   }

	//   const currentUrl = new URL(window.location.href);
	//   const urlParams = getCodeFromUrl(currentUrl);

	//   // Check if 'state' matches the original state
	//   if (urlParams) {
	//     // Perform actions with 'code' and 'state'
	//     console.log("Authorization successful!")
	//     console.log("Code:", urlParams)
	//     // console.log('State:', state);
	//     // Clear the state cookie once used
	//     deleteCookie(cookieName)
	//   } else {
	//     console.error("Authorization failed. State mismatch.")
	//   }
	// }, [])

	return (
		<>
			<h1>Ishtar For Web</h1>
			<h2>Auth State: {authState}</h2>

			<div>
				{authState === "pre-auth" && (
					<button type="button" onClick={startAuth}>
						Auth
					</button>
				)}
			</div>
		</>
	);
};

export default App;
