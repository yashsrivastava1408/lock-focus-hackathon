import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Play, Activity, Brain, Layers, ArrowRight, Zap, Eye, ChevronDown, Check, Book, RefreshCw, Sparkles, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import ProgressCharts from '../components/ProgressCharts';
import AuroraAnimation from '../components/AuroraAnimation';

const Card = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-8 ${className}`}
    >
        {children}
    </motion.div>
);

const ModeButton = ({ label, active, onClick, colorClass, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`
            relative w-full p-4 rounded-2xl flex items-center justify-between group transition-all duration-300
            ${active
                ? `${colorClass} text-white shadow-lg scale-[1.02]`
                : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}
        `}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${active ? 'bg-white/20' : 'bg-white dark:bg-slate-900'} transition-colors`}>
                <Icon size={18} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
            </div>
            <span className="font-bold text-sm">{label}</span>
        </div>
        {active && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check size={16} />
            </motion.div>
        )}
    </button>
);

const Dashboard = () => {
    const { accessibilityMode, setAccessibilityMode, colorBlindMode, setColorBlindMode } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleMode = (mode) => {
        setAccessibilityMode(prev => prev === mode ? 'none' : mode);
    };

    const colorBlindOptions = [
        { value: 'none', label: 'None' },
        { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
        { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
        { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
    ];

    return (
        <DashboardLayout>
            {/* NEW HERO SECTION: Graceful Aurora Design */}
            <section className="relative w-full h-[450px] rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl shadow-blue-900/5 mb-12 group transition-all duration-500">

                {/* 1. Animated Background */}
                <div className="absolute inset-0 z-0 transition-opacity">
                    <AuroraAnimation />
                </div>

                {/* 2. Content Container */}
                <div className="absolute inset-0 z-10 flex flex-col md:flex-row items-center justify-between p-12 md:p-16">

                    {/* Left: Greeting & Status */}
                    <div className="flex flex-col items-start gap-6 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-sm font-bold tracking-wide"
                        >
                            <Sparkles size={14} className="text-blue-500" />
                            <span>NEURAL INTERFACE ACTIVE v2.5</span>
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="text-5xl md:text-7xl font-medium tracking-tight text-gray-900 dark:text-white"
                            >
                                Welcome,
                            </motion.h1>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 dark:from-blue-400 dark:to-purple-400"
                            >
                                Judges.
                            </motion.h1>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="text-lg text-gray-600 dark:text-gray-300 max-w-md"
                        >
                            Your cognitive load is optimal today. Ready to push your limits?
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                            className="mt-4 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform"
                        >
                            Resume Training <ArrowUpRight size={20} />
                        </motion.button>
                    </div>

                    {/* Right: Live Focus Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                        className="hidden md:flex relative w-80 h-80 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-700/60 p-6 flex-col justify-between shadow-xl shadow-blue-900/5 dark:shadow-none"
                    >

                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Daily Focus</h3>
                                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">92%</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>

                        {/* Mini Graph Visualization */}
                        <div className="h-32 flex items-end justify-between gap-2 pb-2">
                            {[40, 65, 50, 80, 60, 90, 75, 95].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.8 + (i * 0.05), duration: 1 }}
                                    className="w-full bg-gray-900 dark:bg-white rounded-t-sm opacity-20 dark:opacity-40"
                                />
                            ))}
                        </div>

                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                            You're in the top 5% of users today.
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 z-10 relative">

                {/* A. START SCAN CTA */}
                <div className="md:col-span-6">
                    <Card delay={0.2} className="h-full relative overflow-hidden group border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
                            <motion.div
                                className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
                                animate={{ boxShadow: ["0 0 0 0px rgba(37, 99, 235, 0.2)", "0 0 0 20px rgba(37, 99, 235, 0)"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Play className="w-8 h-8 text-white ml-1" />
                            </motion.div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Focus Scan</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">3 Minutes • Calibration & Analysis</p>
                            </div>

                            <Link to="/focus-scan" className="w-full">
                                <button className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    Start Analysis <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* B. VISION STUDIO / ACCESSIBILITY CONTROLS */}
                <div className="md:col-span-6">
                    <Card delay={0.3} className="h-full bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold dark:text-white">Vision Studio</h2>
                        </div>

                        {/* 4 Creative Buttons */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <Link to="/adhd-dashboard">
                                <ModeButton
                                    label="ADHD"
                                    icon={Zap}
                                    active={accessibilityMode === 'adhd'}
                                    // onClick={() => toggleMode('adhd')}
                                    onClick={() => { }}
                                    colorClass="bg-orange-500"
                                />
                            </Link>
                            <Link to="/dyslexia-dashboard">
                                <ModeButton
                                    label="Dyslexia"
                                    icon={Book}
                                    active={accessibilityMode === 'dyslexia'}
                                    colorClass="bg-green-500"
                                />
                            </Link>
                            <ModeButton
                                label="Stress"
                                icon={Activity}
                                active={accessibilityMode === 'vision-stress'}
                                onClick={() => toggleMode('vision-stress')}
                                colorClass="bg-pink-500"
                            />
                            <ModeButton
                                label="Royal"
                                icon={Brain}
                                active={accessibilityMode === 'royal-blue'}
                                onClick={() => toggleMode('royal-blue')}
                                colorClass="bg-blue-600"
                            />
                        </div>

                        {/* Color Blind Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:border-gray-200 dark:hover:border-slate-600 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                                        <Eye size={16} className="text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Color Blind Mode</div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            {colorBlindOptions.find(o => o.value === colorBlindMode)?.label || 'None'}
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown size={20} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-20"
                                    >
                                        {colorBlindOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setColorBlindMode(option.value);
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between
                                                    ${colorBlindMode === option.value
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}
                                                `}
                                            >
                                                {option.label}
                                                {colorBlindMode === option.value && <Check size={16} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </div>

                {/* D. LATEST ANALYSIS SUMMARY */}
                <div className="md:col-span-12">
                    <Link to="/test-results" className="block">
                        <Card delay={0.4} className="min-h-[180px] hover:ring-2 hover:ring-blue-50 dark:hover:ring-blue-900/30 transition-all cursor-pointer group dark:bg-slate-900">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    {/* Score Circle */}
                                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="40" cy="40" r="36" className="stroke-gray-100 dark:stroke-slate-800" strokeWidth="8" fill="none" />
                                            <motion.circle
                                                cx="40" cy="40" r="36" stroke="#2563eb" strokeWidth="8" fill="none" strokeDasharray="226"
                                                initial={{ strokeDashoffset: 226 }} animate={{ strokeDashoffset: 226 - (226 * 0.85) }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                                className="stroke-blue-600 dark:stroke-blue-500"
                                            />
                                        </svg>
                                        <span className="absolute text-xl font-bold text-gray-900 dark:text-white">85</span>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Latest Cognitive Analysis</h2>
                                        <p className="text-gray-500 dark:text-gray-400 mb-2">Completed just now • <span className="text-green-600 dark:text-green-400 font-medium">Optimal Focus Detected</span></p>

                                        <div className="flex gap-4 mt-2">
                                            <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-700">Reading: 250 WPM</div>
                                            <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-700">Reaction: 280ms</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pr-4 hidden md:block">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                                        <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-white transition-colors" />
                                    </div>
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
