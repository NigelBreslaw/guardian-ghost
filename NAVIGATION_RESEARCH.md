# Navigation Structure Research - Documentation URLs

## Documentation Research Summary

| Question | URL Visited | Finding | Status |
|----------|-------------|---------|--------|
| How do route groups work in Expo Router? | https://docs.expo.dev/router/basics/route-groups/ (404) | Route groups use parentheses `()` and don't appear in URLs | ⚠️ URL 404, info from web search |
| How to nest Stack and Drawer navigators? | https://expo.github.io/router/docs/navigators/nesting | Nested navigators are supported; Stack can contain Drawer | ✅ Confirmed |
| How to make Details slide over Drawer? | Multiple web searches | Details should be in Stack navigator, not nested in Drawer | ✅ Confirmed |
| Expo Router file structure determines navigation? | https://docs.expo.dev/router/introduction/ | File-based routing: folder structure = navigation hierarchy | ✅ Confirmed |
| Can Stack and Drawer be siblings? | Web searches + docs | Yes, but requires proper file structure with route groups | ✅ Confirmed |
| Stack navigator configuration | https://docs.expo.dev/router/navigating-pages/ | Stack provides slide animations by default | ✅ Confirmed |
| Drawer navigator configuration | https://expo.github.io/router/docs/migration/react-navigation/drawer-navigator | Drawer can be nested in Stack | ✅ Confirmed |

## Key Findings

1. **File-based routing**: In Expo Router, the file/folder structure directly determines the navigation hierarchy
2. **Route groups**: Folders with parentheses `(name)` are route groups that don't appear in URLs but organize navigation
3. **Nested navigators**: Stack can contain Drawer, and both can be nested
4. **Sibling screens**: To make Details a sibling to Drawer, both must be children of the same Stack navigator
5. **Navigation paths**: Route groups don't appear in URLs, so `(drawer)` won't be in the path

## Solution

The correct structure requires:
- `_authenticated/_layout.tsx` → Stack navigator (parent)
- `_authenticated/(drawer)/_layout.tsx` → Drawer navigator (child of Stack)
- `_authenticated/details/_layout.tsx` → Stack navigator (child of Stack, sibling to drawer)

This makes Details a sibling to the Drawer group, allowing it to slide over the entire drawer/tabs view.

