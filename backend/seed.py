import asyncio
import random
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://bazaar_admin:BazaarPass2026@bazaarind-cluster.toys3k4.mongodb.net/?appName=BazaarInd-Cluster"
DATABASE_NAME = "ecommerce"

CATEGORIES = ["Electronics", "Home & Kitchen", "Groceries", "Apparel", "Fitness & Lifestyle", "Footwear", "Books & Stationery"]

BRANDS = {
    "Electronics": ["boAt", "OnePlus", "Noise", "Realme", "Xiaomi", "Samsung", "Logitech", "Zebrunics", "Tata", "Syska"],
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

# 🛍️ PREMIUM STUDIO PACKSHOT NODES (Curated Amazon/Flipkart style e-commerce frames)
PRODUCT_IMAGE_STREAMS = {
    "Wireless Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
    "5G Smartphone": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
    "Smartwatch": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
    "MicroSD Card": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80",
    "Power Bank": "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=500&q=80",
    "TWS Earbuds": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80",
    "Optical Wired Mouse": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=500&q=80",
    "Dual Band WiFi Router": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80",
    "Soundbar": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80",
    "LED Flashlight": "https://images.unsplash.com/photo-1590135548644-8846c433177f?auto=format&fit=crop&w=500&q=80",
    "Mechanical Keyboard": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=500&q=80",
    "Bluetooth Speaker": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80",
    "Mixer Grinder": "https://images.unsplash.com/photo-1581646731595-15f1a55517be?auto=format&fit=crop&w=500&q=80",
    "Electric Kettle": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80",
    "Pressure Cooker": "https://images.unsplash.com/photo-1584990351321-8dd934c15ef1?auto=format&fit=crop&w=500&q=80",
    "Water Heater": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80",
    "Ceiling Fan": "https://images.unsplash.com/photo-1618941716939-556e099607eb?auto=format&fit=crop&w=500&q=80",
    "Dry Iron": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80",
    "Hand Blender": "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=500&q=80",
    "RO Water Purifier": "https://images.unsplash.com/photo-1609842761180-15d9307b6bfb?auto=format&fit=crop&w=500&q=80",
    "Thermosteel Flask": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80",
    "Vision Glass Set": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80",
    "Induction Cooktop": "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=500&q=80",
    "Non-Stick Cookware Set": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=500&q=80",
    "Shudh Chakki Atta 10kg": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80",
    "Kachi Ghani Mustard Oil 1L": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80",
    "Iodized Salt 1kg": "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=500&q=80",
    "Pure Ghee 1L": "https://images.unsplash.com/photo-1589227365533-cee630bd59bd?auto=format&fit=crop&w=500&q=80",
    "Premium Tea 1kg": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=500&q=80",
    "Rozana Basmati Rice 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80",
    "Turmeric Powder 200g": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80",
    "Masala Noodles Pack": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80",
    "Detergent Powder 5kg": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=500&q=80",
    "Liquid Handwash 1.5L": "https://images.unsplash.com/photo-1603306466153-810029bbd635?auto=format&fit=crop&w=500&q=80",
    "Slim Fit Cotton Shirt": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80",
    "Cotton Straight Kurta": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80",
    "Denim Jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
    "Polo Neck T-Shirt": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=500&q=80",
    "Formal Trousers": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80",
    "Traditional Saree": "https://images.unsplash.com/photo-1610030470224-3067b8f61605?auto=format&fit=crop&w=500&q=80",
    "Casual Blazer": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80",
    "Cotton Socks Pack": "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=500&q=80",
    "Leather Belt": "https://images.unsplash.com/photo-1624222247344-550fb8ef5582?auto=format&fit=crop&w=500&q=80",
    "Home Gym Dumbbell Set": "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=500&q=80",
    "Storm Football": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=80",
    "Anti-Skid Yoga Mat": "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=500&q=80",
    "Aviator Sunglasses": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80",
    "Leather Wallet": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80",
    "Analog Dial Watch": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80",
    "Polypropylene Suitcase": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=500&q=80",
    "Half Face Motorbike Helmet": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=500&q=80",
    "Scientific Calculator": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=500&q=80",
    "Running Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
    "Formal Leather Shoes": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=500&q=80",
    "Casual Sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
    "Sports Sandals": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=500&q=80",
    "Leather Slippers": "https://images.unsplash.com/photo-1605991538393-cf7a4194bab1?auto=format&fit=crop&w=500&q=80",
    "Walking Shoes": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=500&q=80",
    "Flip Flops Pack": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80",
    "Long Notebook Pack": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=500&q=80",
    "Stainless Steel Ball Pen": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=500&q=80",
    "Geometry Box Set": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=500&q=80",
    "Exam Clipboard": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=500&q=80",
    "Permanent Markers Pack": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=500&q=80",
    "The Psychology of Money": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80",
    "Atomic Habits": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
    "Rich Dad Poor Dad": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80",
    "Indian Polity Edition": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80"
}

SERIES_MODIFIERS = ["Pro Ultra", "Xtreme Edition", "Nordic Edition", "Classic Stealth", "Neo Elite", "Aero Sport", "Quantum Prime", "Signature Series", "Carbon Matte"]

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    products_collection = db["products"]
    
    print("Purging old fuzzy web layouts from cloud cluster...")
    await products_collection.delete_many({})
    
    generated_inventory = []
    modifier_counter = 0

    for category in CATEGORIES:
        brands = BRANDS[category]
        items = ITEMS[category]
        
        for brand in brands:
            for item in items:
                # 🎯 Pulls the exact high-fidelity product packshot URL directly
                image_target = PRODUCT_IMAGE_STREAMS.get(item, "https://images.unsplash.com/photo-1523275335684-37898b6baf30")
                
                for model_variant in range(1, 3):  
                    if category == "Electronics":
                        price = int(random.randint(299, 45000))
                    elif category in ["Home & Kitchen", "Apparel", "Footwear"]:
                        price = int(random.randint(499, 7999))
                    elif category == "Groceries":
                        price = int(random.randint(25, 1200))
                    else:
                        price = int(random.randint(99, 3500))
                    
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
        print(f"Successfully committed {len(generated_inventory)} Amazon/Flipkart style catalog assets!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())