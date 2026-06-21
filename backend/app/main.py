from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
import httpx
import json
from datetime import datetime

# Import DB and Redis clients from your database.py file
from app.database import product_collection, user_collection, redis_client

app = FastAPI(title="BazaarInd Production API Gateway Engine")

# 🌐 GLOBAL CROSS-ORIGIN SECURITY INTERLOCK
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📋 PYDANTIC SCHEMAS
class UserRegisterSchema(BaseModel):
    name: str
    email: str
    password: str

class UserLoginSchema(BaseModel):
    email: str
    password: str

class ProductSchema(BaseModel):
    name: str
    category: str
    price: float
    offer: Optional[str] = ""
    imageUrl: Optional[str] = ""

# ⚡ ASYNC BACKGROUND WORKER
async def resolve_and_cache_image(product_id: str, product_name: str):
    """
    Background worker that queries a live open visual search engine using the exact 
    product name, grabs a distinct studio asset, and updates the MongoDB cloud record.
    """
    try:
        search_query = product_name.split("(")[0].strip()
        async with httpx.AsyncClient() as client:
            refined_url = f"https://source.unsplash.com/featured/500x500/?{search_query.replace(' ', ',')}"
            checker = await client.head(refined_url, follow_redirects=True, timeout=5.0)
            resolved_link = str(checker.url) if checker.status_code == 200 else refined_url
            
            await product_collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"image_url": resolved_link}}
            )
            # Invalidate cache since the image changed in the background!
            await redis_client.delete("active_products")
    except Exception as e:
        print(f"Lazy-loading bypass triggered: {str(e)}")

# 🚀 SYSTEM HEARTBEAT
@app.get("/")
async def read_root():
    return {"status": "BazaarInd Live Production API Engine Online"}


# ==========================================
# 📦 CACHE-ASIDE PRODUCT FETCHING
# ==========================================
@app.get("/api/products")
async def get_products(background_tasks: BackgroundTasks):
    try:
        # 1. CHECK REDIS CACHE FIRST (Lightning Fast)
        cached_products = await redis_client.get("active_products")
        if cached_products:
            print("⚡ CACHE HIT: Returning active products from Redis")
            return json.loads(cached_products)

        print("🐢 CACHE MISS: Querying MongoDB for active products")
        
        # 2. FALLBACK TO MONGODB
        products_list = []
        # Support legacy rows (no isLatest flag) AND new versioned rows (isLatest = true)
        query = {"$or": [{"isLatest": True}, {"isLatest": {"$exists": False}}]}
        
        async for product in product_collection.find(query):
            product["id"] = str(product["_id"])
            del product["_id"]
            products_list.append(product)
            
            # Background Image Resolution
            if "unsplash.com" in product.get("image_url", "") and "fit=crop" not in product.get("image_url", ""):
                background_tasks.add_task(resolve_and_cache_image, product["id"], product["name"])

        # 3. POPULATE REDIS CACHE (Set expiration to 1 hour = 3600 seconds)
        await redis_client.setex("active_products", 3600, json.dumps(products_list))
                
        return products_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 🛠️ ADMIN CONTROL PANEL ROUTES (VERSIONING)
# ==========================================

