from ultralytics import YOLO
import torch

def check_model(path):
    print(f"--- Checking {path} ---")
    try:
        model = YOLO(path)
        print("Model loaded successfully.")
        # Check if there are any results stored in the model metadata
        if hasattr(model, 'ckpt') and 'train_args' in model.ckpt:
            print("Training arguments found.")
        
        # Try to see if it has validation results
        # In YOLOv8, models usually don't store val results inside the .pt but in a runs/ folder
        
        print("Classes:", model.names)
        
    except Exception as e:
        print(f"Error: {e}")

check_model('2best.pt')
check_model('best.pt')
