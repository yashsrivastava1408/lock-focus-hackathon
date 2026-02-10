import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Star, Check, X, HelpCircle, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import confetti from 'canvas-confetti';
import { storage } from '../utils/storage';

const GAME_DURATION = 60; // seconds

const LETTERS = [
    { target: 'b', distractions: ['d', 'p', 'q', 'h'] },
    { target: 'd', distractions: ['b', 'q', 'p', 'g'] },
    { target: 'p', distractions: ['q', 'b', 'd', '9'] },
    { target: 'q', distractions: ['p', 'd', 'b', 'g'] },
    { target: 'm', distractions: ['w', 'n', 'u', 'v'] },
    { target: 'w', distractions: ['m', 'v', 'u', 'n'] },
    { target: 'n', distractions: ['u', 'h', 'm', 'r'] },
    { target: 'u', distractions: ['n', 'v', 'w', 'o'] },
];

const DyslexiaGame = () => {
    const [gameState, setGameState] = useState('intro'); // intro, playing, paused, summary
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [roundData, setRoundData] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct' or 'incorrect'

    const triggerConfetti = useCallback(() => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, []);

    // Generate a new round
    const generateRound = useCallback(() => {
        const letterSet = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        const target = letterSet.target;

        // Create options: 1 correct + 3 distractions
        const options = [
            { id: 'correct', val: target, isCorrect: true },
            ...letterSet.distractions.slice(0, 3).map((char, i) => ({
                id: `distract-${i}`,
                val: char,
                isCorrect: false
            }))
        ];

        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        setRoundData({ target, options });
        setFeedback(null);
    }, []);

    // Timer logic
    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            // End game
            setGameState('summary');
            triggerConfetti();
            storage.saveSession('letter-match', score);

            // --- BACKEND INTEGRATION ---
            try {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (user && user.user_id) {
                    import('../services/api').then(m => {
                        m.api.submitScore(
                            user.user_id,
                            score,
                            "DyslexiaGame",
                            0,
                            0,
                            { streak }
                        ).then(res => console.log("Dyslexia Score Saved:", res));
                    });
                }
            } catch (e) { console.error("Dyslexia save error", e); }
            // ---------------------------
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft, triggerConfetti]);

    const handleStart = () => {
        setScore(0);
        setStreak(0);
        setTimeLeft(GAME_DURATION);
        generateRound();
        setGameState('playing');
    };

    const handleAnswer = (isCorrect) => {
        if (feedback) return; // Prevent double clicks

        if (isCorrect) {
            setScore(prev => prev + 10 + (streak * 2)); // Streak bonus
            setStreak(prev => prev + 1);
            setFeedback('correct');
            // Auto advance
            setTimeout(() => {
                generateRound();
            }, 800);
        } else {
            setStreak(0);
            setFeedback('incorrect');
            // Don't auto advance immediately, let them see
            setTimeout(() => {
                generateRound();
            }, 1000);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto min-h-[600px] flex flex-col items-center justify-center p-4">

                {/* Header / Nav */}
                <div className="w-full flex justify-between items-center mb-8">
                    <Link to="/dashboard" className="p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </Link>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Letter Mirror Match
                    </h1>
                    <div className="w-12" /> {/* Spacer */}
                </div>

                <AnimatePresence mode="wait">

                    {/* INTRO SCREEN */}
                    {gameState === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-xl border border-gray-100 dark:border-slate-800 max-w-lg w-full"
                        >
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 dark:text-white">Un-Mix the Letters</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                                Quickly find the matching letter. Train your brain to distinguish between mirrored characters like <b>b</b> vs <b>d</b>.
                            </p>
                            <button
                                onClick={handleStart}
                                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <Play fill="currentColor" /> Start Game
                            </button>
                        </motion.div>
                    )}

                    {/* GAME SCREEN */}
                    {gameState === 'playing' && roundData && (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-2xl"
                        >
                            {/* Stats Bar */}
                            <div className="flex justify-between items-center mb-12 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                        <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Score</div>
                                        <div className="text-xl font-bold dark:text-white">{score}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Streak</div>
                                        <div className="text-xl font-bold dark:text-white">{streak}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl font-mono font-bold w-16 text-right text-gray-700 dark:text-gray-200">
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                            </div>

                            {/* Challenge Area */}
                            <div className="text-center mb-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4 text-xl uppercase tracking-widest font-medium">Find this letter</p>
                                <motion.div
                                    key={roundData.target}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-9xl font-bold text-gray-900 dark:text-white"
                                >
                                    {roundData.target}
                                </motion.div>
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {roundData.options.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        onClick={() => handleAnswer(option.isCorrect)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={feedback !== null}
                                        className={`
                                            h-40 rounded-3xl text-6xl font-bold border-2 transition-all shadow-md relative overflow-hidden
                                            ${feedback && option.isCorrect
                                                ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                : feedback && !option.isCorrect && feedback === 'incorrect' // Fade others if wrong? No, just highlight wrong one if clicked
                                                    ? 'opacity-50 grayscale'
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:text-white'
                                            }
                                        `}
                                    >
                                        {option.val}

                                        {/* Animation for selection */}
                                        {feedback && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                {option.isCorrect && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bg-green-500 rounded-full p-2">
                                                        <Check className="text-white w-8 h-8" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* SUMMARY SCREEN */}
                    {gameState === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-xl border border-gray-100 dark:border-slate-800 max-w-lg w-full"
                        >
                            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 dark:text-white">Session Complete!</h2>
                            <div className="text-5xl font-bold text-blue-600 mb-6">{score}</div>

                            <div className="flex gap-4 mb-4 justify-center">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                                    <div className="text-gray-500 text-xs uppercase mb-1">Accuracy</div>
                                    <div className="text-xl font-bold dark:text-white">High</div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                                    <div className="text-gray-500 text-xs uppercase mb-1">Focus</div>
                                    <div className="text-xl font-bold dark:text-white">Optimal</div>
                                </div>
                            </div>

                            {/* CERTIFICATE Mock */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mb-8 p-6 bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 text-yellow-300">
                                    <Trophy size={48} className="opacity-20" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 font-serif mb-1">Certificate of Achievement</h3>
                                <p className="text-sm text-gray-600 mb-4">Awarded for focused excellence in Neuro-Visual Training.</p>
                                <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-yellow-100">
                                    <span className="text-xs font-bold text-gray-500">SCORE: {score}</span>
                                    <span className="text-xs font-bold text-blue-600">VERIFIED</span>
                                </div>
                            </motion.div>

                            <button
                                onClick={handleStart}
                                className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-lg hover:scale-[1.02] transition-all mb-4"
                            >
                                Play Again
                            </button>
                            <Link to="/dashboard">
                                <button className="w-full py-4 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    Back to Dashboard
                                </button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default DyslexiaGame;
