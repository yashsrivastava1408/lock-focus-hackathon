# PeriQuest Enhancement - Quick Reference Guide

## 🎯 What Was Created

### New Files
1. **periquest_enhanced.py** - Modern, improved game (600 lines)
2. **eye_tracker.py** - Advanced eye tracking module (500 lines)
3. **report_generator.py** - Comprehensive reporting (800 lines)
4. **requirements.txt** - Python dependencies
5. **README.md** - Complete documentation
6. **setup_check.py** - Dependency checker

### Original File
- **periquest_game.py** - PRESERVED (unchanged)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

Or check what's needed:
```bash
python setup_check.py
```

### Step 2: Run the Game
```bash
python periquest_enhanced.py
```

### Step 3: View Reports
After session ends, check the `reports/` folder for:
- PDF report with visualizations
- HTML interactive report
- CSV data export

---

## ✨ Key Features Added

### Advanced Eye Tracking
- ✅ Real gaze point detection (not just head)
- ✅ Pupil size measurement
- ✅ Fixation stability analysis
- ✅ Blink detection and rate
- ✅ Saccade (rapid eye movement) tracking
- ✅ Multi-point calibration system
- ✅ Eye movement heatmap data

### Comprehensive Reports
- ✅ Professional PDF reports (6 pages)
- ✅ Interactive HTML reports
- ✅ CSV data export
- ✅ 15+ visualization types:
  - Accuracy gauges
  - Reaction time charts
  - Visual field heatmaps
  - Performance ratings
  - Eye tracking analysis
  - Progress tracking

### Modern UI
- ✅ Dark theme with vibrant colors
- ✅ Glow effects on stimuli
- ✅ Rounded, modern HUD
- ✅ Better visual feedback
- ✅ Professional design

---

## 📊 Report Examples

### PDF Report Includes:
1. **Session Summary** - Patient info, key metrics
2. **Performance Metrics** - Gauges, charts, ratings
3. **Visual Field Analysis** - Heatmaps, comparisons
4. **Reaction Time Analysis** - Distributions, trends
5. **Eye Tracking Analysis** - Gaze heatmap, fixation
6. **Progress Tracking** - Multi-session comparison

### HTML Report Features:
- Modern responsive design
- Color-coded metrics
- Easy to share
- Opens in any browser

---

## 🎮 How to Play

