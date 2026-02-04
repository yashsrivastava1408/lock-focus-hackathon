"""
PeriQuest - Enhanced Peripheral Vision Therapy Game
Improved version with advanced eye tracking and comprehensive reporting
"""

import pygame
import time
import random
import math
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class GameState(Enum):
    INSTRUCTIONS = "instructions"
    PLAYING = "playing"
    RESULTS = "results"
from collections import deque

try:
    from tasks_eye_tracker import EnhancedEyeTracker, EyeData
    EYE_TRACKING_AVAILABLE = True
    print("✓ Using MediaPipe Tasks API Eye Tracker")
except ImportError:
    print("⚠ Eye tracking not available (tasks_eye_tracker.py missing)")
    EYE_TRACKING_AVAILABLE = False

try:
    from report_generator import ReportGenerator
    REPORTING_AVAILABLE = True
except ImportError:
    print("⚠ Report generation not available")
    REPORTING_AVAILABLE = False

# Initialize pygame
pygame.init()

# ==================== CONFIGURATION ====================
@dataclass
class GameConfig:
    """Enhanced game configuration"""
    # Display
    SCREEN_WIDTH: int = 1280
    SCREEN_HEIGHT: int = 720
    FPS: int = 60
    
    # Session
    SESSION_DURATION: int = 300  # 5 minutes
    
    # Colors - Modern palette
    BG_COLOR: Tuple[int, int, int] = (15, 23, 42)  # Dark blue-gray
    CENTER_DOT_COLOR: Tuple[int, int, int] = (34, 211, 238)  # Cyan
    TEXT_COLOR: Tuple[int, int, int] = (248, 250, 252)  # Off-white
    HUD_BG: Tuple[int, int, int, int] = (30, 41, 59, 220)  # Semi-transparent dark
    ACCENT_COLOR: Tuple[int, int, int] = (99, 102, 241)  # Indigo
    SUCCESS_COLOR: Tuple[int, int, int] = (34, 197, 94)  # Green
    WARNING_COLOR: Tuple[int, int, int] = (251, 146, 60)  # Orange
    ERROR_COLOR: Tuple[int, int, int] = (239, 68, 68)  # Red
    
    # Fonts
    TITLE_SIZE: int = 42
    LARGE_SIZE: int = 28
    MEDIUM_SIZE: int = 20
    SMALL_SIZE: int = 14
    
    # Stimulus
    MIN_STIM_SIZE: int = 30
    MAX_STIM_SIZE: int = 120
    STIMULUS_DURATIONS: Dict[int, int] = None
    
    # Scoring
    PERFECT_RT: int = 500
    GOOD_RT: int = 1000
    SLOW_RT: int = 2000
    PERFECT_SCORE: int = 100
    GOOD_SCORE: int = 50
    SLOW_SCORE: int = 25
    MISS_PENALTY: int = -5
    
    def __post_init__(self):
        self.STIMULUS_DURATIONS = {
            1: 3000, 2: 2500, 3: 2000, 4: 1500, 5: 1000
        }

# ==================== ENUMS ====================
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

# ==================== DATA MODELS ====================
@dataclass
class Stimulus:
    """Peripheral stimulus"""
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
        elapsed = (current_time - self.appear_time) * 1000
        return elapsed > self.duration_ms
    
    def time_remaining_ms(self, current_time: float) -> float:
        elapsed = (current_time - self.appear_time) * 1000
        return max(0, self.duration_ms - elapsed)

@dataclass
class SessionMetrics:
    """Session performance metrics"""
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
    eye_tracking_data: List = None
    
    def __post_init__(self):
        if self.reaction_times is None:
            self.reaction_times = []
        if self.field_performance is None:
            self.field_performance = {
                field.value: {"correct": 0, "total": 0, "avg_rt": 0.0}
                for field in VisualField
            }
        if self.eye_tracking_data is None:
            self.eye_tracking_data = []
    
    def add_reaction(self, stimulus: Stimulus, reaction_time: float):
        self.correct_reactions += 1
        self.total_reaction_time += reaction_time
        self.reaction_times.append(reaction_time * 1000)  # Convert to ms
        
        field_stats = self.field_performance[stimulus.field.value]
        field_stats["correct"] += 1
        field_stats["total"] += 1
        if field_stats["correct"] > 0:
            field_stats["avg_rt"] = (
                (field_stats["avg_rt"] * (field_stats["correct"] - 1)) + 
                (reaction_time * 1000)
            ) / field_stats["correct"]
    
    def add_miss(self, stimulus: Stimulus):
        self.missed_stimuli += 1
        field_stats = self.field_performance[stimulus.field.value]
        field_stats["total"] += 1
    
    def calculate_average_rt(self) -> float:
        if not self.reaction_times:
            return 0.0
        return sum(self.reaction_times) / len(self.reaction_times)
    
    def calculate_accuracy(self) -> float:
        if self.total_stimuli == 0:
            return 0.0
        return (self.correct_reactions / self.total_stimuli) * 100
    
    def get_side_bias(self) -> Dict:
        left_stats = self.field_performance["left"]
        right_stats = self.field_performance["right"]
        
        left_acc = (left_stats["correct"] / left_stats["total"] * 100) if left_stats["total"] > 0 else 0
        right_acc = (right_stats["correct"] / right_stats["total"] * 100) if right_stats["total"] > 0 else 0
        
        bias_pct = 0
        if max(left_acc, right_acc) > 0:
            bias_pct = ((right_acc - left_acc) / max(left_acc, right_acc)) * 100
        
        return {
            "bias_percentage": bias_pct,
            "weaker_side": "left" if left_acc < right_acc else "right",
            "left_accuracy": left_acc,
            "right_accuracy": right_acc,
        }
    
    def to_dict(self) -> Dict:
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
            "reaction_times": self.reaction_times
        }

