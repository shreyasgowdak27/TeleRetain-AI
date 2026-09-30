# TeleRetain AI

**Official title:** Telecom Churn Prediction and Retention Using an AI-Powered Chatbot
**Tagline:** Predict. Understand. Retain.

## Overview

TeleRetain AI is an internal B2B dashboard for telecom retention teams — not
a customer-facing product. It lets a retention team identify which customers
are at risk of churning, understand *why* (via an AI chatbot grounded in the
actual retention logic), and act by assigning retention offers. Built as a
college capstone project (guided by Prof. Honnaraju B; team: Shreyas, Arfeen,
Ashray Kowshik V, Poornima).

## Goals

1. Predict churn risk for telecom customers using a trained ML model
   (Random Forest, ROC-AUC ~0.82) on real IBM Telco Churn data.
2. Explain *why* a customer is at risk in plain language via a RAG-backed
   chatbot, grounded in the same rules the retention logic actually uses.
3. Let staff act on that insight by viewing customer detail and updating
   retention offer status, with changes persisting.

## Core User Flow

1. Staff opens the dashboard and sees the customer table with risk tiers
   (Low / Medium / High).
2. Staff opens a customer's detail modal to see their profile and risk reason.
3. Staff runs a new prediction for a customer via the Predict Customer modal.
4. Staff asks the AI sidebar chatbot follow-up questions about a customer or
   about churn concepts in general.
5. Staff updates the customer's retention offer status; the change persists
   after refresh.

## Features

### Dashboard
- Customer table with risk tiers (Low / Medium / High), seeded from the real
  7,032-row IBM Telco Churn dataset
- Customer detail modal with offer status update

### Prediction
- Predict Customer modal — runs the trained model against a customer and
  writes the result back via `insertPrediction()`

### AI Chatbot (RAG)
- Sidebar chatbot exposed via `POST /chatbot/ask`
- Hybrid retrieval: live MongoDB lookup for customer-specific facts,
  ChromaDB for static domain knowledge (churn concepts, risk tiers, reason
  categories, offer mapping)

### Account / Theme
- Theme toggle (light/dark)
- Decorative sign-out flow (see Scope — no real auth backend)

## Scope

### In Scope
- Churn prediction, risk tiering, and reason explanation for existing
  customer records
- RAG chatbot answering questions about churn risk and retention concepts
- Retention offer tracking (status only, no offer fulfillment/CRM
  integration)
- Render deployment of the backend

### Out of Scope
- Real authentication / multi-user accounts (decided against, given the
  project deadline — the sign-out flow is decorative only)
- Editing or ingesting new customer records beyond the seeded dataset
- Any production-grade billing, CRM, or telecom system integration
- Currency/locale conversion beyond what's explicitly decided (see
  `progress-tracker.md` — Open Questions)

## Success Criteria

1. A retention staff member can view a customer's risk tier and see a
   plain-language reason for it.
2. Running a prediction for a customer produces a real model output and
   persists it.
3. The chatbot answers customer-specific questions from live MongoDB data
   and general churn questions from the ChromaDB domain knowledge, without
   mixing the two up.
4. Updating a customer's offer status persists across a page refresh.
5. The backend is deployed and reachable on Render.
