import os
from motor.motor_asyncio import AsyncIOMotorClient

# Your exact production-ready cloud cluster URI string
CLOUD_MONGO_URL = "mongodb://aarthinayaku_db_user:iWpybLQfp8jCgINM@bazaarind-cluster.toys3k4.mongodb.net/?appName=BazaarInd-Cluster"

# Environment router: looks for system overrides, defaults to Atlas cloud link
MONGO_URL = os.getenv("MONGO_URL", CLOUD_MONGO_URL)
DATABASE_NAME = "ecommerce"

# Initialize the non-blocking asynchronous data client loop
client = AsyncIOMotorClient(MONGO_URL)
database = client[DATABASE_NAME]

# Production collection hooks
product_collection = database.get_collection("products")
user_collection = database.get_collection("users")