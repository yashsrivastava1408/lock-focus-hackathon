import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Trophy, Star, RefreshCw, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import confetti from 'canvas-confetti';
import { storage } from '../utils/storage';

const SYLLABLE_DATA = [
    { word: 'FANTASTIC', syllables: ['FAN', 'TAS', 'TIC'], correctBreaks: [3, 6] },
    { word: 'WONDERFUL', syllables: ['WON', 'DER', 'FUL'], correctBreaks: [3, 6] },
    { word: 'COMPUTER', syllables: ['COM', 'PU', 'TER'], correctBreaks: [3, 5] },
    { word: 'GARDEN', syllables: ['GAR', 'DEN'], correctBreaks: [3] },
    { word: 'BUTTERFLY', syllables: ['BUT', 'TER', 'FLY'], correctBreaks: [3, 6] },
    { word: 'DINOSAUR', syllables: ['DI', 'NO', 'SAUR'], correctBreaks: [2, 4] },
    { word: 'REALLY', syllables: ['RE', 'ALLY'], correctBreaks: [2] },
    { word: 'UMBRELLA', syllables: ['UM', 'BREL', 'LA'], correctBreaks: [2, 6] },
    { word: 'HAPPINESS', syllables: ['HAP', 'PI', 'NESS'], correctBreaks: [3, 5] },
    { word: 'ORANGE', syllables: ['OR', 'ANGE'], correctBreaks: [2] },
];

