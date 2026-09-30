# Architecture Context

## Stack

| Layer      | Technology                                                              | Role                                     |
| ---------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| Frontend   | React + TypeScript + Vite, Tailwind CSS (originally scaffolded by Bolt.new) | Dashboard UI                              |
| Backend    | FastAPI (Python)                                                        | API layer                                 |
| Database   | MongoDB Atlas                                                           | Customer records, predictions, offer status |
| ML         | scikit-learn Random Forest (ROC-AUC ~0.82), trained on IBM Telco Churn + SMOTE | Churn prediction                          |
| RAG        | LangChain + ChromaDB + HuggingFace embeddings (`all-MiniLM-L6-v2`) + Groq | AI chatbot                                |
| Deployment | Render                                                                  | Backend hosting                           |

## System Boundaries (verified against the repo)

- `backend/` — FastAPI app: `main.py` (routes), `database.py` (Mongo
  connection), `model.py` (loads `ml_model/churn_model.pkl` +
  `ml_model/feature_columns.pkl`, runs predictions), `retention.py` (the
  rule-based reasoning logic), `requirements.txt`, `.env` (secrets, never
  committed)
- `backend/rag/data/` — domain knowledge text fed into ChromaDB; must stay
  in sync with the `elif` rules in `retention.py`
- `backend/rag/ingest.py` — standalone script that chunks, embeds, and
  persists that text to `backend/rag/chroma_db/` (gitignored, on-disk
  Chroma; never customer PII)
- `backend/rag/retrieval.py` — hybrid RAG: Mongo lookup + Chroma
  similarity search + Groq; FastAPI exposes this as `POST /chatbot/ask`
- `data/` — top-level, **not** under `backend/`: the raw
  `WA_Fn-UseC_-Telco-Customer-Churn.csv` (7,032-row IBM Telco dataset)
- `ml_model/` — top-level, **not** under `backend/`: `churn_analysis.ipynb`
  (training notebook) plus the two committed model artifacts
- `frontend/` — React/TS/Vite app: `src/App.tsx` (top-level state incl.
  `loggedOut`), `src/components/` (`AISidebar`, `AccountDropdown`,
  `CustomerModal`, `CustomerTable`, `Filters`, `PredictModal`, `StatCard`,
  `ThemeToggle`), `src/lib/` (`api.ts` — axios client to the real FastAPI
  routes, replacing Bolt.new's originally-scaffolded fake Supabase calls;
  `format.ts` — display helpers; `theme.tsx` — theme context + tokens)

## Storage Model

- **MongoDB Atlas**: customer records (seeded from the 7,032-row IBM Telco
  Churn dataset), prediction results, retention offer status
- **ChromaDB**: static domain knowledge only (churn concepts, risk tiers,
  reason categories, offer mapping) — never customer-specific data
- **File storage (repo)**: `ml_model/churn_model.pkl` and
  `ml_model/feature_columns.pkl` as committed model artifacts; secrets
  live only in `backend/.env`

## Auth and Access Model

- No real authentication or session backend exists. This was a deliberate
  decision given the project deadline.
- The staff name shown in `AccountDropdown` is hardcoded.
- The "Log out" flow is decorative front-end-only state (`App.tsx`'s
  `loggedOut` renders `SignedOut.tsx`) — it does not represent a real
  session boundary.
- Do not add real login/signup/session infrastructure without Shreyas's
  explicit instruction.

## Invariants

1. Secrets (MongoDB URI, Groq API key) live only in `backend/.env`, read via
   `python-dotenv` — never hardcoded, never committed. (This project has
   already had one credential leak; don't repeat it.)
2. RAG retrieval stays hybrid: customer-specific facts come from a live
   MongoDB lookup; ChromaDB is queried only for static domain knowledge.
   Never vectorize customer PII into ChromaDB.
3. The domain-knowledge text in `backend/rag/data/` must mirror the actual
   `elif`-chained rules in `retention.py` (`high_bill`, `new_customer_risk`,
   `service_quality`, `loyalty_risk`, `missing_features`, `general_risk`).
   If one changes, update the other in the same session.
4. Model input always goes through `pd.DataFrame` with `feature_columns` as
   column names before calling `.predict()` — this is what silenced the
   sklearn "no feature names" warning; don't regress it.
5. No real auth/session backend is added without explicit instruction (see
   Auth and Access Model above).
6. `@supabase/supabase-js` is still listed in `frontend/package.json` but
   is unused (leftover from the Bolt.new scaffold, confirmed via grep) —
   don't build new code against it; it's a removal candidate, not a
   pattern to follow.
