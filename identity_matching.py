import cv2
import numpy as np
import base64
from deepface import DeepFace
import os
import time

class IdentityMatcher:
    def __init__(self):
        self.known_faces = {} # emp_id -> {"name": str, "encoding": list}
        self.last_load = 0
        # Use a faster model
        self.model_name = "Facenet" 
        self.detector_backend = "opencv"
        print(f"IdentityMatcher initialized with {self.model_name}")

    def base64_to_cv2(self, b64_str):
        try:
            if ',' in b64_str:
                b64_str = b64_str.split(',')[1]
            img_data = base64.b64decode(b64_str)
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            print(f"Error decoding base64: {e}")
            return None

    def enroll_workers(self, workers):
        """
        Processes worker photos and extracts embeddings.
        """
        print(f"DEBUG: Starting enrollment for {len(workers)} workers...")
        new_known_faces = {}
        for w_id, w_data in workers.items():
            if not w_data.get('photo'):
                print(f"DEBUG: Skipping {w_data['name']} - no photo")
                continue
            
            img = self.base64_to_cv2(w_data['photo'])
            if img is not None:
                try:
                    # Extract embedding
                    # We use enforce_detection=True here because the profile photo MUST have a face
                    embeddings = DeepFace.represent(
                        img_path=img, 
                        model_name=self.model_name, 
                        enforce_detection=True,
                        detector_backend=self.detector_backend
                    )
                    if embeddings:
                        new_known_faces[w_id] = {
                            "name": w_data['name'],
                            "embedding": embeddings[0]["embedding"]
                        }
                        print(f"DEBUG: SUCCESS - Enrolled worker: {w_data['name']}")
                except Exception as e:
                    print(f"DEBUG: FAILED - Could not find face in {w_data['name']}'s photo: {e}")
        
        self.known_faces = new_known_faces
        self.last_load = time.time()
        print(f"DEBUG: Enrollment finished. {len(self.known_faces)} workers ready.")

    def identify_person(self, person_crop):
        """
        Matches a person crop against known faces.
        Returns worker data if matched, else None.
        """
        if not self.known_faces:
            return None
        
        try:
            # We use verify which is more robust as it handles normalization
            # and supports multiple distance metrics
            best_match = None
            min_dist = 1.0 # Max cosine distance is 1.0 (very different)
            
            for w_id, data in self.known_faces.items():
                # We can't use verify directly on embeddings easily without the images
                # but DeepFace handles verification well.
                # However, for speed with multi-worker, we already have embeddings.
                # Let's use Cosine similarity on the embeddings
                
                # Get live embedding
                res = DeepFace.represent(
                    img_path=person_crop,
                    model_name=self.model_name,
                    enforce_detection=False,
                    detector_backend=self.detector_backend
                )
                
                if not res or len(res) == 0:
                    return None
                
                v1 = np.array(res[0]["embedding"])
                v2 = np.array(data["embedding"])
                
                # Cosine distance = 1 - Cosine similarity
                dot_product = np.dot(v1, v2)
                norm_v1 = np.linalg.norm(v1)
                norm_v2 = np.linalg.norm(v2)
                cosine_dist = 1 - (dot_product / (norm_v1 * norm_v2))
                
                # print(f"DEBUG: Cosine distance to {data['name']}: {cosine_dist:.4f}")
                
                if cosine_dist < min_dist:
                    min_dist = cosine_dist
                    best_match = data
            
            # Typical Cosine threshold for Facenet is 0.40
            # We'll be very generous for the demo: 0.55
            if min_dist < 0.55:
                print(f"DEBUG: MATCH FOUND! {best_match['name']} (dist: {min_dist:.4f})")
                return best_match
            else:
                if int(time.time()) % 5 == 0:
                    print(f"DEBUG: Best match was {best_match['name']} but dist {min_dist:.4f} > 0.55")
            
            return None
            
        except Exception as e:
            # print(f"DEBUG: Identification error: {e}")
            return None
