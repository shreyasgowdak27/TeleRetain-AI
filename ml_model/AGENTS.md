# ML model artifacts

## Overview

Trained Random Forest artifacts and the notebook that produced them. The FastAPI process loads the pickle files at import time. They live at the repo root under `ml_model/`, not inside `backend/`.

## Key files

| File | Owns |
|---|---|
| `churn_model.pkl` | Committed scikit learn model used by `backend/model.py` |
| `feature_columns.pkl` | Column order the model expects |
| `churn_analysis.ipynb` | Training notebook (IBM Telco Churn, SMOTE) |

## Conventions

- Do not edit, regenerate, or replace the two `.pkl` files unless Shreyas explicitly asks.
- `backend/model.py` resolves paths as `../ml_model/` from the backend folder. Keep that layout.
- The raw training CSV lives in top level `data/`, not here.

## Gotchas

- A bad or missing pickle will crash the backend on startup, because `model.py` loads them at import.
- Feature names in `feature_columns.pkl` include values with spaces and hyphens (for example `InternetService_Fiber optic` and `Contract_Month-to-month`). The FastAPI payload maps slightly different Pydantic field names onto those keys in `main.py`.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
