import { useEffect, useRef } from "react"
import { deleteCookie, getCookie, setCookie } from "./Utilities"

const App: React.FC = () => {

  const cookieName = "auth-state"
  const originalState = useRef<string>(getCookie(cookieName) || crypto.randomUUID())

  const startAuth = () => {
    const bungieURL = `https://www.bungie.net/en/oauth/authorize?client_id=45432&response_type=code&state=${originalState.current}`
    console.log(bungieURL)
    window.location.href = bungieURL
  }

  useEffect(() => {
    // Function to parse URL parameters
    const getCodeFromUrl = (url: URL): string | null => {
      const state = url.searchParams.get("state")

      if (originalState.current === state) {
        const code = url.searchParams.get("code")
        if (code) {
          return code
        } else {
          throw new Error("No code in URL")
        }
      } else {
        throw new Error("State mismatch")
      }
    }

    const currentUrl = new URL(window.location.href);
    console.log("current:", currentUrl)
    const urlParams = getCodeFromUrl(currentUrl);

    console.log("orig:", originalState.current)

    // Check if 'state' matches the original state
    if (urlParams) {
      // Perform actions with 'code' and 'state'
      console.log("Authorization successful!")
      console.log("Code:", urlParams)
      // console.log('State:', state);
      // Clear the state cookie once used
      deleteCookie(cookieName)
    } else {
      console.error("Authorization failed. State mismatch.")
    }
  }, [])

  useEffect(() => {
    // Save the original state to a cookie with SameSite attribute. And expires using a date time in 15 minutes
    setCookie(cookieName, originalState.current,  { sameSite: "strict", expires: new Date(Date.now() + 15 * 60 * 1000)})
  }, [])

  return (
    <>
      <div></div>
      <h1>Ishtar For Web</h1>
      <div className="card">
        <button onClick={startAuth}>Auth</button>
      </div>
    </>
  )
}

export default App
