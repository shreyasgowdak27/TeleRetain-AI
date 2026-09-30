# AI Workflow Rules

## Approach

Build incrementally, one unit at a time. This is a real-world product, not
an academic exercise — implement against what's documented in these
context files rather than inventing behavior, and explain the *why* so
decisions hold up against actual usage and requirements. Guide Shreyas one
step at a time; do not move on to the next topic or unit without his
explicit go-ahead.

## Scoping Rules

- Work on one feature unit at a time (e.g. finish the RAG chatbot backend
  route before touching the frontend chat sidebar wiring)
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single step (e.g. don't
  fix a frontend bug and change the RAG retrieval logic in the same pass)

## When to Split Work

Split a step if it combines:

- Frontend changes and backend/model changes
- The RAG pipeline and unrelated dashboard bugs
- Anything not clearly defined in `project-overview.md` or `architecture.md`

If a change can't be verified end to end quickly, the scope is too broad —
split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous (e.g. the INR/USD threshold question), flag
  it and resolve it explicitly rather than guessing — add it to
  `progress-tracker.md` under Open Questions if it's not resolved yet
- Do not add real authentication/session infrastructure — that's an
  explicit out-of-scope decision, not an oversight

## Protected Files — do not modify without explicit instruction

- `churn_model.pkl`, `feature_columns.pkl` — trained model artifacts
- `backend/.env` — secrets
- `seed_database.py` — reseeding would overwrite the real 7,032-customer
  dataset already loaded
- The `elif` rule structure in `retention.py` — if it changes, the RAG
  domain-knowledge text in `backend/rag/data/` must be updated in the same
  session (see `architecture.md` invariant 3)

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- Architecture or system boundaries → `architecture.md`
- New conventions or patterns → `code-standards.md`
- Feature scope → `project-overview.md`
- Anything else → `progress-tracker.md`

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. No console errors (frontend) / no unhandled exceptions (backend)
5. Shreyas has explicitly confirmed he's ready to move on
