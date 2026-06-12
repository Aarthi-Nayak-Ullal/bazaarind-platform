from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from app.database import product_collection, user_collection

app = FastAPI(title="BazaarInd E-Commerce API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

@app.get("/")
async def root():
    return {"status": "online", "message": "BazaarInd Backend Processor running normally!"}

# Updated Product Catalog Route with Explicit Image Mapping Data Channels
@app.get("/api/products")
async def get_products():
    products = []
    async for product in product_collection.find():
        products.append({
            "id": str(product["_id"]),
            "name": product["name"],
            "price": product["price"],
            "stock": product["stock"],
            "category": product.get("category", "General"),
            "image_url": product.get("image_url", "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80") # Fallback layout default logic
        })
    return products

@app.post("/api/register")
async def register(user_data: UserRegisterSchema):
    existing_user = await user_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This email is already registered.")
    
    new_user = {
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password 
    }
    await user_collection.insert_one(new_user)
    return {"message": "Account registration successful!", "user": {"name": user_data.name, "email": user_data.email}}

@app.post("/api/login")
async def login(credentials: UserLoginSchema):
    user = await user_collection.find_one({"email": credentials.email})
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password parameters.")
    return {"message": "Authentication successful", "user": {"name": user["name"], "email": user["email"]}}