# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Active build — RAG chatbot integration

## Current Goal

- Complete the RAG chatbot pipeline and expose it as `POST /chatbot/ask`,
  then wire the frontend chat sidebar to it

## Completed

- MongoDB credential exposure fixed: password rotated, `.gitignore` added,
  GitHub history wiped/re-pushed, `database.py` reads from `.env`
- Real database wiring: `PredictModal.tsx`'s broken `computePrediction()`
  call replaced with real `insertPrediction()` + `reasonToSentence()`
- Backend confirmed connecting to MongoDB; `/customers` returns real data
- MongoDB seeded with all 7,032 real Telco customers (4,360 Low / 1,364
  Medium / 1,308 High risk)
- sklearn "no feature names" warning removed (`model.py` wraps input in
  `pd.DataFrame` with `feature_columns`)
- Predict Customer bug fixed (missing `setResult(pred)` call in
  `PredictModal.tsx`'s `handleSubmit`)
- Responsive layout bug fixed (`ThemeToggle.tsx` button missing `shrink-0`,
  causing overlap with the Predict Customer button)
- Log out flow fixed end-to-end: `AccountDropdown`'s outside-click handler
  now uses a `menuRef` + `contains(target)` check before closing; wired to
  `App.tsx`'s `loggedOut` state → `SignedOut.tsx`
- RAG groundwork: dependencies installed (`langchain`, `langchain-groq`,
  `langchain-community`, `chromadb`, `sentence-transformers`, `groq`,
  `python-dotenv`); Groq API key in `backend/.env`; `rag/data/` created;
  domain knowledge text drafted to match `retention.py`'s six `elif` rules
- RAG ingest script: `backend/rag/ingest.py` chunks `domain_knowledge.md`,
  embeds with `all-MiniLM-L6-v2`, and persists to `backend/rag/chroma_db/`
- RAG retrieval + API: `backend/rag/retrieval.py` (Mongo customer context,
  Chroma domain chunks, labeled prompt, ChatGroq) exposed as
  `POST /chatbot/ask` → `{ answer }`

## In Progress

- Frontend chat sidebar still uses the local `answerQuestion()` stub in
  `api.ts` — not yet wired to `POST /chatbot/ask`

## Next Up

1. Wire the frontend chat sidebar to `POST /chatbot/ask` using the existing
   axios pattern (`api.ts`)
2. Diagnose and fix the Predict Customer silent-spinner bug (check
   `/predict` status code + response body in the Network tab)
3. Resolve the INR/USD threshold decision (see Open Questions)
4. Fix Predict Customer modal running with no Customer ID selected
   (currently shows an arbitrary prediction instead of validating input)
5. End-to-end browser testing: customer table search/filters, AI sidebar,
   theme toggle, rest of responsive layout
6. Render deployment with updated env vars
7. UI polish: skeleton loaders, Bolt watermark removal
8. Full line-by-line code explanation pass (planned for after completion,
   for viva prep)

## Open Questions

- Currency/locale: Shreyas wants Indian telecom framing, but
  `MonthlyCharges` and the `> 70` threshold in `retention.py` are USD-scale.
  A superficial INR relabel without adjusting the threshold would be
  misleading — needs an explicit decision, not a silent relabel.
- `/predict` payload currently fills uncollected fields with defaults (0) —
  acknowledged gap, not yet addressed; decide whether/how to fix before
  final submission.
- `ui-context.md` colors/typography/component library are still placeholders
  — need to be pulled from the actual Tailwind config.

## Architecture Decisions

- Hybrid RAG retrieval (live MongoDB for customer data, ChromaDB for domain
  knowledge only) — chosen over naively vectorizing everything, so it can be
  defended as a deliberate design choice in the viva
- Groq over Ollama — disk space constraints on the M5, and Ollama won't run
  on Render
- No real authentication — decided against, given the deadline; the log-out
  flow is decorative only

## Session Notes

- Environment: MacBook Air M5, zsh, Python 3.14.3 via `venv` (no Conda),
  Cursor (free tier)
- Backend: `python -m uvicorn main:app --reload` from `backend/` (after
  `source venv/bin/activate`)
- Frontend: `npm run dev` from `frontend/`
- Shreyas wants to be guided one step at a time and given the reasoning
  behind decisions.
