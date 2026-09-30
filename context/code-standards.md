# Code Standards

Written from what the codebase already does consistently — follow these
patterns rather than introducing new ones.

## General

- Keep modules single-purpose: `model.py` only loads/runs the model,
  `retention.py` only holds the reasoning rules, `database.py` is the only
  place that opens a MongoDB connection
- Fix root causes, not workarounds — the sklearn "no feature names" fix
  (wrapping input in a real `pd.DataFrame` with `feature_columns`) is the
  pattern to repeat, not suppressing warnings
- Non-obvious layout/scroll behavior gets a comment explaining *why*, not
  just what (see `.table-scroll` / `.header-scroll` in `index.css` for the
  style — short, explains the constraint being solved)

## TypeScript / React

- All theme-dependent styling reads from `useTheme()`'s `tokens` object,
  applied via inline `style={{ }}` — never hardcode a color hex in a
  component; add it to both `LIGHT` and `DARK` in `lib/theme.tsx` instead
- Structural/spacing styling stays as Tailwind utility classes; only
  color/theme values go inline
- Formatting/derivation helpers (`progressColor`, `riskBadgeStyle`,
  `formatReason`) live in `lib/format.ts`, not inline in components
- All backend calls go through `lib/api.ts` — components don't call
  `axios` directly
- When a click-outside handler needs to ignore clicks on a
  portal-rendered element (as in `AccountDropdown`), use a ref and
  `ref.current?.contains(target)` rather than relying on DOM position
- Icons: `lucide-react` only — don't introduce a second icon set

## FastAPI / Python

- Keep all MongoDB access behind `database.py` — routes don't open their
  own connections
- Any route touching the model reuses `model.py`'s existing
  `pd.DataFrame` + `feature_columns` pattern before calling `.predict()`
- Domain knowledge fed to the RAG pipeline (`backend/rag/data/`) must stay
  in sync with the actual `elif` rules in `retention.py` — if one changes,
  update the other in the same session

## Data and Storage

- Customer records, predictions, and offer status: MongoDB
- Domain knowledge for the chatbot: ChromaDB — never customer PII
- Model artifacts (`ml_model/churn_model.pkl`,
  `ml_model/feature_columns.pkl`): committed to the repo, loaded by
  `model.py` at runtime — not regenerated per-request

## File Organization (as it actually exists)

- `backend/` — FastAPI app, `database.py`, `main.py`, `model.py`,
  `retention.py`, `requirements.txt`
- `backend/rag/data/` — RAG domain knowledge text
- `backend/rag/ingest.py` — builds the on-disk Chroma store from that text
  (`python ingest.py` from `backend/rag/`); no FastAPI/Mongo imports
- `backend/rag/retrieval.py` — chatbot retrieval + prompt + Groq; Mongo
  goes through `database.customers_collection` only
- `data/` — the raw Telco churn CSV (top-level, not under `backend/`)
- `ml_model/` — training notebook + the two `.pkl` artifacts (top-level,
  not under `backend/`)
- `frontend/src/components/` — `AISidebar`, `AccountDropdown`,
  `CustomerModal`, `CustomerTable`, `Filters`, `PredictModal`, `StatCard`,
  `ThemeToggle`
- `frontend/src/lib/` — `api.ts` (backend calls), `format.ts` (display
  helpers), `theme.tsx` (theme context + tokens)

## Never Commit

- `backend/.env` (secrets)
- `backend/__pycache__/`, any `.pyc`
- `node_modules/`, `dist/`
- `.DS_Store`
## Error Handling

- No silent failures. Every route and pipeline function must fail loudly:
  catch exceptions and return a proper HTTP error (with a real status
  code and message), never swallow an exception and return an empty or
  default response. The Predict Customer button's silently-dying spinner
  is the bug pattern to avoid — it's a known open bug, not a precedent.

## Database Access

- Reuse the existing MongoDB connection/client from `backend/database.py`
  for all new backend code. Do not instantiate a new client or open a new
  connection elsewhere in the codebase.

## Code Comments

- Comment code for learning, not just function. This is a learning
  project — explain what each step does and why, in plain language,
  using TeleRetain's own data/logic as the example, not generic
  boilerplate comments.