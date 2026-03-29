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

from workplace_safety_monitor import Monitor, build_argparser, logger

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# -------------------------------
# MongoDB Database Setup
# -------------------------------
MONGO_URI = "mongodb+srv://pimprikarsarthaksynture_db_user:plF1qr9kbkRXrf8T@ppe-cluster.upimgci.mongodb.net/?retryWrites=true&w=majority&appName=PPE-Cluster"
try:
    db_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    db = db_client["safety_db"]
    logs_collection = db["violation_logs"]
    
    # Create required indexes for fast queries
    logs_collection.create_index([("timestamp", DESCENDING)])
    logs_collection.create_index([("camera_id", ASCENDING)])
    print("Successfully connected to MongoDB and verified indexes.")
except Exception as e:
    print(f"Warning: Could not connect to MongoDB. Is it running? ({e})")
    logs_collection = None

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
    
    while True:
        try:
            success, frame = cap.read()
            if not success:
                print("Warning: Camera read failed, retrying...")
                time.sleep(1)
                cap.release()
                cap = cv2.VideoCapture(int(mon.args.source)) if str(mon.args.source).isdigit() else cv2.VideoCapture(mon.args.source)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                continue
                
            # Process frame using our optimized Monitor
            out_frame, frame_stats = mon.process_frame(frame)
            
            # Update global stats for the API
            stats["total_detections"] = frame_stats.get("people_count", 0)
            stats["helmet_violations"] = frame_stats.get("helmet_violations", 0)
            stats["vest_violations"] = frame_stats.get("vest_violations", 0)
            
            total_det = max(1, stats["total_detections"])
            comp_rate = 100.0 - (((stats["helmet_violations"] + stats["vest_violations"]) / float(total_det)) * 100.0)
            stats["compliance_rate"] = int(max(0, comp_rate))

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
    return jsonify(stats)

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

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data and data.get('username') == 'admin' and data.get('password') == 'admin':
        return jsonify({"success": True, "token": "admin-token-12345"})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

if __name__ == '__main__':
    print("Starting AI Real-Time Server on port 5000...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)
