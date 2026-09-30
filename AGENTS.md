## Application Building Context

Read the following files in order before implementing or making any
architectural decision:

1. `context/project-overview.md` — product definition, goals, features,
   and scope
2. `context/architecture.md` — system structure, boundaries, storage
   model, and invariants
3. `context/ui-context.md` — theme, colors, typography, and component
   conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping rules,
   and delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open
   questions, and next steps

Update `context/progress-tracker.md` after each meaningful implementation
change.

If implementation changes the architecture, scope, or standards
documented in the context files, update the relevant file before
continuing.

Guide Shreyas one step at a time and explain the reasoning behind
decisions — this is a real-world product, not an academic exercise, so
decisions should hold up against real usage and requirements, not just
sound defensible. Do not move on to a new unit or topic without his
explicit go-ahead.

## Context files

- [frontend/AGENTS.md](frontend/AGENTS.md): React Vite dashboard, theme tokens, axios client
- [backend/AGENTS.md](backend/AGENTS.md): FastAPI, Mongo access, predict and retention routes
- [backend/rag/AGENTS.md](backend/rag/AGENTS.md): Hybrid RAG ingest and retrieval, still wiring the UI
- [ml_model/AGENTS.md](ml_model/AGENTS.md): Committed pickle artifacts and training notebook