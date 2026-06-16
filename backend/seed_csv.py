import pandas as pd
import pymongo

def get_image_for_category(category):
    # Professional image repository mapping to ensure unique, high-quality visuals
    mapping = {
        "Dairy": "https://images.unsplash.com/photo-1550583724-b2692b85b15f?auto=format&fit=crop&w=600&q=80",
        "Snacks": "https://images.unsplash.com/photo-1621072156802-e7ffe0d060e6?auto=format&fit=crop&w=600&q=80",
        "Grocery": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        "Kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
        "Personal Care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
    }
    return mapping.get(category, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80")

def seed_database_from_csv():
    # 1. Connect to MongoDB Atlas (Replace with your connection string)
    client = pymongo.MongoClient("mongodb+srv://bazaar_admin:BazaarPass2026@bazaarind-cluster.toys3k4.mongodb.net/?appName=BazaarInd-Cluster")
    db = client["bazaarind_db"]
    products_col = db["products"]
    
    # 2. Clear existing database to start fresh with your 2,000 products
    products_col.delete_many({})
    
    # 3. Load the CSV file
    df = pd.read_csv("fictional_indian_products_2000.csv")
    
    # 4. Transform and Prepare data
    products = []
    for _, row in df.iterrows():
        product = {
            "name": row["Product_Name"],
            "category": row["Category"],
            "brand": row["Brand"],
            "description": row["Description"],
            "price": float(row["Price_INR"]),
            "weight": row["Weight"],
            "flavor": row["Flavor"],
            # Assigning the reliable image URL based on the category
            "image_url": get_image_for_category(row["Category"]) 
        }
        products.append(product)
    
    # 5. Batch insert into the database
    if products:
        products_col.insert_many(products)
        print(f"✅ Successfully seeded {len(products)} products into your database!")

if __name__ == "__main__":
    seed_database_from_csv()