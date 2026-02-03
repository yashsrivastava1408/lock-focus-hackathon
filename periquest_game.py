# periquest_full.py
"""
Peripheral Vision Therapy Game - Full Version
With camera tracking, adaptive difficulty, and data logging
Fixed to prevent stimuli from appearing behind UI elements
"""

import cv2
import numpy as np
import pygame
import pygame.gfxdraw
import time
import json
import sqlite3
import csv
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple, Optional, Any
from enum import Enum
import random
import math
from collections import deque
import statistics
import sys
import os
import pandas as pd

# Initialize pygame
pygame.init()

# ==================== CONFIGURATION ====================
@dataclass
class GameConfig:
    """Game configuration parameters"""
    # Display settings
    SCREEN_WIDTH: int = 1280
    SCREEN_HEIGHT: int = 720
    FPS: int = 60
    
    # Camera settings
    CAMERA_WIDTH: int = 640
    CAMERA_HEIGHT: int = 480
    
    # Game settings
    SESSION_DURATION: int = 300  # 5 minutes
    MAX_STIMULI_PER_SESSION: int = 200
    
    # Colors
    BACKGROUND_COLOR: Tuple[int, int, int] = (10, 20, 30)
    CENTER_DOT_COLOR: Tuple[int, int, int] = (255, 255, 255)
    TEXT_COLOR: Tuple[int, int, int] = (240, 240, 240)
    HUD_BACKGROUND: Tuple[int, int, int] = (0, 0, 0, 180)
    
    # Font sizes
    TITLE_FONT_SIZE: int = 36
    SCORE_FONT_SIZE: int = 24
    INFO_FONT_SIZE: int = 18
    SMALL_FONT_SIZE: int = 14
    
    # Stimulus settings
    MIN_STIMULUS_SIZE: int = 30
    MAX_STIMULUS_SIZE: int = 120
    
    # Reaction time thresholds (ms)
    PERFECT_REACTION: int = 500
    GOOD_REACTION: int = 1000
    SLOW_REACTION: int = 2000
    
    # Scoring
    PERFECT_SCORE: int = 100
    GOOD_SCORE: int = 50
    SLOW_SCORE: int = 25
    MISS_PENALTY: int = -5
    
    def __post_init__(self):
        # Stimulus durations by level (ms)
        self.STIMULUS_DURATIONS = {
            1: 3000,  # Level 1: 3 seconds
            2: 2500,  # Level 2: 2.5 seconds
            3: 2000,  # Level 3: 2 seconds
            4: 1500,  # Level 4: 1.5 seconds
            5: 1000,  # Level 5: 1 second
        }

# ==================== DATA MODELS ====================
class StimulusType(Enum):
    CIRCLE = "circle"
    SQUARE = "square"
    TRIANGLE = "triangle"
    STAR = "star"

class VisualField(Enum):
    LEFT = "left"
    RIGHT = "right"
    TOP = "top"
    BOTTOM = "bottom"
    TOP_LEFT = "top_left"
    TOP_RIGHT = "top_right"
    BOTTOM_LEFT = "bottom_left"
    BOTTOM_RIGHT = "bottom_right"

@dataclass
class Stimulus:
    """Represents a peripheral stimulus"""
    id: int
    field: VisualField
    type: StimulusType
    x: int
    y: int
    size: int
    color: Tuple[int, int, int]
    appear_time: float
    duration_ms: int
    level: int
    is_target: bool = True
    reacted: bool = False
    reaction_time: Optional[float] = None
    
    def is_expired(self, current_time: float) -> bool:
        """Check if stimulus has expired"""
        elapsed = (current_time - self.appear_time) * 1000
        return elapsed > self.duration_ms
    
    def time_remaining_ms(self, current_time: float) -> float:
        """Get remaining time in milliseconds"""
        elapsed = (current_time - self.appear_time) * 1000
        return max(0, self.duration_ms - elapsed)

@dataclass
class SessionMetrics:
    """Tracks session performance metrics"""
    patient_id: str
    session_id: str
    start_time: datetime
    level: int = 1
    total_stimuli: int = 0
    correct_reactions: int = 0
    missed_stimuli: int = 0
    false_positives: int = 0
    total_reaction_time: float = 0.0
    reaction_times: List[float] = None
    field_performance: Dict[str, Dict] = None
    head_movements: int = 0
    fixation_breaks: int = 0
    score: int = 0
    
    def __post_init__(self):
        if self.reaction_times is None:
            self.reaction_times = []
        if self.field_performance is None:
            self.field_performance = {
                field.value: {"correct": 0, "total": 0, "avg_rt": 0.0}
                for field in VisualField
            }
    
    def add_reaction(self, stimulus: Stimulus, reaction_time: float):
        """Record a successful reaction"""
        self.correct_reactions += 1
        self.total_reaction_time += reaction_time
        self.reaction_times.append(reaction_time)
        
        # Update field-specific stats
        field_stats = self.field_performance[stimulus.field.value]
        field_stats["correct"] += 1
        field_stats["total"] += 1
        field_stats["avg_rt"] = ((field_stats["avg_rt"] * (field_stats["correct"] - 1)) + reaction_time) / field_stats["correct"]
    
    def add_miss(self, stimulus: Stimulus):
        """Record a missed stimulus"""
        self.missed_stimuli += 1
        field_stats = self.field_performance[stimulus.field.value]
        field_stats["total"] += 1
    
    def calculate_average_rt(self) -> float:
        """Calculate average reaction time in milliseconds"""
        if not self.reaction_times:
            return 0.0
        return (sum(self.reaction_times) / len(self.reaction_times)) * 1000
    
    def calculate_accuracy(self) -> float:
        """Calculate accuracy percentage"""
        if self.total_stimuli == 0:
            return 0.0
        return (self.correct_reactions / self.total_stimuli) * 100
    
    def get_side_bias(self) -> Dict[str, Any]:
        """Calculate left/right performance bias"""
        left_stats = self.field_performance["left"]
        right_stats = self.field_performance["right"]
        
        left_accuracy = (left_stats["correct"] / left_stats["total"] * 100) if left_stats["total"] > 0 else 0
        right_accuracy = (right_stats["correct"] / right_stats["total"] * 100) if right_stats["total"] > 0 else 0
        
        bias_percentage = 0
        if max(left_accuracy, right_accuracy) > 0:
            bias_percentage = ((right_accuracy - left_accuracy) / max(left_accuracy, right_accuracy)) * 100
        
        return {
            "bias_percentage": bias_percentage,
            "weaker_side": "left" if left_accuracy < right_accuracy else "right",
            "left_accuracy": left_accuracy,
            "right_accuracy": right_accuracy,
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
            "start_time": self.start_time.isoformat(),
            "end_time": datetime.now().isoformat(),
            "level": self.level,
            "total_stimuli": self.total_stimuli,
            "correct_reactions": self.correct_reactions,
            "missed_stimuli": self.missed_stimuli,
            "false_positives": self.false_positives,
            "average_reaction_time_ms": self.calculate_average_rt(),
            "accuracy_percentage": self.calculate_accuracy(),
            "head_movements": self.head_movements,
            "fixation_breaks": self.fixation_breaks,
            "score": self.score,
            "field_performance": self.field_performance,
            "side_bias": self.get_side_bias(),
            "reaction_times": [rt * 1000 for rt in self.reaction_times]
        }

