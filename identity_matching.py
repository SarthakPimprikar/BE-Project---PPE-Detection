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
        Returns worker data dict (with 'confidence') if matched, else None.
        Uses a strict threshold + margin check to avoid misidentifying unknown people.
        """
        if not self.known_faces:
            return None
        
        try:
            # Extract embedding ONCE for the live person crop
            res = DeepFace.represent(
                img_path=person_crop,
                model_name=self.model_name,
                enforce_detection=False,
                detector_backend=self.detector_backend
            )
            
            if not res or len(res) == 0:
                return None
            
            # Check face confidence from the detector — skip low-quality detections
            face_confidence = res[0].get("face_confidence", 1.0)
            if face_confidence < 0.70:
                return None
            
            v1 = np.array(res[0]["embedding"])
            norm_v1 = np.linalg.norm(v1)
            if norm_v1 < 1e-6:
                return None
            
            # Compare against all known workers
            distances = []
            for w_id, data in self.known_faces.items():
                v2 = np.array(data["embedding"])
                norm_v2 = np.linalg.norm(v2)
                
                # Cosine distance = 1 - Cosine similarity
                cosine_dist = 1 - (np.dot(v1, v2) / (norm_v1 * norm_v2))
                distances.append((cosine_dist, w_id, data))
            
            # Sort by distance (best match first)
            distances.sort(key=lambda x: x[0])
            
            best_dist, best_wid, best_data = distances[0]
            
            # --- STRICT THRESHOLD ---
            # Facenet cosine distance: < 0.35 is a confident match
            MATCH_THRESHOLD = 0.35
            
            if best_dist >= MATCH_THRESHOLD:
                if int(time.time()) % 5 == 0:
                    print(f"DEBUG: Rejected — best was {best_data['name']} but dist {best_dist:.4f} >= {MATCH_THRESHOLD}")
                return None
            
            # --- MARGIN CHECK ---
            # If there are multiple known faces, the best match must be meaningfully
            # better than the second-best to avoid ambiguous matches
            if len(distances) >= 2:
                second_dist = distances[1][0]
                margin = second_dist - best_dist
                MIN_MARGIN = 0.05
                if margin < MIN_MARGIN:
                    if int(time.time()) % 5 == 0:
                        print(f"DEBUG: Rejected — ambiguous match: {best_data['name']}={best_dist:.4f} vs {distances[1][2]['name']}={second_dist:.4f} (margin {margin:.4f})")
                    return None
            
            print(f"DEBUG: MATCH FOUND! {best_data['name']} (dist: {best_dist:.4f})")
            result = dict(best_data)
            result['confidence'] = round(1.0 - best_dist, 3)
            return result
            
        except Exception as e:
            # print(f"DEBUG: Identification error: {e}")
            return None
