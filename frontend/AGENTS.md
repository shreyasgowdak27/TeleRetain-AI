# Frontend

## Overview

This is the retention dashboard UI. Staff view customer risk, open detail and predict modals, toggle theme, and talk to a sidebar chatbot. It is an internal React app, not a customer facing product.

## Key files

| File | Owns |
|---|---|
| `src/App.tsx` | Dashboard state, paging, stats, modal and sidebar open flags |
| `src/lib/api.ts` | Axios client to FastAPI at `http://localhost:8000` |
| `src/lib/theme.tsx` | `LIGHT` and `DARK` tokens plus `useTheme()` |
| `src/lib/format.ts` | Risk badges, reason labels, progress colors |
| `src/components/` | Table, filters, modals, sidebar, account menu, theme toggle |
| `src/types.ts` | Shared TypeScript shapes |

## Commands

```bash
cd frontend
npm install
npm run dev
npm run build
npm run typecheck
```

## Conventions

- All backend calls go through `src/lib/api.ts`. Components do not import axios.
- Theme colors come from `useTheme()` tokens as inline `style`. Do not hardcode hex in a component. Add the token to both `LIGHT` and `DARK` instead.
- Tailwind classes handle spacing and layout. Color and theme values stay on the tokens object.
- Icons come from `lucide-react` only.
- `@supabase/supabase-js` is still in `package.json` but unused leftover from the Bolt.new scaffold. Do not build new code against it.
- There is no real auth. The staff name in `AccountDropdown` is hardcoded. Log out only closes the menu.

## Gotchas

- Search, risk filter, and paging run in the browser after `GET /customers` returns the full list.
- `answerQuestion()` in `api.ts` is still a local stub. It does not call `POST /chatbot/ask` yet. The RAG sidebar is unfinished on this side.
- Theme choice lives in React state only. A refresh returns to light.
- Click outside on the account menu checks the button ref. The portal menu is a separate node, so treat outside click logic with care.
- Machine is macOS with zsh. Run npm from `frontend/`.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
