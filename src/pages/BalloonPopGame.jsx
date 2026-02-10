import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, ChevronRight, Info } from 'lucide-react';
import { storage } from '../utils/storage';

const PASTEL_COLORS = [
    { name: 'Mint', hex: '#B2DFDB', pop: '#4DB6AC' }, // Slightly more saturated
    { name: 'Lavender', hex: '#D1C4E9', pop: '#9575CD' },
    { name: 'Peach', hex: '#FFE0B2', pop: '#FFB74D' },
    { name: 'Sky', hex: '#B3E5FC', pop: '#4FC3F7' },
    { name: 'Rose', hex: '#F8BBD0', pop: '#F06292' },
    { name: 'Lemon', hex: '#FFF9C4', pop: '#FBC02D' },
];

const Balloon = ({ id, color, onPop, onMiss }) => {
    const [isPopped, setIsPopped] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const handleInteraction = () => {
        if (isPopped) return;
        const success = onPop(id, color);
        if (success) {
            setIsPopped(true);
        } else {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            onMiss();
        }
    };

    return (
        <motion.div
            initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
            animate={{
                y: '-20vh',
                opacity: 1,
                x: `${Math.random() * 80 + 10}vw`,
                rotate: [0, 10, -10, 0]
            }}
            transition={{
                y: { duration: 15 + Math.random() * 10, ease: "linear" },
                x: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 1 }
            }}
            onMouseDown={handleInteraction}
            onTouchStart={handleInteraction}
            className="absolute cursor-pointer pointer-events-auto"
            style={{ zIndex: 10 }}
        >
            <AnimatePresence>
                {!isPopped ? (
                    <motion.div
                        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                        className="relative"
                    >
                        {/* Balloon body */}
                        <div
                            className="w-20 h-24 rounded-[50%_50%_50%_50%/_60%_60%_40%_40%] shadow-xl border-2 border-white/80"
                            style={{ backgroundColor: color.hex }}
                        >
                            {/* Reflection highlight */}
                            <div className="absolute top-4 left-4 w-4 h-6 bg-white/40 rounded-full rotate-[30deg]" />
                        </div>
                        {/* Balloon string */}
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gray-300 dark:bg-gray-600" />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {/* Pop/Confetti effect */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: 0, y: 0 }}
                                animate={{ x: (i - 2.5) * 50, y: (Math.random() - 0.5) * 100 }}
                                className="absolute w-2 h-2 rounded-full"
                                style={{ backgroundColor: color.pop }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const BalloonPopGame = () => {
    const navigate = useNavigate();
    const [level, setLevel] = useState(1);
    const [targetColors, setTargetColors] = useState([]);
    const [balloons, setBalloons] = useState([]);
    const [poppedCount, setPoppedCount] = useState(0);
    const [totalTargetsRemaining, setTotalTargetsRemaining] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Initialize level
    useEffect(() => {
        const numTargets = Math.min(level + 1, 6);
        const shuffled = [...PASTEL_COLORS].sort(() => 0.5 - Math.random());
        const selectedTargets = shuffled.slice(0, numTargets);
        setTargetColors(selectedTargets);
        setPoppedCount(0);
        setTotalTargetsRemaining(numTargets * 3); // Must pop 3 of each target color
        setIsSuccess(false);
        setBalloons([]);
    }, [level]);

    // Spawn balloons
    useEffect(() => {
        if (isSuccess) return;

        const interval = setInterval(() => {
            setBalloons(prev => [
                ...prev.slice(-20), // Keep max 20 balloons
                {
                    id: Date.now(),
                    color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]
                }
            ]);
        }, 1200);

        return () => clearInterval(interval);
    }, [isSuccess]);

    const handlePop = useCallback((id, color) => {
        const isTarget = targetColors.some(tc => tc.name === color.name);
        if (isTarget) {
            setTotalTargetsRemaining(prev => {
                const newValue = prev - 1;
                if (newValue <= 0) {
                    setIsSuccess(true);
                    storage.saveSession('balloon-pop', 100, { level });

                    // --- BACKEND INTEGRATION ---
                    try {
                        const user = JSON.parse(localStorage.getItem('currentUser'));
                        if (user && user.user_id) {
                            import('../services/api').then(m => {
                                m.api.submitScore(
                                    user.user_id,
                                    100,
                                    "BalloonPop",
                                    level,
                                    0,
                                    {}
                                ).then(res => console.log("BalloonPop Score Saved:", res));
                            });
                        }
                    } catch (e) { console.error("BalloonPop save error", e); }
                    // ---------------------------
                }
                return newValue;
            });
            // Try/Catch for sound to avoid breaking on browsers with strict autoplay
            try {
                // Future: play soft pop sound
            } catch (e) { }
            return true;
        }
        return false;
    }, [targetColors, level]);

    const handleMiss = useCallback(() => {
        // No penalty, just shake logic handled in Balloon component
    }, []);

    const nextLevel = () => {
        setLevel(prev => prev + 1);
    };

    const resetGame = () => {
        setLevel(1);
        setIsSuccess(false);
        setBalloons([]);
    };

    return (
        <div className="h-screen w-full bg-[#F0F4F8] dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative select-none">
            {/* Header / Targets */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex flex-col items-center">
                <div className="w-full max-w-5xl flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/stress-dashboard')}
                        className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:scale-105 transition-all text-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Pop only these colors:</h2>

                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:scale-105 transition-all text-gray-600 dark:text-gray-300"
                    >
                        <Info size={20} />
                    </button>
                </div>

                <div className="flex gap-4 p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/60 dark:border-slate-700/60 shadow-xl shadow-blue-900/5">
                    {targetColors.map((color, idx) => (
                        <motion.div
                            key={color.name}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div
                                className="w-12 h-14 rounded-full border-2 border-white/90 shadow-md"
                                style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{color.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Balloon Play Area */}
            <div className="absolute inset-0 overflow-hidden pt-40 pb-24">
                <AnimatePresence>
                    {balloons.map((balloon) => (
                        <Balloon
                            key={balloon.id}
                            id={balloon.id}
                            color={balloon.color}
                            onPop={handlePop}
                            onMiss={handleMiss}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Bottom HUD */}
            <div className="absolute bottom-0 left-0 right-0 z-50 p-8 flex flex-col items-center gap-4">
                <div className="w-full max-w-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white dark:border-slate-800 shadow-2xl">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Level {level}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Progression</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden border border-white/20">
                        <motion.div
                            animate={{ width: `${((targetColors.length * 3 - totalTargetsRemaining) / (targetColors.length * 3)) * 100}%` }}
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                        />
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-white/30 dark:bg-slate-950/30"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-8 border-blue-500/10 text-center max-w-md w-full"
                        >
                            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mx-auto mb-8">
                                <Trophy size={48} />
                            </div>

                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter italic">Zen Achieved</h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 font-medium">Your focus is steady and your mind is calm.</p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={nextLevel}
                                    className="w-full py-6 rounded-3xl bg-blue-600 text-white text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    Next Phase <ChevronRight size={24} />
                                </button>
                                <button
                                    onClick={resetGame}
                                    className="text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Restart Journey
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-100 rounded-full blur-3xl animate-pulse" />
            </div>
        </div>
    );
};

export default BalloonPopGame;
