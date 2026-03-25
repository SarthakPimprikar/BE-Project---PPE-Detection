import cv2
import time
import base64
import numpy as np
import random
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from workplace_safety_monitor import Monitor, build_argparser, logger

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Global stats
stats = {
    "total_detections": 0,
    "helmet_violations": 0,
    "vest_violations": 0,
    "system_status": "Online",
    "active_cameras": 1,
    "compliance_rate": 100
}

# Initialize Monitor with default args
class Args:
    source = '0'
    person_weights = ''  # Redundant, 2best.pt detects persons
    person_conf = 0.45
    ppe_weights = '2best.pt'
    ppe_onnx = ''
    class_names = ['person', 'hardhat', 'no-hardhat', 'safety vest', 'no-safety vest', 'mask', 'no-mask']
    input_size = 640
    conf_helmet = 0.50  # Lowered slightly for the new model
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

def gen_frames():
    cap = cv2.VideoCapture(int(mon.args.source)) if str(mon.args.source).isdigit() else cv2.VideoCapture(mon.args.source)
    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            # Process frame using our optimized Monitor
            out_frame, frame_stats = mon.process_frame(frame)
            
            # Update global stats for the API
            stats["total_detections"] = frame_stats.get("people_count", 0)
            stats["helmet_violations"] = frame_stats.get("helmet_violations", 0)
            stats["vest_violations"] = frame_stats.get("vest_violations", 0)
            stats["compliance_rate"] = int(max(0, 100 - ((stats["helmet_violations"] + stats["vest_violations"]) / max(1, stats["total_detections"]) * 100)))

            # Encode to JPEG
            ret, buffer = cv2.imencode('.jpg', out_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@socketio.on('process_frame')
def handle_frame(data):
    try:
        # Decode base64 image
        header, encoded = data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is not None:
            # Process frame
            out_frame, frame_stats = mon.process_frame(frame)
            
            # Update global stats with REAL data (Duplicate of generator logic for consistency)
            stats["total_detections"] = frame_stats.get("people_count", 0)
            stats["helmet_violations"] = frame_stats.get("helmet_violations", 0)
            stats["vest_violations"] = frame_stats.get("vest_violations", 0)
            stats["compliance_rate"] = int(max(0, 100 - ((stats["helmet_violations"] + stats["vest_violations"]) / max(1, stats["total_detections"]) * 100)))

            # Encode processed frame back to base64
            _, buffer = cv2.imencode('.jpg', out_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            out_base64 = base64.b64encode(buffer).decode('utf-8')
            
            emit('response_frame', f"data:image/jpeg;base64,{out_base64}")
            emit('stats_update', stats)
    except Exception as e:
        print(f"Error processing frame: {e}")

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify(stats)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data and data.get('username') == 'admin' and data.get('password') == 'admin':
        return jsonify({"success": True, "token": "admin-token-12345"})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

if __name__ == '__main__':
    print("Starting AI Real-Time Server on port 5000...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)
