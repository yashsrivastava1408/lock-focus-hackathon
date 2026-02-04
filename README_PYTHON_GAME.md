# PeriQuest - Enhanced Peripheral Vision Therapy Game 🎯

An advanced peripheral vision therapy game with eye tracking and comprehensive reporting capabilities.

## ✨ Features

### Original Features (Improved)
- ✅ Peripheral vision training with adaptive difficulty
- ✅ Multiple stimulus types (circles, squares, triangles, stars)
- ✅ Visual field performance tracking
- ✅ Reaction time measurement
- ✅ Head movement monitoring
- ✅ Session scoring and metrics

### New Enhanced Features
- 🆕 **Advanced Eye Tracking**
  - Real-time gaze point detection
  - Pupil size measurement
  - Fixation stability analysis
  - Blink detection and rate monitoring
  - Saccade (rapid eye movement) tracking
  - Eye movement heatmap generation

- 🆕 **Comprehensive Report Generation**
  - PDF reports with professional visualizations
  - HTML interactive reports
  - CSV data export for analysis
  - Performance graphs and charts:
    - Accuracy gauges
    - Reaction time distributions
    - Visual field heatmaps
    - Progress tracking
    - Eye movement analysis

- 🆕 **Modern UI/UX**
  - Clean, professional interface
  - Modern color palette
  - Smooth animations
  - Better visual feedback
  - Improved HUD design

## 📁 Project Structure

```
LOCK FOCUS/
├── periquest_game.py          # Original game (1891 lines)
├── periquest_enhanced.py      # Enhanced version (NEW)
├── eye_tracker.py             # Advanced eye tracking module (NEW)
├── report_generator.py        # Report generation module (NEW)
├── requirements.txt           # Python dependencies (NEW)
├── README.md                  # This file (NEW)
└── reports/                   # Generated reports folder (auto-created)
```

## 🚀 Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Verify Camera Access

Make sure your webcam is connected and accessible. The game will automatically detect available cameras.

## 🎮 How to Run

### Run Enhanced Version (Recommended)
```bash
python periquest_enhanced.py
```

### Run Original Version
```bash
python periquest_game.py
```

## 🎯 How to Play

1. **Look at the center dot** - Keep your eyes fixed on the center fixation point
2. **Detect peripheral stimuli** - Use your peripheral vision to detect shapes appearing around the screen
3. **React to targets** - Press **SPACE** when you see a target stimulus
4. **Avoid distractors** - Don't react to non-target stimuli

### Controls
- **SPACE** - React to target stimulus
- **P** - Pause/Resume game
- **ESC** - Quit game

### Level Progression
- **Level 1**: Only circles (all targets) - 3 second display
- **Level 2**: Circles (targets) + Squares (distractors) - 2.5 seconds
- **Level 3**: Multiple shapes, circles & stars are targets - 2 seconds
- **Level 4+**: All shapes, 70% targets, 30% distractors - 1.5 seconds
- **Level 5**: Expert mode - 1 second display

### Scoring
- **Perfect** (<500ms): 100 points ⭐
- **Good** (500-1000ms): 50 points ✓
- **Slow** (1000-2000ms): 25 points
- **Missed**: -5 points ✗

## 📊 Reports

After each session, the game automatically generates:

### PDF Report
- Session summary with key metrics
- Performance visualizations
- Visual field analysis
- Reaction time distribution
- Eye tracking analysis (if camera available)

### HTML Report
- Interactive web-based report
- Clean, modern design
- Easy to share and view

### CSV Data
- Raw session data
- Reaction times
- Field performance
- Easy to import into Excel/analysis tools

Reports are saved in the `reports/` folder with timestamp.

## 🔧 Troubleshooting

### Camera Not Detected
- Ensure webcam is connected
- Check camera permissions in Windows settings
- Try running as administrator
- The game will work in keyboard-only mode if camera is unavailable

### MediaPipe Not Working
```bash
pip install --upgrade mediapipe
```

### Report Generation Errors
```bash
pip install --upgrade matplotlib seaborn reportlab
```

### Performance Issues
- Close other applications using the camera
- Reduce screen resolution if needed
- Disable eye tracking if not needed (game will still work)

## 📈 Key Improvements Over Original

| Feature | Original | Enhanced |
|---------|----------|----------|
| Eye Tracking | Head position only | Full gaze tracking + pupil + fixation |
| Reports | CSV only | PDF + HTML + CSV with visualizations |
| UI Design | Basic | Modern, professional |
| Code Structure | Single 1891-line file | Modular (3 files) |
| Visualizations | None | 15+ chart types |
| Data Analysis | Basic metrics | Comprehensive analysis |

## 🎨 Visual Improvements

- **Modern Color Palette**: Dark theme with vibrant accents
- **Smooth Animations**: Glow effects and transitions
- **Professional HUD**: Clean, readable interface
- **Better Feedback**: Clear visual indicators
- **Responsive Design**: Adapts to different screen sizes

## 📝 Technical Details

### Eye Tracking Technology
- Uses MediaPipe Face Mesh for facial landmark detection
- 468+ facial landmarks tracked in real-time
- Iris tracking for precise gaze estimation
- Calibration system for accuracy

### Report Generation
- Matplotlib for static charts
- Seaborn for advanced visualizations
- ReportLab for PDF generation
- Jinja2 for HTML templating

### Performance
- 60 FPS gameplay
- Real-time eye tracking at 30 FPS
- Efficient rendering with caching
- Minimal CPU usage

## 🔬 Use Cases

- **Clinical**: Peripheral vision therapy for patients
- **Research**: Vision science studies
- **Training**: Sports vision training
- **Assessment**: Visual field evaluation
- **Rehabilitation**: Post-injury vision recovery

## 📧 Session Data

Each session generates unique ID and stores:
- Patient performance metrics
- Reaction times for each stimulus
- Visual field performance breakdown
- Eye tracking data (if available)
- Head movement statistics
- Temporal performance analysis

## 🎓 Future Enhancements

Potential additions:
- [ ] Multi-session progress tracking
- [ ] Customizable difficulty settings
- [ ] Sound feedback options
- [ ] VR support
- [ ] Network/cloud data storage
- [ ] Therapist dashboard
- [ ] Mobile app version

## 📄 License

This project is for educational and therapeutic use.

## 🙏 Credits

- Original PeriQuest concept and implementation
- Enhanced with advanced eye tracking and reporting
- Built with Python, Pygame, MediaPipe, and Matplotlib

---

**Made with ❤️ for better vision therapy**