# ==================== VISION TRACKER ====================
class VisionTracker:
    """Handles camera input and face tracking with fallback modes"""
    
    def __init__(self, camera_id: int = 0):
        self.camera_id = camera_id
        self.cap = None
        self.is_calibrated = False
        self.calibration_data = {}
        self.use_mediapipe = False
        
        # Try to initialize MediaPipe
        self.face_mesh = None
        self.hands = None
        
        try:
            # Try to initialize MediaPipe
            try:
                # First try the standard import for newer versions
                import mediapipe as mp
                
                # Check if solutions module exists
                if hasattr(mp, 'solutions'):
                    self.face_mesh = mp.solutions.face_mesh.FaceMesh(
                        max_num_faces=1,
                        refine_landmarks=True,
                        min_detection_confidence=0.5,
                        min_tracking_confidence=0.5
                    )
                    
                    self.hands = mp.solutions.hands.Hands(
                        max_num_hands=2,
                        min_detection_confidence=0.7,
                        min_tracking_confidence=0.5
                    )
                    
                    self.use_mediapipe = True
                    print("MediaPipe initialized successfully")
                else:
                    # Try alternative import path
                    try:
                        from mediapipe.python.solutions.face_mesh import FaceMesh
                        from mediapipe.python.solutions.hands import Hands
                        
                        self.face_mesh = FaceMesh(
                            max_num_faces=1,
                            refine_landmarks=True,
                            min_detection_confidence=0.5,
                            min_tracking_confidence=0.5
                        )
                        
                        self.hands = Hands(
                            max_num_hands=2,
                            min_detection_confidence=0.7,
                            min_tracking_confidence=0.5
                        )
                        
                        self.use_mediapipe = True
                        print("MediaPipe initialized (alternative import)")
                    except ImportError:
                        print("Could not find MediaPipe solutions module")
                        print("Using fallback tracking mode")
                        
            except ImportError as e:
                print(f"MediaPipe import failed: {e}")
                print("Using fallback tracking mode")
                
        except Exception as e:
            print(f"Error initializing MediaPipe: {e}")
            print("Using keyboard-only mode")
        
        # Head position tracking
        self.head_position_history = deque(maxlen=30)
        self.head_movement_threshold = 0.15
        self.fixation_break_threshold = 0.3
        
        # Simple face detection fallback (using OpenCV Haar cascade)
        self.face_cascade = None
        if not self.use_mediapipe:
            try:
                self.face_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
                print("OpenCV face detection initialized as fallback")
            except:
                print("OpenCV face detection not available")
    
    def initialize_camera(self):
        """Initialize camera with proper settings"""
        try:
            # Try to open camera without platform-specific backend first
            self.cap = cv2.VideoCapture(self.camera_id)
            if not self.cap.isOpened():
                # Try alternative camera IDs
                for cam_id in [1, 2, 3]:
                    self.cap = cv2.VideoCapture(cam_id)
                    if self.cap.isOpened():
                        self.camera_id = cam_id
                        break
                
                if not self.cap.isOpened():
                    print(f"No camera found at any ID (tried 0, 1, 2, 3)")
                    self.cap = None
                    return False
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            print(f"Camera {self.camera_id} initialized: 640x480 @ 30fps")
            return True
            
        except Exception as e:
            print(f"Camera initialization error: {e}")
            self.cap = None
            return False
    
    def calibrate(self, duration_seconds: int = 5):
        """Calibrate head position"""
        print("Calibration: Please look at the center dot...")
        
        if not self.cap:
            # No camera available - simulate calibration
            print("No camera - simulating calibration...")
            for i in range(3, 0, -1):
                print(f"Calibration in {i}...")
                time.sleep(1)
            
            self.is_calibrated = True
            self.calibration_data = {
                'baseline_position': {'center': (0.5, 0.5)},
                'bounds': {'x_min': 0.4, 'x_max': 0.6, 'y_min': 0.4, 'y_max': 0.6}
            }
            print("Calibration complete (simulated - no camera)")
            return True
        
        positions = []
        start_time = time.time()
        
        while time.time() - start_time < duration_seconds:
            ret, frame = self.cap.read()
            if not ret:
                continue
                
            head_pos = self._get_head_position_from_frame(frame)
            if head_pos:
                positions.append(head_pos)
        
        if not positions:
            print("No face detected during calibration")
            # Use default calibration
            self.calibration_data = {
                'baseline_position': {'center': (0.5, 0.5)},
                'bounds': {'x_min': 0.35, 'x_max': 0.65, 'y_min': 0.35, 'y_max': 0.65}
            }
        else:
            # Calculate average position
            avg_x = np.mean([p[0] for p in positions])
            avg_y = np.mean([p[1] for p in positions])
            
            self.calibration_data = {
                'baseline_position': {'center': (avg_x, avg_y)},
                'bounds': {
                    'x_min': avg_x - 0.15,
                    'x_max': avg_x + 0.15,
                    'y_min': avg_y - 0.15,
                    'y_max': avg_y + 0.15
                }
            }
        
        self.is_calibrated = True
        print("Calibration complete!")
        return True
    
    def _get_head_position_from_frame(self, frame):
        """Get head position from frame using available methods"""
        # Try MediaPipe first
        if self.use_mediapipe and self.face_mesh:
            try:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = self.face_mesh.process(rgb_frame)
                
                if results.multi_face_landmarks:
                    face_landmarks = results.multi_face_landmarks[0]
                    nose_tip = face_landmarks.landmark[1]
                    return (nose_tip.x, nose_tip.y)
            except:
                pass
        
        # Try OpenCV face detection as fallback
        if self.face_cascade is not None:
            try:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
                
                if len(faces) > 0:
                    x, y, w, h = faces[0]
                    center_x = (x + w/2) / frame.shape[1]
                    center_y = (y + h/2) / frame.shape[0]
                    return (center_x, center_y)
            except:
                pass
        
        return None
    
    def get_head_position(self):
        """Get current head position and movement status"""
        if not self.cap:
            # Return default position for keyboard mode
            return {
                'position': (0.5, 0.5),
                'within_bounds': True,
                'head_moved': False,
                'fixation_break': False
            }
        
        try:
            ret, frame = self.cap.read()
            if not ret:
                return None
            
            current_position = self._get_head_position_from_frame(frame)
            if not current_position:
                return None
            
            self.head_position_history.append(current_position)
            
            if self.is_calibrated:
                baseline = self.calibration_data['baseline_position']['center']
                movement_x = abs(current_position[0] - baseline[0])
                movement_y = abs(current_position[1] - baseline[1])
                total_movement = math.sqrt(movement_x**2 + movement_y**2)
                
                # Check bounds
                bounds = self.calibration_data['bounds']
                within_bounds = (
                    bounds['x_min'] <= current_position[0] <= bounds['x_max'] and
                    bounds['y_min'] <= current_position[1] <= bounds['y_max']
                )
                
                # Detect movements
                fixation_break = total_movement > self.fixation_break_threshold
                head_moved = total_movement > self.head_movement_threshold
                
                return {
                    'position': current_position,
                    'movement': total_movement,
                    'within_bounds': within_bounds,
                    'fixation_break': fixation_break,
                    'head_moved': head_moved
                }
            
            return {'position': current_position, 'within_bounds': True}
            
        except Exception as e:
            return None
    
    def detect_hand_gesture(self):
        """Detect hand gesture for stimulus response"""
        if not self.cap or not self.hands:
            return False
        
        try:
            ret, frame = self.cap.read()
            if not ret:
                return False
            
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_frame)
            
            if not results.multi_hand_landmarks:
                return False
            
            # Simple gesture: any hand with fingers extended
            for hand_landmarks in results.multi_hand_landmarks:
                wrist = hand_landmarks.landmark[0]
                thumb_tip = hand_landmarks.landmark[4]
                index_tip = hand_landmarks.landmark[8]
                
                # Check if hand is raised (fingers above wrist)
                if index_tip.y < wrist.y - 0.1:
                    return True
        
        except:
            pass
        
        return False
    
    def get_camera_frame(self):
        """Get camera frame for display"""
        if self.cap:
            try:
                ret, frame = self.cap.read()
                if ret:
                    # Add face/landmark visualization if available
                    if self.use_mediapipe:
                        frame = self._draw_landmarks_on_frame(frame)
                    return frame
            except:
                pass
        return None
    
    def _draw_landmarks_on_frame(self, frame):
        """Draw face and hand landmarks on frame"""
        try:
            # Convert to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process for face landmarks
            if self.face_mesh:
                face_results = self.face_mesh.process(rgb_frame)
                if face_results.multi_face_landmarks:
                    for face_landmarks in face_results.multi_face_landmarks:
                        # Draw simplified face landmarks
                        h, w, _ = frame.shape
                        landmarks = []
                        
                        # Nose tip (landmark 1)
                        nose = face_landmarks.landmark[1]
                        nose_x, nose_y = int(nose.x * w), int(nose.y * h)
                        cv2.circle(frame, (nose_x, nose_y), 5, (0, 255, 0), -1)
                        
                        # Draw calibration bounds if calibrated
                        if self.is_calibrated:
                            bounds = self.calibration_data['bounds']
                            x_min = int(bounds['x_min'] * w)
                            x_max = int(bounds['x_max'] * w)
                            y_min = int(bounds['y_min'] * h)
                            y_max = int(bounds['y_max'] * h)
                            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
            
            # Process for hand landmarks
            if self.hands:
                hand_results = self.hands.process(rgb_frame)
                if hand_results.multi_hand_landmarks:
                    for hand_landmarks in hand_results.multi_hand_landmarks:
                        # Draw wrist and finger tips
                        h, w, _ = frame.shape
                        
                        wrist = hand_landmarks.landmark[0]
                        wx, wy = int(wrist.x * w), int(wrist.y * h)
                        cv2.circle(frame, (wx, wy), 8, (255, 0, 0), -1)
                        
                        # Index finger tip
                        index_tip = hand_landmarks.landmark[8]
                        ix, iy = int(index_tip.x * w), int(index_tip.y * h)
                        cv2.circle(frame, (ix, iy), 6, (0, 0, 255), -1)
                        
        except:
            pass
        
        return frame
    
    def release(self):
        """Release camera resources"""
        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()

