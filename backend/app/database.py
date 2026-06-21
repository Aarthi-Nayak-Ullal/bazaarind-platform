import os
import redis.asyncio as redis
from motor.motor_asyncio import AsyncIOMotorClient

# --- MONGODB SETUP ---
CLOUD_MONGO_URL = "mongodb+srv://bazaar_admin:BazaarPass2026@bazaarind-cluster.toys3k4.mongodb.net/?appName=BazaarInd-Cluster"
MONGO_URL = os.getenv("MONGO_URL", CLOUD_MONGO_URL)
DATABASE_NAME = "ecommerce"

# Initialize the non-blocking asynchronous data client loop
client = AsyncIOMotorClient(MONGO_URL)
database = client[DATABASE_NAME]

# Production collection hooks
product_collection = database.get_collection("products")
user_collection = database.get_collection("users")

# --- REDIS CACHE SETUP ---
# Defaults to localhost for your local testing, but uses Render's REDIS_URL in production
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Create an async Redis connection pool
redis_client = redis.from_url(REDIS_URL, decode_responses=True)