const SyllableSlasher = () => {
    const [gameState, setGameState] = useState('intro'); // intro, playing, summary
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [activeWord, setActiveWord] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
    const [timeLeft, setTimeLeft] = useState(60);
    const gameRef = useRef(null);

    const triggerConfetti = useCallback(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    const spawnWord = useCallback(() => {
        const randomItem = SYLLABLE_DATA[Math.floor(Math.random() * SYLLABLE_DATA.length)];
        setActiveWord({
            ...randomItem,
            id: Date.now(),
            splitIndex: null, // index where user slashed
        });
        setFeedback(null);
    }, []);

    const handleStart = () => {
        setScore(0);
        setCombo(0);
        setTimeLeft(60);
        setGameState('playing');
        spawnWord();
    };

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            // Avoid setting state during render/effect cycle if possible, but here it transitions game state
            setGameState('summary');
            triggerConfetti();
            storage.saveSession('syllable-slasher', score);
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft, triggerConfetti]);

    const handleSlash = (charIndex) => {
        if (feedback || !activeWord) return;

        const isCorrect = activeWord.correctBreaks.includes(charIndex + 1);

        if (isCorrect) {
            setScore(prev => prev + 10 + (combo * 5));
            setCombo(prev => prev + 1);
            setFeedback('correct');
            setActiveWord(prev => ({ ...prev, splitIndex: charIndex + 1 }));

            setTimeout(() => {
                spawnWord();
            }, 600);
        } else {
            setCombo(0);
            setFeedback('incorrect');
            setTimeout(() => {
                spawnWord();
            }, 800);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto min-h-[600px] flex flex-col items-center justify-center p-4" ref={gameRef}>

                {/* Header */}
                <div className="w-full flex justify-between items-center mb-12">
                    <Link to="/dyslexia-dashboard" className="p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-100 dark:border-slate-700 shadow-sm">
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600 uppercase tracking-tighter">
                            Syllable Slasher
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                    </div>
                    <div className="w-12" />
                </div>

                <AnimatePresence mode="wait">
                    {gameState === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 text-center shadow-2xl border border-gray-100 dark:border-slate-800 max-w-xl w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Zap size={120} />
                            </div>

                            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner transform -rotate-12">
                                <Zap className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                            </div>

                            <h2 className="text-3xl font-black mb-2 dark:text-white uppercase tracking-tight">Syllable Slasher</h2>
                            <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-6">Improves: Decoding & Phonological Awareness</p>

                            {/* MINI DEMO SECTION */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-8 border border-gray-100 dark:border-slate-700">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Demo</h4>
                                <div className="flex items-center justify-center gap-4 py-2">
                                    <div className="flex items-center gap-0">
                                        <span className="text-2xl font-bold dark:text-white">GAR</span>
                                        <div className="w-px h-8 bg-orange-400 mx-1 animate-pulse" />
                                        <span className="text-2xl font-bold text-gray-400">DEN</span>
                                    </div>
                                    <span className="text-gray-300">→</span>
                                    <div className="flex gap-4">
                                        <span className="text-2xl font-black text-blue-500">GAR</span>
                                        <span className="text-2xl font-black text-blue-500">DEN</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center italic">
                                    "Slash the word between sounds to break it down!"
                                </p>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-md leading-relaxed">
                                Master the art of <b>chunking</b>. Slice complex words into manageable sounds to boost your reading speed and confidence.
                            </p>

                            <button
                                onClick={handleStart}
                                className="w-full py-5 rounded-2xl bg-orange-600 text-white font-black text-xl hover:bg-orange-700 hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3"
                            >
                                <Play fill="currentColor" size={24} /> START MISSION
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'playing' && activeWord && (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full flex flex-col items-center"
                        >
                            {/* Score & HUD */}
                            <div className="w-full grid grid-cols-3 gap-6 mb-16">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                                    <Trophy className="mx-auto mb-1 text-yellow-500" size={20} />
                                    <div className="text-2xl font-black dark:text-white uppercase">{score}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</div>
                                </div>
                                <div className="bg-orange-600 p-4 rounded-3xl shadow-lg shadow-orange-600/20 text-center text-white">
                                    <div className="text-3xl font-black font-mono">
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Time</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                                    <Star className="mx-auto mb-1 text-blue-500" size={20} />
                                    <div className="text-2xl font-black dark:text-white uppercase">{combo}x</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Combo</div>
                                </div>
                            </div>

                            {/* Game Canvas */}
                            <div className="relative h-64 flex items-center justify-center w-full bg-gray-50/50 dark:bg-slate-800/30 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-slate-800 overflow-hidden">
                                <AnimatePresence mode="popLayout">
                                    <motion.div
                                        key={activeWord.id}
                                        initial={{ y: 200, opacity: 0, rotate: -5 }}
                                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                                        exit={feedback === 'correct' ? { opacity: 0 } : { y: -100, opacity: 0 }}
                                        className="flex items-center"
                                    >
                                        {activeWord.word.split('').map((char, i) => (
                                            <React.Fragment key={i}>
                                                <div className="flex flex-col items-center">
                                                    <motion.span
                                                        className={`text-7xl md:text-9xl font-black tracking-widest transition-colors duration-300
                                                        ${feedback === 'incorrect' ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
                                                        animate={activeWord.splitIndex && i >= activeWord.splitIndex ? {
                                                            x: 40,
                                                            y: 20,
                                                            rotate: 15,
                                                            opacity: 0.8
                                                        } : {}}
                                                    >
                                                        {char}
                                                    </motion.span>
                                                </div>

                                                {/* Slasher Intersection */}
                                                {i < activeWord.word.length - 1 && (
                                                    <button
                                                        onClick={() => handleSlash(i)}
                                                        className="h-24 w-8 relative group z-20 mx-[-4px]"
                                                        disabled={feedback !== null}
                                                    >
                                                        <div className={`w-1 mx-auto h-0 group-hover:h-full bg-orange-400/50 rounded-full transition-all duration-200`} />
                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                            <div className="w-10 h-1 bg-white/50 blur-sm rotate-[110deg]" />
                                                        </div>
                                                    </button>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Flash Feedback */}
                                {feedback === 'correct' && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white dark:bg-blue-900/10 pointer-events-none z-50 flex items-center justify-center"
                                    >
                                        <div className="text-4xl font-black text-blue-500 uppercase tracking-[1rem] scale-150">SPLIT!</div>
                                    </motion.div>
                                )}
                            </div>

                            <p className="mt-8 text-gray-400 font-bold uppercase tracking-widest text-sm">
                                Find the Syllable Break
                            </p>
                        </motion.div>
                    )}

                    {gameState === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center shadow-2xl border border-gray-100 dark:border-slate-800 max-w-lg w-full"
                        >
                            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h2 className="text-3xl font-black mb-1 dark:text-white uppercase tracking-tight">Mission Complete</h2>
                            <div className="text-7xl font-black text-orange-600 mb-8">{score}</div>

                            <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Max Combo</div>
                                    <div className="text-2xl font-black dark:text-white">{combo}</div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Rank</div>
                                    <div className="text-2xl font-black dark:text-white">Expert</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleStart}
                                    className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                                >
                                    RETRY MISSION
                                </button>
                                <Link to="/dyslexia-dashboard">
                                    <button className="w-full py-4 rounded-xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        Return to Station
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default SyllableSlasher;
