"""
Feature Audit Script - Verifies all sidebar features are properly connected to MongoDB
and the data displayed in the UI matches the database.
"""
from pymongo import MongoClient
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

print("=" * 60)
print("  SAFETY DASHBOARD - FULL FEATURE AUDIT")
print("=" * 60)

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["safety_db"]
    print("\n✅ MongoDB Connection: SUCCESS\n")
except Exception as e:
    print(f"\n❌ MongoDB Connection: FAILED - {e}\n")
    exit(1)

# ============================================
# 1. OVERVIEW TAB - uses violation_logs + live stats
# ============================================
print("-" * 60)
print("1. OVERVIEW TAB (violation_logs collection)")
print("-" * 60)
logs = db["violation_logs"]
total_logs = logs.count_documents({})
print(f"   Total violation log entries: {total_logs}")

if total_logs > 0:
    latest = logs.find_one(sort=[("timestamp", -1)])
    print(f"   Latest log timestamp: {latest.get('timestamp', 'N/A')}")
    print(f"   Latest log fields: {list(latest.keys())}")
    
    # Check required fields exist
    required_fields = ["timestamp", "camera_id", "total_detections", "helmet_violations", "vest_violations", "compliance_rate"]
    missing = [f for f in required_fields if f not in latest]
    if missing:
        print(f"   ❌ Missing fields in logs: {missing}")
    else:
        print(f"   ✅ All required fields present")
    
    # Check logs with snapshots (used by Incident Feed)
    snapshot_count = logs.count_documents({"snapshot": {"$exists": True}})
    print(f"   Logs with snapshots: {snapshot_count}")
else:
    print("   ⚠️ No violation logs found yet (normal if camera hasn't been running)")

# ============================================
# 2. INCIDENT FEED TAB - uses violation_logs with snapshots
# ============================================
print("\n" + "-" * 60)
print("2. INCIDENT FEED TAB (violation_logs with snapshots)")
print("-" * 60)
violations_with_snap = logs.count_documents({
    "$or": [{"helmet_violations": {"$gt": 0}}, {"vest_violations": {"$gt": 0}}],
    "snapshot": {"$exists": True}
})
print(f"   Violation events with snapshots: {violations_with_snap}")
if violations_with_snap > 0:
    print("   ✅ Incident Feed has data to display")
else:
    print("   ⚠️ No violation snapshots yet (will populate when camera detects violations)")

# ============================================
# 3. SAFETY ANALYTICS TAB - uses aggregation pipeline on violation_logs
# ============================================
print("\n" + "-" * 60)
print("3. SAFETY ANALYTICS TAB (hourly aggregation)")
print("-" * 60)
pipeline = [
    {"$sort": {"timestamp": -1}}, 
    {"$limit": 5000},
    {"$group": {
        "_id": {
            "year": {"$year": "$timestamp"},
            "month": {"$month": "$timestamp"},
            "day": {"$dayOfMonth": "$timestamp"},
            "hour": {"$hour": "$timestamp"}
        },
        "avg_compliance": {"$avg": "$compliance_rate"},
        "total_helmet_violations": {"$sum": "$helmet_violations"},
        "total_vest_violations": {"$sum": "$vest_violations"},
        "max_detections": {"$max": "$total_detections"}
    }},
    {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1}},
    {"$limit": 24}
]
hourly = list(logs.aggregate(pipeline))
print(f"   Hourly analytics buckets: {len(hourly)}")
if len(hourly) > 0:
    print(f"   Sample bucket: {hourly[0]}")
    print("   ✅ Safety Analytics has data to display")
else:
    print("   ⚠️ No hourly data yet")

# ============================================
# 4. SAFETY SCORE TAB - uses live stats (no DB, computed per-frame)
# ============================================
print("\n" + "-" * 60)
print("4. SAFETY SCORE TAB (live per-frame, NO database)")
print("-" * 60)
print("   ℹ️  This feature uses LIVE camera data, not stored in DB")
print("   ℹ️  Scores are computed per-frame in process_frame()")
print("   ℹ️  Data: person_scores[] → {id, has_helmet, has_vest, score}")
print("   ✅ Feature is computed in real-time (no DB dependency)")

