# Vanguard AI - Workplace Safety Monitoring System

Vanguard AI is a state-of-the-art, real-time workplace safety monitoring system designed to enhance industrial compliance and employee protection. Utilizing advanced YOLO-based object detection and facial recognition, Vanguard AI provides automated oversight of Personal Protective Equipment (PPE) and site activity.

## 🚀 Key Features

- **Real-time AI Monitoring**: Automated detection of Helmets, Safety Vests, and other PPE.
- **Biometric Compliance**: Integrated facial recognition to link safety scores with individual workers.
- **Comprehensive Analytics**: Dynamic dashboards visualizing compliance trends, workforce activity, and safety intensity.
- **Premium Interface**: A high-performance, responsive dark-themed dashboard built for modern safety supervisors.
- **Detailed Reporting**: Export professional PDF audit reports and safety scoreboards.
- **2FA Security**: Secure login system with OTP-based verification for different access levels.

## 🛠 Technology Stack

- **Backend**: Python, Flask, Socket.IO, OpenCV
- **AI/ML**: YOLOv8/YOLOv11, DeepFace, NumPy
- **Frontend**: React, Vite, Recharts, Lucide React
- **Database**: MongoDB (for logs, inventory, and worker directory)
- **Styling**: Premium CSS with Glassmorphism and modern dark-mode palettes

## 📋 System Requirements

- Python 3.9+
- Node.js 18+
- MongoDB 6.0+
- GPU with CUDA support (recommended for real-time monitoring)

## 🏗 Installation

### 1. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:
```env
MONGO_URI=mongodb://localhost:27017
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
ADMIN_EMAIL=admin@example.com
SUPERVISOR_EMAIL=supervisor@example.com
```

## 🚀 Running the System

1. **Start the Backend Service**:
   ```bash
   python app.py
   ```

2. **Launch the Dashboard**:
   ```bash
   cd frontend
   npm run dev
   ```

---
© 2026 Vanguard Safety AI Systems. All rights reserved.
