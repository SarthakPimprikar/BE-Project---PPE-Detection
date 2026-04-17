import eventlet
eventlet.monkey_patch()

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

import cv2
import time
import base64
import numpy as np
import random
import datetime
import threading
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pymongo import MongoClient, ASCENDING, DESCENDING
from bson.objectid import ObjectId
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from workplace_safety_monitor import Monitor, build_argparser, logger
from identity_matching import IdentityMatcher

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# -------------------------------
# MongoDB Database Setup
# -------------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
try:
    db_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    db = db_client["safety_db"]
    logs_collection = db["violation_logs"]
    inventory_collection = db["equipment_inventory"]
    workers_collection = db["workers"]
    alerts_collection = db["alerts"]
    
    # Create required indexes for fast queries
    logs_collection.create_index([("timestamp", DESCENDING)])
    logs_collection.create_index([("camera_id", ASCENDING)])
    print("Successfully connected to MongoDB and verified indexes.")
except Exception as e:
    print(f"Warning: Could not connect to MongoDB. Is it running? ({e})")
    logs_collection = None
    inventory_collection = None
    workers_collection = None
    alerts_collection = None

# -------------------------------
# EMERGENCY NOTIFICATION CONFIG
# -------------------------------
# NOTE: Using environment variables for sensitive configuration
EMAIL_CONFIG = {
    "sender_email": os.getenv("SENDER_EMAIL", "your-email@gmail.com"),
    "sender_password": os.getenv("SENDER_PASSWORD", ""),
    "recipient_email": os.getenv("RECIPIENT_EMAIL", "recipient@gmail.com"),
    "smtp_server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
    "smtp_port": int(os.getenv("SMTP_PORT", 587)),
    "simulate": os.getenv("SIMULATE_EMAIL", "False").lower() == "true"
}

# -------------------------------
# TWO-FACTOR AUTHENTICATION (OTP)
# -------------------------------
OTP_EXPIRY = int(os.getenv("OTP_EXPIRY_SECONDS", 300))  # 5 minutes default
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "pansaresamruddhi397@gmail.com")
SUPERVISOR_EMAIL = os.getenv("SUPERVISOR_EMAIL", "moredevika44@gmail.com")

# In-memory OTP store: { session_key: { otp, email, role, expires_at } }
otp_store = {}

def generate_otp():
    """Generate a 6-digit OTP code."""
    return str(random.randint(100000, 999999))

def send_otp_email(recipient_email, otp_code, role):
    """Send OTP verification email for 2FA login."""
    if EMAIL_CONFIG["simulate"]:
        print(f"\n[SIMULATION] OTP Email sent to {recipient_email}")
        print(f"OTP Code: {otp_code} (Role: {role})\n")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG["sender_email"]
        msg['To'] = recipient_email
        msg['Subject'] = f"🔐 Vanguard AI - Your Login Verification Code"

        body = f"""
        🔐 Two-Factor Authentication
        
        Hello {role.capitalize()},
        
        Your one-time verification code for Vanguard AI Safety System is:
        
        ━━━━━━━━━━━━━━━━━━━━━━━
              {otp_code}
        ━━━━━━━━━━━━━━━━━━━━━━━
        
        This code will expire in {OTP_EXPIRY // 60} minutes.
        
        If you did not request this code, please ignore this email or contact your system administrator.
        
        Stay Safe,
        Vanguard AI Security System
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"])
        server.starttls()
        server.login(EMAIL_CONFIG["sender_email"], EMAIL_CONFIG["sender_password"])
        server.send_message(msg)
        server.quit()
        print(f"SUCCESS: OTP email sent to {recipient_email}")
        return True
    except Exception as e:
        print(f"EMAIL ERROR: Failed to send OTP email: {e}")
        return False

def cleanup_expired_otps():
    """Remove expired OTP entries from the store."""
    now = time.time()
    expired_keys = [k for k, v in otp_store.items() if v['expires_at'] < now]
    for k in expired_keys:
        del otp_store[k]

def send_sos_email(by="Admin"):
    if EMAIL_CONFIG["simulate"]:
        print(f"\n[SIMULATION] Email sent to {EMAIL_CONFIG['recipient_email']}")
        print(f"Subject: 🚨 EMERGENCY SOS ALERT - Workplace Safety")
        print(f"Message: An SOS alert has been triggered by {by}. Please check the Vanguard AI Dashboard immediately.\n")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG["sender_email"]
        msg['To'] = EMAIL_CONFIG["recipient_email"]
        msg['Subject'] = "🚨 EMERGENCY SOS ALERT - Vanguard AI Safety"

        body = f"""
        ⚠️ EMERGENCY SOS ALERT ⚠️
        
        This is an automated notification from the Vanguard AI Workplace Safety Monitoring System.
        
        An EMERGENCY SOS alert has just been triggered by: {by}
        Date: {datetime.datetime.now().strftime('%Y-%m-%d')}
        Time: {datetime.datetime.now().strftime('%H:%M:%S')}
        
        Please log in to the Supervisor Dashboard immediately to review the situation and take necessary action.
        
        Stay Safe,
        Vanguard AI System
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"])
        server.starttls()
        server.login(EMAIL_CONFIG["sender_email"], EMAIL_CONFIG["sender_password"])
        server.send_message(msg)
        server.quit()
        print(f"SUCCESS: Emergency email sent to {EMAIL_CONFIG['recipient_email']}")
        return True
    except Exception as e:
        print(f"EMAIL ERROR: Failed to send SOS alert email: {e}")
        return False