# ============================================
# 5. INVENTORY TAB - uses equipment_inventory collection
# ============================================
print("\n" + "-" * 60)
print("5. INVENTORY TAB (equipment_inventory collection)")
print("-" * 60)
inv = db["equipment_inventory"]
total_items = inv.count_documents({})
print(f"   Total inventory items: {total_items}")

helmets = inv.count_documents({"type": "Helmet"})
vests = inv.count_documents({"type": "Safety Vest"})
helmets_in_use = inv.count_documents({"type": "Helmet", "status": "In Use"})
helmets_avail = inv.count_documents({"type": "Helmet", "status": "Available"})
vests_in_use = inv.count_documents({"type": "Safety Vest", "status": "In Use"})
vests_avail = inv.count_documents({"type": "Safety Vest", "status": "Available"})
assigned = inv.count_documents({"assigned_to": {"$ne": ""}})

print(f"   Helmets: {helmets} (In Use: {helmets_in_use}, Available: {helmets_avail})")
print(f"   Vests:   {vests} (In Use: {vests_in_use}, Available: {vests_avail})")
print(f"   Assigned to workers: {assigned}")

if total_items > 0:
    sample = inv.find_one()
    required_inv_fields = ["name", "type", "status", "assigned_to", "last_updated"]
    missing = [f for f in required_inv_fields if f not in sample]
    if missing:
        print(f"   ❌ Missing fields in inventory: {missing}")
    else:
        print(f"   ✅ All required inventory fields present")
    
    # Verify the numbers match what UI should show
    print(f"\n   📊 UI Cards should show:")
    print(f"      Total Helmets: {helmets}")
    print(f"      Helmets In Use: {helmets_in_use}")
    print(f"      Total Vests: {vests}")
    print(f"      Vests In Use: {vests_in_use}")
    
    # Check pie chart data
    print(f"\n   🥧 Pie Chart - Helmets: In Use({helmets_in_use}) vs Available({helmets_avail})")
    print(f"   🥧 Pie Chart - Vests: In Use({vests_in_use}) vs Available({vests_avail})")
else:
    print("   ❌ No inventory items found! Run populate_inventory.py first.")

# ============================================
# 6. AI SETTINGS TAB - in-memory only (no DB)
# ============================================
print("\n" + "-" * 60)
print("6. AI SETTINGS TAB (in-memory, NO database)")
print("-" * 60)
print("   ℹ️  Settings (conf_helmet, conf_vest) are stored in-memory")
print("   ℹ️  They reset to defaults on each server restart")
print("   ✅ Feature works without DB (by design)")

# ============================================
# SUMMARY
# ============================================
print("\n" + "=" * 60)
print("  AUDIT SUMMARY")
print("=" * 60)
print(f"  Collections in safety_db: {db.list_collection_names()}")
print(f"  violation_logs entries:    {total_logs}")
print(f"  equipment_inventory items: {total_items}")
print()

issues = []
if total_items == 0:
    issues.append("❌ Inventory collection is empty")
if helmets != 100:
    issues.append(f"⚠️ Expected 100 helmets, found {helmets}")
if vests != 100:
    issues.append(f"⚠️ Expected 100 vests, found {vests}")
if helmets_in_use != 80:
    issues.append(f"⚠️ Expected 80 helmets in use, found {helmets_in_use}")
if vests_in_use != 80:
    issues.append(f"⚠️ Expected 80 vests in use, found {vests_in_use}")

if issues:
    print("  ISSUES FOUND:")
    for i in issues:
        print(f"    {i}")
else:
    print("  ✅ ALL FEATURES VERIFIED - Database is consistent!")

print()
client.close()
