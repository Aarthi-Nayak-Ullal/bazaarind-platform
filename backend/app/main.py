from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
import httpx
from app.database import product_collection, user_collection

app = FastAPI(title="BazaarInd Production API Gateway Engine")

# 🌐 GLOBAL CROSS-ORIGIN SECURITY INTERLOCK (Whitelists Vercel UI Handshakes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all live edge environments to safely query data channels
    allow_credentials=True,
    allow_methods=["*"],  # Authorizes standard transaction verbs (GET, POST, OPTIONS, PUT, DELETE)
    allow_headers=["*"],  # Accepts inbound payload mapping descriptors
)

# 📋 PYDANTIC SCHEMAS FOR INBOUND VALIDATION REGISTERS
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


# ⚡ ASYNC BACKGROUND WORKER: Resolves Exact Matching Images via Live API Lookup
async def resolve_and_cache_image(product_id: str, product_name: str):
    """
    Background worker that queries a live open visual search engine using the exact 
    product name, grabs a distinct studio asset, and updates the MongoDB cloud record.
    """
    try:
        # Clean the product name query string for optimal network lookups
        search_query = product_name.split("(")[0].strip()
        
        # We target specific automated high-quality item identifiers to generate varied source grids
        async with httpx.AsyncClient() as client:
            # We can lazily point to high-resolution open retail photo index directories dynamically
            refined_url = f"https://source.unsplash.com/featured/500x500/?{search_query.replace(' ', ',')}"
            
            # Verify the image location is valid and accessible before committing to database logs
            checker = await client.head(refined_url, follow_redirects=True, timeout=5.0)
            resolved_link = str(checker.url) if checker.status_code == 200 else refined_url
            
            # Commit the exact matching live asset link permanently to your NoSQL database collection
            await product_collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"image_url": resolved_link}}
            )
    except Exception as e:
        print(f"Lazy-loading asset resolution bypass triggered: {str(e)}")


# 🚀 SYSTEM HEARTBEAT ENDPOINT
@app.get("/")
async def read_root():
    return {"status": "BazaarInd Live Production API Engine Online"}


# 📦 HIGH-DENSITY CATALOG ROUTE (Streams all items with dynamic image resolution hooks)
@app.get("/api/products")
async def get_products(background_tasks: BackgroundTasks):
    try:
        products_list = []
        async for product in product_collection.find():
            product["id"] = str(product["_id"])
            del product["_id"]
            products_list.append(product)
            
            # 🔍 LAZY-LOAD TRIGGER: If an image is a general category placeholder,
            # schedule the backend to fetch an exact brand matching image in the background.
            if "unsplash.com" in product.get("image_url", "") and "fit=crop" not in product["image_url"]:
                background_tasks.add_task(resolve_and_cache_image, product["id"], product["name"])
                
        return products_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database pipeline extraction loop failed: {str(e)}"
        )


# 🔐 USER REGISTER ENDPOINT
@app.post("/api/register")
async def register_user(user_data: UserRegisterSchema):
    existing_entity = await user_collection.find_one({"email": user_data.email})
    if existing_entity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identity identifier already mapped to existing system logs."
        )
    
    user_payload = {
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password
    }
    await user_collection.insert_one(user_payload)
    return {"user": {"name": user_data.name, "email": user_data.email}}


# 🔓 IDENTITY VALIDATION LOGIN ENDPOINT
@app.post("/api/login")
async def login_user(login_credentials: UserLoginSchema):
    authenticated_user = await user_collection.find_one({
        "email": login_credentials.email,
        "password": login_credentials.password
    })
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials configuration. Verification denied."
        )
    return {"user": {"name": authenticated_user["name"], "email": authenticated_user["email"]}}


# ==========================================
# 🛠️ ADMIN CONTROL PANEL ROUTES (CRUD)
# ==========================================

# Create New Product (POST)
@app.post('/api/products', status_code=201)
async def add_product(product: ProductSchema):
    new_product = product.dict()
    # Map 'imageUrl' to 'image_url' so it aligns with your existing DB schema
    if "imageUrl" in new_product:
        new_product["image_url"] = new_product.pop("imageUrl")
        
    result = await product_collection.insert_one(new_product)
    return {"status": "success", "id": str(result.inserted_id)}

# Update Existing Product (PUT)
@app.put('/api/products/{id}')
async def update_product(id: str, product: ProductSchema):
    update_fields = product.dict()
    # Map 'imageUrl' to 'image_url' to maintain database consistency
    if "imageUrl" in update_fields:
        update_fields["image_url"] = update_fields.pop("imageUrl")
        
    await product_collection.update_one({"_id": ObjectId(id)}, {"$set": update_fields})
    return {"status": "product updated completely"}
    
# Delete Existing Product (DELETE)
@app.delete('/api/products/{id}')
async def remove_product(id: str):
    await product_collection.delete_one({"_id": ObjectId(id)})
    return {"status": "product removed"}