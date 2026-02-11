import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Play, Pause, RotateCcw, Eye, Target, Zap,
    TrendingUp, Clock, Award, AlertTriangle, CheckCircle,
    Camera, CameraOff, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import DashboardLayout from '../layouts/DashboardLayout';
import { useEyeTracking } from '../hooks/useEyeTracking';
import { storage } from '../utils/storage';

// ==================== GAME CONFIGURATION ====================
const CONFIG = {
    SESSION_DURATION: 120, // 2 minutes for web version
    FPS: 60,

    // Stimulus durations per level (ms)
    STIMULUS_DURATIONS: { 1: 3000, 2: 2500, 3: 2000, 4: 1500, 5: 1000 },

    // Spawn intervals per level (seconds)
    SPAWN_INTERVALS: { 1: 2.5, 2: 2.0, 3: 1.7, 4: 1.4, 5: 1.0 },

    // Scoring
    PERFECT_RT: 500,
    GOOD_RT: 1000,
    SLOW_RT: 2000,
    PERFECT_SCORE: 100,
    GOOD_SCORE: 50,
    SLOW_SCORE: 25,
    MISS_PENALTY: -5,

    // Colors
    COLORS: {
        circle: '#FBBF24',    // Amber
        square: '#3B82F6',    // Blue  
        triangle: '#A855F7',  // Purple
        star: '#22C55E',      // Green
    }
};

// Visual field zones (normalized coordinates: x, y, width, height)
const FIELD_ZONES = {
    left: { x: 0.02, y: 0.35, w: 0.15, h: 0.3 },
    right: { x: 0.83, y: 0.35, w: 0.15, h: 0.3 },
    top: { x: 0.4, y: 0.12, w: 0.2, h: 0.15 },
    bottom: { x: 0.35, y: 0.75, w: 0.3, h: 0.15 },
    top_left: { x: 0.05, y: 0.12, w: 0.18, h: 0.18 },
    top_right: { x: 0.77, y: 0.12, w: 0.18, h: 0.18 },
    bottom_left: { x: 0.05, y: 0.7, w: 0.18, h: 0.18 },
    bottom_right: { x: 0.77, y: 0.7, w: 0.18, h: 0.18 },
};

