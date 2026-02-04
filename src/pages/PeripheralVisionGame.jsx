
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Eye, Target, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const PeripheralVisionGame = () => {
    // Game State
    const [gameState, setGameState] = useState('instructions'); // instructions, playing, results
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(60); // 60s session
    const [stimuli, setStimuli] = useState([]);

    // Metrics
    const [totalHits, setTotalHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [falsePositives, setFalsePositives] = useState(0);
    const [leftHits, setLeftHits] = useState(0);
    const [rightHits, setRightHits] = useState(0);
    const [reactionTimes, setReactionTimes] = useState([]);

    // Refs for Game Loop
    const gameAreaRef = useRef(null);
    const reqRef = useRef(null);
    const lastSpawnTime = useRef(0);
    const scoreRef = useRef(0); // For immediate access in loop

    // Config
    const SPAWN_INTERVAL_BASE = 2000;
    const STIMULUS_DURATION = 1500;

    // --- Game Logic ---

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        scoreRef.current = 0;
        setLevel(1);
        setTimeLeft(60);
        setStimuli([]);
        setReactionTimes([]);
        setTotalHits(0);
        setMisses(0);
        setFalsePositives(0);
        setLeftHits(0);
        setRightHits(0);
        lastSpawnTime.current = Date.now();
    };

    const spawnStimulus = useCallback(() => {
        if (!gameAreaRef.current) return;

        const width = gameAreaRef.current.clientWidth;
        const height = gameAreaRef.current.clientHeight;
        const padding = 50;
        const centerX = width / 2;
        const centerY = height / 2;
        const safeZone = 150; // Radius around center to avoid

        // Determine Position (Peripheral)
        let x, y, isLeft;
        let attempts = 0;
        let valid = false;

        while (!valid && attempts < 10) {
            x = Math.random() * (width - 2 * padding) + padding;
            y = Math.random() * (height - 2 * padding) + padding;

            const dist = Math.hypot(x - centerX, y - centerY);
            if (dist > safeZone) {
                valid = true;
                isLeft = x < centerX;
            }
            attempts++;
        }

        if (!valid) return;

        // Add Stimulus
        const newStim = {
            id: Date.now(),
            x,
            y,
            isLeft,
            type: Math.random() > 0.7 && level > 1 ? 'distractor' : 'target', // Level 2+ adds distractors
            createdAt: Date.now()
        };

        setStimuli(prev => [...prev, newStim]);

    }, [level]);

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') {
            cancelAnimationFrame(reqRef.current);
            return;
        }

        const loop = () => {
            const now = Date.now();

            // 1. Spawning
            // Frequency increases with level
            const interval = Math.max(500, SPAWN_INTERVAL_BASE - (level * 300));
            if (now - lastSpawnTime.current > interval) {
                spawnStimulus();
                lastSpawnTime.current = now;
            }

            // 2. Cleanup Expired
            setStimuli(prev => {
                const active = prev.filter(s => now - s.createdAt < STIMULUS_DURATION);
                // Detect misses (expired targets that weren't clicked)
                // Note: accurate miss counting in loop is tricky without double counting. 
                // Simplified: If list shrinks and we didn't click, it's a miss.
                // Actually, let's just use the filter for rendering.
                return active;
            });

            reqRef.current = requestAnimationFrame(loop);
        };

        reqRef.current = requestAnimationFrame(loop);

        // Timer
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('results');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            cancelAnimationFrame(reqRef.current);
            clearInterval(timer);
        };
    }, [gameState, level, spawnStimulus]);

    // Inputs
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            if (e.code === 'Space') {
                handleReaction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, stimuli]);

    const handleReaction = () => {
        const now = Date.now();
        // Check if there is a valid target active
        const activeTargets = stimuli.filter(s => s.type === 'target');

        if (activeTargets.length > 0) {
            // HIT
            const hit = activeTargets[0]; // Take the oldest one
            const rt = now - hit.createdAt;

            // Stats
            setReactionTimes(prev => [...prev, rt]);
            setTotalHits(prev => prev + 1);
            setScore(prev => prev + 100 + Math.max(0, 500 - rt)); // Bonus for speed

            if (hit.isLeft) setLeftHits(prev => prev + 1);
            else setRightHits(prev => prev + 1);

            // Level Up Check
            if (totalHits > 0 && totalHits % 5 === 0) {
                setLevel(prev => Math.min(prev + 1, 5));
            }

            // Remove the hit stimulus
            setStimuli(prev => prev.filter(s => s.id !== hit.id));
        } else {
            // FALSE POSITIVE (Clicked with no target or only distractor)
            setScore(prev => Math.max(0, prev - 50));
            setFalsePositives(prev => prev + 1);
            // Visual feedback could be added here
        }
    };

    // Calculate Results
    const avgRT = reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 0;

    const accuracy = totalHits + misses > 0
        ? Math.round((totalHits / (totalHits + misses + falsePositives)) * 100)
        : 0; // Simplified

    const bias = leftHits > rightHits ? 'Left Bias' : rightHits > leftHits ? 'Right Bias' : 'Balanced';

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-100px)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-6 md:px-0">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 glass rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Peripheral Vision Quest</h1>
                            <p className="text-xs text-muted-foreground">Detect stimulus outside your central gaze.</p>
                        </div>
                    </div>
                    {gameState === 'playing' && (
                        <div className="flex gap-6 text-sm font-mono font-bold">
                            <div className="text-blue-500">SCORE: {Math.round(score)}</div>
                            <div className="text-orange-500">LVL: {level}</div>
                            <div className={`${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                                {timeLeft}s
                            </div>
                        </div>
                    )}
                </div>

                {/* Game Area */}
                <div className="flex-1 relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">

                    {gameState === 'instructions' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20 bg-slate-900/90 backdrop-blur-md">
                            <Eye className="w-16 h-16 text-blue-500 mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">How to Play</h2>
                            <ul className="text-left text-gray-300 space-y-4 mb-8 max-w-md">
                                <li className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-green-400" />
                                    <span>Keep your eyes on the <strong>Central Cross</strong>.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Smartphone className="w-5 h-5 text-blue-400" />
                                    <span>Press <strong>SPACE</strong> identifying items in your peripheral vision.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                    <span>Avoid <strong>Red Distractors</strong> (Level 2+).</span>
                                </li>
                            </ul>
                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Play className="fill-current w-5 h-5" /> Start Session
                            </button>
                        </div>
                    )}

                    {gameState === 'results' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20 bg-slate-900/95 backdrop-blur-md">
                            <div className="p-4 bg-green-500/20 rounded-full mb-6 relative">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                                <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20"></div>
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2">Session Complete</h2>
                            <p className="text-gray-400 mb-8">Here represents your peripheral awareness profile.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-8">
                                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Final Score</div>
                                    <div className="text-3xl font-bold text-blue-400">{Math.round(score)}</div>
                                </div>
                                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Avg Reaction</div>
                                    <div className="text-3xl font-bold text-purple-400">{avgRT} <span className="text-sm text-gray-500">ms</span></div>
                                </div>
                                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Hits</div>
                                    <div className="text-3xl font-bold text-green-400">{totalHits}</div>
                                </div>
                                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Field Bias</div>
                                    <div className="text-2xl font-bold text-orange-400">{bias}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">L: {leftHits} | R: {rightHits}</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={startGame}
                                    className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Try Again
                                </button>
                                <Link
                                    to="/dashboard"
                                    className="px-6 py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-xl font-bold transition-colors"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Active Game Layer */}
                    <div ref={gameAreaRef} className="w-full h-full relative cursor-crosshair">

                        {/* Fixation Point */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 w-32 h-32 rounded-full border border-cyan-500/10 pointer-events-none"></div>

                        {/* Stimuli */}
                        <AnimatePresence>
                            {stimuli.map(s => (
                                <motion.div
                                    key={s.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        left: s.x,
                                        top: s.y,
                                    }}
                                    className={`absolute w-8 h-8 rounded-full shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2
                                        ${s.type === 'target'
                                            ? 'bg-blue-500 shadow-blue-500/50'
                                            : 'bg-red-500 shadow-red-500/50'
                                        }
                                    `}
                                />
                            ))}
                        </AnimatePresence>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PeripheralVisionGame;
