import React from "react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle,
    Activity,
    Star,
    Play,
    Brain,
    Eye,
    BarChart3,
    Gamepad2,
    Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectNavbar from "../components/ProjectNavbar";
import ProblemStatementModal from "../components/ProblemStatementModal";
import VisionSimulator from "../components/VisionSimulator";
import { useState } from "react";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ProjectPage = () => {
    const navigate = useNavigate();
    const [isProblemOpen, setIsProblemOpen] = useState(false);

    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* BACKGROUND GLOWS */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px]" />
            </div>

            <ProjectNavbar />

            {/* ================= HERO ================= */}
            <header className="container mx-auto px-6 pt-36 pb-28 text-center">
                <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-secondary/60 border border-foreground/10 text-sm">
                        <Activity className="w-4 h-4 text-accent" />
                        National Hackathon Prototype • Round 2
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        Lock Focus
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            Adaptive Reading, Reimagined
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-foreground/65 max-w-3xl mx-auto mb-10 leading-relaxed">
                        An intent-aware cognitive system that reshapes reading experiences
                        in real time — reducing overload, supporting neurodiverse users,
                        and improving focus <b>without diagnosis or manual setup</b>.
                    </p>

                    {/* STATUS BAR */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mx-auto mb-10 flex items-center justify-center gap-6 px-6 py-3 rounded-full bg-background/70 backdrop-blur border border-foreground/10 shadow-lg max-w-fit"
                    >
                        <span className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Cognitive Load: Optimal
                        </span>
                        <span className="text-sm text-foreground/50">
                            Focus • Visual Comfort • Retention
                        </span>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="relative px-10 py-4 rounded-full font-bold text-white bg-gradient-to-r from-primary to-accent shadow-xl hover:scale-105 transition-transform"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Play className="w-5 h-5 fill-current" />
                                Open Prototype
                            </span>
                            <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                        </button>

                        <button
                            onClick={() => setIsProblemOpen(true)}
                            className="px-10 py-4 rounded-full border border-foreground/15 hover:border-foreground/30 transition text-foreground"
                        >
                            View Problem Statement
                        </button>
                    </div>

                    <p className="mt-6 text-sm text-foreground/50">
                        Includes a <b>working Dyslexia Training Game</b> and Immersive Reader
                    </p>
                </motion.div>
            </header>

            {/* ================= SIMULATOR (HOOK) ================= */}
            <section className="bg-gradient-to-b from-transparent to-secondary/20 pb-24">
                <div className="container mx-auto px-6">
                    <VisionSimulator />
                </div>
            </section>

            {/* ================= JUDGE QUICK START (CTA) ================= */}
            <section className="py-24 bg-secondary/30">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-block p-8 rounded-3xl bg-background border border-foreground/10 shadow-xl">
                        <h2 className="text-3xl font-bold mb-6 flex alignItems-center justify-center gap-2">
                            <Play className="w-6 h-6 text-primary" />
                            Judge Quick Start (2 Minutes)
                        </h2>
                        <div className="grid md:grid-cols-4 gap-6 text-left">
                            {[
                                "1. Open Dashboard",
                                "2. Click 'Focus Flow'",
                                "3. Enable 'Neuro-Pilot'",
                                "4. Test Attention Control"
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="font-medium text-sm">{step.split('. ')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= WORKING FEATURES (PROOF) ================= */}
            <section className="container mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Working Prototype Features
                    </h2>
                    <p className="text-foreground/60">
                        These features are live and functional in the submitted prototype.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            icon: Brain,
                            title: "Neuro-Pilot (AI)",
                            desc: "Camera-based attention game. Moves only when you focus.",
                        },
                        {
                            icon: Gamepad2,
                            title: "Dyslexia Gamification",
                            desc: "Syllable Slasher trains decoding and chunking.",
                        },
                        {
                            icon: Activity,
                            title: "Focus Scan",
                            desc: "Assess reaction time and precision with millisecond accuracy.",
                        },
                        {
                            icon: Shield,
                            title: "Privacy-First AI",
                            desc: "100% Local Processing. No video data leaves your device.",
                        },
                    ].map((f, i) => (
                        <div
                            key={i}
                            className="p-6 rounded-2xl bg-secondary/40 border border-foreground/10"
                        >
                            <f.icon className="w-7 h-7 text-primary mb-3" />
                            <h4 className="font-bold mb-2">{f.title}</h4>
                            <p className="text-sm text-foreground/70">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= PROBLEM (CONTEXT) ================= */}
            <section className="container mx-auto px-6 py-24 border-t border-foreground/5">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Why Digital Reading Fails Today
                    </h2>
                    <p className="text-foreground/60 max-w-2xl mx-auto">
                        Most systems assume linear reading and identical users — causing
                        fatigue, confusion, and disengagement.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            title: "Static Layouts",
                            desc: "Fixed text structures overload attention and working memory.",
                        },
                        {
                            title: "Poor Neurodiversity Support",
                            desc: "ADHD and dyslexic users struggle with dense, rigid content.",
                        },
                        {
                            title: "No Real-Time Awareness",
                            desc: "Systems fail to detect confusion or disengagement as it happens.",
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -6 }}
                            className="p-8 rounded-2xl bg-secondary/40 border border-foreground/10"
                        >
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-foreground/70">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ================= SOLUTION (DETAILS) ================= */}
            <section className="py-24 bg-secondary/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            What Makes Lock Focus Different
                        </h2>
                        <p className="text-foreground/60 max-w-2xl mx-auto">
                            Lock Focus adapts content to users — not the other way around.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                        <div className="p-8 rounded-2xl bg-background border border-foreground/10">
                            <Brain className="w-8 h-8 text-primary mb-4" />
                            <h3 className="font-bold text-lg mb-2">
                                Intent-Aware Adaptation
                            </h3>
                            <p className="text-foreground/70">
                                The interface reshapes itself based on how users interact,
                                reducing cognitive overload.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-background border border-foreground/10">
                            <Eye className="w-8 h-8 text-accent mb-4" />
                            <h3 className="font-bold text-lg mb-2">
                                Frictionless Accessibility
                            </h3>
                            <p className="text-foreground/70">
                                Support activates automatically — no diagnosis, no stigma,
                                no manual configuration.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-background border border-foreground/10">
                            <BarChart3 className="w-8 h-8 text-emerald-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">
                                Outcome-Driven Design
                            </h3>
                            <p className="text-foreground/70">
                                Improves comprehension, retention, and long-form focus.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="py-10 text-center text-sm text-foreground/40 border-t border-foreground/10">
                <p>
                    Lock Focus is an assistive cognitive tool and does not replace medical
                    diagnosis.
                </p>
                <p className="mt-2">&copy; 2026 Lock Focus</p>
            </footer>
            <ProblemStatementModal open={isProblemOpen} onClose={() => setIsProblemOpen(false)} />
        </div>
    );
};

export default ProjectPage;