# ==================== ADAPTIVE DIFFICULTY ====================
class AdaptiveDifficulty:
    """Manages adaptive difficulty and level progression"""
    
    def __init__(self):
        self.current_level = 1
        self.last_level_change = time.time()
        self.level_change_cooldown = 20  # Minimum 20 seconds between level changes
        
    def update(self, metrics: SessionMetrics, session_duration: float) -> int:
        """Update difficulty based on performance, returns new level"""
        if session_duration < 10:  # Don't change level in first 10 seconds
            return self.current_level
        
        current_time = time.time()
        if current_time - self.last_level_change < self.level_change_cooldown:
            return self.current_level
        
        accuracy = metrics.calculate_accuracy()
        avg_rt = metrics.calculate_average_rt()
        
        old_level = self.current_level
        
        # Level progression rules
        if self.current_level == 1 and accuracy > 75 and avg_rt < 1500 and metrics.total_stimuli >= 5:
            self.current_level = 2
            print("\n🎉 Level Up! Now at Level 2 - Squares added as distractors")
            
        elif self.current_level == 2 and accuracy > 70 and avg_rt < 1200 and metrics.total_stimuli >= 10:
            self.current_level = 3
            print("\n🎉 Level Up! Now at Level 3 - More shapes added")
            
        elif self.current_level == 3 and accuracy > 65 and avg_rt < 1000 and metrics.total_stimuli >= 15:
            self.current_level = 4
            print("\n🎉 Level Up! Now at Level 4 - Distractors increased")
            
        elif self.current_level == 4 and accuracy > 60 and avg_rt < 800 and metrics.total_stimuli >= 20:
            self.current_level = 5
            print("\n🎉 Level Up! Now at Level 5 - Expert mode!")
        
        # Level regression if performance is poor
        elif self.current_level > 1 and accuracy < 40 and metrics.total_stimuli >= 8:
            self.current_level -= 1
            print(f"\n⚠ Level Down to Level {self.current_level} - Keep practicing!")
        
        if old_level != self.current_level:
            self.last_level_change = current_time
        
        return self.current_level
    
    def get_spawn_interval(self) -> float:
        """Get stimulus spawn interval based on level"""
        intervals = {1: 2.5, 2: 2.0, 3: 1.7, 4: 1.4, 5: 1.0}
        return intervals.get(self.current_level, 2.0)

# ==================== STIMULUS MANAGER ====================
class StimulusManager:
    """Manages stimulus generation and display"""
    
    def __init__(self, config: GameConfig):
        self.config = config
        self.stimuli = []
        self.next_id = 1
        self.last_spawn_time = 0
        self.spawn_interval = 2.0
        
        # Visual field zones (normalized coordinates)
        self.field_zones = {
            VisualField.LEFT: (0.0, 0.4, 0.3, 0.4),
            VisualField.RIGHT: (0.7, 0.4, 0.3, 0.4),
            VisualField.TOP: (0.4, 0.15, 0.2, 0.2),
            VisualField.BOTTOM: (0.3, 0.8, 0.4, 0.2),
            VisualField.TOP_LEFT: (0.1, 0.15, 0.2, 0.2),
            VisualField.TOP_RIGHT: (0.7, 0.15, 0.2, 0.2),
            VisualField.BOTTOM_LEFT: (0.1, 0.7, 0.2, 0.2),
            VisualField.BOTTOM_RIGHT: (0.7, 0.7, 0.2, 0.2),
        }
        
        # Modern color palette for stimuli
        self.stimulus_colors = {
            StimulusType.CIRCLE: (251, 191, 36),    # Amber
            StimulusType.SQUARE: (59, 130, 246),    # Blue
            StimulusType.TRIANGLE: (168, 85, 247),  # Purple
            StimulusType.STAR: (34, 197, 94),       # Green
        }
    
    def _is_position_valid(self, x, y, size):
        """Check if position overlaps with UI elements"""
        # Define UI exclusion zones (rects: x, y, w, h)
        # 1. Top HUD
        hud_height = 120 
        if y < hud_height + size: 
            return False
            
        # 2. Camera Feed & Eye Status (Bottom Left)
        # Camera is 320x240, Status is 200x240. 
        # Positioned at bottom left with some padding.
        # Let's say bottom area starting from SCREEN_HEIGHT - 260
        bottom_ui_y = self.config.SCREEN_HEIGHT - 260
        total_ui_width = 20 + 320 + 20 + 200 + 20 # Padding + Cam + Gap + Status + Padding
        
        if y > bottom_ui_y - size and x < total_ui_width + size:
            return False
            
        return True

    def generate_stimulus(self, level: int) -> Optional[Stimulus]:
        current_time = time.time()
        
        if current_time - self.last_spawn_time < self.spawn_interval:
            return None
        
        # Select field and parameters
        field = random.choice(list(self.field_zones.keys()))
        stim_type, size, is_target = self._get_parameters(level)
        
        # Get position - Try multiple times to find valid pos
        for _ in range(10): 
            zone = self.field_zones[field]
            x = int(random.uniform(zone[0] + 0.1, zone[0] + zone[2] - 0.1) * self.config.SCREEN_WIDTH)
            y = int(random.uniform(zone[1] + 0.1, zone[1] + zone[3] - 0.1) * self.config.SCREEN_HEIGHT)
            
            if self._is_position_valid(x, y, size):
                break
        else:
            return None # Could not find valid position
        
        # Create stimulus
        stimulus = Stimulus(
            id=self.next_id,
            field=field,
            type=stim_type,
            x=x,
            y=y,
            size=size,
            color=self.stimulus_colors[stim_type],
            appear_time=current_time,
            duration_ms=self.config.STIMULUS_DURATIONS.get(level, 2000),
            level=level,
            is_target=is_target
        )
        
        self.next_id += 1
        self.last_spawn_time = current_time
        self.stimuli.append(stimulus)
        
        return stimulus
    
    def _get_parameters(self, level: int):
        if level == 1:
            return StimulusType.CIRCLE, random.randint(80, 120), True
        elif level == 2:
            stim_type = random.choice([StimulusType.CIRCLE, StimulusType.SQUARE])
            return stim_type, random.randint(60, 90), stim_type == StimulusType.CIRCLE
        elif level == 3:
            stim_type = random.choice(list(StimulusType))
            return stim_type, random.randint(50, 80), stim_type in [StimulusType.CIRCLE, StimulusType.STAR]
        else:
            stim_type = random.choice(list(StimulusType))
            is_target = random.random() > 0.3
            return stim_type, random.randint(40, 70), is_target
    
    def update(self, current_time: float) -> List[Stimulus]:
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
        self.stimuli.clear()

