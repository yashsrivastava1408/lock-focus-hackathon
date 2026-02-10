import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Play, Eye, ChevronDown, Check, ArrowRight,
    FileText, ArrowUpRight, Scan, Activity, Sparkles
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import ProgressCharts from '../components/ProgressCharts';
import AuroraAnimation from '../components/AuroraAnimation';
import { storage } from '../utils/storage';
import VisionStudioCards from '../components/VisionStudioCards';
import LeaderboardWidget from '../components/LeaderboardWidget';

// Optimized CSS Keyframes for Performance
const dashboardStyles = `
  @keyframes scan-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.08); opacity: 0.8; }
    100% { transform: scale(1); opacity: 0.4; }
  }
  @keyframes orbital-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes orbital-rotate-rev {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  @keyframes floating-particle {
    0% { transform: translateY(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-12px); opacity: 0; }
  }
  .gpu-accelerated {
    will-change: transform, opacity;
  }
`;

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

const GraphLine = ({ data, fallback }) => {
    const points = (data && data.length > 0) ? data : fallback;
    const max = Math.max(...points, 100);
    const min = Math.min(...points, 0);
    // Generate path for 100x100 viewbox
    const pathD = points.map((p, i) => {
        const x = (i / (points.length - 1)) * 100;
        const y = 100 - ((p - min) / (max - min)) * 80 - 10; // 10px padding
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
                d={pathD}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Area under curve for tech feel */}
            <motion.path
                d={`${pathD} V 120 H 0 Z`}
                fill="url(#scoreGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 1, delay: 0.5 }}
            />
            <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};

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
            {/* HERO SECTION — Premium HUD Upgrade */}
            <section className="relative w-full h-[420px] md:h-[480px] rounded-[3.5rem] overflow-hidden bg-[#050a1a] border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] mb-14 group">
                {/* Enhanced Aurora Background */}
                <div className="absolute inset-0 z-0 opacity-80 scale-110 group-hover:scale-125 transition-transform duration-1000">
                    <AuroraAnimation />
                </div>

                {/* Technical HUD Overlays */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full border-[1.5rem] border-[#0a1128]/50" />
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/10" />
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a1a] via-transparent to-transparent" />
                </div>

                <div className="absolute inset-0 z-20 flex flex-col md:flex-row items-center justify-between p-12 md:p-20">
                    <div className="flex flex-col items-start gap-8 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-blue-400 text-xs font-bold tracking-[0.3em] uppercase"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            System Active: 0.98.4
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-2"
                            >
                                {getGreeting()},
                            </motion.h1>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500"
                            >
                                Explorer.
                            </motion.h1>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="text-xl text-gray-400 max-w-[420px] leading-relaxed"
                        >
                            Optical baseline stable. Cognitive load at <span className="text-emerald-400 font-bold">12%</span>. Current focus potential is <span className="text-white font-bold">highly optimized</span>.
                        </motion.p>
                    </div>

                    <div className="hidden lg:flex relative items-center justify-center w-[450px] h-[450px]">
                        <style>{dashboardStyles}</style>
                        {/* Immersive Orbital Rings */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {[420, 320, 220].map((size, i) => (
                                <div
                                    key={size}
                                    className={`absolute rounded-full border border-white/[0.03] dark:border-blue-500/10 gpu-accelerated`}
                                    style={{
                                        width: size,
                                        height: size,
                                        animation: `${i % 2 === 0 ? 'orbital-rotate' : 'orbital-rotate-rev'} ${20 + i * 10}s linear infinite, pulse-ring 4s ease-in-out infinite`
                                    }}
                                />
                            ))}
                        </div>

                        {/* Central Pulse Core */}
                        <motion.div
                            className="relative w-48 h-48 flex items-center justify-center"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[60px]" />
                            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center p-6 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-1">Status</div>
                                <div className="text-4xl font-black text-white tracking-tighter">OS.v4</div>
                                <div className="mt-2 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Optimized</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Data Nodes */}
                        <motion.div
                            className="absolute top-10 right-10 p-5 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                        >
                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Neural XP</div>
                            <div className="text-2xl font-black text-white">{storage.getUser().xp.toLocaleString()}</div>
                        </motion.div>

                        <motion.div
                            className="absolute bottom-20 left-0 p-5 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                        >
                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cognitive Rank</div>
                            <div className="text-xl font-black text-blue-400 uppercase tracking-tight">Master Explorer</div>
                        </motion.div>

                        <motion.div
                            className="absolute bottom-10 right-20 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl flex items-center gap-3"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                        >
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Activity size={16} />
                            </div>
                            <div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Efficiency</div>
                                <div className="text-sm font-bold text-white leading-none">98.2%</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">

                {/* 1. FOCUS COMMAND CENTER (Scan + Stats) */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-2 shadow-xl shadow-blue-900/5 h-full flex flex-col">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">

                            {/* A: SCAN CONSOLE — Premium Redesign */}
                            <Link to="/focus-scan" className="group relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#0a0f1e] via-[#0d1530] to-[#0a1628] flex flex-col justify-between p-7 min-h-[280px] transition-all hover:scale-[0.98] active:scale-[0.96]">

                                {/* Animated Gradient Orbs Background */}
                                <motion.div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px]" animate={{ x: [0, 20, 0], y: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
                                <motion.div className="absolute -bottom-10 -right-10 w-56 h-56 bg-purple-600/15 rounded-full blur-[90px]" animate={{ x: [0, -15, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
                                <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

                                {/* Scanning Rings */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {[80, 56, 36].map((size, i) => (
                                        <div
                                            key={i}
                                            className="absolute rounded-full border gpu-accelerated"
                                            style={{
                                                width: `${size}%`,
                                                height: `${size}%`,
                                                borderColor: `rgba(96, 165, 250, ${0.12 - i * 0.03})`,
                                                animation: `pulse-ring 3s ease-in-out ${i * 0.4}s infinite`
                                            }}
                                        />
                                    ))}
                                    {/* Rotating Scan Beam */}
                                    <div
                                        className="absolute w-[70%] h-[70%] rounded-full gpu-accelerated"
                                        style={{
                                            background: 'conic-gradient(from 0deg, transparent 0%, rgba(59,130,246,0.15) 10%, transparent 20%)',
                                            animation: 'scan-rotate 4s linear infinite'
                                        }}
                                    />
                                    {/* Center Dot */}
                                    <div
                                        className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)] gpu-accelerated"
                                        style={{ animation: 'pulse-ring 2s ease-in-out infinite' }}
                                    />
                                </div>

                                {/* Floating Particles */}
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={`p-${i}`}
                                        className="absolute w-1 h-1 rounded-full bg-blue-400/60 gpu-accelerated"
                                        style={{
                                            top: `${20 + i * 15}%`,
                                            left: `${15 + i * 16}%`,
                                            animation: `floating-particle ${2 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`
                                        }}
                                    />
                                ))}

                                {/* Top Bar */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                                {/* Content — Top */}
                                <div className="z-10 relative">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <motion.div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                        <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-400/90 uppercase">Ready to Scan</span>
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-white leading-[1.15] tracking-tight">
                                        Begin Your<br />
                                        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Focus Scan</span>
                                    </h2>
                                </div>

                                {/* Content — Bottom */}
                                <div className="flex items-end justify-between z-10 relative">
                                    <div>
                                        <p className="text-[11px] text-gray-500 max-w-[160px] leading-relaxed mb-2">
                                            3-minute cognitive calibration & deep focus analysis.
                                        </p>
                                        <div className="flex gap-1.5">
                                            {['Reaction', 'Tracking', 'Memory'].map((tag) => (
                                                <span key={tag} className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 uppercase tracking-wider">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-[0_8px_30px_rgba(59,130,246,0.35)] group-hover:shadow-[0_8px_40px_rgba(59,130,246,0.5)] transition-shadow">
                                        <Play className="w-6 h-6 fill-current ml-0.5" />
                                    </motion.div>
                                </div>
                            </Link>

                            {/* B: LATEST ANALYSIS — Premium Redesign */}
                            <Link to="/test-results" className="group relative overflow-hidden rounded-[1.5rem] bg-gray-50 dark:bg-[#0f1629] border border-gray-100 dark:border-slate-800/80 p-7 flex flex-col justify-between min-h-[280px] hover:bg-white dark:hover:bg-[#111a30] transition-all">

                                {/* Subtle grid pattern */}
                                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                                {/* Header */}
                                <div className="flex justify-between items-start z-10 relative">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-3.5 h-3.5 text-blue-500" />
                                            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Cognitive Score</h3>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <motion.span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tighter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                                {storage.getStats().focusScore}
                                            </motion.span>
                                            <span className="text-sm font-bold text-gray-300 dark:text-gray-600">/100</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700/60 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all bg-white dark:bg-slate-900/60">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+5%</span>
                                    </div>
                                </div>

                                {/* Live Graph */}
                                <div className="flex-1 relative z-10 my-3">
                                    <div className="w-full h-full min-h-[80px]">
                                        <GraphLine data={storage.getSessions().map(s => s.score).slice(-7)} fallback={[40, 60, 45, 75, 65, 90, storage.getStats().focusScore]} />
                                    </div>
                                </div>

                                {/* Bottom Stats Row */}
                                <div className="flex items-center justify-between z-10 relative">
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1.5 bg-white dark:bg-slate-800/80 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-700/50 flex items-center gap-1.5 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            {storage.getStats().avgReactionTime}ms
                                        </div>
                                        <div className="px-3 py-1.5 bg-white dark:bg-slate-800/80 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-700/50 flex items-center gap-1.5 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            250 WPM
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-medium text-gray-400 dark:text-gray-600">Last 7 sessions</span>
                                </div>
                            </Link>

                        </div>
                    </div>
                </div>

                {/* 2. SIDEBAR (Reader + Leaderboard) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* A. ADAPTIVE READER */}
                    <Link to="/adaptive-reader" className="block flex-1 min-h-[280px]">
                        <Card delay={0.3} className="h-full bg-gradient-to-br from-[#0a1e1e] via-[#0d1e25] to-[#0a1628] border-teal-500/10 dark:border-teal-900/40 relative overflow-hidden group hover:border-teal-500/30 transition-all p-0">

                            {/* Animated Background Orbs */}
                            <motion.div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-[70px]" animate={{ x: [0, -20, 0], y: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
                            <motion.div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />

                            {/* Abstract Text Flow Visual */}
                            <div className="absolute inset-0 flex flex-col gap-3 p-12 opacity-20 pointer-events-none overflow-hidden">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="h-1.5 rounded-full bg-gradient-to-r from-teal-400/40 to-transparent"
                                        style={{ width: `${60 + Math.random() * 40}%`, marginLeft: i % 2 === 0 ? '0' : '20%' }}
                                        animate={{ x: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                ))}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent h-20 w-full"
                                    animate={{ y: [-100, 400] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                />
                            </div>

                            <div className="flex flex-col h-full justify-between relative z-10 p-8">
                                <div className="flex items-start justify-between">
                                    <motion.div whileHover={{ rotate: 5 }} className="p-3.5 bg-white/5 dark:bg-slate-900/60 rounded-2xl border border-white/10 shadow-xl text-teal-400 group-hover:text-teal-300 group-hover:border-teal-500/30 transition-all">
                                        <FileText className="w-6 h-6" />
                                    </motion.div>
                                    <div className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold rounded-lg tracking-widest uppercase">
                                        Reader
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-1 rounded-full bg-teal-500"></div>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Enhanced Vision</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-3 leading-tight tracking-tight">Adaptive<br /><span className="text-teal-400">Reader</span></h2>
                                    <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-[200px]">
                                        Intelligent document processing for ADHD & Dyslexia.
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-bold text-teal-500 group-hover:gap-4 transition-all">
                                            <span>Open Interface</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                        <Sparkles className="w-4 h-4 text-teal-500/40 group-hover:text-teal-400 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    {/* B. LEADERBOARD WIDGET */}
                    <div className="flex-1 min-h-[400px]">
                        <LeaderboardWidget />
                    </div>
                </div>

                {/* 3. VISION STUDIO (Full Width) — Premium Redesign */}
                <div className="md:col-span-12 mt-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                                <div className="relative p-3.5 bg-white/5 dark:bg-slate-900 border border-white/10 rounded-2xl text-purple-400 shadow-2xl">
                                    <Eye className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-0.5 bg-purple-500 rounded-full" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Optimization Suite</span>
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Vision <span className="text-purple-400">Studio</span></h2>
                            </div>
                        </div>

                        {/* Filter Dropdown — Refined HUD Style */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="px-5 py-2.5 rounded-2xl bg-white/5 dark:bg-slate-900/40 border border-white/10 flex items-center gap-4 hover:bg-white/10 dark:hover:bg-slate-800 transition-all group/btn"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Filter Mode</span>
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-tight">
                                        {colorBlindOptions.find(o => o.value === colorBlindMode)?.label || 'None'}
                                    </span>
                                </div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 group-hover/btn:text-blue-400 ${dropdownOpen ? 'rotate-180' : ''}`} />
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
            </div>

            {/* PROGRESS SECTION */}
            <div className="mt-12 pt-12 border-t border-gray-200 dark:border-slate-800">
                <ProgressCharts />
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;