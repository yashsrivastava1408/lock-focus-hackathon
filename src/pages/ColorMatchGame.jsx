import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, Trophy, Palette, Info, ChevronRight } from 'lucide-react';
import { storage } from '../utils/storage';

// COLORS const removed, now part of TARGETS palette

const TARGETS = [
    {
        name: 'Brinjal',
        color: { r: 100, g: 45, b: 145 },
        emoji: '🍆',
        palette: [
            { name: 'Purple', rgb: { r: 128, g: 0, b: 128 }, class: 'bg-purple-600' },
            { name: 'Blue', rgb: { r: 0, g: 0, b: 255 }, class: 'bg-blue-600' },
            { name: 'Red', rgb: { r: 255, g: 0, b: 0 }, class: 'bg-red-600' },
        ]
    },
    {
        name: 'Lemon',
        color: { r: 255, g: 230, b: 0 },
        emoji: '🍋',
        palette: [
            { name: 'Yellow', rgb: { r: 255, g: 255, b: 0 }, class: 'bg-yellow-400' },
            { name: 'Orange', rgb: { r: 255, g: 165, b: 0 }, class: 'bg-orange-500' },
            { name: 'White', rgb: { r: 255, g: 255, b: 255 }, class: 'bg-white' },
        ]
    },
    {
        name: 'Leaf',
        color: { r: 75, g: 150, b: 50 },
        emoji: '🍃',
        palette: [
            { name: 'Green', rgb: { r: 0, g: 128, b: 0 }, class: 'bg-green-600' },
            { name: 'Yellow', rgb: { r: 255, g: 255, b: 0 }, class: 'bg-yellow-400' },
            { name: 'Blue', rgb: { r: 0, g: 0, b: 255 }, class: 'bg-blue-600' },
        ]
    },
    {
        name: 'Peach',
        color: { r: 255, g: 180, b: 140 },
        emoji: '🍑',
        palette: [
            { name: 'Orange', rgb: { r: 255, g: 165, b: 0 }, class: 'bg-orange-400' },
            { name: 'Pink', rgb: { r: 255, g: 192, b: 203 }, class: 'bg-pink-300' },
            { name: 'White', rgb: { r: 255, g: 255, b: 255 }, class: 'bg-white' },
        ]
    },
    {
        name: 'Sky',
        color: { r: 135, g: 206, b: 235 },
        emoji: '☁️',
        palette: [
            { name: 'Cyan', rgb: { r: 0, g: 255, b: 255 }, class: 'bg-cyan-400' },
            { name: 'White', rgb: { r: 255, g: 255, b: 255 }, class: 'bg-white' },
            { name: 'Blue', rgb: { r: 0, g: 0, b: 255 }, class: 'bg-blue-500' },
        ]
    },
    {
        name: 'Flower',
        color: { r: 255, g: 100, b: 180 },
        emoji: '🌸',
        palette: [
            { name: 'Pink', rgb: { r: 255, g: 20, b: 147 }, class: 'bg-pink-500' },
            { name: 'Red', rgb: { r: 255, g: 0, b: 0 }, class: 'bg-red-500' },
            { name: 'White', rgb: { r: 255, g: 255, b: 255 }, class: 'bg-white' },
        ]
    },
];