# ==================== RENDERER ====================
class ModernRenderer:
    """Modern, clean renderer with improved visuals"""
    
    def __init__(self, config: GameConfig):
        self.config = config
        self.screen = pygame.display.set_mode((config.SCREEN_WIDTH, config.SCREEN_HEIGHT))
        pygame.display.set_caption("PeriQuest - Enhanced Edition")
        
        # Fonts
        self.title_font = pygame.font.SysFont('Segoe UI', config.TITLE_SIZE, bold=True)
        self.large_font = pygame.font.SysFont('Segoe UI', config.LARGE_SIZE, bold=True)
        self.medium_font = pygame.font.SysFont('Segoe UI', config.MEDIUM_SIZE)
        self.small_font = pygame.font.SysFont('Segoe UI', config.SMALL_SIZE)
        
        self.clock = pygame.time.Clock()
    
    def clear_screen(self):
        self.screen.fill(self.config.BG_COLOR)
    
    def draw_center_fixation(self, is_fixating=True):
        """Draw modern center fixation point
        is_fixating: If True, draws normal/active state. If False, draws warning state.
        """
        cx, cy = self.config.SCREEN_WIDTH // 2, self.config.SCREEN_HEIGHT // 2
        
        # Determine colors based on fixation status
        if is_fixating:
            dot_color = self.config.CENTER_DOT_COLOR # Cyan
            glow_color = (*self.config.CENTER_DOT_COLOR, 50)
        else:
            dot_color = self.config.ERROR_COLOR # Red
            glow_color = (*self.config.ERROR_COLOR, 50)

        # Outer glow (pulsing if not fixating to grab attention)
        pulse = 0
        if not is_fixating:
            pulse = int(math.sin(time.time() * 10) * 5)
            
        for r in range(20 + pulse, 10 + pulse, -2):
            val = int(50 * (1 - (r - 10) / 10))
            alpha = max(0, min(255, val))
            s = pygame.Surface((r*2, r*2), pygame.SRCALPHA)
            # Ensure we only use RGB components (first 3) + new alpha
            color_with_alpha = (*dot_color[:3], alpha)
            pygame.draw.circle(s, color_with_alpha, (r, r), r)
            self.screen.blit(s, (cx - r, cy - r))
        
        # Center dot
        pygame.draw.circle(self.screen, dot_color, (cx, cy), 10)
        pygame.draw.circle(self.screen, self.config.TEXT_COLOR, (cx, cy), 10, 2)

    def draw_gaze_cursor(self, gaze_point):
        """Draw a cursor showing where the user is looking"""
        if not gaze_point:
            return
            
        x = int(gaze_point[0] * self.config.SCREEN_WIDTH)
        y = int(gaze_point[1] * self.config.SCREEN_HEIGHT)
        
        # Draw translucent target cursor
        # 1. Outer Ring
        pygame.draw.circle(self.screen, (255, 255, 255), (x, y), 30, 2)
        
        # 2. Crosshair lines
        pygame.draw.line(self.screen, (255, 255, 255), (x - 10, y), (x - 4, y), 2)
        pygame.draw.line(self.screen, (255, 255, 255), (x + 4, y), (x + 10, y), 2)
        pygame.draw.line(self.screen, (255, 255, 255), (x, y - 10), (x, y - 4), 2)
        pygame.draw.line(self.screen, (255, 255, 255), (x, y + 4), (x, y + 10), 2)
        
        # 3. Label
        label = self.small_font.render("GAZE", True, (255, 255, 255))
        self.screen.blit(label, (x + 35, y - 10))
    
    def draw_stimulus(self, stimulus: Stimulus):
        """Draw stimulus with modern styling"""
        # Add glow effect
        glow_surface = pygame.Surface((stimulus.size * 3, stimulus.size * 3), pygame.SRCALPHA)
        pygame.draw.circle(glow_surface, (*stimulus.color, 30), 
                         (stimulus.size * 1.5, stimulus.size * 1.5), stimulus.size * 1.5)
        self.screen.blit(glow_surface, (stimulus.x - stimulus.size * 1.5, stimulus.y - stimulus.size * 1.5))
        
        # Draw shape
        if stimulus.type == StimulusType.CIRCLE:
            pygame.draw.circle(self.screen, stimulus.color, (stimulus.x, stimulus.y), stimulus.size // 2)
            pygame.draw.circle(self.screen, self.config.TEXT_COLOR, (stimulus.x, stimulus.y), stimulus.size // 2, 2)
        elif stimulus.type == StimulusType.SQUARE:
            rect = pygame.Rect(stimulus.x - stimulus.size // 2, stimulus.y - stimulus.size // 2, 
                             stimulus.size, stimulus.size)
            pygame.draw.rect(self.screen, stimulus.color, rect)
            pygame.draw.rect(self.screen, self.config.TEXT_COLOR, rect, 2)
    
    def draw_hud(self, metrics: SessionMetrics, time_remaining: float, level: int):
        """Draw modern HUD"""
        # Top bar
        hud_rect = pygame.Rect(20, 20, self.config.SCREEN_WIDTH - 40, 100)
        s = pygame.Surface((hud_rect.width, hud_rect.height), pygame.SRCALPHA)
        pygame.draw.rect(s, self.config.HUD_BG, s.get_rect(), border_radius=15)
        self.screen.blit(s, hud_rect)
        
        # Level
        level_text = self.large_font.render(f"Level {level}", True, self.config.ACCENT_COLOR)
        self.screen.blit(level_text, (40, 35))
        
        # Time
        time_text = self.medium_font.render(f"Time: {int(time_remaining)}s", True, self.config.TEXT_COLOR)
        self.screen.blit(time_text, (40, 75))
        
        # Score
        score_text = self.large_font.render(f"Score: {metrics.score}", True, self.config.SUCCESS_COLOR)
        score_rect = score_text.get_rect(right=self.config.SCREEN_WIDTH - 40, centery=60)
        self.screen.blit(score_text, score_rect)
        
        # Accuracy
        accuracy = metrics.calculate_accuracy()
        acc_color = self.config.SUCCESS_COLOR if accuracy >= 75 else self.config.WARNING_COLOR if accuracy >= 50 else self.config.ERROR_COLOR
        acc_text = self.medium_font.render(f"Accuracy: {accuracy:.1f}%", True, acc_color)
        acc_rect = acc_text.get_rect(centerx=self.config.SCREEN_WIDTH // 2, y=40)
        self.screen.blit(acc_text, acc_rect)
        
        # Avg RT
        avg_rt = metrics.calculate_average_rt()
        rt_text = self.small_font.render(f"Avg RT: {avg_rt:.0f}ms", True, self.config.TEXT_COLOR)
        rt_rect = rt_text.get_rect(centerx=self.config.SCREEN_WIDTH // 2, y=75)
        self.screen.blit(rt_text, rt_rect)
    
    def draw_feedback(self, message: str, color: Tuple[int, int, int]):
        """Draw feedback message"""
        text = self.title_font.render(message, True, color)
        rect = text.get_rect(center=(self.config.SCREEN_WIDTH // 2, self.config.SCREEN_HEIGHT // 2))
        
        # Background
        bg_rect = rect.inflate(60, 40)
        s = pygame.Surface((bg_rect.width, bg_rect.height), pygame.SRCALPHA)
        pygame.draw.rect(s, (0, 0, 0, 200), s.get_rect(), border_radius=20)
        pygame.draw.rect(s, color, s.get_rect(), 3, border_radius=20)
        self.screen.blit(s, bg_rect)
        
        self.screen.blit(text, rect)
    
    def draw_camera_feed(self, eye_tracker, position=None):
        """Draw camera feed with eye tracking overlay"""
        import cv2
        
        # Default position: Bottom Left
        if position is None:
            position = (20, self.config.SCREEN_HEIGHT - 260)
            
        if not eye_tracker:
            self._draw_cam_placeholder(position, "Tracker Not Init")
            return

        # Use get_current_frame() if available, else try simple property
        frame = None
        if hasattr(eye_tracker, 'get_current_frame'):
            frame = eye_tracker.get_current_frame()
        elif hasattr(eye_tracker, 'current_frame'):
            frame = getattr(eye_tracker, 'current_frame', None)
            
        # If no cached frame, don't try to read() again as it causes lag/sync issues
        # just skip or show placeholder
        if frame is None:
             self._draw_cam_placeholder(position, "No Signal")
             return
        
        try:
            # Resize frame
            frame_resized = cv2.resize(frame, (320, 240))
            
            # --- Draw Landmarks on display frame (if available) ---
            # We don't have access to landmarks directly on the raw frame passed here 
            # unless we modify tracker to return annotated frame. 
            # But the tracker has just processed this frame.
            # For visualization, we can just show the raw feed or try to re-draw if we had data.
            # Simplest for now: Show the raw feed. Eye Status panel shows the data.
            
            # Convert to pygame surface
            frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
            frame_surface = pygame.surfarray.make_surface(frame_rgb.swapaxes(0, 1))
            
            # Draw border
            border_rect = pygame.Rect(position[0] - 2, position[1] - 2, 324, 244)
            pygame.draw.rect(self.screen, self.config.ACCENT_COLOR, border_rect, 2, border_radius=10)
            
            # Blit to screen
            self.screen.blit(frame_surface, position)
            
            # Add label
            label = self.small_font.render("Camera Feed", True, self.config.TEXT_COLOR)
            self.screen.blit(label, (position[0], position[1] - 20))
            
        except Exception as e:
            # print(f"Draw error: {e}")
            self._draw_cam_placeholder(position, "Error")

    def _draw_cam_placeholder(self, position, text):
        placeholder = pygame.Rect(position[0], position[1], 320, 240)
        s = pygame.Surface((320, 240), pygame.SRCALPHA)
        pygame.draw.rect(s, (30, 41, 59, 200), s.get_rect(), border_radius=10)
        pygame.draw.rect(s, self.config.ACCENT_COLOR, s.get_rect(), 2, border_radius=10)
        self.screen.blit(s, position)
        
        msg = self.small_font.render(text, True, self.config.TEXT_COLOR)
        text_rect = msg.get_rect(center=(position[0] + 160, position[1] + 120))
        self.screen.blit(msg, text_rect)
    
    def draw_eye_status(self, eye_data, position=None):
        """Draw eye tracking status panel"""
        # Default position: Next to Camera (Bottom Left + Offset)
        if position is None:
            position = (360, self.config.SCREEN_HEIGHT - 260)
            
        panel_width, panel_height = 200, 240
        
        # Background
        s = pygame.Surface((panel_width, panel_height), pygame.SRCALPHA)
        pygame.draw.rect(s, (30, 41, 59, 200), s.get_rect(), border_radius=10)
        pygame.draw.rect(s, self.config.ACCENT_COLOR, s.get_rect(), 2, border_radius=10)
        self.screen.blit(s, position)
        
        # Title
        title = self.small_font.render("Eye Tracking", True, self.config.TEXT_COLOR)
        self.screen.blit(title, (position[0] + 10, position[1] + 10))
        
        y_offset = position[1] + 40
        
        if eye_data:
            # Status text
            if getattr(eye_data, 'head_turn_detected', False):
                status_text = "Status: Head Turn!"
                color = self.config.WARNING_COLOR
            elif eye_data.is_fixating:
                status_text = "Status: Fixating"
                color = self.config.SUCCESS_COLOR
            else:
                status_text = "Status: Distracted"
                color = self.config.ERROR_COLOR
            
            # Draw stats
            labels = [
                status_text,
                f"Gaze: ({eye_data.gaze_point[0]:.2f}, {eye_data.gaze_point[1]:.2f})" if eye_data.gaze_point else "Gaze: --",
                f"Pupil: {eye_data.left_pupil_size:.3f}",
                f"Head Yaw: {getattr(eye_data, 'head_yaw', 0.0):.2f}"
            ]
            
            for i, label in enumerate(labels):
                color_to_use = color if i == 0 else self.config.TEXT_COLOR
                text = self.small_font.render(label, True, color_to_use)
                self.screen.blit(text, (position[0] + 10, y_offset))
                y_offset += 25
            
            # Visual indicator for gaze
            if eye_data.gaze_point:
                indicator_size = 100
                indicator_x = position[0] + panel_width // 2
                indicator_y = position[1] + 150
                
                # Draw indicator background
                pygame.draw.circle(self.screen, (50, 60, 80), (indicator_x, indicator_y), indicator_size // 2, 1)
                
                # Draw gaze point
                gaze_x = int(indicator_x + (eye_data.gaze_point[0] - 0.5) * indicator_size)
                gaze_y = int(indicator_y + (eye_data.gaze_point[1] - 0.5) * indicator_size)
                pygame.draw.circle(self.screen, self.config.SUCCESS_COLOR, (gaze_x, gaze_y), 5)
                
                # Draw center crosshair
                pygame.draw.line(self.screen, (100, 110, 130), 
                               (indicator_x - 10, indicator_y), (indicator_x + 10, indicator_y), 1)
                pygame.draw.line(self.screen, (100, 110, 130), 
                               (indicator_x, indicator_y - 10), (indicator_x, indicator_y + 10), 1)
        else:
            no_data_text = self.small_font.render("No eye data", True, self.config.TEXT_COLOR)
            self.screen.blit(no_data_text, (position[0] + 10, y_offset))
    
    def update_display(self):
        pygame.display.flip()
        self.clock.tick(self.config.FPS)

# ==================== MAIN GAME ====================
class EnhancedPeriQuestGame:
    """Enhanced PeriQuest game with advanced features"""
    
    def __init__(self, patient_id: str = "default"):
        self.config = GameConfig()
        self.patient_id = patient_id
        self.session_id = f"{patient_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Components
        self.stimulus_manager = StimulusManager(self.config)
        self.renderer = ModernRenderer(self.config)
        self.adaptive_difficulty = AdaptiveDifficulty()
        
        # Eye tracking
        if EYE_TRACKING_AVAILABLE:
            self.eye_tracker = EnhancedEyeTracker()
            self.eye_tracker_enabled = self.eye_tracker.initialize_camera()
        else:
            self.eye_tracker = None
            self.eye_tracker_enabled = False
        
        # Reporting
        if REPORTING_AVAILABLE:
            self.report_generator = ReportGenerator()
        else:
            self.report_generator = None
        
        # State
        self.running = False
        self.paused = False
        self.game_over = False
        self.state = GameState.INSTRUCTIONS
        self.session_start_time = 0
        self.current_level = 1
        self.level_up_animation_time = 0
        
        # Metrics
        self.metrics = SessionMetrics(
            patient_id=patient_id,
            session_id=self.session_id,
            start_time=datetime.now()
        )
        
        # Feedback
        self.feedback_queue = deque(maxlen=3)
        self.current_feedback = None
        
        print(f"✓ Enhanced PeriQuest initialized for patient: {patient_id}")
        print(f"  Eye Tracking: {'Enabled' if self.eye_tracker_enabled else 'Disabled'}")
        print(f"  Reporting: {'Enabled' if self.report_generator else 'Disabled'}")
    
    def start_session(self):
        """Start therapy session"""
        self.running = True
        self.session_start_time = time.time()
        self.metrics = SessionMetrics(
            patient_id=self.patient_id,
            session_id=self.session_id,
            start_time=datetime.now()
        )
        print(f"✓ Session started: {self.session_id}")
    
    def handle_events(self):
        """Handle input events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if self.state == GameState.RESULTS:
                    # Check for button clicks on result screen
                    mx, my = pygame.mouse.get_pos()
                    
                    # Download PDF Button (left)
                    pdf_btn_rect = pygame.Rect(self.config.SCREEN_WIDTH//2 - 210, 600, 200, 60)
                    if pdf_btn_rect.collidepoint(mx, my):
                         self._generate_report('pdf')

                    # Download Excel Button (right)
                    excel_btn_rect = pygame.Rect(self.config.SCREEN_WIDTH//2 + 10, 600, 200, 60)
                    if excel_btn_rect.collidepoint(mx, my):
                         self._generate_report('excel')
                
                elif self.state == GameState.INSTRUCTIONS:
                    self.state = GameState.PLAYING
                    self.session_start_time = time.time()
            
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                
                elif self.state == GameState.INSTRUCTIONS:
                    # Any key to start
                    self.state = GameState.PLAYING
                    self.session_start_time = time.time()
                
                elif self.state == GameState.PLAYING:
                    if event.key == pygame.K_SPACE:
                        self._handle_reaction()
                    elif event.key == pygame.K_p:
                        self.paused = not self.paused

    def _generate_report(self, type='pdf'):
        """Generate specific report on demand"""
        if not self.report_generator: return
        
        self.renderer.draw_feedback("Generating...", self.config.ACCENT_COLOR)
        self.renderer.update_display()
        
        try:
            session_data = self.metrics.to_dict()
            eye_data = self.metrics.eye_tracking_data if self.eye_tracker_enabled else None
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            if type == 'pdf':
                path = self.report_generator.export_pdf(session_data, eye_data, self.session_id, timestamp)
                print(f"✓ PDF Saved: {path}")
                self._show_feedback("PDF SAVED!", self.config.SUCCESS_COLOR)
                # Open the folder
                os.startfile(os.path.dirname(path))
            else:
                path = self.report_generator.export_excel(session_data, self.session_id, timestamp)
                print(f"✓ Excel Saved: {path}")
                self._show_feedback("EXCEL SAVED!", self.config.SUCCESS_COLOR)
                os.startfile(os.path.dirname(path))
                
        except Exception as e:
            print(f"Error: {e}")
            self._show_feedback("ERROR SAVING", self.config.ERROR_COLOR)

    def _render_game_over(self):
        """Render interactive results dashboard"""
        screen = self.renderer.screen
        WIDTH, HEIGHT = self.config.SCREEN_WIDTH, self.config.SCREEN_HEIGHT
        
        # 1. Title
        title = self.renderer.title_font.render("SESSION COMPLETE", True, self.config.SUCCESS_COLOR)
        screen.blit(title, (WIDTH // 2 - title.get_width() // 2, 50))
        
        # 2. Score & Accuracy Cards
        # Draw dashboard background panel
        panel_rect = pygame.Rect(100, 150, WIDTH - 200, 400)
        s = pygame.Surface((panel_rect.width, panel_rect.height), pygame.SRCALPHA)
        pygame.draw.rect(s, (30, 41, 59, 200), s.get_rect(), border_radius=20)
        pygame.draw.rect(s, self.config.ACCENT_COLOR, s.get_rect(), 2, border_radius=20)
        screen.blit(s, panel_rect)
        
        # Metrics to display
        metrics = [
            ("TOTAL SCORE", f"{self.metrics.score}", self.config.ACCENT_COLOR),
            ("ACCURACY", f"{self.metrics.calculate_accuracy():.1f}%", self.config.SUCCESS_COLOR),
            ("AVG REACTION", f"{self.metrics.calculate_average_rt():.0f} ms", self.config.WARNING_COLOR),
            ("HEAD MOVES", f"{self.metrics.head_movements}", self.config.ERROR_COLOR),
            ("FALSE ALARMS", f"{self.metrics.false_positives}", self.config.ERROR_COLOR),
        ]
        
        # Draw columns
        start_y = 200
        col_width = (WIDTH - 200) // 3
        
        for i, (label, value, color) in enumerate(metrics[:3]): # Top row
            x = 100 + i * col_width + col_width // 2
            lbl = self.renderer.medium_font.render(label, True, self.config.TEXT_COLOR)
            val = self.renderer.large_font.render(value, True, color)
            screen.blit(lbl, (x - lbl.get_width()//2, start_y))
            screen.blit(val, (x - val.get_width()//2, start_y + 40))
            
        start_y += 120
        # Bottom row (Head moves, False alarms)
        for i, (label, value, color) in enumerate(metrics[3:]):
            x = 100 + (len(metrics[:3]) * col_width // len(metrics[3:])) * i + 150
            lbl = self.renderer.medium_font.render(label, True, self.config.TEXT_COLOR)
            val = self.renderer.large_font.render(value, True, color)
            screen.blit(lbl, (x - lbl.get_width()//2, start_y))
            screen.blit(val, (x - val.get_width()//2, start_y + 40))

        # 3. Download Buttons
        btn_y = 600
        btn_w, btn_h = 200, 600 # Wait defined rects below
        
        # PDF Button
        pdf_rect = pygame.Rect(WIDTH//2 - 210, 600, 200, 60)
        pygame.draw.rect(screen, self.config.ACCENT_COLOR, pdf_rect, border_radius=10)
        pdf_text = self.renderer.medium_font.render("DOWNLOAD PDF", True, self.config.BG_COLOR)
        screen.blit(pdf_text, (pdf_rect.centerx - pdf_text.get_width()//2, pdf_rect.centery - pdf_text.get_height()//2))
        
        # Excel Button
        excel_rect = pygame.Rect(WIDTH//2 + 10, 600, 200, 60)
        pygame.draw.rect(screen, (34, 197, 94), excel_rect, border_radius=10) # Green for Excel
        xls_text = self.renderer.medium_font.render("DOWNLOAD EXCEL", True, self.config.BG_COLOR)
        screen.blit(xls_text, (excel_rect.centerx - xls_text.get_width()//2, excel_rect.centery - xls_text.get_height()//2))

        # Quit Hint
        hint = self.renderer.small_font.render("Press ESC to Exit", True, (100, 116, 139))
        screen.blit(hint, (WIDTH//2 - hint.get_width()//2, 700))

    def end_session(self):
        """End session without auto-generating files (User will choose)"""
        self.game_over = True
        self.state = GameState.RESULTS
        print("\n=== SESSION COMPLETE ===")
        # Wait for user interaction in game loop
    
    def _handle_reaction(self):
        """Handle player reaction"""
        current_time = time.time()
        
        for stimulus in self.stimulus_manager.stimuli:
            if not stimulus.reacted and stimulus.is_target:
                reaction_time = current_time - stimulus.appear_time
                
                if reaction_time * 1000 < stimulus.duration_ms:
                    self._process_reaction(stimulus, reaction_time)
                    break
        else:
            # False Positive (Reaction with no valid target)
            self.metrics.false_positives += 1
            self.metrics.score = max(0, self.metrics.score - 50)
            self._show_feedback("FALSE ALARM!", self.config.ERROR_COLOR)
    
    def _process_reaction(self, stimulus: Stimulus, reaction_time: float):
        """Process successful reaction"""
        stimulus.reacted = True
        stimulus.reaction_time = reaction_time
        
        self.metrics.add_reaction(stimulus, reaction_time)
        
        rt_ms = reaction_time * 1000
        if rt_ms < self.config.PERFECT_RT:
            points = self.config.PERFECT_SCORE
            self._show_feedback("PERFECT!", self.config.SUCCESS_COLOR)
        elif rt_ms < self.config.GOOD_RT:
            points = self.config.GOOD_SCORE
            self._show_feedback("GOOD!", self.config.SUCCESS_COLOR)
        else:
            points = self.config.SLOW_SCORE
            self._show_feedback("SLOW", self.config.WARNING_COLOR)
        
        self.metrics.score = max(0, self.metrics.score + points)

    def _show_feedback(self, message: str, color: Tuple[int, int, int]):
        """Show feedback message"""
        self.feedback_queue.append({
            "message": message,
            "color": color,
            "end_time": time.time() + 1.0
        })
    
    def update(self):
        """Update game state"""
        if self.paused or self.state != GameState.PLAYING:
            return
        
        current_time = time.time()
        session_duration = current_time - self.session_start_time
        
        # Check session end
        if session_duration >= self.config.SESSION_DURATION:
            self.end_session()
            return
        
        # Update adaptive difficulty
        old_level = self.current_level
        self.current_level = self.adaptive_difficulty.update(self.metrics, session_duration)
        self.metrics.level = self.current_level
        
        # Update spawn interval based on level
        self.stimulus_manager.spawn_interval = self.adaptive_difficulty.get_spawn_interval()
        
        # Show level up animation
        if old_level != self.current_level:
            self.level_up_animation_time = current_time
            level_msg = f"LEVEL {self.current_level}!"
            self._show_feedback(level_msg, self.config.ACCENT_COLOR)
        
        # Update eye tracking
        if self.eye_tracker_enabled:
            eye_data = self.eye_tracker.get_eye_data()
            if eye_data:
                self.metrics.eye_tracking_data.append(eye_data)
                
                if not eye_data.is_fixating:
                    self.metrics.fixation_breaks += 1
        
        # Generate stimuli
        if random.random() < 0.02:  # 2% chance per frame
            stimulus = self.stimulus_manager.generate_stimulus(self.current_level)
            if stimulus:
                self.metrics.total_stimuli += 1
        
        # Update stimuli
        expired = self.stimulus_manager.update(current_time)
        for stimulus in expired:
            if stimulus.is_target and not stimulus.reacted:
                self.metrics.add_miss(stimulus)
                self.metrics.score += self.config.MISS_PENALTY
                self._show_feedback("Missed!", self.config.ERROR_COLOR)
        
        # Update feedback
        if self.current_feedback and current_time < self.current_feedback["end_time"]:
            pass
        elif self.feedback_queue:
            self.current_feedback = self.feedback_queue.popleft()
        else:
            self.current_feedback = None
    
    def render(self):
        """Render game"""
        if not self.running:
            return
        
        self.renderer.clear_screen()
        
        if self.state == GameState.RESULTS:
            self._render_game_over()
        elif self.state == GameState.INSTRUCTIONS:
            self._render_instructions()
        else:
            # Determine fixation status for feedback
            is_fixating_center = True
            current_gaze = None
            
            if self.eye_tracker_enabled and self.metrics.eye_tracking_data:
                latest_data = self.metrics.eye_tracking_data[-1]
                
                # Check if data is stale (older than 200ms) indicating lost tracking
                time_since_data = time.time() - latest_data.timestamp
                
                if time_since_data < 0.2:
                    is_fixating_center = latest_data.is_fixating
                    current_gaze = latest_data.gaze_point
                    
                    # Track head movements (debounce: don't count continuous movement as multiple)
                    if getattr(latest_data, 'head_turn_detected', False):
                        if not getattr(self, 'currently_turning_head', False):
                            self.metrics.head_movements += 1
                            self.currently_turning_head = True
                            self._show_feedback("KEEP HEAD STILL!", self.config.WARNING_COLOR)
                    else:
                        self.currently_turning_head = False
                        
                else:
                    # Tracking lost (face turned away or obscured)
                    is_fixating_center = False
                    current_gaze = None
            
            self.renderer.draw_center_fixation(is_fixating=is_fixating_center)
            
            for stimulus in self.stimulus_manager.stimuli:
                self.renderer.draw_stimulus(stimulus)
            
            time_remaining = max(0, self.config.SESSION_DURATION - (time.time() - self.session_start_time))
            self.renderer.draw_hud(self.metrics, time_remaining, self.current_level)
            
            # Draw camera feed and eye tracking status
            if self.eye_tracker_enabled:
                # Use default positions defined in renderer methods (Bottom Left)
                self.renderer.draw_camera_feed(self.eye_tracker)
                
                # Get current eye data
                current_eye_data = self.metrics.eye_tracking_data[-1] if self.metrics.eye_tracking_data else None
                self.renderer.draw_eye_status(current_eye_data)
                
                # Draw on-screen gaze cursor for user feedback
                if current_gaze:
                    self.renderer.draw_gaze_cursor(current_gaze)
            
            if self.current_feedback:
                self.renderer.draw_feedback(
                    self.current_feedback["message"],
                    self.current_feedback["color"]
                )
            
            if self.paused:
                self.renderer.draw_feedback("PAUSED", self.config.WARNING_COLOR)
        
        self.renderer.update_display()
    
    
    def _render_instructions(self):
        """Render comprehensive instructions screen"""
        screen = self.renderer.screen
        WIDTH, HEIGHT = self.config.SCREEN_WIDTH, self.config.SCREEN_HEIGHT
        
        # Overlay background
        overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        overlay.fill((15, 23, 42, 230)) # Slate 900 with alpha
        screen.blit(overlay, (0,0))
        
        # Panel
        panel_rect = pygame.Rect(100, 50, WIDTH - 200, HEIGHT - 100)
        pygame.draw.rect(screen, (30, 41, 59), panel_rect, border_radius=20)
        pygame.draw.rect(screen, self.config.ACCENT_COLOR, panel_rect, 2, border_radius=20)
        
        y = 80
        # Title
        title = self.renderer.title_font.render("🎯 How to Play", True, self.config.SUCCESS_COLOR)
        screen.blit(title, (WIDTH // 2 - title.get_width() // 2, y))
        y += 70
        
        # Instructions text
        instructions = [
            ("1. Look at the center dot", "Keep your eyes fixed on the center fixation point"),
            ("2. Detect peripheral stimuli", "Use your peripheral vision to detect shapes appearing around the screen"),
            ("3. React to targets", "Press SPACE when you see a target stimulus"),
            ("4. Avoid distractors", "Don't react to non-target stimuli")
        ]
        
        for main_text, sub_text in instructions:
            m_surf = self.renderer.medium_font.render(main_text, True, self.config.ACCENT_COLOR)
            s_surf = self.renderer.small_font.render(sub_text, True, self.config.TEXT_COLOR)
            screen.blit(m_surf, (150, y))
            screen.blit(s_surf, (150, y + 35))
            y += 75
            
        y += 10
        # Controls Section
        ctrl_title = self.renderer.medium_font.render("Controls", True, self.config.WARNING_COLOR)
        screen.blit(ctrl_title, (150, y))
        y += 40
        
        controls = [
            "SPACE - React to target stimulus",
            "P - Pause/Resume game",
            "ESC - Quit game"
        ]
        
        for ctrl in controls:
            c_surf = self.renderer.small_font.render(f"• {ctrl}", True, self.config.TEXT_COLOR)
            screen.blit(c_surf, (170, y))
            y += 30
            
        # Level Progression column (Right side)
        level_x = WIDTH // 2 + 50
        level_y = 150
        lvl_title = self.renderer.medium_font.render("Level Progression", True, self.config.ACCENT_COLOR)
        screen.blit(lvl_title, (level_x, level_y))
        level_y += 50
        
        levels = [
            ("Level 1: Only circles (all targets)", "3 second display"),
            ("Level 2: Circles (targets) + Squares (distractors)", "2.5 seconds"),
            ("Level 3: Multiple shapes, circles & stars are targets", "2 seconds"),
            ("Level 4+: All shapes, 70% targets, 30% distractors", "1.5 seconds"),
            ("Level 5: Expert mode", "1 second display")
        ]
        
        for l_name, l_desc in levels:
            n_surf = self.renderer.small_font.render(l_name, True, self.config.TEXT_COLOR)
            d_surf = self.renderer.small_font.render(f"  → {l_desc}", True, (148, 163, 184))
            screen.blit(n_surf, (level_x, level_y))
            screen.blit(d_surf, (level_x, level_y + 25))
            level_y += 60
            
        # Press start hint
        start_hint = self.renderer.medium_font.render("Press ANY KEY or CLICK to Start Therapy", True, self.config.SUCCESS_COLOR)
        screen.blit(start_hint, (WIDTH // 2 - start_hint.get_width() // 2, HEIGHT - 100))
        
    def run(self):
        """Main game loop"""
        self.start_session()
        
        while self.running:
            self.handle_events()
            self.update()
            self.render()
        
        self.cleanup()
    
    def cleanup(self):
        """Cleanup resources"""
        if self.eye_tracker:
            self.eye_tracker.release()
        pygame.quit()
        print("\n✓ Game ended. Thank you!")

# ==================== MAIN ====================
def show_setup_screen() -> int:
    """Show graphical setup screen to get session duration"""
    pygame.init()
    screen_width, screen_height = 800, 600
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.display.set_caption("PeriQuest - Setup")
    
    # Fonts
    font = pygame.font.SysFont('Segoe UI', 32)
    small_font = pygame.font.SysFont('Segoe UI', 24)
    title_font = pygame.font.SysFont('Segoe UI', 48, bold=True)
    
    # Colors
    BG_COLOR = (15, 23, 42)    # Slate 900
    TEXT_COLOR = (241, 245, 249) # Slate 100
    ACCENT_COLOR = (56, 189, 248) # Cyan 400
    INPUT_BG = (30, 41, 59)    # Slate 800
    
    input_text = "5"
    active = True
    
    clock = pygame.time.Clock()
    
    while active:
        screen.fill(BG_COLOR)
        
        # Title
        title = title_font.render("PeriQuest Setup", True, ACCENT_COLOR)
        screen.blit(title, (screen_width//2 - title.get_width()//2, 100))
        
        # Instruction
        msg = font.render("Enter Session Duration (minutes):", True, TEXT_COLOR)
        screen.blit(msg, (screen_width//2 - msg.get_width()//2, 250))
        
        # Input box
        input_rect = pygame.Rect(screen_width//2 - 100, 320, 200, 50)
        pygame.draw.rect(screen, INPUT_BG, input_rect, border_radius=10)
        pygame.draw.rect(screen, ACCENT_COLOR, input_rect, 2, border_radius=10)
        
        text_surf = font.render(input_text, True, TEXT_COLOR)
        screen.blit(text_surf, (input_rect.x + 20, input_rect.y + 5))
        
        # Start button
        btn_rect = pygame.Rect(screen_width//2 - 100, 450, 200, 60)
        pygame.draw.rect(screen, ACCENT_COLOR, btn_rect, border_radius=15)
        
        btn_text = font.render("START", True, BG_COLOR)
        screen.blit(btn_text, (btn_rect.centerx - btn_text.get_width()//2, btn_rect.centery - btn_text.get_height()//2))
        
        # Hint
        hint = small_font.render("Press ENTER to Start", True, (148, 163, 184))
        screen.blit(hint, (screen_width//2 - hint.get_width()//2, 530))
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
                
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    active = False
                elif event.key == pygame.K_BACKSPACE:
                    input_text = input_text[:-1]
                else:
                    if event.unicode.isnumeric() and len(input_text) < 3:
                        input_text += event.unicode
                        
            if event.type == pygame.MOUSEBUTTONDOWN:
                if btn_rect.collidepoint(event.pos):
                    active = False
        
        pygame.display.flip()
        clock.tick(30)
    
    try:
        minutes = float(input_text) if input_text else 5
        return int(minutes * 60)
    except ValueError:
        return 300

def main():
    import sys
    
    # 1. Show graphical setup screen
    duration_seconds = show_setup_screen()
    
    print("="*60)
    print("     PERIQUEST - ENHANCED PERIPHERAL VISION THERAPY")
    print("="*60)
    print(f"✓ Session duration set to {duration_seconds/60:.1f} minutes")
    
    patient_id = f"patient_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    print(f"\nPatient ID: {patient_id}\n")
    
    # Create game instance
    game = EnhancedPeriQuestGame(patient_id=patient_id)
    
    # Update configuration
    game.config.SESSION_DURATION = duration_seconds
    
    try:
        game.run()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        game.cleanup()
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
        game.cleanup()

if __name__ == "__main__":
    main()
