# RAG chatbot

## Overview

Hybrid retrieval for the staff sidebar. Live customer facts come from MongoDB. Static churn concepts come from ChromaDB. Groq answers from a labeled prompt. This area is still being wired to the frontend.

## Key files

| File | Owns |
|---|---|
| `data/domain_knowledge.md` | Static text that must match `retention.py` rules |
| `ingest.py` | Chunk, embed, write `chroma_db/` (no FastAPI, no customer rows) |
| `retrieval.py` | Mongo lookup, Chroma search, Groq prompt, `ask_chatbot` |
| `chroma_db/` | On disk Chroma store, gitignored |

## Commands

```bash
cd backend
source venv/bin/activate
cd rag
python ingest.py
```

Re run ingest after you change `data/domain_knowledge.md`. The script wipes `chroma_db/` first so chunks do not duplicate.

## Conventions

- Never vectorize customer PII into Chroma. Customer records stay in Mongo only.
- Ingest and retrieval must use the same embedding name: `sentence-transformers/all-MiniLM-L6-v2`.
- Collection name is `domain_knowledge`.
- Chunk size 1400 with overlap 200 so the six reason rules stay together.
- Groq model in code is `llama-3.1-8b-instant`. Temperature stays low so the model does not invent extra rules.
- `ingest.py` may load `backend/.env` for the same pattern as the rest of the backend, but it does not call Groq. Do not print or copy env values.

## Gotchas

- If `chroma_db/` is missing, `POST /chatbot/ask` returns 503 until you run ingest.
- Frontend `answerQuestion()` still ignores this API. Changing retrieval does not change the sidebar until `api.ts` is wired.
- If you change the `elif` chain in `retention.py`, update `data/domain_knowledge.md` in the same session, then re run ingest.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
