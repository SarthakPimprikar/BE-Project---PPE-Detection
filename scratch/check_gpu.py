import torch
import tensorflow as tf
from ultralytics import YOLO

print("--- Torch Check ---")
print(f"Torch version: {torch.__version__}")
print(f"Is CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")

print("\n--- TensorFlow Check ---")
print(f"TensorFlow version: {tf.__version__}")
gpus = tf.config.list_physical_devices('GPU')
print(f"GPUs detected by TF: {gpus}")

print("\n--- YOLO Check ---")
model = YOLO('yolov8n.pt')
print(f"YOLO default device: {model.device}")
