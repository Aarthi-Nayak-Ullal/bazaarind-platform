import os
from motor.motor_asyncio import AsyncIOMotorClient

CLOUD_MONGO_URL = "mongodb+srv://bazaar_admin:BazaarPass2026@bazaarind-cluster.toys3k4.mongodb.net/?appName=BazaarInd-Cluster"

# Environment router: looks for system overrides, defaults to Atlas cloud link
MONGO_URL = os.getenv("MONGO_URL", CLOUD_MONGO_URL)

# --- CHANGE THIS LINE ---
DATABASE_NAME = "bazaarind_db" 

# Initialize the non-blocking asynchronous data client loop
client = AsyncIOMotorClient(MONGO_URL)
database = client[DATABASE_NAME]

# Production collection hooks
product_collection = database.get_collection("products")
user_collection = database.get_collection("users")