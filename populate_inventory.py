from pymongo import MongoClient
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

try:
    print("Connecting to MongoDB...")
    db_client = MongoClient(MONGO_URI)
    db = db_client["safety_db"]
    inventory_collection = db["equipment_inventory"]

    print("Clearing existing inventory...")
    inventory_collection.delete_many({})

    items = []
    print("Generating 100 helmets and 100 vests...")
    for i in range(1, 101):
        items.append({
            "name": f"helmet{i}",
            "type": "Helmet",
            "status": "In Use" if i <= 80 else "Available",
            "assigned_to": f"person{i}" if i <= 80 else "",
            "last_updated": datetime.datetime.now(datetime.timezone.utc)
        })
        items.append({
            "name": f"vest{i}",
            "type": "Safety Vest",
            "status": "In Use" if i <= 80 else "Available",
            "assigned_to": f"person{i}" if i <= 80 else "",
            "last_updated": datetime.datetime.now(datetime.timezone.utc)
        })

    print("Inserting 200 items into database...")
    result = inventory_collection.insert_many(items)
    print(f"Inventory populated successfully with {len(result.inserted_ids)} items.")
except Exception as e:
    print("Error:", e)
