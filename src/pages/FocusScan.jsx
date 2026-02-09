import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ArrowRight, Play, Eye, Activity, Zap, Layers } from 'lucide-react';
import OpticNerveAnimation from '../components/OpticNerveAnimation';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';

const TestStep = ({ title, description, children, onNext, isLast }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="w-full max-w-3xl mx-auto z-10 relative"
        >
            <div className="text-center mb-8">
                <h2 className="text-4xl font-light text-white mb-2 tracking-tight">{title}</h2>
                <p className="text-slate-400 text-lg">{description}</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl mb-8 min-h-[350px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                {children}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onNext}
                    className="group relative flex items-center gap-3 bg-white text-slate-950 px-10 py-4 rounded-full font-bold hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all duration-300"
                >
                    <span className="relative z-10">{isLast ? 'Complete Scan' : 'Next Step'}</span>
                    {isLast ? <Check className="w-5 h-5 relative z-10" /> : <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>
        </motion.div>
    );
};

const ReactionTimeTest = ({ onComplete }) => {
    const [state, setState] = useState('waiting');
    const [startTime, setStartTime] = useState(0);
    const [times, setTimes] = useState([]);
    const [penalties, setPenalties] = useState(0);
    const [round, setRound] = useState(1);
    const [isTarget, setIsTarget] = useState(true);

    const TOTAL_ROUNDS = 5;

    // Auto-start first round
    useEffect(() => {
        if (round === 1 && state === 'waiting' && times.length === 0) {
            // Wait for user to be ready? No, let's manual start for control
        }
    }, [round, state, times.length]);

    const startRound = useCallback(() => {
        setState('ready');
        const delay = 1500 + Math.random() * 2500;
        setTimeout(() => {
            const isGoTrial = Math.random() > 0.3;
            setIsTarget(isGoTrial);
            setState('now');
            setStartTime(Date.now());

            if (!isGoTrial) {
                setTimeout(() => handleNoGoSuccess(), 2000);
            }
        }, delay);
    }, []);

    const handleNoGoSuccess = () => {
        setState(current => {
            if (current === 'now') {
                nextRound();
                return 'waiting';
            }
            return current;
        });
    };

    const nextRound = () => {
        if (round < TOTAL_ROUNDS) {
            setState('waiting');
            setRound(r => r + 1);
        } else {
            finishTest();
        }
    };

    const finishTest = () => {
        setState('done');
        const validTimes = times.length > 0 ? times : [500];
        const avg = Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
        onComplete(avg + (penalties * 100));
    };

    const handleClick = () => {
        if (state === 'now') {
            if (isTarget) {
                const time = Date.now() - startTime;
                setTimes([...times, time]);
                nextRound();
            } else {
                setPenalties(p => p + 1);
                setState('penalty');
                setTimeout(() => nextRound(), 500);
            }
        } else if (state === 'ready') {
            setPenalties(p => p + 1);
            setState('waiting'); // Reset to manual start
            alert("Too early! Penalties apply.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
            <div className="flex justify-between w-full px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span>Round {round} / {TOTAL_ROUNDS}</span>
                <span className="text-red-400">Errors: {penalties}</span>
            </div>

            {state === 'waiting' && (
                <button onClick={startRound} className="relative z-10 cursor-pointer w-64 h-64 rounded-full bg-slate-800 border-2 border-slate-700 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all group shadow-2xl shadow-blue-900/20">
                    <Zap className="w-10 h-10 text-blue-400 group-hover:text-yellow-400 transition-colors" />
                    <span className="text-xl font-bold text-slate-200">{round === 1 ? 'Start Test' : 'Next Round'}</span>
                    <span className="text-xs text-slate-500">Tap to begin</span>
                </button>
            )}

            {state === 'ready' && (
                <div onMouseDown={handleClick} className="w-64 h-64 rounded-full bg-slate-800 border-4 border-dashed border-slate-600 flex items-center justify-center animate-pulse cursor-pointer">
                    <span className="text-2xl font-bold text-slate-400">Wait...</span>
                </div>
            )}

            {(state === 'now' || state === 'penalty') && (
                <div
                    onMouseDown={handleClick}
                    className={`relative z-10 w-64 h-64 rounded-full flex flex-col items-center justify-center text-white font-bold text-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] cursor-pointer transform transition-all duration-100 ${state === 'penalty' ? 'bg-red-600 scale-90' : isTarget ? 'bg-green-500 scale-110' : 'bg-red-500'
                        }`}
                >
                    {state === 'penalty' ? 'MISS!' : isTarget ? 'CLICK!' : 'WAIT!'}
                </div>
            )}

            {state === 'done' && (
                <div className="text-center">
                    <div className="text-6xl font-black text-white mb-2 font-mono tracking-tighter">
                        {Math.round(times.reduce((a, b) => a + b, 0) / (times.length || 1))}<span className="text-2xl text-slate-500 ml-1">ms</span>
                    </div>
                    <p className="text-slate-400">Reaction Average</p>
                </div>
            )}
        </div>
    );
};

const ASRSQuestion = ({ question, options = ["Never", "Rarely", "Sometimes", "Often", "Very Often"], onSelect }) => {
    const [selected, setSelected] = useState(null);
    return (
        <div className="space-y-4">
            <h3 className="font-medium text-xl text-slate-200">{question}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setSelected(i);
                            onSelect(i);
                        }}
                        className={`relative z-10 cursor-pointer py-3 px-2 rounded-xl text-sm font-medium transition-all duration-300 border ${selected === i
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ContrastTest = ({ onComplete }) => {
    const [level, setLevel] = useState(1);
    const [targetNumber, setTargetNumber] = useState(8);

    // Dark Mode Contrast Levels (Text color getting closer to bg #111827)
    // Bg is slate-900 (#0f172a)
    // Level 1 (Easy): White (#ffffff)
    // Level 2 (Medium): #94a3b8 (Slate 400)
    // Level 3 (Hard): #475569 (Slate 600)
    // Level 4 (Harder): #334155 (Slate 700)
    // Level 5 (Impossible): #1e293b (Slate 800)

    const colors = ['#ffffff', '#94a3b8', '#475569', '#334155', '#1e293b'];

    const generateRound = useCallback(() => {
        const num = Math.floor(Math.random() * 9) + 1;
        setTargetNumber(num);
    }, []);

    const handleGuess = (guess) => {
        if (guess === targetNumber) {
            if (level < 5) {
                setLevel(l => l + 1);
                generateRound();
            } else {
                onComplete('Superior');
            }
        } else {
            const result = level === 1 ? 'Low' : level === 2 ? 'Below Average' : level === 3 ? 'Average' : 'High';
            onComplete(result);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="relative w-full h-40 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
                {/* Noisy texture overlay could make it harder/more realistic but let's stick to pure color diff */}
                <span
                    className="text-8xl font-bold select-none transition-colors duration-500"
                    style={{ color: colors[level - 1] }}
                >
                    {targetNumber}
                </span>
            </div>

            <div className="grid grid-cols-5 gap-2 w-full max-w-lg">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleGuess(num)}
                        className="relative z-10 cursor-pointer aspect-square rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-xl transition-all"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={() => handleGuess(-1)}
                    className="col-span-5 py-2 text-xs text-slate-500 hover:text-slate-300 uppercase tracking-widest mt-2"
                >
                    I can't see anything
                </button>
            </div>
        </div>
    );
};

const FocusScan = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    // Timer
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [wpm, setWpm] = useState(0);
    const textWordCount = 60;

    // Preferences
    const [measures, setMeasures] = useState({
        reaction: 0,
        crowding: 'standard',
        contrast: 'Pending',
        asrs: [0, 0] // Store index (0-4) for each question
    });

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => setElapsedTime(p => p + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const toggleTimer = () => {
        if (!isTimerRunning && elapsedTime === 0) {
            setIsTimerRunning(true);
        } else if (isTimerRunning) {
            setIsTimerRunning(false);
            const calculatedWpm = Math.round((textWordCount / elapsedTime) * 60);
            setWpm(calculatedWpm);
        }
    };

    const nextStep = () => {
        if (step < 5) {
            setStep(step + 1);
        } else {
            const reactionScore = Math.max(0, 100 - (measures.reaction / 10));
            const wpmScore = Math.min(100, (wpm / 300) * 100);

            // Calculate attention score from ASRS (higher selection = lower focus)
            const asrsAvg = measures.asrs.reduce((a, b) => a + b, 0) / (measures.asrs.length || 1);
            const attentionScore = Math.max(0, 100 - (asrsAvg * 25));

            const totalScore = Math.round((reactionScore + wpmScore + attentionScore) / 3) || 85;

            // Persist to local "database"
            storage.saveSession('focus-scan', totalScore, {
                wpm: wpm || 250,
                reactionTime: measures.reaction,
                contrast: measures.contrast,
                crowding: measures.crowding,
                attentionLevel: attentionScore
            });

            navigate('/test-results', {
                state: {
                    wpm: wpm || 250,
                    score: totalScore,
                    profile: {
                        type: measures.crowding === 'spaced' ? 'Visual Sensitivity' : 'Neuro-Typical',
                        needsFocusMode: measures.crowding === 'spaced'
                    },
                    measures // Pass all raw measures for detailed breakdown
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">

            {/* Immersive Header */}
            <div className={`relative w-full overflow-hidden transition-all duration-1000 ease-in-out pointer-events-none ${step > 0 ? 'h-[30vh]' : 'h-[50vh]'}`}>
                <div className="absolute inset-0 z-0">
                    <OpticNerveAnimation />
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 z-10"></div>

                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-20">
                    <button onClick={() => navigate('/dashboard')} className="pointer-events-auto p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors text-white cursor-pointer relative z-50">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-12 z-20 flex flex-col items-center justify-end pb-12 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-light text-white mb-4 tracking-tighter">
                            Focus <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Scan</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">
                            Calibrating neural interface for optimal cognitive performance.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-50 -mt-10 px-4 pb-20 pointer-events-auto">
                <AnimatePresence mode="wait">

                    {/* Step 0: ASRS */}
                    {step === 0 && (
                        <TestStep key="0" title="Attention Baseline" description="Do you often find yourself..." onNext={nextStep}>
                            <div className="flex flex-col gap-12">
                                <ASRSQuestion
                                    question="Having trouble waiting your turn in situations when turn-taking is required?"
                                    onSelect={(val) => setMeasures(p => ({ ...p, asrs: [val, p.asrs[1]] }))}
                                />
                                <ASRSQuestion
                                    question="Feeling distracted by activity or noise around you?"
                                    onSelect={(val) => setMeasures(p => ({ ...p, asrs: [p.asrs[0], val] }))}
                                />
                            </div>
                        </TestStep>
                    )}

                    {/* Step 1: Reading Speed */}
                    {step === 1 && (
                        <TestStep key="1" title="Processing Speed" description="Read the text below normally. Stop the timer when finished." onNext={nextStep}>
                            <div className="max-w-2xl mx-auto bg-slate-950/50 p-8 rounded-2xl border border-slate-800 leading-relaxed text-slate-300 text-lg font-serif">
                                <p className="mb-4">
                                    The concept of neuroplasticity suggests that the brain is not a static organ, but rather a dynamic web of connections that can be rewired through experience and focused attention.
                                </p>
                                <p>
                                    By engaging in specific cognitive exercises, individuals can strengthen neural pathways associated with focus, memory, and emotional regulation, effectively upgrading their own mental hardware over time.
                                </p>
                            </div>

                            <div className="flex flex-col items-center mt-8">
                                {!wpm ? (
                                    <button onClick={toggleTimer} className={`relative z-20 cursor-pointer flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg transition-all shadow-xl ${isTimerRunning ? 'bg-red-500/10 text-red-500 border border-red-500/50 animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/40'}`}>
                                        {isTimerRunning ? (
                                            <>Stop Timer <span className="font-mono ml-2">({elapsedTime}s)</span></>
                                        ) : (
                                            <><Play className="w-5 h-5 fill-current" /> Start Reading</>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center animate-fade-in-up">
                                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Measured Speed</div>
                                        <div className="text-6xl font-black text-white mb-2">{wpm} <span className="text-2xl text-slate-600">WPM</span></div>
                                    </div>
                                )}
                            </div>
                        </TestStep>
                    )}

                    {/* Step 2: Reaction */}
                    {step === 2 && (
                        <TestStep key="2" title="Inhibition Control" description="Tap GREEN only. Ignore RED." onNext={nextStep}>
                            <ReactionTimeTest onComplete={(score) => setMeasures(p => ({ ...p, reaction: score }))} />
                        </TestStep>
                    )}

                    {/* Step 3: Crowding */}
                    {step === 3 && (
                        <TestStep key="3" title="Visual Comfort" description="Which text block feels easier to read?" onNext={nextStep}>
                            <div className="grid md:grid-cols-2 gap-6 h-full items-stretch">
                                <button
                                    onClick={() => setMeasures(prev => ({ ...prev, crowding: 'tight' }))}
                                    className={`relative z-10 cursor-pointer p-8 border rounded-3xl text-left transition-all group ${measures.crowding === 'tight' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 font-bold group-hover:bg-slate-700">A</div>
                                    <h4 className="font-bold text-white mb-2">Standard Spacing</h4>
                                    <p className="text-slate-400 text-sm leading-snug">
                                        The quick brown fox jumps over the lazy dog. Visual crowding can occur when items are too close together, making it hard to identify individual letters.
                                    </p>
                                </button>
                                <button
                                    onClick={() => setMeasures(prev => ({ ...prev, crowding: 'spaced' }))}
                                    className={`relative z-10 cursor-pointer p-8 border rounded-3xl text-left transition-all group ${measures.crowding === 'spaced' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 font-bold group-hover:bg-slate-700">B</div>
                                    <h4 className="font-bold text-white mb-2">Expanded Spacing</h4>
                                    <p className="text-slate-400 text-sm leading-loose tracking-wide">
                                        The quick brown fox jumps over the lazy dog. Extra space can reduce the crowding effect and improve reading comfort for many people.
                                    </p>
                                </button>
                            </div>
                        </TestStep>
                    )}

                    {/* Step 4: Contrast */}
                    {step === 4 && (
                        <TestStep key="4" title="Contrast Sensitivity" description="Identify the numbers as they fade into the darkness." onNext={nextStep}>
                            {measures.contrast === 'Pending' ? (
                                <ContrastTest onComplete={(res) => setMeasures(p => ({ ...p, contrast: res }))} />
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-24 h-24 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-blue-400 animate-pulse">
                                        <Eye className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Scan Complete</h3>
                                    <p className="text-slate-400">Your eyes are <span className="text-blue-400 font-bold">{measures.contrast}</span> Sensitivity.</p>
                                </div>
                            )}
                        </TestStep>
                    )}

                    {/* Step 5: Complete */}
                    {step === 5 && (
                        <TestStep key="5" title="Calibration Finalized" description="Your cognitive profile is ready." onNext={nextStep} isLast>
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 rounded-full"></div>
                                    <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center mb-8 relative z-10 shadow-xl">
                                        <Check className="w-12 h-12 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-3xl font-bold text-white mb-4">You're All Set</h3>
                                <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                                    We have personalized the Reader and Dashboard based on your focus metrics.
                                </p>
                            </div>
                        </TestStep>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default FocusScan;
