"""
Enhanced Eye Tracking Module for PeriQuest using MediaPipe Tasks API
Compatible with MediaPipe 0.10.x+
"""

import cv2
import numpy as np
import time
import math
import mediapipe as mp
import os
from dataclasses import dataclass, field
from typing import Tuple, Optional, List, Dict, Any
from collections import deque

# Import MediaPipe Tasks API
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

@dataclass
class EyeData:
    """Stores eye tracking data for a single frame"""
    timestamp: float
    left_eye_center: Optional[Tuple[float, float]] = None
    right_eye_center: Optional[Tuple[float, float]] = None
    gaze_point: Optional[Tuple[float, float]] = None
    left_pupil_size: float = 0.0
    right_pupil_size: float = 0.0
    is_fixating: bool = False
    blink_detected: bool = False
    head_turn_detected: bool = False
    head_yaw: float = 0.0
    head_position: Optional[Tuple[float, float]] = None
    
@dataclass
class GazeCalibration:
    """Stores calibration data for gaze estimation"""
    calibration_points: List[Tuple[float, float]] = field(default_factory=list)
    gaze_mappings: List[Tuple[float, float]] = field(default_factory=list)
    is_calibrated: bool = False
    calibration_matrix: Optional[np.ndarray] = None

class EnhancedEyeTracker:
    """Advanced eye tracking with MediaPipe Tasks API (FaceLandmarker)"""
    
    # Eye landmark indices from MediaPipe Face Mesh
    # These indices remain consistent in the new model
    LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
    RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
    LEFT_IRIS_INDICES = [468, 469, 470, 471, 472]
    RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477]
    
    def __init__(self, camera_id: int = 0):
        self.camera_id = camera_id
        self.cap = None
        self.landmarker = None
        self.use_mediapipe = False
        self.current_frame = None
        self.start_time = time.time() * 1000
        
        # Calibration
        self.calibration = GazeCalibration()
        
        # Eye movement history
        self.eye_data_history = deque(maxlen=300)
        self.gaze_history = deque(maxlen=30)
        
        # Fixation detection parameters
        self.fixation_threshold = 0.05
        self.total_blinks = 0
        self.saccades = []
        
        # Initialize MediaPipe Tasks
        self._initialize_mediapipe_tasks()
        
    def _initialize_mediapipe_tasks(self):
        """Initialize MediaPipe Face Landmarker using Tasks API"""
        model_path = 'face_landmarker.task'
        
        if not os.path.exists(model_path):
            print(f"✗ Model file {model_path} not found.")
            print("  Please run download_model.py first.")
            return

        try:
            base_options = python.BaseOptions(model_asset_path=model_path)
            options = vision.FaceLandmarkerOptions(
                base_options=base_options,
                running_mode=vision.RunningMode.VIDEO,
                num_faces=1,
                min_face_detection_confidence=0.5,
                min_face_presence_confidence=0.5,
                min_tracking_confidence=0.5,
                output_face_blendshapes=True)
            
            self.landmarker = vision.FaceLandmarker.create_from_options(options)
            self.use_mediapipe = True
            print("✓ MediaPipe Face Landmarker (Tasks API) initialized successfully")
            
        except Exception as e:
            print(f"✗ Error initializing MediaPipe Tasks: {e}")
            self.use_mediapipe = False
    
    def initialize_camera(self) -> bool:
        """Initialize camera"""
        try:
            self.cap = cv2.VideoCapture(self.camera_id)
            if not self.cap.isOpened():
                for cam_id in [1, 2, 3]:
                    self.cap = cv2.VideoCapture(cam_id)
                    if self.cap.isOpened():
                        self.camera_id = cam_id
                        break
            
            if not self.cap.isOpened():
                print("✗ No camera found")
                return False
            
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            print(f"✓ Camera {self.camera_id} initialized")
            return True
        except Exception as e:
            print(f"✗ Camera initialization error: {e}")
            return False
            
    def get_eye_data(self) -> Optional[EyeData]:
        """Get current eye tracking data"""
        if not self.cap:
            return None
        
        ret, frame = self.cap.read()
        if not ret:
            return None
        
        self.current_frame = frame
        return self._process_frame(frame)

    def get_current_frame(self):
        return self.current_frame

    def _process_frame(self, frame) -> Optional[EyeData]:
        """Process frame using Face Landmarker"""
        if not self.use_mediapipe or not self.landmarker:
            return None
        
        timestamp = time.time()
        # MediaPipe Tasks requires MP Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        # Determine timestamp in ms 
        # (This should be strictly increasing for VIDEO mode)
        frame_timestamp_ms = int((time.time() * 1000))
        
        try:
            result = self.landmarker.detect_for_video(mp_image, frame_timestamp_ms)
        except Exception as e:
            # Handle out of order timestamps or other errors
            # print(f"Detection error: {e}")
            return None
        
        if not result.face_landmarks:
            return None
        
        # We only asked for 1 face
        landmarks = result.face_landmarks[0]
        
        # --- Extract Data (same logic as before, just adapting object structure) ---
        eye_data = EyeData(timestamp=timestamp)
        h, w = frame.shape[:2]
        
        # Helper to get normalized point
        def get_point(idx):
            lm = landmarks[idx]
            return lm # Has x, y, z
            
        def get_center_normalized(indices):
            xs = [landmarks[i].x for i in indices]
            ys = [landmarks[i].y for i in indices]
            return (np.mean(xs), np.mean(ys))

        eye_data.left_eye_center = get_center_normalized(self.LEFT_EYE_INDICES)
        eye_data.right_eye_center = get_center_normalized(self.RIGHT_EYE_INDICES)
        
        # Iris landmarks (if available - the new model should support them)
        if len(landmarks) > 470:
            left_iris_center = get_center_normalized(self.LEFT_IRIS_INDICES)
            right_iris_center = get_center_normalized(self.RIGHT_IRIS_INDICES)
            
            eye_data.gaze_point = self._estimate_gaze(
                eye_data.left_eye_center, eye_data.right_eye_center,
                left_iris_center, right_iris_center
            )
            
            # Simple pupil size estimation
            eye_data.left_pupil_size = self._estimate_pupil_size([landmarks[i] for i in self.LEFT_IRIS_INDICES])
            eye_data.right_pupil_size = self._estimate_pupil_size([landmarks[i] for i in self.RIGHT_IRIS_INDICES])

        # Blink Detection using Blendshapes if available (more accurate!)
        if result.face_blendshapes:
            # Index for eye blink blendshapes usually:
            # These are category_name="eyeBlinkLeft", etc.
            # But let's stick to EAR for consistency or use blendshapes if better.
            # Blendshapes are easier if we iterate them.
            blendshapes = result.face_blendshapes[0]
            # Search for blink scores
            left_blink = next((c.score for c in blendshapes if c.category_name == 'eyeBlinkLeft'), 0)
            right_blink = next((c.score for c in blendshapes if c.category_name == 'eyeBlinkRight'), 0)
            
            if left_blink > 0.5 or right_blink > 0.5:
                eye_data.blink_detected = True
                self.total_blinks += 1
        
        # Fixation detection
        eye_data.is_fixating = self._detect_fixation(eye_data.gaze_point)
        
        # Head turn detection using geometry (Nose tip: 1, Left ear: 234, Right ear: 454)
        nose = landmarks[1]
        left_ear = landmarks[234] 
        right_ear = landmarks[454]
        
        # Calculate horizontal distance ratio
        # Ensure we don't divide by zero
        d_left = abs(nose.x - left_ear.x)
        d_right = abs(nose.x - right_ear.x)
        
        # head_turn_ratio: 1.0 is straight. 
        # If turned right, d_left (mirror) or actual distance changes.
        head_turn_ratio = d_left / (d_right + 1e-6)
        
        # Map ratio to a 'yaw score' roughly -1.0 to 1.0 for UI display
        # Ratio around 1.0 -> 0.0
        # Ratio > 2.0 or < 0.5 is significant
        if head_turn_ratio > 1.0:
            head_yaw_score = min(1.0, (head_turn_ratio - 1.0))
        else:
            head_yaw_score = max(-1.0, -(1.0 / (head_turn_ratio + 1e-6) - 1.0))
        
        significant_yaw_threshold = 0.3 # Adjusted threshold for geometric ratio
        is_turning_head = abs(head_yaw_score) > significant_yaw_threshold
        
        eye_data.head_position = (nose.x, nose.y)
        eye_data.head_turn_detected = is_turning_head
        eye_data.head_yaw = head_yaw_score
        
        # If head is turned significantly, mark as NOT fixating regardless of gaze
        if is_turning_head:
            eye_data.is_fixating = False
            
        # History
        self.eye_data_history.append(eye_data)
        if eye_data.gaze_point:
            self.gaze_history.append(eye_data.gaze_point)
            
        return eye_data

    # --- Helper methods (Reused) ---
    def _estimate_gaze(self, left_eye, right_eye, left_iris, right_iris):
        if not all([left_eye, right_eye, left_iris, right_iris]): return None
        # Same simple logic
        lx, ly = left_iris[0] - left_eye[0], left_iris[1] - left_eye[1]
        rx, ry = right_iris[0] - right_eye[0], right_iris[1] - right_eye[1]
        avg_x, avg_y = (lx + rx)/2, (ly + ry)/2
        gaze_x = 0.5 + avg_x * 5
        gaze_y = 0.5 + avg_y * 10 # Increase sensitivity
        return (max(0, min(1, gaze_x)), max(0, min(1, gaze_y)))

    def _estimate_pupil_size(self, iris_points):
        # Calculate diameter
        # Normalized units
        if len(iris_points) < 2: return 0
        dx = iris_points[1].x - iris_points[3].x # Width approximation
        dy = iris_points[2].y - iris_points[4].y # Height approximation
        return math.sqrt(dx*dx + dy*dy)

    def _detect_fixation(self, gaze_point):
        if not gaze_point or len(self.gaze_history) < 5: return False
        recent = list(self.gaze_history)[-5:]
        x_var = np.var([p[0] for p in recent])
        y_var = np.var([p[1] for p in recent])
        return (x_var + y_var) < self.fixation_threshold

    def release(self):
        if self.cap: self.cap.release()
        if self.landmarker: self.landmarker.close()
        cv2.destroyAllWindows()
