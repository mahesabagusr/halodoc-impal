# IMPAL Frontend — Code Location Guide

## Where Does New Code Go?

### New Page
- Create a folder inside `src/Pages/<FeatureName>/`
- Add the page component at `src/Pages/<FeatureName>/pages/YourPage.jsx`
- Register the route in `src/App.jsx`
- If it needs Navbar + Footer → nest it under the `PublicLayout` route
- If it's full-screen (e.g. chat, doctor dashboard) → add it as a **top-level route** outside `PublicLayout`

### New Reusable Component (shared across features)
- `src/components/YourComponent.jsx`


### New Feature-Scoped Component (used only inside one feature)
- `src/Pages/<FeatureName>/components/YourComponent.jsx`

### New Hook
- `src/hooks/useYourHook.js`
- Export it from `src/hooks/index.js` (barrel file)

### New API Call / Data Fetching
- Add a hook in `src/hooks/` using `useApiQuery` or `useApiMutation`
- Do **not** call `apiFetch` or `http` directly inside components

### New Constant / Config
- `src/constants/yourFile.js`
- Examples: status maps, enums, specialization lists

### New Utility / Helper
- If shared app-wide → `src/lib/yourUtil.js`
- If scoped to a feature → `src/Pages/<FeatureName>/helpers/yourUtil.js`

### New Layout / Shell
- `src/layout/YourLayout.jsx`
- Register it as a parent route in `src/App.jsx`

---

## Quick Reference

| What | Where |
|------|-------|
| Pages | `src/Pages/<Feature>/pages/` |
| Shared components | `src/components/` |
| Feature components | `src/Pages/<Feature>/components/` |
| Hooks | `src/hooks/` + export in `index.js` |
| API/HTTP config | `src/lib/axios.js` |
| Socket.IO | `src/lib/socket.js` |
| Auth state | `src/context/AuthContext.jsx` |
| Constants / enums | `src/constants/` |
| Shared utilities | `src/lib/` |
| Feature helpers | `src/Pages/<Feature>/helpers/` |
| Routes | `src/App.jsx` |
| Global styles | `src/index.css` |
| Static assets | `src/assets/` |

---

## Key Rules

1. **No raw `axios` in components** — use hooks from `src/hooks/`
2. **No new `io()` calls** — use `getSocket()` from `src/lib/socket.js`
3. **No path aliases** — use relative imports (`../../hooks`, `../../lib/axios`)
4. **All new hooks must be exported** from `src/hooks/index.js`
5. **TailwindCSS v4** — no `tailwind.config.js`, do NOT create one
6. **Icons** — use `lucide-react` only, no other icon libraries