# Global stats
stats = {
    "total_detections": 0,
    "helmet_violations": 0,
    "vest_violations": 0,
    "system_status": "Online",
    "active_cameras": 1,
    "compliance_rate": 100
}

last_log_time = 0
last_violation_log_time = 0
latest_frame_bytes = None
is_ai_active = False # Manual Toggle for Detection
daily_person_scores = {}
worker_cache = {} # Map emp_id -> {name, photo}
id_map = {} # Map track_id -> {match_data, timestamp} (identity fusion with expiry)
matcher = IdentityMatcher()

def refresh_worker_cache():
    global worker_cache
    if workers_collection is not None:
        try:
            workers = list(workers_collection.find())
            new_cache = {str(w['_id']): w for w in workers}
            # Check if cache changed or matcher is empty
            if len(new_cache) != len(worker_cache) or not matcher.known_faces:
                print(f"DEBUG: Worker Directory updated. Refreshing AI encodings...")
                matcher.enroll_workers(new_cache)
            worker_cache = new_cache
        except Exception as e:
            print(f"DEBUG: Cache refresh error: {e}")
            pass

# Initialize Monitor with default args
class Args:
    source = '0'
    person_weights = ''
    person_conf = 0.45
    ppe_weights = '2best.pt'
    ppe_onnx = ''
    class_names = ['person', 'hardhat', 'no-hardhat', 'safety vest', 'no-safety vest', 'mask', 'no-mask']
    input_size = 640
    conf_helmet = 0.50
    conf_vest = 0.50
    nms_iou = 0.50
    min_box_area = 900
    max_aspect_ratio = 3.5
    head_iou_gate = 0.10
    torso_iou_gate = 0.15
    ppe_inside_person_frac = 0.35
    temporal_window = 7
    track_iou = 0.35
    track_max_age = 20
    save_vis = ''

mon = Monitor(Args())

def log_to_mongodb(out_frame, frame_stats):
    global last_log_time, last_violation_log_time
    current_time = time.time()
    
    # Limit DB insertions to max 1 per second to prevent frontend/backend lag
    if logs_collection is not None and (current_time - last_log_time >= 1.0):
        try:
            doc = {
                "timestamp": datetime.datetime.now(datetime.timezone.utc),
                "camera_id": str(mon.args.source),
                "total_detections": stats["total_detections"],
                "helmet_violations": stats["helmet_violations"],
                "vest_violations": stats["vest_violations"],
                "compliance_rate": stats["compliance_rate"]
            }
            
            # DEBOUNCE: Only save a snapshot once every 5 seconds to avoid spamming the same event
            if (stats["helmet_violations"] > 0 or stats["vest_violations"] > 0) and out_frame is not None:
                if (current_time - last_violation_log_time) >= 5.0:
                    thumb = cv2.resize(out_frame, (320, 180))
                    ret, buffer = cv2.imencode('.jpg', thumb, [cv2.IMWRITE_JPEG_QUALITY, 50])
                    if ret:
                        doc["snapshot"] = base64.b64encode(buffer).decode('utf-8')
                        last_violation_log_time = current_time
            
            logs_collection.insert_one(doc)
            last_log_time = current_time
        except Exception as e:
            pass

