import asyncio
import random
from motor.motor_asyncio import AsyncIOMotorClient

# 🌐 SECURE CLOUD DATABASE MATRIX CONNECTION CHANNELS
MONGO_URL = "mongodb+srv://bazaar_admin:BazaarPass2026@bazaarind-cluster.toys3k4.mongodb.net/?appName=BazaarInd-Cluster"
DATABASE_NAME = "ecommerce"

CATEGORIES = ["Electronics", "Home & Kitchen", "Groceries", "Apparel", "Fitness & Lifestyle", "Footwear", "Books & Stationery"]

BRANDS = {
    "Electronics": ["boAt", "OnePlus", "Noise", "Realme", "Xiaomi", "Samsung", "Logitech", "Zebronics", "Tata", "Syska"],
    "Home & Kitchen": ["Prestige", "Pigeon", "Hawkins", "Bajaj", "Orient", "Philips", "Kent", "Eureka Forbes", "Milton", "Borosil"],
    "Groceries": ["Aashirvaad", "Fortune", "Tata", "Amul", "Daawat", "Catch", "Maggi", "Surf Excel", "Dettol", "Saffola"],
    "Apparel": ["Peter England", "Biba", "Fabindia", "Allen Solly", "Raymond", "Manyavar", "Levis", "Wrogn", "Van Heusen"],
    "Fitness & Lifestyle": ["Nivia", "Kore", "Strauss", "Decathlon", "Puma", "Nike", "Adidas", "Fastrack", "Titan", "Vega"],
    "Footwear": ["Bata", "Sparx", "Paragon", "Campus", "Red Tape", "Khadim", "Woodland", "Liberty", "Puma"],
    "Books & Stationery": ["Classmate", "Parker", "Luxor", "Camlin", "Rorito", "Penguin Books", "HarperCollins", "Rupa Publications"]
}

ITEMS = {
    "Electronics": ["Wireless Headphones", "5G Smartphone", "Smartwatch", "MicroSD Card", "Power Bank", "TWS Earbuds", "Optical Wired Mouse", "Dual Band WiFi Router", "Soundbar", "LED Flashlight", "Mechanical Keyboard", "Bluetooth Speaker"],
    "Home & Kitchen": ["Mixer Grinder", "Electric Kettle", "Pressure Cooker", "Water Heater", "Ceiling Fan", "Dry Iron", "Hand Blender", "RO Water Purifier", "Thermosteel Flask", "Vision Glass Set", "Induction Cooktop", "Non-Stick Cookware Set"],
    "Groceries": ["Shudh Chakki Atta 10kg", "Kachi Ghani Mustard Oil 1L", "Iodized Salt 1kg", "Pure Ghee 1L", "Premium Tea 1kg", "Rozana Basmati Rice 5kg", "Turmeric Powder 200g", "Masala Noodles Pack", "Detergent Powder 5kg", "Liquid Handwash 1.5L"],
    "Apparel": ["Slim Fit Cotton Shirt", "Cotton Straight Kurta", "Denim Jeans", "Polo Neck T-Shirt", "Formal Trousers", "Traditional Saree", "Casual Blazer", "Cotton Socks Pack", "Leather Belt"],
    "Fitness & Lifestyle": ["Home Gym Dumbbell Set", "Storm Football", "Anti-Skid Yoga Mat", "Aviator Sunglasses", "Leather Wallet", "Analog Dial Watch", "Polypropylene Suitcase", "Half Face Motorbike Helmet", "Scientific Calculator"],
    "Footwear": ["Running Shoes", "Formal Leather Shoes", "Casual Sneakers", "Sports Sandals", "Leather Slippers", "Walking Shoes", "Flip Flops Pack"],
    "Books & Stationery": ["Long Notebook Pack", "Stainless Steel Ball Pen", "Geometry Box Set", "Exam Clipboard", "Permanent Markers Pack", "The Psychology of Money", "Atomic Habits", "Rich Dad Poor Dad", "Indian Polity Edition"]
}

# 🏷️ PREMIUM CATCHY EDITION PATH DESCRIPTORS
SERIES_MODIFIERS = ["Pro Ultra", "Xtreme Edition", "Nordic Edition", "Classic Stealth", "Neo Elite", "Aero Sport", "Quantum Prime", "Signature Series", "Carbon Matte"]

# 📸 HIGH-DIVERSITY UNIQUE IMAGE MATRIX POOLS (Ensures photos look completely different for all items)
CATEGORY_IMAGE_POOLS = {
    "Electronics": [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80", # Headphones
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80", # Phone
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80", # Camera/Watch
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80", # Pad
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80", # Buds
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=500&q=80", # Keyboard
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80", # Speaker
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=80"  # Audio Gear
    ],
    "Home & Kitchen": [
        "https://images.unsplash.com/photo-1581646731595-15f1a55517be?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1531234799389-dcd353c1394e?auto=format&fit=crop&w=500&q=80"
    ],
    "Groceries": [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?auto=format&fit=crop&w=500&q=80"
    ],
    "Apparel": [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80"
    ],
    "Fitness & Lifestyle": [
        "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=500&q=80"
    ],
    "Footwear": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=500&q=80"
    ],
    "Books & Stationery": [
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80"
    ]
}

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    products_collection = db["products"]
    
    await products_collection.delete_many({})
    generated_inventory = []
    
    print("Re-indexing high-fidelity brand profiles into cloud database layers...")
    
    # Track index counters to safely rotate picture pools using a modulo matrix
    img_rotation_counter = 0
    modifier_counter = 0

    for category in CATEGORIES:
        brands = BRANDS[category]
        items = ITEMS[category]
        image_pool = CATEGORY_IMAGE_POOLS[category]
        
        for brand in brands:
            for item in items:
                # 📸 Dynamic Image Rotation: Cycles unique images so adjacent items are different
                image_target = image_pool[img_rotation_counter % len(image_pool)]
                img_rotation_counter += 1
                
                for model_variant in range(1, 3):  
                    if category == "Electronics":
                        price = random.randint(299, 45000)
                    elif category in ["Home & Kitchen", "Apparel", "Footwear"]:
                        price = random.randint(499, 7999)
                    elif category == "Groceries":
                        price = random.randint(25, 1200)
                    else:
                        price = random.randint(99, 3500)
                    
                    # 🏷️ High-Impact Catchy Name Generator: Replaces generic text loops
                    series_tag = SERIES_MODIFIERS[modifier_counter % len(SERIES_MODIFIERS)]
                    modifier_counter += 1
                    
                    name = f"{brand} {item} ({series_tag} v{model_variant})"
                    stock = random.randint(5, 450)
                    
                    product_doc = {
                        "name": name,
                        "price": price,
                        "stock": stock,
                        "category": category,
                        "image_url": image_target
                    }
                    generated_inventory.append(product_doc)

    if generated_inventory:
        await products_collection.insert_many(generated_inventory)
        print(f"Successfully committed {len(generated_inventory)} robust product arrays!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())