// ==================== STIMULUS SHAPES ====================
const StimulusShape = ({ type, size, color }) => {
    const baseSize = size;
    const glowStyle = { filter: `drop-shadow(0 0 ${baseSize / 2}px ${color}) drop-shadow(0 0 ${baseSize}px ${color})` };

    switch (type) {
        case 'circle':
            return (
                <div
                    className="rounded-full animate-pulse"
                    style={{
                        width: baseSize,
                        height: baseSize,
                        backgroundColor: color,
                        boxShadow: `inset 0 0 ${baseSize / 4}px rgba(255,255,255,0.8), 0 0 ${baseSize / 1.5}px ${color}`,
                        ...glowStyle
                    }}
                />
            );
        case 'square':
            return (
                <div
                    className="rounded-lg animate-bounce"
                    style={{
                        width: baseSize,
                        height: baseSize,
                        backgroundColor: color,
                        boxShadow: `inset 0 0 ${baseSize / 4}px rgba(255,255,255,0.8), 0 0 ${baseSize}px ${color}`,
                        ...glowStyle
                    }}
                />
            );
        case 'triangle':
            return (
                <div className="animate-pulse" style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${baseSize / 2}px solid transparent`,
                    borderRight: `${baseSize / 2}px solid transparent`,
                    borderBottom: `${baseSize}px solid ${color}`,
                    filter: `drop-shadow(0 0 ${baseSize / 3}px ${color}) drop-shadow(0 0 ${baseSize}px ${color})`,
                    transform: 'rotate(0deg)'
                }} />
            );
        case 'star':
            return (
                <div className="animate-spin-slow" style={{
                    fontSize: baseSize * 1.2,
                    color: color,
                    textShadow: `0 0 ${baseSize / 2}px ${color}, 0 0 ${baseSize}px ${color}`,
                    lineHeight: 1
                }}>
                    ★
                </div>
            );
        default:
            return null;
    }
};

// ==================== MAIN GAME COMPONENT ====================
const PeriQuestGame = () => {
    // Game state
    const [gameState, setGameState] = useState('INSTRUCTIONS'); // INSTRUCTIONS, PLAYING, PAUSED, RESULTS
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(CONFIG.SESSION_DURATION);
    const [stimuli, setStimuli] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [combo, setCombo] = useState(0);

    // Metrics
    const [metrics, setMetrics] = useState({
        totalStimuli: 0,
        correctReactions: 0,
        missedStimuli: 0,
        reactionTimes: [],
        fieldPerformance: {
            top_left: { correct: 0, total: 0, avgRt: 0 },
            top: { correct: 0, total: 0, avgRt: 0 },
            top_right: { correct: 0, total: 0, avgRt: 0 },
            left: { correct: 0, total: 0, avgRt: 0 },
            right: { correct: 0, total: 0, avgRt: 0 },
            bottom_left: { correct: 0, total: 0, avgRt: 0 },
            bottom: { correct: 0, total: 0, avgRt: 0 },
            bottom_right: { correct: 0, total: 0, avgRt: 0 }
        },
        fixationBreaks: 0
    });

    // Refs
    const gameAreaRef = useRef(null);
    const lastSpawnTime = useRef(0);
    const stimulusIdRef = useRef(0);
    const gameLoopRef = useRef(null);
    const levelChangeRef = useRef(Date.now());

    // Eye tracking
    const {
        isTracking, isLoading, isFixating, gazePoint,
        faceDetected, videoRef, startTracking, stopTracking
    } = useEyeTracking();

    // ==================== GAME LOGIC ====================

    // Generate stimulus parameters based on level
    const getStimulusParams = useCallback((level) => {
        const types = ['circle', 'square', 'triangle', 'star'];
        let type, size, isTarget;

        if (level === 1) {
            type = 'circle';
            size = 80 + Math.random() * 40;
            isTarget = true;
        } else if (level === 2) {
            type = Math.random() > 0.5 ? 'circle' : 'square';
            size = 60 + Math.random() * 30;
            isTarget = type === 'circle';
        } else if (level === 3) {
            type = types[Math.floor(Math.random() * types.length)];
            size = 50 + Math.random() * 30;
            isTarget = type === 'circle' || type === 'star';
        } else {
            type = types[Math.floor(Math.random() * types.length)];
            size = 40 + Math.random() * 30;
            isTarget = Math.random() > 0.3;
        }

        return { type, size, isTarget, color: CONFIG.COLORS[type] };
    }, []);

    // Spawn new stimulus
    const spawnStimulus = useCallback(() => {
        if (!gameAreaRef.current) return;

        // Fixation Guard: Only spawn if fixated OR if camera is disabled
        if (isTracking && !isFixating) return;

        const now = Date.now();
        const spawnInterval = CONFIG.SPAWN_INTERVALS[level] * 1000;

        if (now - lastSpawnTime.current < spawnInterval) return;

        const fields = Object.keys(FIELD_ZONES);
        const fieldKey = fields[Math.floor(Math.random() * fields.length)];
        const zone = FIELD_ZONES[fieldKey];

        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = zone.x * rect.width + Math.random() * zone.w * rect.width;
        const y = zone.y * rect.height + Math.random() * zone.h * rect.height;

        const { type, size, isTarget, color } = getStimulusParams(level);

        const newStimulus = {
            id: stimulusIdRef.current++,
            field: fieldKey,
            type,
            x,
            y,
            size,
            color,
            isTarget,
            appearTime: now,
            duration: CONFIG.STIMULUS_DURATIONS[level],
            reacted: false
        };

        setStimuli(prev => [...prev, newStimulus]);
        setMetrics(prev => ({
            ...prev,
            totalStimuli: prev.totalStimuli + 1,
            fieldPerformance: {
                ...prev.fieldPerformance,
                [fieldKey]: {
                    ...prev.fieldPerformance[fieldKey],
                    total: prev.fieldPerformance[fieldKey].total + 1
                }
            }
        }));

        lastSpawnTime.current = now;
    }, [level, getStimulusParams]);

    // Handle reaction (spacebar press)
    const handleReaction = useCallback(() => {
        if (gameState !== 'PLAYING' || stimuli.length === 0) return;

        const now = Date.now();
        const activeStimulus = stimuli.find(s => !s.reacted && s.isTarget);

        if (activeStimulus) {
            const reactionTime = now - activeStimulus.appearTime;
            let basePoints = 0;
            let feedbackType = '';

            // Calculate multiplier based on combo
            // 0-4: 1x, 5-9: 1.5x, 10+: 2x, 20+: 3x
            const multiplier = combo >= 20 ? 3 : combo >= 10 ? 2 : combo >= 5 ? 1.5 : 1;

            if (reactionTime <= CONFIG.PERFECT_RT) {
                basePoints = CONFIG.PERFECT_SCORE;
                feedbackType = 'PERFECT!';
            } else if (reactionTime <= CONFIG.GOOD_RT) {
                basePoints = CONFIG.GOOD_SCORE;
                feedbackType = 'Good!';
            } else if (reactionTime <= CONFIG.SLOW_RT) {
                basePoints = CONFIG.SLOW_SCORE;
                feedbackType = 'Slow';
            } else {
                basePoints = 10;
                feedbackType = 'Late';
            }

            const points = Math.round(basePoints * multiplier);

            // Particles!
            if (gameAreaRef.current) {
                const rect = gameAreaRef.current.getBoundingClientRect();
                // Normalize coordinates for confetti (0-1)
                const xNorm = activeStimulus.x / rect.width;
                const yNorm = activeStimulus.y / rect.height;

                confetti({
                    particleCount: combo > 10 ? 30 : 15,
                    spread: 50,
                    origin: { x: xNorm, y: yNorm },
                    colors: [activeStimulus.color, '#ffffff'],
                    disableForReducedMotion: true
                });
            }

            setScore(prev => prev + points);
            setCombo(prev => prev + 1); // Increment combo

            setStimuli(prev => prev.map(s =>
                s.id === activeStimulus.id ? { ...s, reacted: true } : s
            ));

            setMetrics(prev => ({
                ...prev,
                correctReactions: prev.correctReactions + 1,
                reactionTimes: [...prev.reactionTimes, reactionTime],
                fieldPerformance: {
                    ...prev.fieldPerformance,
                    [activeStimulus.field]: {
                        ...prev.fieldPerformance[activeStimulus.field],
                        correct: prev.fieldPerformance[activeStimulus.field].correct + 1
                    }
                }
            }));

            setFeedback({ type: 'success', message: `${feedbackType} ${multiplier > 1 ? `x${multiplier}` : ''}`, points });
            setTimeout(() => setFeedback(null), 800);
        } else {
            // False positive - no target visible
            setFeedback({ type: 'error', message: 'MISS!', points: 0 });
            setCombo(0); // Reset combo

            // Screen shake effect
            if (gameAreaRef.current) {
                gameAreaRef.current.classList.add('animate-shake');
                setTimeout(() => gameAreaRef.current.classList.remove('animate-shake'), 300);
            }

            setTimeout(() => setFeedback(null), 400);
        }
    }, [gameState, stimuli, combo]);

    // Remove expired stimuli
    const updateStimuli = useCallback(() => {
        const now = Date.now();

        setStimuli(prev => {
            const expired = prev.filter(s => !s.reacted && now - s.appearTime > s.duration);

            // Count missed targets
            if (expired.length > 0) {
                const missedTargets = expired.filter(s => s.isTarget).length;
                if (missedTargets > 0) {
                    setMetrics(m => ({
                        ...m,
                        missedStimuli: m.missedStimuli + missedTargets
                    }));
                    setScore(s => Math.max(0, s + CONFIG.MISS_PENALTY * missedTargets));
                }
            }

            return prev.filter(s => s.reacted || now - s.appearTime <= s.duration);
        });
    }, []);

    // Update difficulty based on performance
    const updateDifficulty = useCallback(() => {
        const now = Date.now();
        if (now - levelChangeRef.current < 20000) return; // 20s cooldown

        const accuracy = metrics.totalStimuli > 0
            ? (metrics.correctReactions / metrics.totalStimuli) * 100
            : 0;
        const avgRt = metrics.reactionTimes.length > 0
            ? metrics.reactionTimes.reduce((a, b) => a + b, 0) / metrics.reactionTimes.length
            : 0;

        let newLevel = level;

        // Level up conditions
        if (level === 1 && accuracy > 75 && avgRt < 1500 && metrics.totalStimuli >= 5) newLevel = 2;
        else if (level === 2 && accuracy > 70 && avgRt < 1200 && metrics.totalStimuli >= 10) newLevel = 3;
        else if (level === 3 && accuracy > 65 && avgRt < 1000 && metrics.totalStimuli >= 15) newLevel = 4;
        else if (level === 4 && accuracy > 60 && avgRt < 800 && metrics.totalStimuli >= 20) newLevel = 5;
        // Level down condition
        else if (level > 1 && accuracy < 40 && metrics.totalStimuli >= 8) newLevel = level - 1;

        if (newLevel !== level) {
            setLevel(newLevel);
            levelChangeRef.current = now;
            setFeedback({
                type: newLevel > level ? 'levelup' : 'leveldown',
                message: newLevel > level ? `Level ${newLevel}!` : `Level ${newLevel}`,
                points: 0
            });
            setTimeout(() => setFeedback(null), 1500);
        }
    }, [level, metrics]);

    // ==================== KEYBOARD HANDLING ====================
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                // Visual feedback for keypress
                const ripple = document.createElement('div');
                ripple.className = 'absolute w-full h-full bg-white/10 pointer-events-none z-50 animate-ping';
                ripple.style.animationDuration = '200ms';
                gameAreaRef.current?.appendChild(ripple);
                setTimeout(() => ripple.remove(), 200);

                if (gameState === 'INSTRUCTIONS') {
                    startGame();
                } else if (gameState === 'PLAYING') {
                    handleReaction();
                }
            } else if (e.code === 'KeyP' && gameState === 'PLAYING') {
                setGameState('PAUSED');
            } else if (e.code === 'KeyP' && gameState === 'PAUSED') {
                setGameState('PLAYING');
            } else if (e.code === 'Escape') {
                endGame();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, handleReaction]);

    // ==================== GAME LOOP ====================
    useEffect(() => {
        if (gameState !== 'PLAYING') {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
            return;
        }

        gameLoopRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });

            spawnStimulus();
            updateStimuli();
            updateDifficulty();

            // Track fixation breaks
            if (!isFixating && isTracking) {
                setMetrics(prev => ({
                    ...prev,
                    fixationBreaks: prev.fixationBreaks + 1
                }));
            }
        }, 1000);

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [gameState, spawnStimulus, updateStimuli, updateDifficulty, isFixating, isTracking]);

    // ==================== GAME CONTROLS ====================
    const startGame = () => {
        setGameState('PLAYING');
        setLevel(1);
        setScore(0);
        setTimeRemaining(CONFIG.SESSION_DURATION);
        setStimuli([]);
        setMetrics({
            totalStimuli: 0,
            correctReactions: 0,
            missedStimuli: 0,
            reactionTimes: [],
            fieldPerformance: Object.keys(FIELD_ZONES).reduce((acc, field) => {
                acc[field] = { correct: 0, total: 0, avgRt: 0 };
                return acc;
            }, {}),
            fixationBreaks: 0
        });
        lastSpawnTime.current = 0;
        levelChangeRef.current = Date.now();
    };

    const endGame = () => {
        setGameState('RESULTS');

        // Persist Session
        // Persist Session
        storage.saveSession('peri-quest', score, {
            level,
            accuracy: parseFloat(metrics.totalStimuli > 0 ? ((metrics.correctReactions / metrics.totalStimuli) * 100).toFixed(1) : 0),
            avgReactionTime: metrics.reactionTimes.length > 0
                ? Math.round(metrics.reactionTimes.reduce((a, b) => a + b, 0) / metrics.reactionTimes.length)
                : 0,
            fixationBreaks: metrics.fixationBreaks,
            fieldPerformance: metrics.fieldPerformance
        });

        // --- BACKEND INTEGRATION ---
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && user.user_id) {
                const acc = parseFloat(metrics.totalStimuli > 0 ? ((metrics.correctReactions / metrics.totalStimuli) * 100).toFixed(1) : 0);
                const avgRt = metrics.reactionTimes.length > 0
                    ? Math.round(metrics.reactionTimes.reduce((a, b) => a + b, 0) / metrics.reactionTimes.length)
                    : 0;

                import('../services/api').then(m => {
                    m.api.submitScore(
                        user.user_id,
                        score,
                        "PeriQuest",
                        level,
                        acc, // use Accuracy as Attention proxy
                        {
                            avgReactionTime: avgRt,
                            fixationBreaks: metrics.fixationBreaks,
                            fieldPerformance: metrics.fieldPerformance
                        }
                    ).then(res => console.log("PeriQuest Score Saved:", res));
                });
            }
        } catch (e) { console.error("PeriQuest save error", e); }
        // ---------------------------

        if (score > 500) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    };

    const restartGame = () => {
        startGame();
    };

    // ==================== COMPUTED VALUES ====================
    const accuracy = metrics.totalStimuli > 0
        ? ((metrics.correctReactions / metrics.totalStimuli) * 100).toFixed(1)
        : '0.0';
    const avgReactionTime = metrics.reactionTimes.length > 0
        ? Math.round(metrics.reactionTimes.reduce((a, b) => a + b, 0) / metrics.reactionTimes.length)
        : 0;

    // ==================== RENDER ====================
    return (
        <DashboardLayout>
            <div className="min-h-screen relative overflow-hidden" ref={gameAreaRef}>

                {/* Instructions Screen */}
                {gameState === 'INSTRUCTIONS' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                    >
                        <div className="max-w-2xl mx-auto text-center p-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <Eye className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold text-white mb-4">PeriQuest</h1>
                                <p className="text-xl text-gray-300 mb-8">Peripheral Vision Training</p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <Target className="w-6 h-6 text-amber-400 mb-2" />
                                    <h3 className="font-bold text-white">Focus on Center</h3>
                                    <p className="text-sm text-gray-400">Keep your eyes on the center dot at all times</p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <Zap className="w-6 h-6 text-cyan-400 mb-2" />
                                    <h3 className="font-bold text-white">React Quickly</h3>
                                    <p className="text-sm text-gray-400">Press <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">SPACE</kbd> when you see a target</p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                                    <h3 className="font-bold text-white">Level Up</h3>
                                    <p className="text-sm text-gray-400">Good performance unlocks harder levels</p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <Clock className="w-6 h-6 text-purple-400 mb-2" />
                                    <h3 className="font-bold text-white">Faster = Better</h3>
                                    <p className="text-sm text-gray-400">Quick reactions earn more points</p>
                                </div>
                            </div>

                            {/* Eye Tracking Toggle */}
                            <div className="mb-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Camera className="w-5 h-5 text-blue-400" />
                                        <span className="text-white font-medium">Eye Tracking</span>
                                        <span className="text-xs text-gray-500">(Optional)</span>
                                    </div>
                                    <button
                                        onClick={isTracking ? stopTracking : startTracking}
                                        disabled={isLoading}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${isTracking
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {isLoading ? 'Loading...' : isTracking ? 'Enabled' : 'Enable'}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startGame}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                            >
                                <Play className="w-5 h-5 inline mr-2" />
                                Press SPACE to Start
                            </motion.button>

                            <div className="mt-6">
                                <Link to="/adhd-dashboard" className="text-gray-400 hover:text-white transition-colors">
                                    ← Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Game Area */}
                {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
                    <>
                        {/* HUD */}
                        <div className="absolute top-4 left-4 right-4 z-40">
                            <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <div className="text-xs text-gray-400">Level</div>
                                        <div className="text-2xl font-bold text-cyan-400">{level}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Time</div>
                                        <div className="text-2xl font-bold text-white">{timeRemaining}s</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400">Accuracy</div>
                                        <div className={`text-xl font-bold ${parseFloat(accuracy) >= 75 ? 'text-green-400' :
                                            parseFloat(accuracy) >= 50 ? 'text-amber-400' : 'text-red-400'
                                            }`}>{accuracy}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400">Avg RT</div>
                                        <div className="text-xl font-bold text-white">{avgReactionTime}ms</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400">Score</div>
                                        <div className="text-2xl font-bold text-green-400">{score}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setGameState(gameState === 'PAUSED' ? 'PLAYING' : 'PAUSED')}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    {gameState === 'PAUSED' ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Center Fixation Dot */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                            {/* Visual Feedback Vignette */}
                            {!isFixating && isTracking && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(239,68,68,0.15)_100%)] shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]"
                                />
                            )}

                            <motion.div
                                animate={{
                                    scale: isFixating || !isTracking ? [1, 1.1, 1] : [1, 1.6, 1],
                                    boxShadow: isFixating || !isTracking
                                        ? ['0 0 20px rgba(34,211,238,0.5)', '0 0 50px rgba(34,211,238,0.3)', '0 0 20px rgba(34,211,238,0.5)']
                                        : ['0 0 30px rgba(239,68,68,0.8)', '0 0 60px rgba(239,68,68,0.5)', '0 0 30px rgba(239,68,68,0.8)']
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className={`w-8 h-8 rounded-full border-4 flex items-center justify-center bg-slate-950 backdrop-blur-md transition-all duration-300 ${isFixating || !isTracking ? 'border-cyan-400' : 'border-red-500 scale-125'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isFixating || !isTracking ? 'bg-cyan-400' : 'bg-red-500'}`} />
                            </motion.div>
                            {!isFixating && isTracking && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-[calc(50%+60px)] flex flex-col items-center gap-2"
                                >
                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] bg-red-500/10 px-4 py-2 rounded-full border border-red-500/30 backdrop-blur-md">
                                        Fixation Lost: Return to Center
                                    </div>
                                    <div className="text-[8px] text-white/40 uppercase tracking-widest animate-pulse font-bold">
                                        Tracking Active • Move Eyes to HUB
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Stimuli */}
                        <AnimatePresence>
                            {stimuli.map(stimulus => (
                                <motion.div
                                    key={stimulus.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute pointer-events-none z-20"
                                    style={{
                                        left: stimulus.x - stimulus.size / 2,
                                        top: stimulus.y - stimulus.size / 2,
                                    }}
                                >
                                    <StimulusShape
                                        type={stimulus.type}
                                        size={stimulus.size}
                                        color={stimulus.color}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Feedback */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.5, opacity: 0, y: -20 }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                                >
                                    <div className={`px-6 py-3 rounded-2xl text-2xl font-bold ${feedback.type === 'success' ? 'bg-green-500 text-white' :
                                        feedback.type === 'error' ? 'bg-red-500 text-white' :
                                            feedback.type === 'levelup' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                                                'bg-slate-700 text-white'
                                        }`}>
                                        {feedback.message}
                                        {feedback.points > 0 && <span className="ml-2 text-lg">+{feedback.points}</span>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pause Overlay */}
                        {gameState === 'PAUSED' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-50"
                            >
                                <div className="text-center">
                                    <Pause className="w-16 h-16 mx-auto text-white mb-4" />
                                    <h2 className="text-3xl font-bold text-white mb-2">Paused</h2>
                                    <p className="text-gray-400 mb-6">Press P or click to resume</p>
                                    <button
                                        onClick={() => setGameState('PLAYING')}
                                        className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl"
                                    >
                                        Resume
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Eye Tracking Status (bottom left) */}
                        {isTracking && (
                            <div className="absolute bottom-4 left-4 z-40">
                                <div className="p-3 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Camera className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-medium text-white">Eye Tracking</span>
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-400' : 'bg-red-400'}`} />
                                            <span className="text-gray-400">{faceDetected ? 'Face Detected' : 'No Face'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isFixating ? 'bg-green-400' : 'bg-amber-400'}`} />
                                            <span className="text-gray-400">{isFixating ? 'Fixating' : 'Looking Away'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hidden video element for eye tracking */}
                        <video
                            ref={videoRef}
                            className="hidden"
                            playsInline
                            muted
                        />

                        {/* Gaze Debug Cursor */}
                        {isTracking && (
                            <motion.div
                                animate={{
                                    x: gazePoint.x * (gameAreaRef.current?.clientWidth || window.innerWidth),
                                    y: gazePoint.y * (gameAreaRef.current?.clientHeight || window.innerHeight),
                                }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
                                className="absolute w-8 h-8 rounded-full border-2 border-red-500 z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 bg-red-500/20"
                                style={{
                                    left: 0,
                                    top: 0
                                }}
                            >
                                <div className="absolute top-full left-1/2 -translate-x-1/2 text-[10px] bg-black/50 text-white px-1 rounded whitespace-nowrap">
                                    Gaze
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Results Screen */}
                {gameState === 'RESULTS' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 overflow-y-auto"
                    >
                        <div className="max-w-4xl mx-auto p-8">
                            <div className="text-center mb-8">
                                <Award className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                                <h1 className="text-4xl font-bold text-white mb-2">Session Complete!</h1>
                                <p className="text-gray-400">Here's how you performed</p>
                            </div>

                            {/* Main Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
                                    <div className="text-4xl font-bold text-green-400 mb-1">{score}</div>
                                    <div className="text-sm text-gray-400">Total Score</div>
                                </div>
                                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
                                    <div className="text-4xl font-bold text-cyan-400 mb-1">{level}</div>
                                    <div className="text-sm text-gray-400">Final Level</div>
                                </div>
                                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
                                    <div className={`text-4xl font-bold mb-1 ${parseFloat(accuracy) >= 75 ? 'text-green-400' :
                                        parseFloat(accuracy) >= 50 ? 'text-amber-400' : 'text-red-400'
                                        }`}>{accuracy}%</div>
                                    <div className="text-sm text-gray-400">Accuracy</div>
                                </div>
                                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
                                    <div className="text-4xl font-bold text-purple-400 mb-1">{avgReactionTime}ms</div>
                                    <div className="text-sm text-gray-400">Avg Reaction</div>
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Performance */}
                                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-400" />
                                        Performance Breakdown
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Stimuli</span>
                                            <span className="text-white font-medium">{metrics.totalStimuli}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Correct Reactions</span>
                                            <span className="text-green-400 font-medium">{metrics.correctReactions}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Missed Targets</span>
                                            <span className="text-red-400 font-medium">{metrics.missedStimuli}</span>
                                        </div>
                                        {isTracking && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Fixation Breaks</span>
                                                <span className="text-amber-400 font-medium">{metrics.fixationBreaks}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Realistic Ocular Map */}
                                <div className="p-8 bg-black/40 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05)_0%,transparent_100%)]" />
                                    <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 uppercase italic tracking-tighter">
                                        <Target className="w-5 h-5 text-cyan-400" />
                                        Spatial Attention Heatmap
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3 aspect-square max-w-sm mx-auto relative z-10">
                                        {['top_left', 'top', 'top_right', 'left', 'center', 'right', 'bottom_left', 'bottom', 'bottom_right'].map((field, i) => {
                                            if (field === 'center') {
                                                return (
                                                    <div key={i} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                                                        <Eye className="w-6 h-6 text-cyan-400 animate-pulse mb-1" />
                                                        <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">Foveal</div>
                                                        <div className="text-sm font-black text-white font-mono">{accuracy}%</div>
                                                    </div>
                                                );
                                            }
                                            const perf = metrics.fieldPerformance[field];
                                            const acc = perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
                                            const rt = perf.correct > 0 ? Math.round(perf.avgRt) : 0;

                                            // Determine HSL color based on accuracy (0 = Red/0deg, 100 = Green/120deg)
                                            // We clamp it slightly to avoid pure red/green
                                            const hue = Math.max(0, Math.min(120, acc * 1.2));
                                            const bgColor = `hsla(${hue}, 70%, 50%, 0.15)`;
                                            const borderColor = `hsla(${hue}, 80%, 60%, 0.4)`;
                                            const textColor = `hsla(${hue}, 90%, 70%, 1)`;

                                            return (
                                                <div
                                                    key={field}
                                                    className="p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 relative overflow-hidden"
                                                    style={{
                                                        backgroundColor: bgColor,
                                                        borderColor: borderColor,
                                                        borderWidth: '1px'
                                                    }}
                                                >
                                                    {/* Warning for Blind Spots */}
                                                    {acc < 40 && perf.total > 2 && (
                                                        <div className="absolute top-1 right-1">
                                                            <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                                                        </div>
                                                    )}

                                                    <div className="text-[8px] font-black text-white/40 uppercase tracking-tight">{field.replace('_', ' ')}</div>
                                                    <div className="text-xl font-black font-mono" style={{ color: textColor }}>
                                                        {acc}%
                                                    </div>
                                                    <div className="text-[8px] font-mono text-white/30">{rt}ms</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={restartGame}
                                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    Play Again
                                </button>
                                <Link
                                    to="/adhd-dashboard"
                                    className="px-8 py-4 bg-white/5 text-white font-bold rounded-[2rem] border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-widest text-xs italic"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Exit to Hub
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PeriQuestGame;