def camera_worker():
    global latest_frame_bytes
    print("Starting background AI inference stream...")
    # Initialize the camera using args source
    cap = cv2.VideoCapture(int(mon.args.source)) if str(mon.args.source).isdigit() else cv2.VideoCapture(mon.args.source)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1) # Prevent hardware frame buffer lag
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    while True:
        try:
            success, frame = cap.read()
            if not success:
                print("Warning: Camera read failed, retrying...")
                time.sleep(1)
                cap.release()
                cap = cv2.VideoCapture(int(mon.args.source)) if str(mon.args.source).isdigit() else cv2.VideoCapture(mon.args.source)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                continue
            
            # If AI is off, just show raw frame or nothing
            if not is_ai_active:
                ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
                if ret:
                    latest_frame_bytes = buffer.tobytes()
                time.sleep(0.1)
                continue
                
            # Process frame using our optimized Monitor
            frame = cv2.resize(frame, (640, 480))
            out_frame, frame_stats = mon.process_frame(frame)
            
            # Update global stats for the API
            stats["total_detections"] = frame_stats.get("people_count", 0)
            stats["helmet_violations"] = frame_stats.get("helmet_violations", 0)
            stats["vest_violations"] = frame_stats.get("vest_violations", 0)
            
            total_det = max(1, stats["total_detections"])
            comp_rate = 100.0 - (((stats["helmet_violations"] + stats["vest_violations"]) / float(total_det)) * 100.0)
            stats["compliance_rate"] = int(max(0, comp_rate))
            
            # Periodically refresh worker directory cache
            if int(time.time()) % 10 == 0:
                refresh_worker_cache()
            
            # Daily Score Logic: update the score list, store the lowest score for each person ID for the day
            scores = frame_stats.get("person_scores", [])
            
            # Identity Matching Logic (AI Identity Fusion)
            current_time = time.time()
            ID_MATCH_EXPIRY = 30  # Re-check identity every 30 seconds
            ID_RETRY_INTERVAL = 3  # Don't retry failed matches more than once per 3 seconds
            
            updated_scores = []
            for p in scores:
                pid = str(p['id'])
                
                # Check if we need to (re-)identify this person
                cached = id_map.get(pid)
                should_identify = False
                
                if cached is None:
                    # Never identified — try now
                    should_identify = True
                elif cached.get('name') == 'Unknown' and (current_time - cached.get('timestamp', 0)) > ID_RETRY_INTERVAL:
                    # Was marked unknown, retry after interval
                    should_identify = True
                elif cached.get('name') != 'Unknown' and (current_time - cached.get('timestamp', 0)) > ID_MATCH_EXPIRY:
                    # Matched identity expired, re-verify
                    should_identify = True
                
                if should_identify and 'box' in p:
                    box = p['box']
                    try:
                        x1, y1, x2, y2 = map(int, box)
                        h, w = frame.shape[:2]
                        x1, y1 = max(0, x1), max(0, y1)
                        x2, y2 = min(w, x2), min(h, y2)
                        
                        if x2 > x1 and y2 > y1:
                            crop = frame[y1:y2, x1:x2]
                            match = matcher.identify_person(crop)
                            if match:
                                id_map[pid] = {
                                    'name': match['name'],
                                    'photo': match.get('photo', ''),
                                    'confidence': match.get('confidence', 0),
                                    'timestamp': current_time
                                }
                                print(f"IDENTIFIED: Person #{pid} -> {match['name']} (conf: {match.get('confidence', '?')})")
                            else:
                                # Explicitly mark as Unknown so we don't spam retries
                                id_map[pid] = {
                                    'name': 'Unknown',
                                    'photo': '',
                                    'confidence': 0,
                                    'timestamp': current_time
                                }
                    except Exception as e:
                        print(f"ID error: {e}")
                
                # Attach data if we found a match (skip if Unknown)
                cached = id_map.get(pid)
                if cached and cached.get('name') != 'Unknown':
                    p['name'] = cached['name']
                    p['photo'] = cached.get('photo', '')
                
                updated_scores.append(p)
            
            stats["person_scores"] = updated_scores
            scores = updated_scores
            
            # Reset daily dictionary if it's a new day
            current_day = datetime.datetime.now().strftime('%Y-%m-%d')
            if getattr(camera_worker, 'current_day', None) != current_day:
                daily_person_scores.clear()
                camera_worker.current_day = current_day
                
            for p in scores:
                pid = p['id']
                # If we haven't seen this person, or their new score is HIGHER than their recorded score, update
                if pid not in daily_person_scores or p['score'] > daily_person_scores[pid]['score']:
                    daily_person_scores[pid] = dict(p)
                    daily_person_scores[pid]['last_seen'] = datetime.datetime.now().isoformat()

            # Log it dynamically! Pass frame for thumbnail extraction
            log_to_mongodb(out_frame, frame_stats)

            # Encode to JPEG for the web feed
            ret, buffer = cv2.imencode('.jpg', out_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if ret:
                latest_frame_bytes = buffer.tobytes()
                
            # Yield to Flask thread so GET requests don't hang
            time.sleep(0.01)
            
        except Exception as e:
            print(f"CAMERA WORKER CRASH AVOIDED: {e}")
            time.sleep(1)

# Start background camera processor thread that updates 24/7
worker_thread = threading.Thread(target=camera_worker, daemon=True)
worker_thread.start()

def gen_frames():
    global latest_frame_bytes
    while True:
        if latest_frame_bytes is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + latest_frame_bytes + b'\r\n')
        time.sleep(0.05) # 20fps logic lock

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@socketio.on('process_frame')
def handle_frame(data):
    # Backward compatibility for base64 fallback manually processed
    pass 

