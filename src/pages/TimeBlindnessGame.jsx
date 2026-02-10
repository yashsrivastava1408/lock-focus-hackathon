import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Award, Zap, Timer, Target, Brain, Bell, MessageSquare, Ghost, Sparkles, Volume2, VolumeX } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { storage } from '../utils/storage';

const DifficultyLevels = {
    EASY: { label: 'Easy', color: 'bg-emerald-500', targetRange: [5, 10], showVisuals: true },
    MEDIUM: { label: 'Medium', color: 'bg-amber-500', targetRange: [10, 20], showVisuals: false },
    HARD: { label: 'Hard', color: 'bg-rose-500', targetRange: [20, 45], showVisuals: false }
};

const Distractions = [
    { type: 'thought', text: "Did I lock the door?", icon: Brain },
    { type: 'notification', text: "New Message: 'Hey, you free?'", icon: MessageSquare },
    { type: 'phone', text: "Low Battery: 10%", icon: Bell },
    { type: 'random', text: "I wonder if penguins have knees...", icon: Ghost }
];

const TimeBlindnessGame = () => {
    const [gameState, setGameState] = useState('idle'); // idle, counting, playing, result
    const [difficulty, setDifficulty] = useState(DifficultyLevels.EASY);
    const [isChaosMode, setIsChaosMode] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [targetTime, setTargetTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [score, setScore] = useState(0);
    const [preCount, setPreCount] = useState(3);
    const [streak, setStreak] = useState(0);
    const [activeDistractions, setActiveDistractions] = useState([]);
    const [shouldShake, setShouldShake] = useState(false);

    const distractionInterval = useRef(null);

    const startGame = (diff) => {
        setDifficulty(diff);
        const min = diff.targetRange[0];
        const max = diff.targetRange[1];
        setTargetTime(Math.floor(Math.random() * (max - min + 1)) + min);
        setGameState('counting');
        setPreCount(3);
        setActiveDistractions([]);
    };

    useEffect(() => {
        let interval;
        if (gameState === 'counting' && preCount > 0) {
            interval = setInterval(() => {
                setPreCount((prev) => prev - 1);
            }, 1000);
        } else if (gameState === 'playing') {
            setStartTime(Date.now());
            if (isChaosMode) {
                startDistractions();
            }
        } else if (gameState === 'counting' && preCount === 0) {
            setGameState('playing');
        }
        return () => {
            clearInterval(interval);
            clearInterval(distractionInterval.current);
        };
    }, [gameState, preCount, isChaosMode]);

    const startDistractions = () => {
        distractionInterval.current = setInterval(() => {
            const randomDistraction = Distractions[Math.floor(Math.random() * Distractions.length)];
            const id = Date.now();
            setActiveDistractions(prev => [...prev, {
                ...randomDistraction, id,
                x: Math.random() * 80 + 10,
                y: Math.random() * 60 + 20
            }]);

            setTimeout(() => {
                setActiveDistractions(prev => prev.filter(d => d.id !== id));
            }, 3000);
        }, 2500);
    };

    const stopGame = () => {
        const end = Date.now();
        setEndTime(end);
        const elapsed = (end - startTime) / 1000;
        const finalScore = calculateScore(elapsed);
        setGameState('result');
        clearInterval(distractionInterval.current);

        // Persist to local "database"
        storage.saveSession('time-blindness', finalScore, {
            targetTime,
            elapsedTime: elapsed,
            isChaosMode,
            difficulty: difficulty.label
        });

        // --- BACKEND INTEGRATION ---
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && user.user_id) {
                import('../services/api').then(m => {
                    m.api.submitScore(
                        user.user_id,
                        finalScore,
                        "TimeBlindness",
                        0,
                        0,
                        {
                            targetTime,
                            elapsedTime: elapsed,
                            isChaosMode,
                            difficulty: difficulty.label,
                            streak // Pass current streak
                        }
                    ).then(res => console.log("TimeBlindness Score Saved:", res));
                });
            }
        } catch (e) { console.error("TimeBlindness save error", e); }
        // ---------------------------
    };

    const calculateScore = (elapsed) => {
        const diff = Math.abs(elapsed - targetTime);
        const pct = Math.max(0, 100 - (diff / targetTime) * 100);
        const finalScore = Math.round(pct);
        setScore(finalScore);

        if (finalScore >= 90) {
            setStreak(prev => prev + 1);
            setShouldShake(true);
            setTimeout(() => setShouldShake(false), 500);
        } else {
            setStreak(0);
        }
        return finalScore;
    };

    const resetGame = () => {
        setGameState('idle');
        setStartTime(null);
        setEndTime(null);
        setScore(0);
        setActiveDistractions([]);
    };

    const formatTime = (time) => time.toFixed(2);

    return (
        <DashboardLayout>
            <div className={`min-h-screen transition-all duration-500 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] 
                ${isChaosMode ? 'from-rose-100/40 via-background to-background dark:from-rose-900/20' : 'from-purple-100/40 via-background to-background dark:from-purple-900/20'}`}>

                <div className="max-w-4xl mx-auto px-4 py-8 relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <Link to="/adhd-dashboard" className="p-3 glass rounded-xl hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                                    Chronos Match
                                </h1>
                                <p className="text-muted-foreground">Master your internal temporal flow.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                                className={`p-3 rounded-xl transition-all ${isSoundEnabled ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'glass text-muted-foreground'}`}
                            >
                                {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </button>
                            <label className="glass px-4 py-2 rounded-xl flex items-center gap-3 cursor-pointer select-none group">
                                <Zap className={`w-4 h-4 transition-colors ${isChaosMode ? 'text-rose-500' : 'text-muted-foreground'}`} />
                                <span className={`text-sm font-bold ${isChaosMode ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>CHAOS MODE</span>
                                <div className="relative inline-flex items-center w-10 h-5">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isChaosMode}
                                        onChange={() => setIsChaosMode(!isChaosMode)}
                                    />
                                    <div className={`w-full h-full rounded-full transition-colors ${isChaosMode ? 'bg-rose-500' : 'bg-gray-300 dark:bg-slate-700'}`} />
                                    <div className={`absolute left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isChaosMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    <AnimatePresence>
                        {streak > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="absolute -left-4 top-24 z-20"
                            >
                                <div className="bg-amber-500 text-white px-4 py-2 rounded-r-full flex items-center gap-2 shadow-lg shadow-amber-500/20 border-l-4 border-amber-600">
                                    <Sparkles size={16} />
                                    <span className="font-bold">STREAK: {streak}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {gameState === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-card rounded-3xl p-12 text-center"
                            >
                                <div className="mb-8 flex justify-center">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="p-6 bg-purple-100 dark:bg-purple-900/30 rounded-full"
                                    >
                                        <Timer className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                                    </motion.div>
                                </div>
                                <h2 className="text-2xl font-bold mb-4">Choose Your Pulse</h2>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                    Estimation is a skill. The closer you get, the stronger your temporal awareness becomes.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                    {Object.values(DifficultyLevels).map((level) => (
                                        <button
                                            key={level.label}
                                            onClick={() => startGame(level)}
                                            className="group relative h-40 flex flex-col items-center justify-center gap-3 glass hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all duration-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                                        >
                                            <div className={`w-3 h-3 rounded-full ${level.color} animate-pulse`} />
                                            <span className="font-bold text-lg">{level.label}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {level.targetRange[0]}-{level.targetRange[1]}s
                                            </span>
                                            <Play className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500 mt-2" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {gameState === 'counting' && (
                            <motion.div
                                key="counting"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                className="flex flex-col items-center justify-center p-20"
                            >
                                <div className="text-9xl font-black text-purple-600 dark:text-purple-400 drop-shadow-2xl">
                                    {preCount}
                                </div>
                                <motion.p
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="mt-8 text-xl font-medium text-muted-foreground uppercase tracking-widest"
                                >
                                    Focusing...
                                </motion.p>
                            </motion.div>
                        )}

                        {gameState === 'playing' && (
                            <motion.div
                                key="playing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-card rounded-3xl p-12 text-center relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center"
                            >
                                {/* Chronos Orb */}
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-4">Target</div>
                                    <div className="text-4xl font-bold mb-8">{targetTime}s</div>

                                    <div className="relative mb-12">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                boxShadow: [
                                                    "0 0 0px rgba(124, 58, 237, 0)",
                                                    "0 0 40px rgba(124, 58, 237, 0.4)",
                                                    "0 0 0px rgba(124, 58, 237, 0)"
                                                ]
                                            }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center relative z-10"
                                        >
                                            <button
                                                onClick={stopGame}
                                                className="h-full w-full rounded-full flex items-center justify-center hover:scale-95 transition-transform"
                                            >
                                                <Target className="w-16 h-16 text-white" />
                                            </button>
                                        </motion.div>

                                        {/* Spinning Outer Ring */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            className="absolute -top-4 -left-4 -right-4 -bottom-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-full"
                                        />
                                    </div>

                                    <p className="text-muted-foreground animate-pulse text-lg">
                                        Capture the moment when time is up.
                                    </p>
                                </div>

                                {/* Chaos Distractions */}
                                <AnimatePresence>
                                    {activeDistractions.map(d => (
                                        <motion.div
                                            key={d.id}
                                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 1.5 }}
                                            style={{ left: `${d.x}%`, top: `${d.y}%` }}
                                            className="absolute z-20 pointer-events-none"
                                        >
                                            <div className={`glass px-4 py-2 rounded-2xl flex items-center gap-3 border shadow-xl ${d.type === 'notification' ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-200' : 'border-purple-200 text-purple-700 dark:text-purple-200'}`}>
                                                <d.icon size={16} />
                                                <span className="text-xs font-bold whitespace-nowrap">{d.text}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Difficulty Visual Hint if Easy */}
                                {difficulty.showVisuals && (
                                    <motion.div
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: targetTime, ease: 'linear' }}
                                        className="absolute bottom-0 left-0 h-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 bg-[length:200%_100%] animate-shimmer"
                                    />
                                )}
                            </motion.div>
                        )}

                        {gameState === 'result' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: shouldShake ? [-5, 5, -5, 5, 0] : 0
                                }}
                                className="glass-card rounded-3xl p-12 overflow-hidden border-t-8 border-purple-500"
                            >
                                <div className="text-center mb-12">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex p-6 bg-purple-100 dark:bg-purple-900/30 rounded-3xl mb-6 relative"
                                    >
                                        <Award className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                                        {score > 90 && (
                                            <motion.div
                                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className="absolute inset-0 rounded-3xl border-4 border-purple-400"
                                            />
                                        )}
                                    </motion.div>
                                    <h2 className="text-5xl font-black mb-2 tracking-tight">{score}%</h2>
                                    <p className="text-xl font-medium text-muted-foreground">
                                        {score > 95 ? "Perfect Sync!" : score > 85 ? "Master Timer!" : score > 70 ? "Great Rhythm!" : "Calibrating..."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-12">
                                    <div className="p-8 glass rounded-3xl border border-slate-100 dark:border-slate-800 text-center group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                        <div className="text-xs font-bold text-muted-foreground uppercase mb-2 tracking-widest">Target Flux</div>
                                        <div className="text-4xl font-bold">{targetTime}.00s</div>
                                    </div>
                                    <div className="p-8 glass rounded-3xl border border-slate-100 dark:border-slate-800 text-center group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                        <div className="text-xs font-bold text-muted-foreground uppercase mb-2 tracking-widest">Your Pulse</div>
                                        <div className="text-4xl font-bold text-purple-500">{formatTime((endTime - startTime) / 1000)}s</div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={resetGame}
                                        className="group flex-1 h-16 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-600/30 active:scale-95"
                                    >
                                        <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
                                        RETRY SESSION
                                    </button>
                                    <Link
                                        to="/adhd-dashboard"
                                        className="flex-1 h-16 glass hover:bg-white dark:hover:bg-slate-800 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-purple-100 dark:border-purple-800"
                                    >
                                        DASHBOARD
                                    </Link>
                                </div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-12 p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex gap-6 items-center"
                                >
                                    <div className="p-4 bg-amber-200/50 dark:bg-amber-800/30 rounded-2xl">
                                        <Brain className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                                        <strong>Neuro Insight:</strong> Practicing estimation under distraction (Chaos Mode) strengthens the prefrontal cortex's ability to maintain time tracking despite competing inputs.
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TimeBlindnessGame;
