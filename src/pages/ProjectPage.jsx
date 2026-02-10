import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight, Activity, Star, Play, Brain, Eye,
    BarChart3, Gamepad2, Shield, Github, Heart,
    ExternalLink, Target, FileText, Zap, CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectNavbar from "../components/ProjectNavbar";
import ProblemStatementModal from "../components/ProblemStatementModal";
import VisionSimulator from "../components/VisionSimulator";
import Footer from "../components/Footer";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } // Apple-style ease
};

const ProjectPage = () => {
    const navigate = useNavigate();
    const [isProblemOpen, setIsProblemOpen] = useState(false);

    return (
        <div className="relative min-h-screen bg-[#030303] text-slate-50 overflow-x-hidden selection:bg-primary/30">
            {/* HIGH-END BACKGROUND GRADIENTS - ANIMATED */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.4, 0.3],
                        x: [0, -30, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.3, 0.1],
                        x: [0, 40, 0],
                        y: [0, -40, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]"
                />
            </div>

            <ProjectNavbar />

            {/* ================= HERO ================= */}
            <header className="container mx-auto px-6 pt-44 pb-32 text-center relative">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10 text-sm font-medium backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span className="text-slate-300">AI-Powered Cognitive Assistant</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tight mb-8">
                        Lock Focus
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                            Adaptive Reading
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                        An intent-aware cognitive system that reshapes reading experiences
                        in real time — reducing overload and supporting neurodiversity
                        <span className="text-white font-medium italic"> without manual setup</span>.
                    </motion.p>

                    {/* STATUS BAR */}
                    <motion.div
                        variants={itemVariants}
                        className="mx-auto mb-12 flex items-center justify-center gap-8 px-8 py-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl max-w-fit"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                            <span className="text-sm font-mono text-emerald-400 tracking-tighter uppercase">Cognitive Load: Optimal</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-xs font-medium text-slate-500 tracking-widest uppercase">Focus • Visual Comfort • Retention</span>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-6">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="group relative px-12 py-4 rounded-full font-bold text-black bg-white hover:bg-slate-200 transition-all duration-300 transform hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Play className="w-5 h-5 fill-current" />
                                Open Prototype
                            </span>
                        </button>

                        <button
                            onClick={() => setIsProblemOpen(true)}
                            className="px-12 py-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white font-semibold backdrop-blur-sm flex items-center gap-2"
                        >
                            <Target className="w-4 h-4" /> Our Mission
                        </button>


                    </motion.div>

                    {/* HERO TECH STACK */}
                    <motion.div variants={itemVariants} className="mt-20 flex flex-wrap justify-center gap-3">
                        {[
                            { icon: Brain, label: "TensorFlow.js" },
                            { icon: Eye, label: "MediaPipe Vision" },
                            { icon: Activity, label: "Web Audio API" }
                        ].map((tech, i) => (
                            <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 font-mono">
                                <tech.icon className="w-3.5 h-3.5 text-primary" /> {tech.label}
                            </span>
                        ))}
                    </motion.div>
                </motion.div>
            </header>

            {/* ================= SIMULATOR ================= */}
            <section className="pb-32 relative">
                <div className="container mx-auto px-6">
                    <div className="rounded-[40px] overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-1">
                        <VisionSimulator />
                    </div>
                </div>
            </section>

            {/* ================= ECOSYSTEM PATHS ================= */}
            <section className="py-32 bg-white/[0.01] border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold mb-4 tracking-tight">Explore the Ecosystem</h2>
                        <p className="text-slate-500 font-light italic">Experience the full capability of Lock Focus.</p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-6">
                        {[
                            { step: "01", title: "Neuro-Pilot", desc: "Test the AI attention steering mechanism.", link: "/focus-flow", icon: Brain, color: "text-purple-400", bg: "bg-purple-400/10", span: "md:col-span-4" },
                            { step: "02", title: "PeriQuest", desc: "Verify peripheral vision training with eye tracking.", link: "/peripheral-vision", icon: Target, color: "text-red-400", bg: "bg-red-400/10", span: "md:col-span-4" },
                            { step: "03", title: "Chronos Match", desc: "Train internal clock and time-blindness awareness.", link: "/time-blindness", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", span: "md:col-span-4" },
                            { step: "04", title: "Adaptive Reader", desc: "Upload a PDF and see it transform instantly.", link: "/adaptive-reader", icon: FileText, color: "text-teal-400", bg: "bg-teal-400/10", span: "md:col-span-6" },
                            { step: "05", title: "Focus Scan", desc: "Measure your cognitive reflex speed.", link: "/focus-scan", icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10", span: "md:col-span-6" }
                        ].map((item, i) => (
                            <div key={i} className={`${item.span} group relative p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                                <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <div className="absolute top-8 right-8 text-5xl font-black text-white/[0.03] select-none italic">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-light">{item.desc}</p>
                                <button
                                    onClick={() => navigate(item.link)}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white hover:text-black font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    {item.title.split(' ')[0]} <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FEATURES GRID ================= */}
            <section className="container mx-auto px-6 py-32">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Brain, title: "Neuro-Pilot (AI)", desc: "Camera-based attention game. Moves only when you focus." },
                        { icon: Gamepad2, title: "Dyslexia Gamification", desc: "Syllable Slasher trains decoding and chunking." },
                        { icon: Activity, title: "Focus Scan", desc: "Assess reaction time and precision with millisecond accuracy." },
                        { icon: Shield, title: "Privacy-First AI", desc: "100% Local Processing. No video data leaves your device." },
                        { icon: Target, title: "PeriQuest (Vision)", desc: "Clinically-inspired peripheral vision training with Gaze Tracking." },
                        { icon: FileText, title: "Adaptive Reader", desc: "Transforms PDFs into Dyslexia/ADHD-friendly layouts." },
                    ].map((f, i) => (
                        <div key={i} className="p-10 rounded-[40px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:bg-white/[0.07] transition-all group">
                            <f.icon className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="text-xl font-bold mb-4 tracking-tight">{f.title}</h4>
                            <p className="text-slate-400 font-light leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= PROBLEM/SOLUTION (DARK MODE POLISH) ================= */}
            <section className="container mx-auto px-6 py-32 border-t border-white/5">
                <div className="flex flex-col md:flex-row gap-16">
                    <div className="md:w-1/3">
                        <h2 className="text-5xl font-black mb-6 leading-tight">Why Digital Reading Fails Today</h2>
                        <p className="text-slate-500 font-light">Existing systems fail to account for the fluid nature of human attention.</p>
                    </div>
                    <div className="md:w-2/3 grid md:grid-cols-2 gap-8">
                        {[
                            { title: "Static Layouts", desc: "Fixed structures overload attention and working memory." },
                            { title: "Neurodiversity Gap", desc: "Rigid content blocks access for ADHD and dyslexic minds." }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                                <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
                                <p className="text-slate-400 font-light leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <Footer />

            <ProblemStatementModal open={isProblemOpen} onClose={() => setIsProblemOpen(false)} />
        </div>
    );
};

export default ProjectPage;