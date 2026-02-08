import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { ArrowLeft, BookOpen, RefreshCw, Sparkles, Brain, MousePointer2, AlignLeft, Star, ZapIcon } from 'lucide-react';
import FocusRuler from '../components/FocusRuler';
import ProgressCharts from '../components/ProgressCharts';

const toBionic = (text) => {
    if (typeof text !== 'string') return text;
    return text.split(' ').map((word, i) => {
        const mid = Math.ceil(word.length / 2);
        const start = word.slice(0, mid);
        const end = word.slice(mid);
        return (
            <span key={i} className="inline-block mr-1">
                <span className="font-extrabold text-black dark:text-white">{start}</span>
                {end}
            </span>
        );
    });
};

const DyslexiaDashboard = () => {
    const [isFocusRulerActive, setIsFocusRulerActive] = useState(false);
    const [isBionicActive, setIsBionicActive] = useState(false);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-background to-background dark:from-blue-900/20 dark:via-background dark:to-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="p-3 glass rounded-xl hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold tracking-wider uppercase border border-orange-200 dark:border-orange-800">
                                        Accessibility Workspace
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                    Dyslexia Support
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 text-sm font-medium">
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                <span>3 Day Streak</span>
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
                                    {isBionicActive ? toBionic("Find your perfect reading flow.") : "Find your perfect reading flow."}
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8 max-w-xl leading-relaxed">
                                    {isBionicActive
                                        ? toBionic("Customize your workspace with tools designed to enhance focus, readability, and comprehension.")
                                        : "Customize your workspace with tools designed to enhance focus, readability, and comprehension."
                                    }
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
                                        <span>Focus Ruler</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isFocusRulerActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                            {isFocusRulerActive ? 'ON' : 'OFF'}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setIsBionicActive(!isBionicActive)}
                                        className={`h-12 px-6 rounded-xl flex items-center gap-2.5 font-semibold transition-all duration-300 ${isBionicActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105'
                                            : 'glass hover:bg-white/50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <AlignLeft size={18} />
                                        <span>Bionic Reading</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isBionicActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                            {isBionicActive ? 'ON' : 'OFF'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Decorative BG Elements */}
                            <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5 pointer-events-none transform translate-x-12 translate-y-12 transition-transform duration-700 group-hover:translate-x-6 group-hover:translate-y-6">
                                <Brain size={300} />
                            </div>
                        </motion.div>

                        {/* Quick Stats / Motivation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-indigo-500/10"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                                        <Star className="text-yellow-300 fill-yellow-300" size={24} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">Lvl 4</div>
                                        <div className="text-indigo-100 text-sm">Scholar</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-2 text-indigo-100">
                                        <span>Next Reward</span>
                                        <span>850 / 1000 XP</span>
                                    </div>
                                    <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div className="h-full bg-white/90 rounded-full w-[85%] shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                    </div>
                                </div>
                            </div>

                            {/* Animated blobs */}
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1),_transparent_70%)] animate-spin-slow pointer-events-none" />
                        </motion.div>
                    </div>

                    <FocusRuler isActive={isFocusRulerActive} />

                    {/* Modules Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-foreground">Learning Modules</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Letter Mirror Match",
                                    desc: "Train distinguishing b/d, p/q.",
                                    icon: RefreshCw,
                                    color: "blue",
                                    path: "/dyslexia-game",
                                    action: "Play Game"
                                },
                                {
                                    title: "Immersive Reader",
                                    desc: "Focus mode with text-to-speech.",
                                    icon: BookOpen,
                                    color: "emerald",
                                    path: "/reader",
                                    action: "Open Reader"
                                },
                                {
                                    title: "Syllable Slasher",
                                    desc: "Break down complex words.",
                                    icon: ZapIcon,
                                    color: "orange",
                                    path: "/syllable-slasher",
                                    action: "Start Slashing"
                                }
                            ].map((item, idx) => (
                                <Link to={item.path} key={idx} className="group">
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="h-full glass-card hover:bg-white dark:hover:bg-slate-800 rounded-3xl p-6 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 relative overflow-hidden"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300
                                            ${item.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                            ${item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                                            ${item.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                        `}>
                                            <item.icon size={26} />
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                                            {item.desc}
                                        </p>

                                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-sm font-bold opacity-60 group-hover:opacity-100 transition-opacity">
                                            <span className={`${item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : ''}
                                                ${item.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                                                ${item.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : ''}
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

export default DyslexiaDashboard;
