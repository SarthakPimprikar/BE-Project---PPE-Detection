import torch
from ultralytics import YOLO

def deep_inspect(path):
    print(f"--- Deep Inspection of {path} ---")
    try:
        ckpt = torch.load(path, map_location='cpu')
        # Check for results or performance metrics
        if 'train_metrics' in ckpt:
            print("Found train_metrics:", ckpt['train_metrics'])
        elif 'metrics' in ckpt:
            print("Found metrics:", ckpt['metrics'])
        else:
            print("No direct metrics found in checkpoint keys.")
            print("Keys available:", ckpt.keys())
            
    except Exception as e:
        print(f"Error: {e}")

deep_inspect('2best.pt')
deep_inspect('best.pt')
