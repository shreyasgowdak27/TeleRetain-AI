# Backend

## Overview

FastAPI serves the dashboard. It predicts churn, lists and updates customers in MongoDB Atlas, and exposes the RAG chatbot route. Python runs inside `backend/venv` on macOS zsh.

## Key files

| File | Owns |
|---|---|
| `main.py` | Routes, CORS, request models |
| `database.py` | The only Mongo client and `customers_collection` |
| `model.py` | Loads `ml_model/churn_model.pkl` and `feature_columns.pkl`, runs predict |
| `retention.py` | Six `elif` churn reasons and matching offer text |
| `requirements.txt` | pip packages for the venv |
| `rag/` | Chatbot ingest and retrieval (see `rag/AGENTS.md`) |

## Commands

```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload
```

Install or add packages only after the venv is active, with pip. Do not use Conda.

## Conventions

- Keep modules single purpose. Routes do not open their own Mongo connections.
- Fail loudly. Catch errors and return a real HTTP status and message. Do not swallow exceptions into an empty body.
- Secrets belong in `backend/.env`. Never read that file into chat, never copy its values into any other file, never commit it.
- Do not add real login or session infrastructure unless Shreyas asks for it.
- `retention.py` reason keys (`high_bill`, `new_customer_risk`, `service_quality`, `loyalty_risk`, `missing_features`, `general_risk`) must stay aligned with `rag/data/domain_knowledge.md`.
- Model features missing from the payload default to 0 in `model.py`. That is a known gap, not a pattern to extend without an explicit decision.

## Gotchas

- Load the venv with `source venv/bin/activate` from `backend/` before uvicorn or pip.
- `model.py` builds a numpy row in `feature_columns` order, then `predict_proba`. `main.py` imports pandas but the live predict path uses that numpy row.
- `PATCH /customers/{id}/offer-status` takes `status` as a query param (`Pending`, `Accepted`, `Rejected`).
- `POST /chatbot/ask` is live. The React sidebar is not wired to it yet.
- Protected without an explicit ask: `backend/.env`, and the two files under `ml_model/` (`churn_model.pkl`, `feature_columns.pkl`).

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
