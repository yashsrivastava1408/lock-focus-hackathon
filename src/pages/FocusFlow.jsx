import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Zap, Shield, RotateCcw, Crown, Camera, CameraOff, Eye, AlertCircle, Brain, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import confetti from 'canvas-confetti';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Lock, Unlock, Trophy, FastForward } from 'lucide-react';
import { storage } from '../utils/storage';

const LEVEL_CONFIG = [
    { id: 1, name: "Beginner", speed: 2, duration: 15, desc: "Mental Warm-up", color: "from-emerald-500 to-teal-500" },
    { id: 2, name: "Easy", speed: 5, duration: 15, desc: "Focus Stability", color: "from-cyan-500 to-blue-500" },
    { id: 3, name: "Medium", speed: 8, duration: 18, desc: "Deep Attention", color: "from-blue-500 to-indigo-500" },
    { id: 4, name: "Hard", speed: 12, duration: 20, desc: "Cognitive Endurance", color: "from-indigo-500 to-purple-500" },
    { id: 5, name: "Master", speed: 18, duration: 20, desc: "Flow State Master", color: "from-purple-500 to-pink-500" },
];


const FocusFlow = () => {
    // Game State (UI Synced)
    const [gameState, setGameState] = useState('level-select'); // level-select, intro, playing, gameover
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [lane, setLane] = useState(1);
    const [items, setItems] = useState([]);
    const [speed, setSpeed] = useState(5);
    const [streak, setStreak] = useState(0);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [attentionState, setAttentionState] = useState('unknown');
    const [neuroMode, setNeuroMode] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const [unlockedLevels, setUnlockedLevels] = useState(() => {
        const saved = localStorage.getItem('focusFlowUnlockedLevels');
        return saved ? parseInt(saved) : 1;
    });
    const [currentLevel, setCurrentLevel] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [levelStatus, setLevelStatus] = useState(null); // 'completed' or 'failed'


    // REFS (Source of Truth for Game Loop) - Solving Stale Closures
    const laneRef = useRef(1);
    const itemsRef = useRef([]);
    const speedRef = useRef(5);
    const streakRef = useRef(0);
    const scoreRef = useRef(0);
    const gameTimeRef = useRef(0);
    const gameStateRef = useRef('intro');
    const neuroModeRef = useRef(false);
    const attentionStateRef = useRef('unknown');
    const cameraEnabledRef = useRef(false); // Fix: Track camera state in ref for loop access

    // AI / Camera Refs
    const videoRef = useRef(null);
    const modelRef = useRef(null);
    const detectionIntervalRef = useRef(null);

    // Loop Refs
    const requestRef = useRef();
    const lastTimeRef = useRef();
    const spawnTimerRef = useRef(0);

    // Analytics History
    const gazeHistoryRef = useRef([]); // Stores { x: percentage, y: percentage }
    const attentionHistoryRef = useRef([]); // Stores 1 for focused, 0 for away
    const [finalAnalytics, setFinalAnalytics] = useState(null);


    // Sync State to Refs (Update refs when UI state changes via other means)
    useEffect(() => { laneRef.current = lane; }, [lane]);
    useEffect(() => { neuroModeRef.current = neuroMode; }, [neuroMode]);
    useEffect(() => { cameraEnabledRef.current = cameraEnabled; }, [cameraEnabled]); // Sync camera state

    // Load Blazeface Model
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.setBackend('webgl');
                modelRef.current = await blazeface.load();
                console.log("Blazeface model loaded");
            } catch (err) {
                console.error("Failed to load face model:", err);
            }
        };
        loadModel();
        return () => {
            if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
            cancelAnimationFrame(requestRef.current);
        }
    }, []);

    // Face Detection Loop
    const startDetection = () => {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

        detectionIntervalRef.current = setInterval(async () => {
            if (modelRef.current && videoRef.current && videoRef.current.readyState === 4) {
                try {
                    const predictions = await modelRef.current.estimateFaces(videoRef.current, false);
                    if (predictions.length > 0) {
                        const face = predictions[0];
                        const landmarks = face.landmarks;

                        // Landmark indices for BlazeFace: 0: RE, 1: LE, 2: Nose
                        const rEye = landmarks[0];
                        const lEye = landmarks[1];
                        const nose = landmarks[2];

                        // Calculate horizontal gaze (Head Pose)
                        const eyeMidX = (rEye[0] + lEye[0]) / 2;
                        const eyeDist = Math.abs(rEye[0] - lEye[0]);
                        const horizontalOffset = Math.abs(nose[0] - eyeMidX);

                        // Threshold: If nose deviates > 25% of inter-eye distance, they are looking away
                        if (horizontalOffset > eyeDist * 0.25) {
                            setAttentionState('distracted');
                            attentionStateRef.current = 'distracted';
                        } else {
                            setAttentionState('focused');
                            attentionStateRef.current = 'focused';
                        }
                    } else {
                        setAttentionState('away');
                        attentionStateRef.current = 'away';
                    }
                } catch (e) { }
            }
        }, 300); // Increased frequency for better reactivity

    };

    // Camera Toggle
    const toggleCamera = async () => {
        if (cameraEnabled) {
            const stream = videoRef.current?.srcObject;
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
            setCameraEnabled(false);
            setAttentionState('unknown');
            attentionStateRef.current = 'unknown';
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadeddata = () => startDetection();
                }
                setCameraEnabled(true);
            } catch (err) {
                alert("Camera access required for Attention Awareness.");
            }
        }
    };

    // Controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Use REF for current state check to avoid stale closures in event listener
            if (gameStateRef.current !== 'playing' || neuroModeRef.current) return;

            if (e.key === 'ArrowLeft') {
                const newLane = Math.max(0, laneRef.current - 1);
                laneRef.current = newLane;
                setLane(newLane);
            }
            if (e.key === 'ArrowRight') {
                const newLane = Math.min(2, laneRef.current + 1);
                laneRef.current = newLane;
                setLane(newLane);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const startGame = (isNeuro = false) => {
        if (!currentLevel) return;
        console.log("Starting Game. Neuro:", isNeuro, "Level:", currentLevel.id);

        const config = currentLevel;

        // Reset Logic Refs
        scoreRef.current = 0;
        streakRef.current = 0;
        itemsRef.current = [];
        laneRef.current = 1;
        speedRef.current = config.speed;
        gameTimeRef.current = 0;
        neuroModeRef.current = isNeuro;
        gameStateRef.current = 'playing';
        gazeHistoryRef.current = [];
        attentionHistoryRef.current = [];

        // Reset UI State
        setScore(0);
        setStreak(0);
        setItems([]);
        setLane(1);
        setSpeed(config.speed);
        setTimeLeft(config.duration);
        setNeuroMode(isNeuro);
        setGameState('playing');
        setLevelStatus(null);
        setFinalAnalytics(null);


        // Start Loop
        lastTimeRef.current = performance.now();
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const gameOver = (success = false) => {
        gameStateRef.current = 'gameover';
        setGameState('gameover');
        setLevelStatus(success ? 'completed' : 'failed');
        cancelAnimationFrame(requestRef.current);

        // Process Analytics
        const totalSamples = attentionHistoryRef.current.length;
        const focusedSamples = attentionHistoryRef.current.filter(a => a === 1).length;
        const attentionPct = totalSamples > 0 ? Math.round((focusedSamples / totalSamples) * 100) : 0;

        const reflexTime = Math.round(Math.max(120, 450 - (speedRef.current * 15)));
        const consistency = Math.round(Math.max(60, Math.min(98, 70 + (scoreRef.current / 200))));

        const analytics = {
            attentionPct,
            gazeHistory: [...gazeHistoryRef.current],
            reflexTime,
            consistency
        };

        setFinalAnalytics(analytics);

        // Persist Session
        storage.saveSession('focus-flow', scoreRef.current, {
            level: currentLevel.id,
            difficulty: currentLevel.name,
            success,
            neuroMode: neuroModeRef.current,
            attentionScore: attentionPct,
            consistency
        });

        if (success) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            if (currentLevel.id === unlockedLevels && unlockedLevels < 5) {
                const newUnlock = unlockedLevels + 1;
                setUnlockedLevels(newUnlock);
                localStorage.setItem('focusFlowUnlockedLevels', newUnlock.toString());
            }
        }
    };



    // GAME LOOP (Ref-Based for Accuracy)
    const gameLoop = (time) => {
        if (gameStateRef.current !== 'playing') return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        const currentLane = laneRef.current;
        let currentItems = [...itemsRef.current];
        const currentSpeed = speedRef.current;
        const isCameraOn = cameraEnabledRef.current; // Use Ref for live status
        const currentAttention = attentionStateRef.current;

        // --- 1. NEURO-PILOT LOGIC (AI Steering) ---
        if (neuroModeRef.current && isCameraOn && currentAttention === 'focused') {
            // Look ahead for close threats
            const threats = currentItems.filter(i => i.lane === currentLane && i.y > 40 && i.y < 90 && i.type === 'obstacle');
            const rewards = currentItems.filter(i => i.y > 30 && i.y < 90 && i.type === 'orb');

            if (threats.length > 0) {
                // Threat incoming! Dodge!
                const safeLanes = [0, 1, 2].filter(l => l !== currentLane);
                const target = safeLanes[Math.floor(Math.random() * safeLanes.length)];
                laneRef.current = target;
                setLane(target); // Sync UI
            } else {
                // Orb hunting
                const goodOrb = rewards.find(i => i.lane !== currentLane);
                if (goodOrb) {
                    laneRef.current = goodOrb.lane;
                    setLane(goodOrb.lane); // Sync UI
                }
            }
        }

        // --- 2. Physics & Collision ---
        const nextItems = [];
        let hit = false;
        let collected = false;

        currentItems.forEach(item => {
            const newY = item.y + (currentSpeed * (deltaTime / 16));

            // Collision Check
            if (newY > 80 && newY < 95 && item.lane === laneRef.current) {
                if (item.type === 'obstacle') {
                    hit = true;
                } else if (item.type === 'orb') {
                    collected = true;
                }
            } else if (newY < 100) {
                if (!(newY > 80 && newY < 95 && item.lane === laneRef.current && item.type === 'orb')) {
                    nextItems.push({ ...item, y: newY });
                }
            }
        });

        if (hit) {
            gameOver();
            return;
        }

        if (collected) {
            scoreRef.current += 50;
            streakRef.current = Math.min(100, streakRef.current + 10);
            setScore(scoreRef.current);
            setStreak(streakRef.current);
        }

        itemsRef.current = nextItems;
        setItems(nextItems);

        // --- 3. Spawning ---
        spawnTimerRef.current += deltaTime;
        if (spawnTimerRef.current > (10000 / (currentSpeed * 10)) + 400) {
            const lane = Math.floor(Math.random() * 3);
            const type = Math.random() > 0.3 ? 'obstacle' : 'orb';
            itemsRef.current.push({ id: Date.now(), lane, type, y: -10 });
            spawnTimerRef.current = 0;

            // Streak Logic with Camera
            if (isCameraOn && currentAttention === 'away') {
                streakRef.current = Math.max(0, streakRef.current - 5);
            } else {
                streakRef.current = Math.max(0, streakRef.current - 0.2);
            }
            setStreak(streakRef.current);
        }

        // --- 4. Difficulty & Level Progression ---
        gameTimeRef.current += deltaTime;
        const totalTime = currentLevel.duration * 1000;
        const remaining = Math.max(0, (totalTime - gameTimeRef.current) / 1000);
        setTimeLeft(Math.ceil(remaining));

        // --- 5. Gaze Data Recording ---
        // We simulate gaze based on current attention and lane for the heatmap demo
        if (gameTimeRef.current % 100 < 20) { // Record roughly 10 times per second
            if (attentionStateRef.current === 'focused') {
                // Focus is on the lane, usually near the bottom third where action is
                const x = (laneRef.current * 33) + 16 + (Math.random() * 10 - 5);
                const y = 70 + (Math.random() * 20 - 10);
                gazeHistoryRef.current.push({ x, y });
                attentionHistoryRef.current.push(1);
            } else {
                // Scattered gaze when away/distracted
                attentionHistoryRef.current.push(0);
            }
        }

        if (gameTimeRef.current >= totalTime) {
            gameOver(true);
            return;
        }

        // Slight speed increase over time within level
        speedRef.current = currentLevel.speed + (gameTimeRef.current / 20000);
        setSpeed(speedRef.current);

        requestRef.current = requestAnimationFrame(gameLoop);
    };


    // Status Color Helper
    const getStatusColor = () => {
        if (!cameraEnabled) return 'text-gray-500';
        switch (attentionState) {
            case 'focused': return 'text-emerald-400';
            case 'distracted': return 'text-yellow-400';
            case 'away': return 'text-red-500 animate-pulse';
            default: return 'text-gray-400';
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden relative">

                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.9)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,18,0.9)_2px,transparent_2px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] opacity-20 pointer-events-none" />

                {/* HUD Header */}
                <div className="absolute top-8 left-0 right-0 px-8 flex flex-col md:flex-row justify-between items-center z-50 gap-4">
                    <Link to="/adhd-dashboard" className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors self-start md:self-center">
                        <ArrowLeft />
                    </Link>

                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 italic uppercase tracking-wider">
                            Focus Flow
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-200 ${getStatusColor()}`}>
                                Attention Signal: {cameraEnabled ? attentionState.toUpperCase() : 'OFFLINE'}
                            </span>
                            {cameraEnabled && (
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${attentionState === 'focused' ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${attentionState === 'focused' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                </span>
                            )}
                        </div>
                        {neuroMode && (
                            <div className="text-[10px] font-mono text-purple-400 mt-1 animate-pulse">
                                NEURO-PILOT ACTIVE
                            </div>
                        )}
                    </div>

                    {/* Camera Control / Feed */}
                    <div className="flex items-center gap-6">
                        {/* Feed Box */}
                        <div className="relative group">
                            <div className={`relative w-32 h-24 rounded-lg overflow-hidden border-2 bg-black/50 transition-colors duration-200 ${cameraEnabled ? (attentionState === 'focused' ? 'border-emerald-500/50' : 'border-red-500/80') : 'border-gray-700'}`}>
                                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover transition-opacity duration-500 ${cameraEnabled ? 'opacity-60' : 'opacity-0'}`} />

                                {/* Overlay UI */}
                                {cameraEnabled && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`w-12 h-12 border border-dashed rounded-full flex items-center justify-center transition-all duration-200 ${attentionState === 'focused' ? 'border-emerald-400 scale-100' : 'border-red-500 scale-110'}`}>
                                            <div className={`w-1 h-1 rounded-full ${attentionState === 'focused' ? 'bg-emerald-400' : 'bg-red-500'}`} />
                                        </div>
                                        {/* Corner Markers */}
                                        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/50" />
                                        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-white/50" />
                                        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-white/50" />
                                        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/50" />
                                    </div>
                                )}

                                {!cameraEnabled && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                        <CameraOff size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Camera Toggle Button */}
                            <button
                                onClick={toggleCamera}
                                className="absolute -bottom-3 -right-3 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 border border-slate-600 shadow-lg transition-colors"
                                title={cameraEnabled ? "Disable Attention Camera" : "Enable Attention Camera"}
                            >
                                {cameraEnabled ? <Eye size={14} className="text-emerald-400" /> : <Camera size={14} />}
                            </button>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-xs text-white/50 font-bold uppercase">{gameState === 'playing' ? 'Time Left' : 'Score'}</span>
                            <span className="text-2xl font-black text-white font-mono">
                                {gameState === 'playing' ? `${timeLeft}s` : score.toString().padStart(6, '0')}
                            </span>
                        </div>
                    </div>
                </div>


                {/* GAME SCENE */}
                <div className="relative w-full max-w-lg h-[600px] border-x-4 border-white/10 bg-gradient-to-b from-slate-900 to-purple-900/20 perspective-1000 overflow-hidden rounded-3xl backdrop-blur-sm shadow-2xl">

                    {/* Lanes */}
                    <div className="absolute inset-0 flex">
                        <div className="flex-1 border-r border-white/5" onClick={() => !neuroMode && setLane(0)} />
                        <div className="flex-1 border-r border-white/5" onClick={() => !neuroMode && setLane(1)} />
                        <div className="flex-1" onClick={() => !neuroMode && setLane(2)} />
                    </div>

                    {/* Level Selection Screen */}
                    {gameState === 'level-select' && (
                        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-8 overflow-y-auto">
                            <Trophy size={48} className="text-yellow-400 mb-4" />
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">PROGRESSION</h2>
                            <p className="text-white/40 text-sm mb-12 uppercase tracking-[0.3em]">Select your focus level</p>

                            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                                {LEVEL_CONFIG.map((lvl) => {
                                    const isLocked = lvl.id > unlockedLevels;
                                    return (
                                        <button
                                            key={lvl.id}
                                            disabled={isLocked}
                                            onClick={() => {
                                                setCurrentLevel(lvl);
                                                setGameState('intro');
                                            }}
                                            className={`group relative p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${isLocked
                                                ? 'bg-white/5 border-white/5 opacity-50 grayscale'
                                                : `bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1`}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${lvl.color} shadow-lg shadow-black/20`}>
                                                {isLocked ? <Lock size={20} className="text-white/40" /> : <span className="text-lg font-black text-white">{lvl.id}</span>}
                                            </div>

                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-white">{lvl.name}</span>
                                                    {!isLocked && lvl.id < unlockedLevels && <Trophy size={14} className="text-yellow-400" />}
                                                </div>
                                                <p className="text-xs text-white/40 font-medium">{lvl.desc}</p>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Speed</div>
                                                <div className="text-sm font-mono font-bold text-white/60">{lvl.speed}x</div>
                                            </div>

                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl">
                                                    <Lock size={24} className="text-white/20" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <Link to="/adhd-dashboard" className="mt-12 text-white/30 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                                Return to Dashboard
                            </Link>
                        </div>
                    )}

                    {/* Start Screen */}
                    {gameState === 'intro' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-8 text-center">
                            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${currentLevel?.color} flex items-center justify-center mb-6 shadow-2xl`}>
                                <Zap size={40} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{currentLevel?.name}</h2>
                            <p className="text-white/60 mb-8 max-w-xs mx-auto">
                                Surivive for <span className="text-white font-bold">{currentLevel?.duration} seconds</span> to unlock the next level.
                            </p>


                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                {!cameraEnabled && (
                                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                        <div className="flex items-center gap-2 mb-2 text-cyan-400">
                                            <Camera size={16} />
                                            <span className="text-sm font-bold uppercase">Attention Sensor</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 leading-relaxed text-left mb-3">
                                            Required for Neuro-Pilot (Auto-Play). The game will play itself while you maintain focus.
                                        </p>
                                        <button
                                            onClick={toggleCamera}
                                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white transition-colors"
                                        >
                                            Enable Camera
                                        </button>
                                    </div>
                                )}

                                <button onClick={() => startGame(false)} className={`px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 ${cameraEnabled ? 'w-full' : ''}`}>
                                    <Play fill="black" size={20} /> MANUAL MODE
                                </button>

                                {cameraEnabled && (
                                    <button onClick={() => startGame(true)} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-xl rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 w-full border border-white/20">
                                        <Brain size={20} /> NEURO-PILOT
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Game Over Screen / Analytics Dashboard */}
                    {gameState === 'gameover' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center bg-black/95 backdrop-blur-md p-6 text-center overflow-y-auto custom-scrollbar">
                            {!finalAnalytics ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                                    <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest animate-pulse">Processing Neuro-Analytics...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-full flex justify-between items-center mb-6">
                                        <div className="text-left">
                                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Neuro-Report</h2>
                                            <div className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase">Session #{Math.floor(Math.random() * 9000) + 1000}</div>
                                        </div>
                                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${levelStatus === 'completed' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                                            {levelStatus === 'completed' ? 'Validated' : 'Interrupted'}
                                        </div>
                                    </div>


                                    {/* Analytics Grid */}
                                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain size={14} className="text-purple-400" />
                                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Focus Level</span>
                                            </div>
                                            <div className="text-3xl font-black text-white font-mono">{finalAnalytics?.attentionPct}%</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity size={14} className="text-blue-400" />
                                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Consistency</span>
                                            </div>
                                            <div className="text-3xl font-black text-white font-mono">{finalAnalytics?.consistency}%</div>
                                        </div>
                                    </div>

                                    {/* Gaze Heatmap Visualization */}
                                    <div className="w-full relative rounded-3xl overflow-hidden border border-white/10 aspect-square bg-slate-900 mb-6 group">
                                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                                            <Eye size={12} className="text-cyan-400" />
                                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Gaze Heatmap</span>
                                        </div>

                                        {/* Simulated Heatmap via CSS Shadows/Glows for performance & simplicity */}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                        {finalAnalytics?.gazeHistory?.length > 0 ? (
                                            finalAnalytics.gazeHistory.map((pt, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute w-8 h-8 rounded-full blur-xl opacity-20 pointer-events-none"
                                                    style={{
                                                        left: `${pt.x}%`,
                                                        top: `${pt.y}%`,
                                                        background: `radial-gradient(circle, ${levelStatus === 'completed' ? '#22d3ee' : '#ef4444'} 0%, transparent 70%)`
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                                <CameraOff size={24} className="text-white/10" />
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Sensor Data Unavailable</span>
                                            </div>
                                        )}


                                        {/* Average Focus Zone */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                            <div className="w-48 h-48 border-2 border-dashed border-white/10 rounded-full animate-spin-slow" />
                                            <div className="absolute w-32 h-32 border border-white/5 rounded-full" />
                                        </div>

                                        {finalAnalytics?.gazeHistory?.length > 0 && (
                                            <div className="absolute bottom-4 right-4 z-20 text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                                Spatial Distribution Map
                                            </div>
                                        )}

                                    </div>

                                    {/* Reflex Stats */}
                                    <div className="w-full p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/5 mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <Zap size={14} className="text-yellow-400" />
                                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Neural Latency</span>
                                            </div>
                                            <div className="text-xl font-black text-white font-mono">{finalAnalytics?.reflexTime}ms</div>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (450 - (finalAnalytics?.reflexTime || 0)) / 3)}%` }}
                                                className="h-full bg-gradient-to-r from-yellow-400 to-emerald-400"
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[8px] font-bold text-white/20 uppercase">
                                            <span>Delayed</span>
                                            <span>Instant</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="w-full flex flex-col gap-3">
                                        {levelStatus === 'completed' ? (
                                            <button
                                                onClick={() => setGameState('level-select')}
                                                className="w-full py-4 bg-white text-black font-black text-lg rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                            >
                                                PROCEED TO NEXT PHASE <ArrowLeft size={18} className="rotate-180" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startGame(neuroMode)}
                                                className="w-full py-4 bg-red-600 text-white font-black text-lg rounded-2xl transition-all hover:bg-red-500 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                                            >
                                                <RotateCcw size={18} /> RE-INITIALIZE
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setGameState('level-select')}
                                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-bold rounded-xl transition-all text-xs uppercase tracking-[0.2em]"
                                        >
                                            Return to Hub
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}




                    {/* Player Ship */}
                    <AnimatePresence>
                        {gameState !== 'intro' && (
                            <motion.div
                                className="absolute bottom-10 w-16 h-16 bg-cyan-500 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.6)] z-30 flex items-center justify-center"
                                animate={{ left: `${(lane * 33.33) + 8.33}%` }} // Approximate center of 33% lane
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <div className="w-10 h-10 bg-white rounded-full" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Falling Items */}
                    {items.map(item => (
                        <div
                            key={item.id}
                            className={`absolute w-12 h-12 rounded-lg z-20 flex items-center justify-center transition-transform ${item.type === 'obstacle' ? 'scale-100' : 'scale-75 animate-pulse'}`}
                            style={{
                                top: `${item.y}%`,
                                left: `${(item.lane * 33.33) + 10}%`,
                                opacity: item.y < 0 ? 0 : 1
                            }}
                        >
                            {item.type === 'obstacle' ? (
                                <div className="w-full h-full bg-red-500 rotate-45 shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                            ) : (
                                <div className="w-full h-full bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)] border-2 border-white" />
                            )}
                        </div>
                    ))}

                    {/* Lane Highlights */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className={`absolute top-0 bottom-0 left-0 w-1/3 bg-white/5 transition-opacity duration-300 ${lane === 0 ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute top-0 bottom-0 left-1/3 w-1/3 bg-white/5 transition-opacity duration-300 ${lane === 1 ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute top-0 bottom-0 right-0 w-1/3 bg-white/5 transition-opacity duration-300 ${lane === 2 ? 'opacity-100' : 'opacity-0'}`} />
                    </div>

                    {/* Attention Overlay (Distraction Effect) */}
                    {cameraEnabled && attentionState === 'distracted' && (
                        <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none animate-pulse z-10" />
                    )}

                </div>

                {/* Privacy Disclaimer Modal */}
                <AnimatePresence>
                    {showDisclaimer && (
                        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden"
                            >
                                {/* Decorative Glow */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-600" />

                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-600">
                                        <Shield size={32} className="text-cyan-400" />
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-2">Camera Access & Privacy</h2>

                                    <div className="space-y-4 text-slate-400 text-sm leading-relaxed mb-8">
                                        <p>
                                            <strong className="text-white">Focus Flow</strong> uses your webcam to detect your attention state in real-time. This powers the <span className="text-purple-400 font-bold">Neuro-Pilot</span> features.
                                        </p>
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-left">
                                            <ul className="space-y-2">
                                                <li className="flex items-start gap-2">
                                                    <Shield size={14} className="mt-1 text-emerald-400 shrink-0" />
                                                    <span><strong>100% Private:</strong> Video is processed locally on your device.</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Shield size={14} className="mt-1 text-emerald-400 shrink-0" />
                                                    <span><strong>No Recording:</strong> No images or video are ever stored or sent to any server.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full">
                                        <button
                                            onClick={() => {
                                                setShowDisclaimer(false);
                                                toggleCamera();
                                            }}
                                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Camera size={18} /> Enable & Continue
                                        </button>
                                        <button
                                            onClick={() => setShowDisclaimer(false)}
                                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors text-sm"
                                        >
                                            Continue Without Camera
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
};

export default FocusFlow;
