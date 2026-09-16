from pymongo import MongoClient

MONGO_URI = "mongodb+srv://Shreyas_db_user:TeleRetain2026@cluster0.1ja94wl.mongodb.net/teleretain?appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client["teleretain"]

customers_collection = db["customers"]

print("✅ Connected to MongoDB Atlas!")