# ==================== STIMULUS MANAGER ====================
class StimulusManager:
    """Manages stimulus generation and display"""
    
    def __init__(self, config: GameConfig):
        self.config = config
        self.stimuli = []
        self.next_stimulus_id = 1
        self.last_stimulus_time = 0
        self.stimulus_interval = 2.0
        
        # UI overlay areas to avoid (x, y, width, height)
        self.camera_overlay_rect = (10, 200, 320, 240)  # Camera feed area
        self.head_indicator_rect = (340, 200, 180, 180)  # Head indicator area
        
        # Adjusted visual field zones to avoid UI elements
        # (proportional coordinates: x, y, width, height)
        self.field_zones = {
            VisualField.LEFT: (0.0, 0.4, 0.3, 0.4),       # Move down to avoid top HUD
            VisualField.RIGHT: (0.7, 0.4, 0.3, 0.4),      # Move down to avoid top HUD
            VisualField.TOP: (0.4, 0.2, 0.2, 0.2),        # Smaller top zone
            VisualField.BOTTOM: (0.3, 0.8, 0.4, 0.2),     # Bottom zone
            VisualField.TOP_LEFT: (0.1, 0.2, 0.2, 0.2),   # Move down
            VisualField.TOP_RIGHT: (0.7, 0.2, 0.2, 0.2),  # Move down
            VisualField.BOTTOM_LEFT: (0.1, 0.7, 0.2, 0.2),# Move up slightly
            VisualField.BOTTOM_RIGHT: (0.7, 0.7, 0.2, 0.2),# Move up slightly
        }
        
        # Stimulus colors
        self.stimulus_colors = {
            StimulusType.CIRCLE: (255, 200, 100),    # Yellow-orange
            StimulusType.SQUARE: (100, 200, 255),    # Blue
            StimulusType.TRIANGLE: (200, 100, 200),  # Purple
            StimulusType.STAR: (100, 255, 100),      # Green
        }
        
        # Distractor colors (darker versions)
        self.distractor_colors = {
            StimulusType.CIRCLE: (200, 150, 50),
            StimulusType.SQUARE: (50, 150, 200),
            StimulusType.TRIANGLE: (150, 50, 150),
            StimulusType.STAR: (50, 200, 50),
        }
    
    def generate_stimulus(self, level: int, weak_side_bias: float = 0.0) -> Optional[Stimulus]:
        """Generate a new stimulus, avoiding UI overlay areas"""
        current_time = time.time()
        
        # Check interval
        if current_time - self.last_stimulus_time < self.stimulus_interval:
            return None
        
        # Select visual field with bias
        field = self._select_visual_field(weak_side_bias)
        
        # Determine stimulus parameters based on level
        stimulus_type, size, is_target = self._get_stimulus_parameters(level)
        
        # Try to find a valid position (avoid UI elements)
        max_attempts = 10
        x, y = 0, 0
        for attempt in range(max_attempts):
            # Get position based on field
            zone = self.field_zones[field]
            x = int(random.uniform(zone[0] + 0.1, zone[0] + zone[2] - 0.1) * self.config.SCREEN_WIDTH)
            y = int(random.uniform(zone[1] + 0.1, zone[1] + zone[3] - 0.1) * self.config.SCREEN_HEIGHT)
            
            # Check if position overlaps with UI elements
            if not self._position_overlaps_ui(x, y, size):
                break
            
            if attempt == max_attempts - 1:
                # Last attempt failed, try different field
                field = random.choice(list(self.field_zones.keys()))
                continue
        
        # Final check to ensure position is valid
        if self._position_overlaps_ui(x, y, size):
            # If still overlapping, find a completely different position
            safe_fields = [f for f in self.field_zones.keys() 
                          if f not in [VisualField.TOP, VisualField.TOP_LEFT, VisualField.TOP_RIGHT]]
            if safe_fields:
                field = random.choice(safe_fields)
                zone = self.field_zones[field]
                x = int(random.uniform(zone[0] + 0.2, zone[0] + zone[2] - 0.2) * self.config.SCREEN_WIDTH)
                y = int(random.uniform(zone[1] + 0.2, zone[1] + zone[3] - 0.2) * self.config.SCREEN_HEIGHT)
        
        # Choose color
        color = self.stimulus_colors[stimulus_type] if is_target else self.distractor_colors[stimulus_type]
        
        # Create stimulus
        stimulus = Stimulus(
            id=self.next_stimulus_id,
            field=field,
            type=stimulus_type,
            x=x,
            y=y,
            size=size,
            color=color,
            appear_time=current_time,
            duration_ms=self.config.STIMULUS_DURATIONS.get(level, 2000),
            level=level,
            is_target=is_target
        )
        
        self.next_stimulus_id += 1
        self.last_stimulus_time = current_time
        self.stimuli.append(stimulus)
        
        return stimulus
    
    def _position_overlaps_ui(self, x: int, y: int, size: int = 0) -> bool:
        """Check if a stimulus position overlaps with UI elements"""
        # Camera feed area (with margin)
        cam_rect = pygame.Rect(
            self.camera_overlay_rect[0] - size - 20,
            self.camera_overlay_rect[1] - size - 20,
            self.camera_overlay_rect[2] + 2 * (size + 20),
            self.camera_overlay_rect[3] + 2 * (size + 20)
        )
        
        # Head indicator area (with margin)
        head_rect = pygame.Rect(
            self.head_indicator_rect[0] - size - 20,
            self.head_indicator_rect[1] - size - 20,
            self.head_indicator_rect[2] + 2 * (size + 20),
            self.head_indicator_rect[3] + 2 * (size + 20)
        )
        
        # HUD area (top bar - prevent stimuli too close to HUD)
        hud_rect = pygame.Rect(0, 0, self.config.SCREEN_WIDTH, 220)
        
        # Create rectangle representing the stimulus
        stimulus_rect = pygame.Rect(x - size//2, y - size//2, size, size)
        
        # Check overlaps
        return (cam_rect.colliderect(stimulus_rect) or 
                head_rect.colliderect(stimulus_rect) or 
                hud_rect.colliderect(stimulus_rect))
    
    def _select_visual_field(self, weak_side_bias: float = 0.0) -> VisualField:
        """Select visual field with optional bias for weak side"""
        fields = list(self.field_zones.keys())
        
        if weak_side_bias > 0:
            # Bias toward left side
            left_fields = [f for f in fields if 'left' in f.value]
            if random.random() < weak_side_bias and left_fields:
                return random.choice(left_fields)
        elif weak_side_bias < 0:
            # Bias toward right side
            right_fields = [f for f in fields if 'right' in f.value]
            if random.random() < abs(weak_side_bias) and right_fields:
                return random.choice(right_fields)
        
        return random.choice(fields)
    
    def _get_stimulus_parameters(self, level: int):
        """Get stimulus type, size, and target status based on level"""
        if level == 1:
            # Level 1: Only circles, large, always targets
            return StimulusType.CIRCLE, random.randint(80, 120), True
            
        elif level == 2:
            # Level 2: Circles and squares, react only to circles
            stimulus_type = random.choice([StimulusType.CIRCLE, StimulusType.SQUARE])
            return stimulus_type, random.randint(60, 90), stimulus_type == StimulusType.CIRCLE
            
        elif level == 3:
            # Level 3: All shapes, circles and stars are targets
            stimulus_type = random.choice(list(StimulusType))
            return stimulus_type, random.randint(50, 80), stimulus_type in [StimulusType.CIRCLE, StimulusType.STAR]
            
        elif level >= 4:
            # Level 4+: All shapes, smaller, faster
            stimulus_type = random.choice(list(StimulusType))
            is_target = random.random() > 0.3  # 70% targets, 30% distractors
            return stimulus_type, random.randint(40, 70), is_target
            
        else:
            return StimulusType.CIRCLE, random.randint(60, 100), True
    
    def update(self, current_time: float) -> List[Stimulus]:
        """Update all stimuli and return expired ones"""
        expired = []
        active = []
        
        for stimulus in self.stimuli:
            if stimulus.is_expired(current_time):
                expired.append(stimulus)
            else:
                active.append(stimulus)
        
        self.stimuli = active
        return expired
    
    def clear_all(self):
        """Clear all stimuli"""
        self.stimuli.clear()

# ==================== ADAPTIVE DIFFICULTY ====================
class AdaptiveDifficulty:
    """Adapts game difficulty based on player performance"""
    
    def __init__(self):
        self.current_level = 1
        self.weak_side_bias = 0.0
        self.performance_history = []
        self.last_level_change = time.time()
        
    def update(self, metrics: SessionMetrics, session_duration: float):
        """Update difficulty based on performance"""
        if session_duration < 10:  # Don't change level in first 10 seconds
            return
        
        accuracy = metrics.calculate_accuracy()
        avg_rt = metrics.calculate_average_rt()
        side_bias = metrics.get_side_bias()
        
        # Store performance
        self.performance_history.append({
            'time': datetime.now(),
            'accuracy': accuracy,
            'avg_rt': avg_rt,
            'level': self.current_level
        })
        
        # Update weak side bias
        self.weak_side_bias = self._calculate_weak_side_bias(side_bias)
        
        # Level progression rules
        current_time = time.time()
        if current_time - self.last_level_change < 30:  # Minimum 30 seconds per level
            return
        
        if self.current_level == 1 and accuracy > 75 and avg_rt < 1500:
            self.current_level = 2
            self.last_level_change = current_time
            print("Advancing to Level 2! (Circles and Squares)")
            
        elif self.current_level == 2 and accuracy > 70 and avg_rt < 1200:
            self.current_level = 3
            self.last_level_change = current_time
            print("Advancing to Level 3! (More shapes)")
            
        elif self.current_level == 3 and accuracy > 65 and avg_rt < 1000:
            self.current_level = 4
            self.last_level_change = current_time
            print("Advancing to Level 4! (Distractors added)")
            
        elif self.current_level == 4 and accuracy > 60 and avg_rt < 800:
            self.current_level = 5
            self.last_level_change = current_time
            print("Advancing to Level 5! (Expert mode)")
        
        # Level regression if performance is poor
        elif self.current_level > 1 and accuracy < 50 and avg_rt > 2000:
            self.current_level -= 1
            self.last_level_change = current_time
            print(f"Dropping to Level {self.current_level} (needs improvement)")
    
    def _calculate_weak_side_bias(self, side_bias: Dict[str, Any]) -> float:
        """Calculate bias adjustment for weak side training"""
        bias_percentage = side_bias['bias_percentage']
        weaker_side = side_bias['weaker_side']
        
        if abs(bias_percentage) < 15:
            return 0.0
        
        bias_strength = min(abs(bias_percentage) / 100, 0.4)
        
        return bias_strength if weaker_side == 'left' else -bias_strength
    
    def get_stimulus_interval(self) -> float:
        """Get current stimulus interval"""
        base_intervals = {1: 2.5, 2: 2.0, 3: 1.7, 4: 1.4, 5: 1.0}
        return base_intervals.get(self.current_level, 2.0)
    
    def get_config(self) -> Dict[str, Any]:
        """Get current difficulty configuration"""
        return {
            'level': self.current_level,
            'weak_side_bias': self.weak_side_bias,
            'stimulus_interval': self.get_stimulus_interval(),
            'allow_distractors': self.current_level >= 4
        }

# ==================== DATA MANAGER ====================
class DataManager:
    """Manages patient data storage and retrieval"""
    
    def __init__(self):
        self.db_path = "periquest_sessions.db"
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create sessions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            patient_id TEXT,
            start_time TEXT,
            end_time TEXT,
            duration REAL,
            level INTEGER,
            total_stimuli INTEGER,
            correct_reactions INTEGER,
            missed_stimuli INTEGER,
            false_positives INTEGER,
            average_reaction_time REAL,
            accuracy REAL,
            score INTEGER,
            head_movements INTEGER,
            fixation_breaks INTEGER,
            side_bias TEXT,
            field_performance TEXT
        )
        ''')
        
        # Create patient_progress table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS patient_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            date TEXT,
            metric_name TEXT,
            metric_value REAL
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_session(self, metrics: SessionMetrics):
        """Save session data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        metrics_dict = metrics.to_dict()
        
        cursor.execute('''
        INSERT INTO sessions (
            session_id, patient_id, start_time, end_time, duration,
            level, total_stimuli, correct_reactions, missed_stimuli,
            false_positives, average_reaction_time, accuracy, score,
            head_movements, fixation_breaks, side_bias, field_performance
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            metrics_dict['session_id'],
            metrics_dict['patient_id'],
            metrics_dict['start_time'],
            metrics_dict['end_time'],
            (datetime.fromisoformat(metrics_dict['end_time']) - 
             datetime.fromisoformat(metrics_dict['start_time'])).total_seconds(),
            metrics_dict['level'],
            metrics_dict['total_stimuli'],
            metrics_dict['correct_reactions'],
            metrics_dict['missed_stimuli'],
            metrics_dict['false_positives'],
            metrics_dict['average_reaction_time_ms'],
            metrics_dict['accuracy_percentage'],
            metrics_dict['score'],
            metrics_dict['head_movements'],
            metrics_dict['fixation_breaks'],
            json.dumps(metrics_dict['side_bias']),
            json.dumps(metrics_dict['field_performance'])
        ))
        
        conn.commit()
        conn.close()
        
        # Also save to CSV for easy analysis
        self._export_to_csv(metrics_dict)
        
        print(f"Session data saved to {self.db_path}")
    
    def _export_to_csv(self, metrics_dict: Dict[str, Any]):
        """Export session data to CSV"""
        csv_file = f"session_{metrics_dict['session_id']}.csv"
        
        # Flatten dictionary
        flat_data = {}
        for key, value in metrics_dict.items():
            if isinstance(value, (dict, list)):
                flat_data[key] = json.dumps(value)
            else:
                flat_data[key] = value
        
        # Write to CSV
        with open(csv_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=flat_data.keys())
            writer.writeheader()
            writer.writerow(flat_data)
        
        print(f"Session data exported to {csv_file}")
    
    def export_session_detailed(self, metrics: SessionMetrics):
        """Export detailed session data including reaction times"""
        metrics_dict = metrics.to_dict()
        
        # Create DataFrame for detailed data
        detailed_data = {
            'patient_id': metrics_dict['patient_id'],
            'session_id': metrics_dict['session_id'],
            'level': metrics_dict['level'],
            'accuracy': metrics_dict['accuracy_percentage'],
            'avg_reaction_time': metrics_dict['average_reaction_time_ms'],
            'reaction_times': json.dumps(metrics_dict['reaction_times'])
        }
        
        # Add field performance
        for field, stats in metrics_dict['field_performance'].items():
            detailed_data[f'{field}_correct'] = stats['correct']
            detailed_data[f'{field}_total'] = stats['total']
            detailed_data[f'{field}_avg_rt'] = stats['avg_rt']
        
        # Export to CSV
        filename = f"detailed_session_{metrics_dict['session_id']}.csv"
        df = pd.DataFrame([detailed_data])
        df.to_csv(filename, index=False)
        
        # Also export reaction times separately
        rt_filename = f"reaction_times_{metrics_dict['session_id']}.csv"
        rt_data = [{'trial_number': i+1, 'reaction_time_ms': rt} 
                  for i, rt in enumerate(metrics_dict['reaction_times'])]
        rt_df = pd.DataFrame(rt_data)
        rt_df.to_csv(rt_filename, index=False)
        
        print(f"Detailed data exported to {filename} and {rt_filename}")
    
    def get_patient_sessions(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all sessions for a patient"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM sessions 
        WHERE patient_id = ? 
        ORDER BY start_time DESC
        LIMIT 20
        ''', (patient_id,))
        
        sessions = []
        columns = [col[0] for col in cursor.description]
        
        for row in cursor.fetchall():
            session = dict(zip(columns, row))
            
            # Parse JSON fields
            for field in ['side_bias', 'field_performance']:
                if session[field]:
                    session[field] = json.loads(session[field])
            
            sessions.append(session)
        
        conn.close()
        return sessions

# ==================== GAME RENDERER ====================
class GameRenderer:
    """Handles all game rendering"""
    
    def __init__(self, config: GameConfig):
        self.config = config
        
        # Initialize display
        self.screen = pygame.display.set_mode((config.SCREEN_WIDTH, config.SCREEN_HEIGHT))
        pygame.display.set_caption("PeriQuest - Full Version")
        
        # Load fonts
        self.title_font = pygame.font.SysFont('Arial', config.TITLE_FONT_SIZE, bold=True)
        self.score_font = pygame.font.SysFont('Arial', config.SCORE_FONT_SIZE)
        self.info_font = pygame.font.SysFont('Arial', config.INFO_FONT_SIZE)
        self.small_font = pygame.font.SysFont('Arial', config.SMALL_FONT_SIZE)
        
        # Clock for FPS control
        self.clock = pygame.time.Clock()
        
        # Center fixation
        self.center_radius = 10
        
        # Surface caching for better performance
        self.stimulus_cache = {}
    
    def clear_screen(self):
        """Clear the screen"""
        self.screen.fill(self.config.BACKGROUND_COLOR)
    
    def draw_center_fixation(self):
        """Draw the central fixation point"""
        center_x = self.config.SCREEN_WIDTH // 2
        center_y = self.config.SCREEN_HEIGHT // 2
        
        # Outer ring
        pygame.gfxdraw.aacircle(self.screen, center_x, center_y, self.center_radius + 8, (150, 150, 150))
        
        # Inner ring
        pygame.gfxdraw.aacircle(self.screen, center_x, center_y, self.center_radius + 4, (200, 200, 200))
        
        # Center dot
        pygame.gfxdraw.filled_circle(self.screen, center_x, center_y, self.center_radius, self.config.CENTER_DOT_COLOR)
        pygame.gfxdraw.aacircle(self.screen, center_x, center_y, self.center_radius, self.config.CENTER_DOT_COLOR)
    
    def draw_stimulus(self, stimulus: Stimulus):
        """Draw a stimulus on screen with caching"""
        # Fixed: No blinking/pulsing - solid appearance only
        color_with_alpha = (*stimulus.color, 255)  # Always full opacity
        
        # Create cache key
        cache_key = f"{stimulus.type.value}_{stimulus.size}_{stimulus.color}"
        
        if cache_key not in self.stimulus_cache:
            # Create and cache surface
            surface = self._create_stimulus_surface(stimulus, color_with_alpha)
            self.stimulus_cache[cache_key] = surface
        else:
            surface = self.stimulus_cache[cache_key]
        
        # Draw surface at position
        self.screen.blit(surface, (stimulus.x - stimulus.size, stimulus.y - stimulus.size))
        
        # Draw target indicator
        if stimulus.is_target:
            self._draw_target_indicator(stimulus)
    
    def _create_stimulus_surface(self, stimulus: Stimulus, color: Tuple[int, int, int, int]):
        """Create a surface for a stimulus"""
        surface_size = stimulus.size * 2
        surface = pygame.Surface((surface_size, surface_size), pygame.SRCALPHA)
        
        if stimulus.type == StimulusType.CIRCLE:
            self._draw_circle_on_surface(surface, stimulus.size, color)
        elif stimulus.type == StimulusType.SQUARE:
            self._draw_square_on_surface(surface, stimulus.size, color)
        elif stimulus.type == StimulusType.TRIANGLE:
            self._draw_triangle_on_surface(surface, stimulus.size, color)
        elif stimulus.type == StimulusType.STAR:
            self._draw_star_on_surface(surface, stimulus.size, color)
        
        return surface
    
    def _draw_circle_on_surface(self, surface, size: int, color: Tuple[int, int, int, int]):
        """Draw circle on surface"""
        radius = size // 2
        center = size
        
        # Fill
        pygame.gfxdraw.filled_circle(surface, center, center, radius, color)
        
        # Outline
        outline_color = (255, 255, 255, color[3])
        pygame.gfxdraw.aacircle(surface, center, center, radius, outline_color)
        pygame.gfxdraw.aacircle(surface, center, center, radius - 1, outline_color)
    
    def _draw_square_on_surface(self, surface, size: int, color: Tuple[int, int, int, int]):
        """Draw square on surface"""
        offset = size // 2
        rect = pygame.Rect(offset, offset, size, size)
        
        pygame.draw.rect(surface, color, rect)
        pygame.draw.rect(surface, (255, 255, 255, color[3]), rect, 3)
    
    def _draw_triangle_on_surface(self, surface, size: int, color: Tuple[int, int, int, int]):
        """Draw triangle on surface"""
        half = size
        points = [
            (half, 0),
            (0, half * 2),
            (half * 2, half * 2)
        ]
        
        pygame.gfxdraw.filled_polygon(surface, points, color)
        pygame.gfxdraw.aapolygon(surface, points, (255, 255, 255, color[3]))
    
    def _draw_star_on_surface(self, surface, size: int, color: Tuple[int, int, int, int]):
        """Draw star on surface"""
        center = size
        radius = size // 2
        
        points = []
        for i in range(10):
            angle = math.pi / 5 * i
            r = radius if i % 2 == 0 else radius * 0.5
            x = center + r * math.cos(angle - math.pi / 2)
            y = center + r * math.sin(angle - math.pi / 2)
            points.append((x, y))
        
        pygame.gfxdraw.filled_polygon(surface, points, color)
        pygame.gfxdraw.aapolygon(surface, points, (255, 255, 255, color[3]))
    
    def _draw_target_indicator(self, stimulus: Stimulus):
        """Draw small indicator for target stimuli"""
        pygame.gfxdraw.filled_circle(self.screen, stimulus.x, stimulus.y, 4, (255, 255, 255, 180))
    
    def draw_hud(self, metrics: SessionMetrics, time_remaining: float, level: int, config: Dict[str, Any]):
        """Draw heads-up display"""
        # Main HUD panel
        main_hud = pygame.Rect(10, 10, 350, 180)
        pygame.draw.rect(self.screen, self.config.HUD_BACKGROUND, main_hud)
        pygame.draw.rect(self.screen, (80, 120, 180), main_hud, 2)
        
        y_offset = 25
        
        # Level and time
        self._draw_hud_text(f"Level: {level}", 25, y_offset, self.score_font)
        self._draw_hud_text(f"Time: {int(time_remaining)}s", 180, y_offset, self.score_font)
        y_offset += 35
        
        # Score and accuracy
        accuracy = metrics.calculate_accuracy()
        self._draw_hud_text(f"Score: {metrics.score}", 25, y_offset, self.info_font)
        self._draw_hud_text(f"Accuracy: {accuracy:.1f}%", 180, y_offset, self.info_font)
        y_offset += 30
        
        # Reaction time and stimuli
        avg_rt = metrics.calculate_average_rt()
        self._draw_hud_text(f"Avg RT: {avg_rt:.0f}ms", 25, y_offset, self.info_font)
        self._draw_hud_text(f"Stimuli: {metrics.total_stimuli}", 180, y_offset, self.info_font)
        y_offset += 30
        
        # Side bias
        side_bias = metrics.get_side_bias()
        bias_text = f"Side Bias: {side_bias['weaker_side'].upper()} ({abs(side_bias['bias_percentage']):.1f}%)"
        self._draw_hud_text(bias_text, 25, y_offset, self.small_font)
        y_offset += 25
        
        # Head movements
        moves_text = f"Head Moves: {metrics.head_movements} | Fix Breaks: {metrics.fixation_breaks}"
        self._draw_hud_text(moves_text, 25, y_offset, self.small_font)
        
        # Camera/Input status panel
        status_hud = pygame.Rect(self.config.SCREEN_WIDTH - 250, 10, 240, 80)
        pygame.draw.rect(self.screen, self.config.HUD_BACKGROUND, status_hud)
        pygame.draw.rect(self.screen, (80, 120, 180), status_hud, 2)
        
        self._draw_hud_text("Input Methods:", self.config.SCREEN_WIDTH - 240, 25, self.small_font)
        self._draw_hud_text("• SPACE: Keyboard", self.config.SCREEN_WIDTH - 240, 45, self.small_font)
        self._draw_hud_text("• Hand Gesture: Camera", self.config.SCREEN_WIDTH - 240, 65, self.small_font)
    
    def _draw_hud_text(self, text: str, x: int, y: int, font):
        """Helper to draw HUD text"""
        rendered = font.render(text, True, self.config.TEXT_COLOR)
        self.screen.blit(rendered, (x, y))
    
    def draw_camera_feed(self, frame, position: Tuple[int, int] = (10, 200)):
        """Draw camera feed on screen as background"""
        if frame is None:
            # Draw placeholder
            placeholder = pygame.Rect(position[0], position[1], 320, 240)
            pygame.draw.rect(self.screen, (20, 30, 40), placeholder)
            pygame.draw.rect(self.screen, (60, 90, 120), placeholder, 2)
            
            no_cam_text = self.info_font.render("Camera Not Available", True, (150, 150, 150))
            self.screen.blit(no_cam_text, (position[0] + 80, position[1] + 110))
            return
        
        try:
            # Resize if needed
            if frame.shape[1] > 320 or frame.shape[0] > 240:
                frame = cv2.resize(frame, (320, 240))
            
            # Convert to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_surface = pygame.surfarray.make_surface(frame_rgb.swapaxes(0, 1))
            
            # Draw border
            border = pygame.Rect(position[0] - 2, position[1] - 2, 324, 244)
            pygame.draw.rect(self.screen, (60, 90, 120), border, 2)
            
            # Blit to screen
            self.screen.blit(frame_surface, position)
            
        except Exception:
            # Fallback placeholder
            placeholder = pygame.Rect(position[0], position[1], 320, 240)
            pygame.draw.rect(self.screen, (20, 30, 40), placeholder)
            pygame.draw.rect(self.screen, (60, 90, 120), placeholder, 2)
    
    def draw_head_position(self, head_data: Optional[Dict], position: Tuple[int, int] = (340, 200)):
        """Draw head position indicator"""
        indicator_size = 180
        surface = pygame.Surface((indicator_size, indicator_size), pygame.SRCALPHA)
        
        # Background circle
        pygame.gfxdraw.aacircle(surface, indicator_size // 2, indicator_size // 2, 
                               indicator_size // 2 - 15, (80, 80, 80, 150))
        
        # Center crosshair
        center = indicator_size // 2
        pygame.draw.line(surface, (150, 150, 150, 100), 
                        (center - 15, center), (center + 15, center), 2)
        pygame.draw.line(surface, (150, 150, 150, 100), 
                        (center, center - 15), (center, center + 15), 2)
        
        if head_data:
            # Head position
            head_x, head_y = head_data['position']
            indicator_x = int((head_x - 0.5) * indicator_size * 0.7 + center)
            indicator_y = int((head_y - 0.5) * indicator_size * 0.7 + center)
            
            # Color based on position
            color = (0, 255, 0) if head_data.get('within_bounds', True) else (255, 100, 100)
            pygame.gfxdraw.filled_circle(surface, indicator_x, indicator_y, 10, (*color, 200))
            pygame.gfxdraw.aacircle(surface, indicator_x, indicator_y, 10, (*color, 255))
            
            # Status text
            status = "HEAD CENTERED" if head_data.get('within_bounds', True) else "MOVE TO CENTER"
            status_color = (100, 255, 100) if head_data.get('within_bounds', True) else (255, 100, 100)
            
        else:
            # No head data
            status = "NO HEAD TRACKING"
            status_color = (150, 150, 150)
        
        # Draw to screen
        self.screen.blit(surface, position)
        
        # Draw status
        status_text = self.small_font.render(status, True, status_color)
        self.screen.blit(status_text, (position[0], position[1] + indicator_size + 10))
    
    def draw_feedback(self, message: str, color: Tuple[int, int, int]):
        """Draw feedback message"""
        feedback_text = self.title_font.render(message, True, color)
        text_rect = feedback_text.get_rect(center=(self.config.SCREEN_WIDTH // 2, 
                                                  self.config.SCREEN_HEIGHT // 2))
        
        # Background
        bg_rect = text_rect.inflate(50, 30)
        pygame.draw.rect(self.screen, (0, 0, 0, 220), bg_rect, border_radius=15)
        pygame.draw.rect(self.screen, color, bg_rect, 3, border_radius=15)
        
        self.screen.blit(feedback_text, text_rect)
    
    def draw_game_over(self, metrics: SessionMetrics):
        """Draw game over screen with results"""
        self.clear_screen()
        
        # Title
        title = self.title_font.render("SESSION COMPLETE!", True, (255, 255, 255))
        title_rect = title.get_rect(center=(self.config.SCREEN_WIDTH // 2, 60))
        self.screen.blit(title, title_rect)
        
        # Results container
        results_rect = pygame.Rect(self.config.SCREEN_WIDTH // 2 - 300, 120, 600, 400)
        pygame.draw.rect(self.screen, (20, 30, 45), results_rect, border_radius=20)
        pygame.draw.rect(self.screen, (80, 140, 200), results_rect, 4, border_radius=20)
        
        # Results
        y_offset = 150
        results = [
            f"Final Level: {metrics.level}",
            f"Total Score: {metrics.score}",
            f"Stimuli Presented: {metrics.total_stimuli}",
            f"Correct Reactions: {metrics.correct_reactions}",
            f"Accuracy: {metrics.calculate_accuracy():.1f}%",
            f"Average Reaction Time: {metrics.calculate_average_rt():.0f}ms",
            f"Weak Side: {metrics.get_side_bias()['weaker_side'].upper()}",
            f"Head Movements: {metrics.head_movements}",
            f"Fixation Breaks: {metrics.fixation_breaks}"
        ]
        
        for result in results:
            text = self.score_font.render(result, True, (230, 230, 230))
            self.screen.blit(text, (self.config.SCREEN_WIDTH // 2 - 280, y_offset))
            y_offset += 40
        
        # Instructions
        instructions = self.info_font.render("Press R to restart or ESC to quit", True, (200, 220, 100))
        instructions_rect = instructions.get_rect(center=(self.config.SCREEN_WIDTH // 2, 
                                                         self.config.SCREEN_HEIGHT - 50))
        self.screen.blit(instructions, instructions_rect)
    
    def draw_rules_screen(self):
        """Draw the rules screen before starting the game"""
        self.clear_screen()
        
        # Title
        title = self.title_font.render("PERIQUEST - GAME RULES", True, (255, 255, 200))
        title_rect = title.get_rect(center=(self.config.SCREEN_WIDTH // 2, 60))
        self.screen.blit(title, title_rect)
        
        # Rules container
        rules_rect = pygame.Rect(self.config.SCREEN_WIDTH // 2 - 400, 120, 800, 450)
        pygame.draw.rect(self.screen, (20, 30, 45), rules_rect, border_radius=20)
        pygame.draw.rect(self.screen, (80, 140, 200), rules_rect, 4, border_radius=20)
        
        # Rules
        rules = [
            "OBJECTIVE:",
            "• Train your peripheral vision by detecting stimuli while maintaining central fixation",
            "",
            "GAME RULES:",
            "1. Keep your eyes FIXED on the CENTER DOT at all times",
            "2. Stimuli will appear in your peripheral vision",
            "3. React ONLY to target stimuli (ignore distractors)",
            "4. Press SPACE key when you see a target stimulus",
            "5. Or raise your HAND above wrist (if camera is available)",
            "6. Try NOT to move your head during the session",
            "",
            "LEVEL PROGRESSION:",
            "• Level 1: Only circles (all are targets)",
            "• Level 2: Circles (targets) and squares (distractors)",
            "• Level 3: Circles & stars (targets), squares & triangles (distractors)",
            "• Level 4+: All shapes, 70% targets, 30% distractors",
            "",
            "SCORING:",
            "• Perfect reaction (<500ms): 100 points",
            "• Good reaction (500-1000ms): 50 points",
            "• Slow reaction (1000-2000ms): 25 points",
            "• Missed stimulus: -5 points",
            "",
            "CONTROLS:",
            "• SPACE: React to target",
            "• P: Pause/Resume game",
            "• ESC: Quit game",
            "• R: Restart after game over"
        ]
        
        y_offset = 150
        for rule in rules:
            if "OBJECTIVE:" in rule or "GAME RULES:" in rule or "LEVEL PROGRESSION:" in rule or "SCORING:" in rule or "CONTROLS:" in rule:
                # Section headers
                text = self.score_font.render(rule, True, (100, 200, 255))
                self.screen.blit(text, (self.config.SCREEN_WIDTH // 2 - 380, y_offset))
                y_offset += 30
            elif rule == "":
                # Empty line
                y_offset += 10
            else:
                # Regular text
                text = self.info_font.render(rule, True, (230, 230, 230))
                self.screen.blit(text, (self.config.SCREEN_WIDTH // 2 - 370, y_offset))
                y_offset += 25
        
        # Continue instruction
        continue_text = self.title_font.render("Press SPACE to start the game", True, (100, 255, 100))
        continue_rect = continue_text.get_rect(center=(self.config.SCREEN_WIDTH // 2, 
                                                     self.config.SCREEN_HEIGHT - 50))
        
        # Background for continue text
        continue_bg = continue_rect.inflate(40, 20)
        pygame.draw.rect(self.screen, (0, 0, 0, 200), continue_bg, border_radius=15)
        pygame.draw.rect(self.screen, (100, 255, 100), continue_bg, 3, border_radius=15)
        
        self.screen.blit(continue_text, continue_rect)
        self.update_display()
    
    def update_display(self):
        """Update the display"""
        pygame.display.flip()
        self.clock.tick(self.config.FPS)

# ==================== MAIN GAME CLASS ====================
class PeriQuestGame:
    """Main game controller"""
    
    def __init__(self, patient_id: str = "default"):
        self.config = GameConfig()
        self.patient_id = patient_id
        self.session_id = f"{patient_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize components
        self.vision_tracker = VisionTracker()
        self.stimulus_manager = StimulusManager(self.config)
        self.adaptive_difficulty = AdaptiveDifficulty()
        self.data_manager = DataManager()
        self.renderer = GameRenderer(self.config)
        
        # Game state
        self.running = False
        self.paused = False
        self.game_over = False
        self.session_start_time = 0
        self.showing_rules = True  # Show rules first
        self.debug_mode = False  # Set to True for testing zone visualization
        
        # Metrics
        self.metrics = SessionMetrics(
            patient_id=patient_id,
            session_id=self.session_id,
            start_time=datetime.now()
        )
        
        # Feedback system with queue
        self.feedback_queue = deque(maxlen=3)
        self.current_feedback = None
        
        # Camera frame
        self.camera_frame = None
        
        # Gesture cooldown
        self.last_gesture_time = 0
        self.gesture_cooldown = 0.5  # seconds
        
        print(f"PeriQuest Game Initialized for Patient: {patient_id}")
    
    def initialize(self):
        """Initialize the game"""
        print("Initializing game components...")
        
        # Debug: List available cameras
        print("Checking for available cameras...")
        for i in range(4):
            temp_cap = cv2.VideoCapture(i)
            if temp_cap.isOpened():
                print(f"  Camera found at index {i}")
                temp_cap.release()
            else:
                print(f"  No camera at index {i}")
        
        # Initialize camera (optional)
        camera_available = self.vision_tracker.initialize_camera()
        
        if camera_available:
            print("Camera initialized successfully")
        else:
            print("Camera not available - using keyboard mode")
        
        # Calibration
        print("Calibration starting... Look at center dot")
        self._show_calibration_screen()
        
        if not self.vision_tracker.calibrate(duration_seconds=4):
            print("Calibration skipped or failed")
        
        print("Game initialization complete!")
        return True
    
    def _show_calibration_screen(self):
        """Show calibration screen"""
        self.renderer.clear_screen()
        self.renderer.draw_center_fixation()
        
        # Calibration message
        cal_text = self.renderer.title_font.render("CALIBRATION - LOOK AT CENTER DOT", 
                                                  True, (255, 255, 200))
        text_rect = cal_text.get_rect(center=(self.config.SCREEN_WIDTH // 2, 
                                             self.config.SCREEN_HEIGHT // 2 - 50))
        
        # Countdown
        countdown_text = self.renderer.title_font.render("Starting in 3 seconds...", 
                                                        True, (255, 200, 100))
        countdown_rect = countdown_text.get_rect(center=(self.config.SCREEN_WIDTH // 2, 
                                                        self.config.SCREEN_HEIGHT // 2 + 50))
        
        bg_rect = text_rect.union(countdown_rect).inflate(40, 40)
        pygame.draw.rect(self.renderer.screen, (0, 0, 0, 200), bg_rect, border_radius=10)
        pygame.draw.rect(self.renderer.screen, (255, 255, 200), bg_rect, 2, border_radius=10)
        
        self.renderer.screen.blit(cal_text, text_rect)
        self.renderer.screen.blit(countdown_text, countdown_rect)
        self.renderer.update_display()
        
        # Brief pause to show the message
        time.sleep(1)
    
    def show_rules(self):
        """Show the rules screen"""
        self.renderer.draw_rules_screen()
        return True
    
    def start_session(self):
        """Start a new therapy session"""
        self.running = True
        self.paused = False
        self.game_over = False
        self.showing_rules = False
        self.session_start_time = time.time()
        
        # Reset metrics
        self.metrics = SessionMetrics(
            patient_id=self.patient_id,
            session_id=self.session_id,
            start_time=datetime.now()
        )
        
        # Reset stimulus manager
        self.stimulus_manager.clear_all()
        
        # Reset feedback queue
        self.feedback_queue.clear()
        self.current_feedback = None
        
        print(f"Session {self.session_id} started!")
    
    def handle_events(self):
        """Handle PyGame events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                
                elif event.key == pygame.K_p and not self.showing_rules:
                    self.paused = not self.paused
                    print(f"Game {'paused' if self.paused else 'resumed'}")
                
                elif event.key == pygame.K_SPACE:
                    if self.showing_rules:
                        # Start the game from rules screen
                        self.start_session()
                    elif not self.game_over:
                        self._handle_space_reaction()
                
                elif event.key == pygame.K_r and self.game_over:
                    self._restart_session()
                
                elif event.key == pygame.K_d:  # Debug mode toggle
                    self.debug_mode = not self.debug_mode
                    print(f"Debug mode: {'ON' if self.debug_mode else 'OFF'}")
    
    def _handle_space_reaction(self):
        """Handle space bar reaction"""
        current_time = time.time()
        
        for stimulus in self.stimulus_manager.stimuli:
            if not stimulus.reacted and stimulus.is_target:
                reaction_time = current_time - stimulus.appear_time
                
                if reaction_time * 1000 < stimulus.duration_ms:
                    self._process_reaction(stimulus, reaction_time)
                    break
                else:
                    # Too late
                    self.metrics.add_miss(stimulus)
                    self._show_feedback("Too late!", (255, 100, 100))
                    break
    
    def _process_reaction(self, stimulus: Stimulus, reaction_time: float):
        """Process a successful reaction"""
        stimulus.reacted = True
        stimulus.reaction_time = reaction_time
        
        # Add to metrics
        self.metrics.add_reaction(stimulus, reaction_time)
        
        # Calculate score
        rt_ms = reaction_time * 1000
        if rt_ms < self.config.PERFECT_REACTION:
            points = self.config.PERFECT_SCORE
            feedback = "PERFECT!"
            color = (100, 255, 100)
        elif rt_ms < self.config.GOOD_REACTION:
            points = self.config.GOOD_SCORE
            feedback = "GOOD!"
            color = (200, 255, 100)
        elif rt_ms < self.config.SLOW_REACTION:
            points = self.config.SLOW_SCORE
            feedback = "SLOW"
            color = (255, 200, 100)
        else:
            points = 10
            feedback = "VERY SLOW"
            color = (255, 150, 100)
        
        self.metrics.score += points
        self._show_feedback(feedback, color)
    
    def _show_feedback(self, message: str, color: Tuple[int, int, int]):
        """Show feedback message"""
        self.feedback_queue.append({
            "message": message,
            "color": color,
            "end_time": time.time() + 1.0
        })
    
    def _restart_session(self):
        """Restart the session"""
        self.session_id = f"{self.patient_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.start_session()
        print("Session restarted!")
    
    def update(self):
        """Update game state"""
        if self.paused or self.game_over or self.showing_rules:
            return
        
        current_time = time.time()
        session_duration = current_time - self.session_start_time
        
        # Check session duration
        if session_duration >= self.config.SESSION_DURATION:
            self.end_session()
            return
        
        # Update camera frame (only if camera is available)
        if self.vision_tracker.cap:
            self.camera_frame = self.vision_tracker.get_camera_frame()
        else:
            self.camera_frame = None
        
        # Update head tracking (handles no-camera case internally)
        head_data = self.vision_tracker.get_head_position()
        if head_data:
            if head_data.get('head_moved', False):
                self.metrics.head_movements += 1
            
            if head_data.get('fixation_break', False):
                self.metrics.fixation_breaks += 1
            
            if not head_data.get('within_bounds', True):
                self._show_feedback("Keep head centered!", (255, 100, 100))
        
        # Update adaptive difficulty
        self.adaptive_difficulty.update(self.metrics, session_duration)
        level_config = self.adaptive_difficulty.get_config()
        self.metrics.level = level_config['level']
        
        # Update stimulus manager
        self.stimulus_manager.stimulus_interval = level_config['stimulus_interval']
        
        # Generate new stimulus
        if random.random() < 0.25:  # 25% chance per frame
            stimulus = self.stimulus_manager.generate_stimulus(
                level_config['level'],
                level_config['weak_side_bias']
            )
            if stimulus:
                self.metrics.total_stimuli += 1
        
        # Update stimuli
        expired = self.stimulus_manager.update(current_time)
        for stimulus in expired:
            if stimulus.is_target and not stimulus.reacted:
                self.metrics.add_miss(stimulus)
                self.metrics.score += self.config.MISS_PENALTY
                self._show_feedback("Missed!", (255, 100, 100))
        
        # Check hand gestures
        self._check_hand_gestures(current_time)
        
        # Update feedback
        if self.current_feedback and current_time < self.current_feedback["end_time"]:
            # Still showing current feedback
            pass
        elif self.feedback_queue:
            # Get next feedback from queue
            self.current_feedback = self.feedback_queue.popleft()
        else:
            self.current_feedback = None
    
    def _check_hand_gestures(self, current_time: float):
        """Check for hand gesture reactions with cooldown"""
        if current_time - self.last_gesture_time < self.gesture_cooldown:
            return
        
        if self.vision_tracker.detect_hand_gesture():
            self.last_gesture_time = current_time
            # Find the oldest unreacted target
            for stimulus in self.stimulus_manager.stimuli:
                if not stimulus.reacted and stimulus.is_target:
                    reaction_time = current_time - stimulus.appear_time
                    
                    if reaction_time * 1000 < stimulus.duration_ms:
                        self._process_reaction(stimulus, reaction_time)
                    else:
                        self.metrics.add_miss(stimulus)
                        self._show_feedback("Too late!", (255, 100, 100))
                    break
    
    def render(self):
        """Render the game with correct layering"""
        if not self.running:
            return
        
        if self.showing_rules:
            # Show rules screen
            self.show_rules()
        elif self.game_over:
            # Show game over screen
            self.renderer.draw_game_over(self.metrics)
        else:
            # Draw game elements in correct order
            self.renderer.clear_screen()
            
            # 1. Draw UI background elements FIRST
            self.renderer.draw_camera_feed(self.camera_frame)
            
            # 2. Draw head position indicator
            head_data = self.vision_tracker.get_head_position()
            self.renderer.draw_head_position(head_data, (340, 200))
            
            # 3. Draw center fixation point
            self.renderer.draw_center_fixation()
            
            # 4. Draw stimuli ON TOP of UI elements
            for stimulus in self.stimulus_manager.stimuli:
                self.renderer.draw_stimulus(stimulus)
            
            # 5. Draw HUD elements (on top of everything)
            time_remaining = max(0, self.config.SESSION_DURATION - (time.time() - self.session_start_time))
            level_config = self.adaptive_difficulty.get_config()
            self.renderer.draw_hud(self.metrics, time_remaining, level_config['level'], level_config)
            
            # 6. Draw feedback (on top of everything)
            if self.current_feedback:
                self.renderer.draw_feedback(
                    self.current_feedback["message"], 
                    self.current_feedback["color"]
                )
            
            # 7. Draw pause indicator
            if self.paused:
                self.renderer.draw_feedback("PAUSED - Press P to resume", (255, 255, 100))
        
        self.renderer.update_display()
    
    def end_session(self):
        """End the current session"""
        self.game_over = True
        
        # Save session data
        self.data_manager.save_session(self.metrics)
        self.data_manager.export_session_detailed(self.metrics)
        
        # Print summary
        self._print_session_summary()
    
    def _print_session_summary(self):
        """Print session summary to console"""
        print("\n" + "="*60)
        print("SESSION SUMMARY")
        print("="*60)
        print(f"Patient ID:     {self.metrics.patient_id}")
        print(f"Session ID:     {self.metrics.session_id}")
        print(f"Level Reached:  {self.metrics.level}")
        print(f"Final Score:    {self.metrics.score}")
        print(f"Duration:       {time.time() - self.session_start_time:.1f}s")
        print(f"Total Stimuli:  {self.metrics.total_stimuli}")
        print(f"Correct:        {self.metrics.correct_reactions}")
        print(f"Missed:         {self.metrics.missed_stimuli}")
        print(f"Accuracy:       {self.metrics.calculate_accuracy():.1f}%")
        print(f"Avg RT:         {self.metrics.calculate_average_rt():.0f}ms")
        
        side_bias = self.metrics.get_side_bias()
        print(f"Weak Side:      {side_bias['weaker_side'].upper()} ({abs(side_bias['bias_percentage']):.1f}% bias)")
        print(f"Head Movements: {self.metrics.head_movements}")
        print(f"Fix Breaks:     {self.metrics.fixation_breaks}")
        print("="*60)
    
    def run(self):
        """Main game loop"""
        if not self.initialize():
            print("Failed to initialize game")
            return
        
        # Show rules first
        self.showing_rules = True
        print("\nShowing game rules... Press SPACE to start")
        
        # Set running to True so the game loop continues
        self.running = True
        
        # Main loop
        while self.running:
            self.handle_events()
            
            # Only update if we're not showing rules and game is not over
            if not self.showing_rules and not self.game_over:
                self.update()
            
            self.render()
        
        self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        self.vision_tracker.release()
        pygame.quit()
        print("\nGame ended. Thank you for playing!")

# ==================== MAIN ENTRY POINT ====================
def main():
    """Main entry point"""
    print("="*60)
    print("         PERIQUEST - PERIPHERAL VISION THERAPY")
    print("="*60)
    
    # Automatically use a default patient ID without asking for input
    patient_id = f"patient_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    print(f"\nUsing Patient ID: {patient_id}")
    
    # Create and run game
    game = PeriQuestGame(patient_id=patient_id)
    
    try:
        game.run()
    except KeyboardInterrupt:
        print("\n\nGame interrupted by user")
        game.cleanup()
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
        game.cleanup()

if __name__ == "__main__":
    main()