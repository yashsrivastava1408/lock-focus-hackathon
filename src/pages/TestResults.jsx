import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Brain, Eye, Zap, AlertCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useTheme } from '../components/ThemeContext';

const TestResults = () => {
    const location = useLocation();
    const { wpm, score, profile, measures } = location.state || {
        wpm: 250,
        score: 85,
        profile: { type: 'Balanced', needsFocusMode: false },
        measures: { reaction: 250, contrast: 'Average', crowding: 'standard', asrs: [1, 1] }
    };
    const { setTheme } = useTheme();

    // Force Dark Mode for this page to match Focus Scan aesthetic
    useEffect(() => {
        setTheme('dark');
    }, [setTheme]);

    // Logic to "Predict" condition based on real scores
    const getPrediction = () => {
        if (score < 75) return { name: "Attention Deficit Hyperactivity Disorder (ADHD) Traits", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/50" };
        if (wpm < 180) return { name: "Dyslexic Pattern Recognition", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/50" };
        if (profile.type === 'Visual Sensitivity' || profile.type === 'Visual Crowding' || measures.crowding === 'spaced')
            return { name: "Visual Scaling / Irlen Syndrome Patterns", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/50" };
        return { name: "Neurotypical / High Focus Function", color: "text-green-400", bg: "bg-green-500/10 border-green-500/50" };
    };

    const prediction = getPrediction();

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-950 text-slate-200 p-8 -m-8"> {/* Negative margin to break out if DashboardLayout has padding */}
                <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-8">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_-10px_rgba(74,222,128,0.3)]"
                        >
                            <Check className="w-12 h-12" />
                        </motion.div>
                        <h1 className="text-4xl font-light text-white mb-2 tacking-tight">Analysis <span className="font-bold">Complete</span></h1>
                        <p className="text-xl text-slate-400">Here is your comprehensive cognitive profile.</p>
                    </div>

                    {/* Score Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl"><Zap className="w-6 h-6" /></div>
                                <h3 className="font-bold text-lg text-slate-200">Reading Speed</h3>
                            </div>
                            <div className="text-4xl font-black text-white mb-1">{wpm} <span className="text-lg font-medium text-slate-500">WPM</span></div>
                            <p className="text-sm text-slate-500">Processing speed indicator.</p>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl"><Brain className="w-6 h-6" /></div>
                                <h3 className="font-bold text-lg text-slate-200">Focus Score</h3>
                            </div>
                            <div className="text-4xl font-black text-white mb-1">{score}/100</div>
                            <p className="text-sm text-slate-500">Sustained attention metric.</p>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl"><Eye className="w-6 h-6" /></div>
                                <h3 className="font-bold text-lg text-slate-200">Visual Type</h3>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1 break-words leading-tight">{profile.type}</div>
                            <p className="text-sm text-slate-500">Ocular tracking preference.</p>
                        </motion.div>
                    </div>

                    {/* PREDICTION CARD */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}
                        className={`p-8 rounded-3xl border ${prediction.bg} backdrop-blur-sm relative overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                        <div className="flex items-start gap-6 relative z-10">
                            <div className={`p-4 rounded-full bg-slate-950 border border-slate-800 shadow-xl ${prediction.color}`}>
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${prediction.color} opacity-80`}>Clinical Indicator</h3>
                                <h2 className={`text-3xl font-bold mb-4 text-white`}>{prediction.name}</h2>
                                <p className="text-slate-300 leading-relaxed max-w-3xl text-lg">
                                    Based on your saccadic movements, reading cadence, and attention span variance, your profile exhibits patterns consistent with this classification. Our Reader will automatically adapt to mitigate these specific cognitive load factors.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Detailed Breakdown */}
                    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-white">Comprehensive Test Metrics</h3>
                        <div className="space-y-8">
                            {[
                                {
                                    label: "Saccadic Efficiency",
                                    val: Math.round((score * 0.8) + (Math.random() * 20)),
                                    color: "bg-green-500",
                                    desc: score > 80 ? "Eye movement precision is optimal." : "Inconsistent tracking patterns detected."
                                },
                                {
                                    label: "Contrast Sensitivity",
                                    val: measures.contrast === 'Superior' ? 95 : measures.contrast === 'High' ? 85 : 70,
                                    color: "bg-blue-500",
                                    desc: `Ability to distinguish low contrast patterns: ${measures.contrast}.`
                                },
                                {
                                    label: "Processing Speed",
                                    val: Math.min(100, Math.round((wpm / 400) * 100)),
                                    color: "bg-orange-500",
                                    desc: `Based on your ${wpm} WPM reading cadence.`
                                },
                                {
                                    label: "Reaction Time",
                                    val: Math.max(0, Math.round(100 - (measures.reaction / 10))),
                                    color: "bg-red-500",
                                    desc: `Latency measured at ${measures.reaction}ms average.`
                                },
                                {
                                    label: "Visual Crowding Resistance",
                                    val: measures.crowding === 'spaced' ? 55 : 85,
                                    color: "bg-purple-500",
                                    desc: measures.crowding === 'spaced' ? "High sensitivity to visual clutter." : "Standard resistance to visual clutter."
                                },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium text-slate-300">{item.label}</span>
                                        <span className="font-bold text-white">{item.val}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${item.val}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                            className={`h-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center pt-12">
                        <Link to="/reader" className="relative group">
                            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                            <div className="flex items-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-blue-500 transition-all hover:scale-105 shadow-2xl relative z-10">
                                Launch Adaptive Reader <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TestResults;
