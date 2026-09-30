"""
Hybrid RAG helpers for the TeleRetain chatbot.

Two sources, never mixed in storage:
  - MongoDB  → one live customer record (facts: risk, reason, offer, features)
  - ChromaDB → static domain knowledge from ingest.py (what the six rules mean)

The LLM only sees both when we stitch them into a labeled prompt.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq

from database import customers_collection

# Same on-disk store ingest.py wrote. If this folder is missing, run ingest.py.
RAG_DIR = Path(__file__).resolve().parent
CHROMA_DIR = RAG_DIR / "chroma_db"
COLLECTION_NAME = "domain_knowledge"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Groq: fast enough for a sidebar, no local GPU. Temperature stays low so
# the model does not invent extra churn rules beyond retention.py.
GROQ_MODEL = "llama-3.1-8b-instant"

load_dotenv(RAG_DIR.parent / ".env")

# Loaded once per process — the MiniLM weights are slow to start, not per question.
_vectorstore: Chroma | None = None
_llm: ChatGroq | None = None


class CustomerNotFound(Exception):
    """Raised when MongoDB has no document for the given customerID."""


def get_customer_context(customer_id: str) -> dict | None:
    """Live MongoDB lookup. Returns the customer dict, or None if missing.

    This is a point-read of current offer_status / risk — not a vector search.
    Customer PII is never written into Chroma.
    """
    doc = customers_collection.find_one(
        {"customerID": customer_id},
        {"_id": 0},
    )
    return doc


def get_domain_context(question: str, k: int = 3) -> list[str]:
    """Top-k markdown chunks from the Chroma collection built by ingest.py.

    Must use the same embedding model as ingest, or similarity scores are meaningless.
    """
    vectorstore = _get_vectorstore()
    documents = vectorstore.similarity_search(question, k=k)
    return [doc.page_content for doc in documents]


def build_prompt(
    customer_context: dict,
    domain_chunks: list[str],
    question: str,
) -> str:
    """Merge the two sources into one prompt with hard section labels.

    The labels exist so Groq can tell a live customer fact (e.g. this
    person's churn_reason is high_bill) apart from the rule definition
    (what high_bill means, which offer it maps to).
    """
    customer_block = json.dumps(customer_context, indent=2, default=str)
    if domain_chunks:
        domain_block = "\n\n---\n\n".join(domain_chunks)
    else:
        domain_block = "(no matching domain-knowledge chunks)"

    return f"""You are TeleRetain AI, an internal assistant for a telecom retention team.

Use ONLY the two context sections below. Do not invent customer facts, churn rules, or offers.

How to choose a source:
- CUSTOMER DATA is a live MongoDB record. Use it for this customer's risk, reason, offer, and features.
- DOMAIN KNOWLEDGE is static retention logic (risk tiers, the six elif reasons, offer mapping). Use it to explain what those concepts mean.
- If the staff ask about this customer, ground the answer in CUSTOMER DATA and use DOMAIN KNOWLEDGE only to explain the labels.
- If the staff ask a general churn/retention question, use DOMAIN KNOWLEDGE. Mention this customer only if it helps.
- If the answer is not in the context, say you do not have that information.

=== CUSTOMER DATA (live MongoDB) ===
{customer_block}

=== DOMAIN KNOWLEDGE (ChromaDB) ===
{domain_block}

=== STAFF QUESTION ===
{question}
"""


def ask_chatbot(customer_id: str, question: str) -> str:
    """Run lookup → retrieve → prompt → Groq. Returns plain text.

    Missing customer IDs fail here (CustomerNotFound) instead of asking Groq
    to guess about a person who is not in the database.
    """
    customer_context = get_customer_context(customer_id)
    if customer_context is None:
        raise CustomerNotFound(f"No customer found with ID '{customer_id}'")

    domain_chunks = get_domain_context(question, k=3)
    prompt = build_prompt(customer_context, domain_chunks, question)

    llm = _get_llm()
    response = llm.invoke(prompt)
    answer = getattr(response, "content", None)
    if not answer:
        raise RuntimeError("Groq returned an empty response")
    return answer.strip()


def _get_vectorstore() -> Chroma:
    global _vectorstore
    if _vectorstore is not None:
        return _vectorstore

    if not CHROMA_DIR.exists():
        raise FileNotFoundError(
            f"Chroma store not found at {CHROMA_DIR}. Run backend/rag/ingest.py first."
        )

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    _vectorstore = Chroma(
        persist_directory=str(CHROMA_DIR),
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
    )
    if _vectorstore._collection.count() == 0:
        raise RuntimeError(
            f"Chroma collection '{COLLECTION_NAME}' is empty. Re-run ingest.py."
        )
    return _vectorstore


def _get_llm() -> ChatGroq:
    global _llm
    if _llm is not None:
        return _llm

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is missing from backend/.env")

    _llm = ChatGroq(
        model_name=GROQ_MODEL,
        temperature=0.2,
        groq_api_key=api_key,
    )
    return _llm
