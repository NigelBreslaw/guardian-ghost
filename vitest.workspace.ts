import { defineWorkspace } from 'vitest/config'

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  'apps/*',
  "docs/*",
  {
    test: {
      
    }
  }
])
