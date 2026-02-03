import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { ArrowLeft, BookOpen, Target, Sparkles, Brain, MousePointer2, Zap, Star, LayoutGrid } from 'lucide-react';
import FocusRuler from '../components/FocusRuler'; // Assuming we can reuse this or it exists
import ProgressCharts from '../components/ProgressCharts';

const ADHDDashboard = () => {
    const [isFocusRulerActive, setIsFocusRulerActive] = useState(false);
    const [isFocusModeActive, setIsFocusModeActive] = useState(false);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-background to-background dark:from-amber-900/20 dark:via-background dark:to-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="p-3 glass rounded-xl hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-wider uppercase border border-amber-200 dark:border-amber-800">
                                        Focus Workspace
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                    ADHD Support
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 text-sm font-medium">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>High Focus Day</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero / Tools Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Welcome & Toggles */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                                    Master your attention span.
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8 max-w-xl leading-relaxed">
                                    Tools designed to reduce distraction, visualize time, and gamify your focus sessions.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => setIsFocusRulerActive(!isFocusRulerActive)}
                                        className={`h-12 px-6 rounded-xl flex items-center gap-2.5 font-semibold transition-all duration-300 ${isFocusRulerActive
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                                            : 'glass hover:bg-white/50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <MousePointer2 size={18} />
                                        <span>Reading Ruler</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isFocusRulerActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                            {isFocusRulerActive ? 'ON' : 'OFF'}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setIsFocusModeActive(!isFocusModeActive)}
                                        className={`h-12 px-6 rounded-xl flex items-center gap-2.5 font-semibold transition-all duration-300 ${isFocusModeActive
                                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 scale-105'
                                            : 'glass hover:bg-white/50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <Target size={18} />
                                        <span>Deep Focus Mode</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isFocusModeActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                            {isFocusModeActive ? 'ON' : 'OFF'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Decorative BG Elements */}
                            <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5 pointer-events-none transform translate-x-12 translate-y-12 transition-transform duration-700 group-hover:translate-x-6 group-hover:translate-y-6">
                                <Zap size={300} />
                            </div>
                        </motion.div>

                        {/* Quick Stats / Motivation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-amber-500/10"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                                        <Star className="text-yellow-300 fill-yellow-300" size={24} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">Lvl 2</div>
                                        <div className="text-amber-100 text-sm">Focus Master</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-2 text-amber-100">
                                        <span>Next Reward</span>
                                        <span>320 / 500 XP</span>
                                    </div>
                                    <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div className="h-full bg-white/90 rounded-full w-[65%] shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                    </div>
                                </div>
                            </div>

                            {/* Animated blobs */}
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1),_transparent_70%)] animate-spin-slow pointer-events-none" />
                        </motion.div>
                    </div>

                    {isFocusRulerActive && <FocusRuler isActive={isFocusRulerActive} />}

                    {/* Modules Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-foreground">Focus Modules</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Focus Flow",
                                    desc: "Gamified attention training. Deep focus state inducer.",
                                    icon: Target,
                                    color: "amber",
                                    path: "/focus-flow",
                                    action: "Start Flow"
                                },
                                {
                                    title: "Immersive Reader",
                                    desc: "Distraction-free reading environment.",
                                    icon: BookOpen,
                                    color: "emerald",
                                    path: "/reader",
                                    action: "Open Reader"
                                },
                                {
                                    title: "Time Blindness",
                                    desc: "Visual timers to manage tasks. Coming soon!",
                                    icon: LayoutGrid,
                                    color: "purple",
                                    path: "#",
                                    action: "Coming Soon"
                                }
                            ].map((item, idx) => (
                                <Link to={item.path} key={idx} className="group">
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="h-full glass-card hover:bg-white dark:hover:bg-slate-800 rounded-3xl p-6 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 relative overflow-hidden"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300
                                            ${item.color === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                                            ${item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                                            ${item.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                                        `}>
                                            <item.icon size={26} />
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                                            {item.desc}
                                        </p>

                                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-sm font-bold opacity-60 group-hover:opacity-100 transition-opacity">
                                            <span className={`${item.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : ''}
                                                ${item.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                                                ${item.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : ''}
                                            `}>{item.action}</span>
                                            <ArrowLeft className="rotate-180 w-4 h-4" />
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="glass-card rounded-3xl p-8 border border-white/50 dark:border-white/5">
                        <ProgressCharts />
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default ADHDDashboard;
