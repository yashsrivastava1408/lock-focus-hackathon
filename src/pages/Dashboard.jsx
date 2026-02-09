import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Play, Eye, ChevronDown, Check, ArrowRight,
    FileText, ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import ProgressCharts from '../components/ProgressCharts';
import AuroraAnimation from '../components/AuroraAnimation';
import { storage } from '../utils/storage';
import VisionStudioCards from '../components/VisionStudioCards';

const Card = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 p-8 ${className}`}
    >
        {children}
    </motion.div>
);

const Dashboard = () => {
    const { colorBlindMode, setColorBlindMode } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const colorBlindOptions = [
        { value: 'none', label: 'None' },
        { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
        { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
        { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <DashboardLayout>
            {/* HERO SECTION */}
            <section className="relative w-full h-[400px] md:h-[450px] rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl shadow-blue-900/5 mb-12 group transition-all duration-500">
                <div className="absolute inset-0 z-0">
                    <AuroraAnimation />
                </div>

                <div className="absolute inset-0 z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16">
                    <div className="flex flex-col items-start gap-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold tracking-widest uppercase"
                        >
                            Your Focus Companion
                        </motion.div>

                        <div className="space-y-1">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="text-5xl md:text-6xl font-medium tracking-tight text-gray-900 dark:text-white"
                            >
                                {getGreeting()},
                            </motion.h1>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 dark:from-blue-400 dark:to-purple-400"
                            >
                                Explorer.
                            </motion.h1>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="text-lg text-gray-500 dark:text-gray-400 max-w-md"
                        >
                            Your cognitive load is optimal today. Ready to push your limits?
                        </motion.p>
                    </div>

                    {/* STATS OVERVIEW CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                        className="hidden lg:flex relative w-80 h-72 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-700/60 p-8 flex-col justify-between shadow-xl shadow-blue-900/5"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Lvl {storage.getUser().level} Explorer</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{storage.getUser().xp.toLocaleString()} XP</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>

                        <div className="h-24 flex items-end justify-between gap-1.5">
                            {[40, 65, 50, 80, 60, 90, 75, 95].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.8 + (i * 0.05), duration: 1 }}
                                    className="w-full bg-blue-600 dark:bg-blue-400 rounded-t-lg opacity-30 dark:opacity-50"
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">

                {/* 1. START SCAN CTA (Settled Version) */}
                <div className="md:col-span-6">
                    <Link to="/focus-scan" className="block h-full">
                        <Card delay={0.2} className="h-full relative overflow-hidden group border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/5 opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-6 h-full">
                                <div className="w-16 h-16 shrink-0 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                    <Play className="w-7 h-7 text-white fill-current ml-1" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Focus Scan</h2>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">3 MIN</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Calibrate your baseline and analyze cognitive load.</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* 2. ADAPTIVE READER CTA */}
                <div className="md:col-span-6">
                    <Link to="/adaptive-reader" className="block h-full">
                        <Card delay={0.3} className="h-full bg-white dark:bg-slate-900 border-teal-100 dark:border-teal-900/40 overflow-hidden relative group">
                            <div className="relative z-10 flex items-center gap-6 h-full">
                                <div className="w-16 h-16 shrink-0 bg-teal-500 dark:bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                                    <FileText className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adaptive Reader</h2>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-md">NEW</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Dyslexia and ADHD friendly document viewing.</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-teal-500 group-hover:border-teal-500 transition-all">
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* 3. VISION STUDIO (Full Width Grid Section) */}
                <div className="md:col-span-12 mt-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                <Eye className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white">Vision Studio</h2>
                        </div>

                        {/* Compact Color Blind Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                            >
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                                    Filter: {colorBlindOptions.find(o => o.value === colorBlindMode)?.label || 'None'}
                                </span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-30"
                                    >
                                        {colorBlindOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => { setColorBlindMode(option.value); setDropdownOpen(false); }}
                                                className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${colorBlindMode === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                                            >
                                                {option.label}
                                                {colorBlindMode === option.value && <Check size={14} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <VisionStudioCards />
                </div>

                {/* 4. LATEST ANALYSIS SUMMARY */}
                <div className="md:col-span-12">
                    <Link to="/test-results" className="block">
                        <Card delay={0.4} className="hover:ring-2 hover:ring-blue-100 dark:hover:ring-blue-900/30 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-center gap-8">
                                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="40" cy="40" r="36" className="stroke-gray-100 dark:stroke-slate-800" strokeWidth="8" fill="none" />
                                            <motion.circle
                                                cx="40" cy="40" r="36" stroke="#2563eb" strokeWidth="8" fill="none" strokeDasharray="226"
                                                initial={{ strokeDashoffset: 226 }} animate={{ strokeDashoffset: 226 - (226 * (storage.getStats().focusScore / 100)) }}
                                                transition={{ duration: 1.5, delay: 0.5 }} className="stroke-blue-600"
                                            />
                                        </svg>
                                        <span className="absolute text-xl font-bold text-gray-900 dark:text-white">{storage.getStats().focusScore}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Latest Cognitive Analysis</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed just now • <span className="text-green-600 dark:text-green-400 font-bold">Optimal Focus</span></p>
                                        <div className="flex gap-3 mt-3">
                                            <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-700">Reading: 250 WPM</div>
                                            <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-800">Reaction: 280ms</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-blue-600 transition-all items-center justify-center">
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* PROGRESS SECTION */}
            <div className="mt-12 pt-12 border-t border-gray-200 dark:border-slate-800">
                <ProgressCharts />
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;