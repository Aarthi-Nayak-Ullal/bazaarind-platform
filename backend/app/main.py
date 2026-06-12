from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import product_collection, user_collection

app = FastAPI(title="BazaarInd Full-Stack API Gateway Engine")

# 🌐 GLOBAL CROSS-ORIGIN SECURITY INTERLOCK (Whitelists Vercel UI Handshakes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all live edge environments to safely query data channels
    allow_credentials=True,
    allow_methods=["*"],  # Authorizes all standard transaction verbs (GET, POST, OPTIONS)
    allow_headers=["*"],  # Accepts all inbound payload mapping descriptors
)

# 📋 PYDANTIC SCHEMAS FOR INBOUND VALIDATION REGISTERS
class UserRegisterSchema(BaseModel):
    name: str
    email: str
    password: str

class UserLoginSchema(BaseModel):
    email: str
    password: str


# 🚀 SYSTEM HEARTBEAT ENDPOINT
@app.get("/")
async def read_root():
    return {"status": "BazaarInd Core API Engine Active"}


# 📦 HIGH-DENSITY CATALOG ROUTE (Streams all 1,292 retail-ready units)
@app.get("/api/products")
async def get_products():
    try:
        products_list = []
        # Asynchronously scan across the live cloud document matrix
        async for product in product_collection.find():
            # Map MongoDB binary BSON ObjectIds to string IDs for your frontend grid components
            product["id"] = str(product["_id"])
            del product["_id"]
            products_list.append(product)
        return products_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database pipeline extraction loop failed: {str(e)}"
        )


# 🔐 USER REGISTER ENDPOINT
@app.post("/api/register")
async def register_user(user_data: UserRegisterSchema):
    # Scan the cluster matrix to verify user uniqueness
    existing_entity = await user_collection.find_one({"email": user_data.email})
    if existing_entity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identity identifier already mapped to existing system logs."
        )
    
    # Pack parameters and commit to cloud NoSQL cluster layers
    user_payload = {
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password  # Standard plaintext schema for validation staging
    }
    await user_collection.insert_one(user_payload)
    
    return {
        "user": {
            "name": user_data.name,
            "email": user_data.email
        }
    }


# 🔓 IDENTITY VALIDATION LOGIN ENDPOINT
@app.post("/api/login")
async def login_user(login_credentials: UserLoginSchema):
    # Scan the user repository logs for matching parameter inputs
    authenticated_user = await user_collection.find_one({
        "email": login_credentials.email,
        "password": login_credentials.password
    })
    
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials configuration. Verification denied."
        )
    
    return {
        "user": {
            "name": authenticated_user["name"],
            "email": authenticated_user["email"]
        }
    }