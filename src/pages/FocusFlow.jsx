import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Zap, Shield, RotateCcw, Crown, Camera, CameraOff, Eye, AlertCircle, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import confetti from 'canvas-confetti';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const FocusFlow = () => {
    // Game State (UI Synced)
    const [gameState, setGameState] = useState('intro'); // intro, playing, gameover
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
                        setAttentionState('focused');
                        attentionStateRef.current = 'focused';
                    } else {
                        setAttentionState('away');
                        attentionStateRef.current = 'away';
                    }
                } catch (e) { }
            }
        }, 500);
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
        console.log("Starting Game. Neuro:", isNeuro);

        // Reset Logic Refs
        scoreRef.current = 0;
        streakRef.current = 0;
        itemsRef.current = [];
        laneRef.current = 1;
        speedRef.current = 5;
        gameTimeRef.current = 0;
        neuroModeRef.current = isNeuro;
        gameStateRef.current = 'playing';

        // Reset UI State
        setScore(0);
        setStreak(0);
        setItems([]);
        setLane(1);
        setSpeed(5);
        setNeuroMode(isNeuro);
        setGameState('playing');

        // Start Loop
        lastTimeRef.current = performance.now();
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const gameOver = () => {
        gameStateRef.current = 'gameover';
        setGameState('gameover');
        cancelAnimationFrame(requestRef.current);
        if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
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

        // --- 4. Difficulty ---
        gameTimeRef.current += deltaTime;
        speedRef.current = Math.min(15, 5 + (gameTimeRef.current / 10000));
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
                            <span className="text-xs text-white/50 font-bold uppercase">Score</span>
                            <span className="text-2xl font-black text-white font-mono">{score.toString().padStart(6, '0')}</span>
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

                    {/* Start Screen */}
                    {gameState === 'intro' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-8 text-center">
                            <Zap size={60} className="text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                            <h2 className="text-3xl font-bold text-white mb-2">Focus Flow</h2>
                            <p className="text-white/60 mb-8 max-w-xs mx-auto">
                                Dodge <span className="text-red-500 font-bold">RED</span>. Collect <span className="text-cyan-400 font-bold">BLUE</span>.
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

                    {/* Game Over Screen */}
                    {gameState === 'gameover' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                            <Crown size={60} className="text-yellow-400 mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-2">Session Complete</h2>
                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2 font-mono">{score}</div>
                            <p className="text-white/60 mb-8 font-mono text-sm max-w-xs text-center">
                                {neuroMode ? "Neuro-Pilot successfully calibrated your attention span." : `HIGH SCORE: ${highScore}`}
                            </p>

                            <button onClick={() => setGameState('intro')} className="px-10 py-4 bg-white text-black font-black text-xl rounded-full transition-all hover:scale-105 flex items-center gap-2 mb-4">
                                <RotateCcw size={20} /> RETURN TO MENU
                            </button>
                            <Link to="/adhd-dashboard" className="text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                                Return to Hub
                            </Link>
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
                                            <Camera size={18} />
                                            Enable Camera & Continue
                                        </button>

                                        <button
                                            onClick={() => setShowDisclaimer(false)}
                                            className="w-full py-3 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-medium rounded-xl transition-colors text-xs uppercase tracking-widest"
                                        >
                                            Continue Without Camera
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-white/30 text-xs font-mono">
                    [LEFT/RIGHT ARROW] or [TAP LANES] to move
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FocusFlow;
