"""
One-time (and re-runnable) ingest for TeleRetain's static domain knowledge.

This script is NOT the chatbot. It only:
  1. Reads backend/rag/data/domain_knowledge.md
  2. Splits it into overlapping text chunks
  3. Embeds those chunks with a local HuggingFace model
  4. Writes the vectors to a ChromaDB folder on disk

Customer records never go through here — Chroma is for concepts
(risk tiers, the six churn-reason rules, offer mapping), not PII.
"""

import shutil
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Paths are anchored to this file so `python ingest.py` works from any cwd.
RAG_DIR = Path(__file__).resolve().parent
KNOWLEDGE_PATH = RAG_DIR / "data" / "domain_knowledge.md"
CHROMA_DIR = RAG_DIR / "chroma_db"
ENV_PATH = RAG_DIR.parent / ".env"

# Named collection so the later chatbot can open the same store.
COLLECTION_NAME = "domain_knowledge"

# Large enough that the six elif-matching rules stay in one chunk;
# too small a size would split "high_bill" away from "general_risk".
CHUNK_SIZE = 1400
CHUNK_OVERLAP = 200


def main() -> None:
    # Same .env pattern as the rest of the backend (GROQ_API_KEY lives
    # there for the chatbot). This script does not call Groq itself.
    load_dotenv(ENV_PATH)

    # 1. Load the markdown that must stay in sync with retention.py.
    if not KNOWLEDGE_PATH.exists():
        raise FileNotFoundError(f"Domain knowledge file not found: {KNOWLEDGE_PATH}")

    raw_text = KNOWLEDGE_PATH.read_text(encoding="utf-8")
    print(f"Loaded domain knowledge from {KNOWLEDGE_PATH}")

    # 2. Chunk by paragraph/line first, then characters. Recursive splitter
    #    prefers keeping related lines together before cutting mid-sentence.
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = splitter.create_documents(
        [raw_text],
        metadatas=[{"source": str(KNOWLEDGE_PATH.name)}],
    )
    print(f"Created {len(chunks)} chunk(s)")

    # 3. Local embedding model — small, fast, no API key. The chatbot
    #    must use this same model_name or retrieval scores will be garbage.
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
    )

    # 4. Persist to disk (not in-memory) so embeddings survive restarts.
    #    Wipe the folder first so re-running ingest does not duplicate chunks.
    if CHROMA_DIR.exists():
        shutil.rmtree(CHROMA_DIR)

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=str(CHROMA_DIR),
        collection_name=COLLECTION_NAME,
    )
    # Chroma 0.4+ writes to persist_directory automatically; no persist() call.

    stored = vectorstore._collection.count()
    print(
        f"Persisted {stored} embedding(s) to {CHROMA_DIR} "
        f"(collection '{COLLECTION_NAME}') successfully."
    )


if __name__ == "__main__":
    main()