@app.route('/api/stats', methods=['GET'])
def get_stats():
    resp = dict(stats)
    resp["ai_active"] = is_ai_active
    return jsonify(resp)

@app.route('/api/toggle_ai', methods=['POST'])
def toggle_ai():
    global is_ai_active
    is_ai_active = not is_ai_active
    return jsonify({"success": True, "ai_active": is_ai_active})

@app.route('/api/daily_scores', methods=['GET'])
def get_daily_scores():
    # Return list of individuals sorted by most recently seen, capped at 50
    persons = list(daily_person_scores.values())
    persons.sort(key=lambda x: x.get('last_seen', ''), reverse=True)
    return jsonify(persons[:50])

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    if logs_collection is None:
        return jsonify({"success": False, "message": "MongoDB is not connected."})

    try:
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
        
        hourly_analytics = list(logs_collection.aggregate(pipeline))
        
        recent_events = list(logs_collection.find(
            {
                "$or": [{"helmet_violations": {"$gt": 0}}, {"vest_violations": {"$gt": 0}}],
                "snapshot": {"$exists": True}
            },
            {"_id": 0}
        ).sort("timestamp", DESCENDING).limit(50))

        return jsonify({
            "success": True,
            "hourly_analytics": hourly_analytics,
            "recent_violations": recent_events
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/settings', methods=['GET', 'POST'])
def handle_settings():
    if request.method == 'GET':
        return jsonify({
            "success": True,
            "conf_helmet": mon.args.conf_helmet,
            "conf_vest": mon.args.conf_vest,
            "source": str(mon.args.source)
        })
    elif request.method == 'POST':
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
            
        try:
            if 'conf_helmet' in data:
                val = float(data['conf_helmet'])
                mon.args.conf_helmet = val
                mon.assoc_cfg.conf_helmet = val
            if 'conf_vest' in data:
                val = float(data['conf_vest'])
                mon.args.conf_vest = val
                mon.assoc_cfg.conf_vest = val
                
            # Update the underlying YOLO model NMS
            if hasattr(mon, 'ppe_backend') and hasattr(mon.ppe_backend, 'conf_th'):
                mon.ppe_backend.conf_th = min(mon.args.conf_helmet, mon.args.conf_vest)
                
            return jsonify({
                "success": True, 
                "message": "AI thresholds updated instantly.",
                "conf_helmet": mon.args.conf_helmet,
                "conf_vest": mon.args.conf_vest
            })
        except Exception as e:
            return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/capture', methods=['POST'])
def capture_frame():
    global latest_frame_bytes
    if latest_frame_bytes is None:
        return jsonify({"success": False, "message": "No frame available"}), 400
    
    try:
        snapshot = base64.b64encode(latest_frame_bytes).decode('utf-8')
        # Create a "manual" incident object
        incident = {
            "timestamp": datetime.datetime.now().isoformat(),
            "camera_id": str(mon.args.source),
            "total_detections": stats["total_detections"],
            "helmet_violations": stats["helmet_violations"],
            "vest_violations": stats["vest_violations"],
            "compliance_rate": stats["compliance_rate"],
            "snapshot": snapshot,
            "type": "Manual Audit"
        }
        return jsonify({"success": True, "incident": incident})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    
    admin_usr = os.getenv("ADMIN_USERNAME", "admin")
    admin_pwd = os.getenv("ADMIN_PASSWORD", "admin")
    sup_usr = os.getenv("SUPERVISOR_USERNAME", "supervisor")
    sup_pwd = os.getenv("SUPERVISOR_PASSWORD", "supervisor")
    
    # Step 1: Validate credentials
    authenticated_role = None
    target_email = None
    
    if username == admin_usr and password == admin_pwd and role == 'admin':
        authenticated_role = 'admin'
        target_email = ADMIN_EMAIL
    elif username == sup_usr and password == sup_pwd and role == 'supervisor':
        authenticated_role = 'supervisor'
        target_email = SUPERVISOR_EMAIL
    
    if not authenticated_role:
        return jsonify({"success": False, "message": "Invalid credentials or wrong role selected"}), 401
    
    # Step 2: Generate OTP and send via email
    cleanup_expired_otps()
    otp_code = generate_otp()
    session_key = f"{authenticated_role}_{int(time.time())}_{random.randint(1000, 9999)}"
    
    otp_store[session_key] = {
        'otp': otp_code,
        'email': target_email,
        'role': authenticated_role,
        'expires_at': time.time() + OTP_EXPIRY,
        'username': username
    }
    
    # Send OTP email in background thread
    threading.Thread(target=send_otp_email, args=(target_email, otp_code, authenticated_role)).start()
    
    # Mask email for frontend display
    parts = target_email.split('@')
    masked = parts[0][:3] + '***@' + parts[1]
    
    return jsonify({
        "success": True,
        "requires_otp": True,
        "session_key": session_key,
        "masked_email": masked,
        "message": f"Verification code sent to {masked}"
    })

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    """Verify the OTP code and complete login."""
    data = request.json
    session_key = data.get('session_key')
    otp_code = data.get('otp')
    
    if not session_key or not otp_code:
        return jsonify({"success": False, "message": "Missing session key or OTP code"}), 400
    
    # Check if session exists
    session = otp_store.get(session_key)
    if not session:
        return jsonify({"success": False, "message": "Session expired. Please login again."}), 401
    
    # Check expiry
    if time.time() > session['expires_at']:
        del otp_store[session_key]
        return jsonify({"success": False, "message": "OTP has expired. Please login again."}), 401
    
    # Verify OTP
    if otp_code.strip() != session['otp']:
        return jsonify({"success": False, "message": "Invalid OTP code. Please try again."}), 401
    
    # OTP verified - complete login
    role = session['role']
    del otp_store[session_key]  # One-time use
    
    return jsonify({
        "success": True,
        "token": f"{role}-token",
        "role": role
    })

@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    """Resend a new OTP code for an existing session."""
    data = request.json
    session_key = data.get('session_key')
    
    if not session_key:
        return jsonify({"success": False, "message": "Missing session key"}), 400
    
    session = otp_store.get(session_key)
    if not session:
        return jsonify({"success": False, "message": "Session expired. Please login again."}), 401
    
    # Generate new OTP and update session
    new_otp = generate_otp()
    session['otp'] = new_otp
    session['expires_at'] = time.time() + OTP_EXPIRY
    
    # Send new OTP email
    threading.Thread(target=send_otp_email, args=(session['email'], new_otp, session['role'])).start()
    
    parts = session['email'].split('@')
    masked = parts[0][:3] + '***@' + parts[1]
    
    return jsonify({
        "success": True,
        "message": f"New verification code sent to {masked}"
    })

@app.route('/api/inventory', methods=['GET', 'POST'])
def handle_inventory():
    if inventory_collection is None:
        return jsonify({"success": False, "message": "MongoDB not connected."}), 500
    if request.method == 'GET':
        items = list(inventory_collection.find())
        for item in items:
            item['_id'] = str(item['_id'])
            if 'last_updated' in item:
                item['last_updated'] = str(item['last_updated'])
        return jsonify({"success": True, "items": items})
    elif request.method == 'POST':
        data = request.json
        new_item = {
            "name": data.get("name", "Unknown"),
            "type": data.get("type", "Helmet"),
            "status": data.get("status", "Available"),
            "assigned_to": data.get("assigned_to", ""),
            "last_updated": datetime.datetime.now(datetime.timezone.utc)
        }
        res = inventory_collection.insert_one(new_item)
        new_item['_id'] = str(res.inserted_id)
        return jsonify({"success": True, "item": new_item})

@app.route('/api/inventory/<item_id>', methods=['PUT', 'DELETE'])
def manage_inventory_item(item_id):
    if inventory_collection is None:
        return jsonify({"success": False, "message": "MongoDB not connected."}), 500
    try:
        if request.method == 'PUT':
            data = request.json
            update_fields = {k: v for k, v in {
                "name": data.get("name"),
                "type": data.get("type"),
                "status": data.get("status"),
                "assigned_to": data.get("assigned_to"),
                "last_updated": datetime.datetime.now(datetime.timezone.utc)
            }.items() if v is not None}
            inventory_collection.update_one({"_id": ObjectId(item_id)}, {"$set": update_fields})
            return jsonify({"success": True})
        elif request.method == 'DELETE':
            inventory_collection.delete_one({"_id": ObjectId(item_id)})
            return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/workers', methods=['GET', 'POST'])
def handle_workers():
    if workers_collection is None:
        return jsonify({"success": False, "message": "MongoDB not connected."}), 500
    if request.method == 'GET':
        items = list(workers_collection.find())
        for item in items:
            item['_id'] = str(item['_id'])
        return jsonify({"success": True, "items": items})
    elif request.method == 'POST':
        data = request.json
        new_item = {
            "emp_id": data.get("emp_id", f"EMP-{random.randint(1000, 9999)}"),
            "name": data.get("name", "Unknown"),
            "department": data.get("department", "General"),
            "position": data.get("position", "Worker"),
            "contact": data.get("contact", ""),
            "photo": data.get("photo", "")
        }
        res = workers_collection.insert_one(new_item)
        new_item['_id'] = str(res.inserted_id)
        return jsonify({"success": True, "item": new_item})

@app.route('/api/workers/<item_id>', methods=['PUT', 'DELETE'])
def manage_worker(item_id):
    if workers_collection is None:
        return jsonify({"success": False, "message": "MongoDB not connected."}), 500
    try:
        if request.method == 'PUT':
            data = request.json
            update_fields = {k: v for k, v in {
                "emp_id": data.get("emp_id"),
                "name": data.get("name"),
                "department": data.get("department"),
                "position": data.get("position"),
                "contact": data.get("contact"),
                "photo": data.get("photo")
            }.items() if v is not None}
            workers_collection.update_one({"_id": ObjectId(item_id)}, {"$set": update_fields})
            return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/alerts', methods=['GET', 'POST'])
def handle_alerts():
    if alerts_collection is None:
        return jsonify({"success": False, "message": "MongoDB not connected."}), 500
    if request.method == 'GET':
        items = list(alerts_collection.find({"by": "Admin"}).sort("timestamp", -1))
        for item in items:
            item['_id'] = str(item['_id'])
        return jsonify({"success": True, "items": items})
    elif request.method == 'POST':
        data = request.json
        now = datetime.datetime.now()
        new_item = {
            "by": data.get("by", "Admin"),
            "date": now.strftime("%Y-%m-%d"),
            "time": now.strftime("%H:%M:%S"),
            "status": "Alerted",
            "timestamp": now.timestamp()
        }
        res = alerts_collection.insert_one(new_item)
        new_item['_id'] = str(res.inserted_id)
        
        # 1. Emit via socket for real-time UI update
        socketio.emit('new_alert', new_item)
        
        # 2. Trigger Email Notification (Background)
        threading.Thread(target=send_sos_email, args=(new_item['by'],)).start()
        
        return jsonify({"success": True, "item": new_item})

@app.route('/api/alerts/<item_id>', methods=['PUT'])
def update_alert(item_id):
    if alerts_collection is None:
        return jsonify({"success": False, "message": "MongoDB not connected."}), 500
    try:
        data = request.json
        alerts_collection.update_one(
            {"_id": ObjectId(item_id)}, 
            {"$set": {"status": data.get("status", "Resolved")}}
        )
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    print(f"Starting AI Real-Time Server on port {port}...")
    socketio.run(app, host="0.0.0.0", port=port, debug=False)
