import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parent / ".env")

MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise RuntimeError("MONGODB_URI is not set")

client = MongoClient(MONGO_URI)
db = client["teleretain"]

customers_collection = db["customers"]

print("✅ Connected to MongoDB Atlas!")