const ColorMatchGame = () => {
    const navigate = useNavigate();
    const [level, setLevel] = useState(0);
    const [mixedColor, setMixedColor] = useState({ r: 255, g: 255, b: 255 });
    const [mixCount, setMixCount] = useState(0);
    const [similarity, setSimilarity] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const target = TARGETS[level % TARGETS.length];

    // Mixing logic: Weighted average or progressive blend
    // We'll use a simple "additive" average inspired by paint mixing
    const addColor = (color) => {
        // Soft pop sound effect (simulated with Framer Motion or logic)
        setMixedColor(prev => {
            // If it's the first color, start with it
            if (mixCount === 0) {
                setMixCount(1);
                return color;
            }

            const newCount = mixCount + 1;
            setMixCount(newCount);

            // Average the values
            return {
                r: Math.round((prev.r * mixCount + color.r) / newCount),
                g: Math.round((prev.g * mixCount + color.g) / newCount),
                b: Math.round((prev.b * mixCount + color.b) / newCount),
            };
        });
    };

    const calculateSimilarity = (c1, c2) => {
        const rDiff = Math.abs(c1.r - c2.r);
        const gDiff = Math.abs(c1.g - c2.g);
        const bDiff = Math.abs(c1.b - c2.b);

        // Normalize difference (0 to 1)
        const diff = (rDiff + gDiff + bDiff) / (255 * 3);
        return Math.max(0, Math.round((1 - diff) * 100));
    };

    useEffect(() => {
        const sim = calculateSimilarity(mixedColor, target.color);
        setSimilarity(sim);

        if (sim >= 90 && !isSuccess) {
            setIsSuccess(true);
            // Save session in storage
            storage.saveSession('color-match', sim, { level: level + 1 });

            // --- BACKEND INTEGRATION ---
            try {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (user && user.user_id) {
                    import('../services/api').then(m => {
                        m.api.submitScore(
                            user.user_id,
                            sim,
                            "ColorMatch",
                            level + 1,
                            0,
                            {}
                        ).then(res => console.log("ColorMatch Score Saved:", res));
                    });
                }
            } catch (e) { console.error("ColorMatch save error", e); }
            // ---------------------------
        }
    }, [mixedColor, target, level]);

    const resetMix = () => {
        setMixedColor({ r: 255, g: 255, b: 255 });
        setMixCount(0);
        setIsSuccess(false);
    };

    const nextLevel = () => {
        setLevel(prev => prev + 1);
        resetMix();
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 transition-colors duration-500 overflow-hidden font-sans">
            {/* HUD / Navbar */}
            <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                <button
                    onClick={() => navigate('/stress-dashboard')}
                    className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:scale-105 transition-all text-gray-600 dark:text-gray-300"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Level</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white leading-none">{level + 1}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2" />
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Best</span>
                        <span className="text-xl font-black text-pink-500 leading-none">98%</span>
                    </div>
                </div>

                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:scale-105 transition-all text-gray-600 dark:text-gray-300"
                >
                    <Info size={20} />
                </button>
            </nav>

            {/* Main Game Container */}
            <main className="h-screen w-full flex flex-col md:flex-row items-center pt-24 md:pt-0">

                {/* Left: Target Preview */}
                <section className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-pink-50/50 to-transparent dark:from-pink-900/5 transition-colors">
                    <motion.div
                        key={target.name}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative"
                    >
                        {/* Target Object Canvas */}
                        <div className="w-64 h-64 md:w-80 md:h-80 rounded-[4rem] bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center border-8 border-white dark:border-slate-800 overflow-hidden relative group">
                            {/* Inner Color Fill */}
                            <div
                                className="absolute inset-0 transition-colors duration-1000"
                                style={{ backgroundColor: `rgb(${target.color.r}, ${target.color.g}, ${target.color.b})`, opacity: 0.9 }}
                            />
                            <span className="text-8xl md:text-9xl z-10 transition-transform group-hover:scale-110 duration-500">{target.emoji}</span>
                        </div>

                        {/* Target Label */}
                        <div className="mt-8 text-center">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">{target.name}</h2>
                            <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-wide">Match this hue</p>
                        </div>
                    </motion.div>
                </section>

                {/* Right: Mixing Board */}
                <section className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 relative">

                    {/* Mixing Card/Canvas */}
                    <div className="w-full max-w-sm aspect-square md:aspect-auto md:h-2/3 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800 p-8 flex flex-col relative overflow-hidden">

                        {/* Mixed Color Preview */}
                        <div className="flex-1 rounded-[2rem] border-4 border-gray-50 dark:border-slate-800 shadow-inner relative overflow-hidden group">
                            <div
                                className="absolute inset-0 transition-colors duration-500"
                                style={{ backgroundColor: `rgb(${mixedColor.r}, ${mixedColor.g}, ${mixedColor.b})` }}
                            />
                            {mixCount === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                    <Palette size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">Tap colors to start mixing</p>
                                </div>
                            )}

                            {/* Mixing "Splash" Animation Container */}
                            <AnimatePresence>
                                {/* We could add splash emojis or animated circles here when colors are added */}
                            </AnimatePresence>
                        </div>

                        {/* Color Palette */}
                        <div className="mt-8 flex justify-between gap-4">
                            {target.palette.map((color) => (
                                <motion.button
                                    key={color.name}
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    whileTap={{ scale: 0.9, rotate: 5 }}
                                    onClick={() => addColor(color.rgb)}
                                    className="w-16 h-16 rounded-2xl shadow-lg border-4 border-white dark:border-slate-800 relative group overflow-hidden"
                                >
                                    <div className={`absolute inset-0 ${color.class}`} />
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                            ))}

                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={resetMix}
                                className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors border-4 border-white dark:border-slate-800"
                            >
                                <RefreshCw size={24} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Similarity HUD */}
                    <div className="mt-8 w-full max-w-sm flex flex-col gap-3">
                        <div className="flex justify-between items-end px-2">
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Similarity</span>
                            <span className={`text-2xl font-black ${similarity >= 90 ? 'text-green-500' : 'text-gray-400'}`}>
                                {similarity}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 bg-gray-100 dark:bg-slate-900 rounded-full border-2 border-white dark:border-slate-800 shadow-inner overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${similarity}%` }}
                                className={`h-full rounded-full transition-colors duration-500 ${similarity >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                    similarity >= 70 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                                        'bg-gradient-to-r from-pink-400 to-rose-500'
                                    }`}
                            />
                        </div>
                    </div>
                </section>
            </main>

            {/* Success Modal Overlay */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-white/30 dark:bg-slate-950/30"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-8 border-green-500/10 text-center max-w-md w-full relative"
                        >
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                                <Trophy size={48} />
                            </div>

                            <h2 className="text-5xl font-black text-gray-900 dark:text-white mt-8 mb-2 uppercase tracking-tighter">Perfect Match</h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 font-medium">Your artistic intuition is flawlessly calibrated.</p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={nextLevel}
                                    className="w-full py-6 rounded-3xl bg-green-500 text-white text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                                >
                                    Next Masterpiece <ChevronRight size={24} />
                                </button>
                                <button
                                    onClick={resetMix}
                                    className="text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Micro-Interactions (Floating Blobs) */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-300 rounded-full blur-[150px] animate-bounce-slow" />
            </div>

        </div>
    );
};

export default ColorMatchGame;