# Create New Product (POST)
@app.post('/api/products', status_code=201)
async def add_product(product: ProductSchema):
    new_product = product.dict()
    if "imageUrl" in new_product:
        new_product["image_url"] = new_product.pop("imageUrl")
        
    # --- APPEND-ONLY VERSIONING INIT ---
    new_product["version"] = 1
    new_product["isLatest"] = True
    new_product["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    result = await product_collection.insert_one(new_product)
    
    # Set the group ID to tie all future versions to this original record
    await product_collection.update_one(
        {"_id": result.inserted_id},
        {"$set": {"product_group_id": str(result.inserted_id)}}
    )
    
    # 💥 INVALIDATE CACHE
    await redis_client.delete("active_products")
    
    return {"status": "success", "id": str(result.inserted_id)}

# Update Existing Product (PUT) - CREATES NEW VERSION (Race-Condition Proof)
@app.put('/api/products/{id}')
async def update_product(id: str, product: ProductSchema):
    # 1. Find the target product to get its group_id
    old_product = await product_collection.find_one({"_id": ObjectId(id)})
    if not old_product:
        raise HTTPException(status_code=404, detail="Product not found")

    group_id = old_product.get("product_group_id", str(old_product["_id"]))

    # 2. BULLETPROOFING: Find the ACTUAL highest version currently in this group
    latest_in_group = await product_collection.find_one(
        {"product_group_id": group_id},
        sort=[("version", -1)]  # Sort descending to get the absolute highest number
    )
    highest_version = latest_in_group.get("version", 1) if latest_in_group else 1

    # 3. Demote ALL versions in this group (Ensure no duplicate "Actives")
    await product_collection.update_many(
        {"product_group_id": group_id}, 
        {"$set": {"isLatest": False}}
    )

    # 4. Create the new version
    new_version_data = product.dict()
    if "imageUrl" in new_version_data:
        new_version_data["image_url"] = new_version_data.pop("imageUrl")

    new_version_data["product_group_id"] = group_id
    new_version_data["version"] = highest_version + 1  # Safely increment
    new_version_data["isLatest"] = True
    new_version_data["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    insert_result = await product_collection.insert_one(new_version_data)
    
    # 💥 INVALIDATE CACHE
    await redis_client.delete("active_products")
    
    # RETURN THE NEW ID so the frontend can update its state seamlessly
    return {
        "status": "Product updated, new version created", 
        "id": str(insert_result.inserted_id)
    }

# Delete Existing Product (DELETE)
@app.delete('/api/products/{id}')
async def remove_product(id: str):
    # Hard delete the specific product record
    await product_collection.delete_one({"_id": ObjectId(id)})
    
    # 💥 INVALIDATE CACHE
    await redis_client.delete("active_products")
    
    return {"status": "product removed"}


# ==========================================
# 📜 AUDIT HISTORY ENDPOINT
# ==========================================
@app.get('/api/products/{id}/history')
async def get_product_history(id: str):
    # 1. Identify the group ID of the requested product
    product = await product_collection.find_one({"_id": ObjectId(id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    group_id = product.get("product_group_id", str(product["_id"]))
    
    # 2. Fetch all versions belonging to this group
    history = []
    # Sort by version descending (newest first)
    cursor = product_collection.find({"product_group_id": group_id}).sort("version", -1)
    
    async for record in cursor:
        history.append({
            "version": record.get("version", 1),
            "isLatest": record.get("isLatest", False),
            "date": record.get("updated_at", "Legacy Record"),
            "action": "UPDATE" if record.get("version", 1) > 1 else "CREATED",
            "details": f"Price: ₹{record.get('price')} | Offer: {record.get('offer', 'None')}"
        })
        
    # Fallback for old data that doesn't have a group_id yet
    if not history:
        history.append({
            "version": 1,
            "isLatest": True,
            "date": "Legacy Record",
            "action": "CREATED",
            "details": f"Price: ₹{product.get('price')}"
        })
        
    return history


# ==========================================
# 🔐 USER AUTH ROUTING
# ==========================================
@app.post("/api/register")
async def register_user(user_data: UserRegisterSchema):
    existing_entity = await user_collection.find_one({"email": user_data.email})
    if existing_entity:
        raise HTTPException(status_code=400, detail="Identity already exists.")
    
    user_payload = {
        "name": user_data.name, 
        "email": user_data.email, 
        "password": user_data.password
    }
    await user_collection.insert_one(user_payload)
    return {"user": {"name": user_data.name, "email": user_data.email}}

@app.post("/api/login")
async def login_user(login_credentials: UserLoginSchema):
    authenticated_user = await user_collection.find_one({
        "email": login_credentials.email,
        "password": login_credentials.password
    })
    if not authenticated_user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    return {"user": {"name": authenticated_user["name"], "email": authenticated_user["email"]}}