1. **Look at center dot** (cyan circle)
2. **Detect peripheral stimuli** using peripheral vision
3. **Press SPACE** when you see a target
4. **Avoid distractors** (don't react to non-targets)

### Targets by Level:
- **Level 1**: All circles are targets
- **Level 2**: Only circles (not squares)
- **Level 3**: Circles and stars
- **Level 4+**: 70% targets, 30% distractors

### Controls:
- **SPACE** - React to target
- **P** - Pause/Resume
- **ESC** - Quit

---

## 🔧 Troubleshooting

### Camera Not Working
- Game will work in keyboard-only mode
- Eye tracking features will be disabled
- All other features work normally

### Missing Packages
```bash
# Install all at once
pip install -r requirements.txt

# Or individually
pip install pygame opencv-python mediapipe matplotlib seaborn reportlab pandas numpy
```

### Report Generation Errors
- Ensure matplotlib and reportlab are installed
- Check `reports/` folder permissions
- Reports are optional - game works without them

---

## 📁 File Descriptions

### periquest_enhanced.py
Main game file with modern UI and improved structure. Integrates eye tracking and report generation.

**Key Classes:**
- `GameConfig` - Configuration settings
- `StimulusManager` - Handles stimulus generation
- `ModernRenderer` - Improved rendering engine
- `EnhancedPeriQuestGame` - Main game controller

### eye_tracker.py
Advanced eye tracking using MediaPipe Face Mesh.

**Key Classes:**
- `EyeData` - Stores single frame data
- `GazeCalibration` - Calibration system
- `EnhancedEyeTracker` - Main tracker class

**Features:**
- 468+ facial landmarks
- Iris tracking (landmarks 468-477)
- Gaze estimation algorithm
- Fixation detection
- Blink detection (Eye Aspect Ratio)
- Saccade detection

### report_generator.py
Comprehensive report generation system.

**Key Class:**
- `ReportGenerator` - Creates PDF, HTML, CSV reports

**Visualizations:**
- Gauge charts
- Heatmaps
- Bar charts
- Histograms
- Line charts
- Pie charts
- Scatter plots

---

## 💡 Tips for Best Results

### For Accurate Eye Tracking:
1. Ensure good lighting
2. Position camera at eye level
3. Sit 50-70cm from screen
4. Complete calibration carefully
5. Minimize head movement

### For Better Performance:
1. Close other camera applications
2. Use dedicated graphics if available
3. Reduce screen resolution if needed
4. Disable other background apps

### For Therapy Sessions:
1. Start with Level 1
2. Complete full 5-minute sessions
3. Review reports after each session
4. Track progress over multiple sessions
5. Focus on weaker visual fields

---

## 📈 Understanding Your Reports

### Accuracy
- **>75%** = Excellent (green)
- **50-75%** = Good (orange)
- **<50%** = Needs improvement (red)

### Reaction Time
- **<500ms** = Perfect (100 points)
- **500-1000ms** = Good (50 points)
- **1000-2000ms** = Slow (25 points)
- **>2000ms** = Too slow

### Side Bias
- Shows if one side is weaker
- >20% bias indicates significant difference
- Focus training on weaker side

### Fixation Stability
- Percentage of time eyes stayed fixed
- >80% = Good fixation
- <50% = Poor fixation control

---

## 🎨 Color Scheme

The enhanced version uses a modern, professional palette:

- **Background**: Dark blue-gray (#0F172A)
- **Center Dot**: Cyan (#22D3EE)
- **Text**: Off-white (#F8FAFC)
- **Accent**: Indigo (#6366F1)
- **Success**: Green (#22C55E)
- **Warning**: Orange (#FB923C)
- **Error**: Red (#EF4444)

**Stimuli Colors:**
- Circles: Amber (#FBBF24)
- Squares: Blue (#3B82F6)
- Triangles: Purple (#A855F7)
- Stars: Green (#22C55E)

---

## 🔬 Technical Details

### Eye Tracking Algorithm
1. Capture camera frame (30 FPS)
2. Detect face with MediaPipe
3. Extract 468+ facial landmarks
4. Locate iris landmarks (468-477)
5. Calculate iris center
6. Compute gaze offset from eye center
7. Apply calibration transformation
8. Map to screen coordinates

### Report Generation Pipeline
1. Collect session metrics
2. Process eye tracking data
3. Generate matplotlib figures
4. Compile PDF with ReportLab
5. Create HTML with embedded styles
6. Export CSV for raw data

### Performance
- **Game**: 60 FPS
- **Eye Tracking**: 30 FPS
- **Memory**: ~200MB with eye tracking
- **CPU**: Low to moderate
- **Report Gen**: 5-10 seconds

---

## 📞 Support

### Common Issues

**Q: Camera not detected?**  
A: Game works without camera. Eye tracking will be disabled.

**Q: Reports not generating?**  
A: Check if matplotlib and reportlab are installed.

**Q: Game running slow?**  
A: Disable eye tracking or reduce screen resolution.

**Q: Can't see stimuli?**  
A: Adjust monitor brightness and contrast.

---

## 🎓 For Developers

### Extending the Code

**Add new stimulus type:**
```python
# In StimulusType enum
class StimulusType(Enum):
    HEXAGON = "hexagon"

# In stimulus_colors dict
self.stimulus_colors[StimulusType.HEXAGON] = (255, 0, 255)
```

**Add new report chart:**
```python
# In ReportGenerator class
def _plot_custom_chart(self, ax, data):
    # Your matplotlib code here
    pass
```

**Modify difficulty:**
```python
# In GameConfig
STIMULUS_DURATIONS = {
    1: 4000,  # Easier - 4 seconds
    # ...
}
```

---

## 📝 Version Info

- **Original**: periquest_game.py (1891 lines)
- **Enhanced**: periquest_enhanced.py (600 lines)
- **Eye Tracking**: eye_tracker.py (500 lines)
- **Reporting**: report_generator.py (800 lines)
- **Total New Code**: ~1900 lines
- **Documentation**: README + walkthrough + this guide

---

## ✅ Checklist for First Run

- [ ] Python 3.8+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Camera connected (optional)
- [ ] Good lighting (for eye tracking)
- [ ] Quiet environment
- [ ] 5 minutes available for session
- [ ] `reports/` folder will be auto-created

---

**Ready to start? Run:**
```bash
python periquest_enhanced.py
```

**Good luck with your peripheral vision training! 🎯**
