import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LockEyesAnimation = () => {
    return (
        <div className="relative w-72 h-72 flex items-center justify-center">

            {/* Lock Shape - Thicker Stroke */}
            <svg
                width="100%" height="100%" viewBox="0 0 200 200" fill="none"
                className="absolute inset-0 z-0 opacity-10"
            >
                {/* Lock Body */}
                <motion.rect
                    x="50" y="80" width="100" height="80" rx="10"
                    stroke="white" strokeWidth="8" // Thicker stroke
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                {/* Lock Shackle */}
                <motion.path
                    d="M70 80 V50 A30 30 0 0 1 130 50 V80"
                    stroke="white" strokeWidth="8" // Thicker stroke
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                />
            </svg>

            {/* Eyes & Specs Container */}
            <div className="absolute inset-0 flex items-center justify-center gap-12 z-10 transition-all duration-1000">

                {/* Left Eye Complex */}
                <div className="relative">
                    {/* Spectacle Frame (Circle) */}
                    <div className="w-24 h-24 rounded-full border-4 border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-10 box-border"></div>

                    {/* The Eye */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center relative shadow-sm border border-gray-100 z-20">
                        <motion.div
                            className="w-full h-full bg-white absolute top-0 left-0 z-30 origin-top rounded-full"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: [0, 1, 0, 1, 0] }} // Blink logic
                            transition={{ duration: 4, times: [0, 0.05, 0.1, 0.15, 0.2], repeat: Infinity, repeatDelay: 3 }}
                        ></motion.div>
                        <div className="w-6 h-6 bg-black rounded-full z-20"></div>
                    </div>
                </div>

                {/* Right Eye Complex */}
                <div className="relative">
                    {/* Spectacle Frame */}
                    <div className="w-24 h-24 rounded-full border-4 border-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-10 box-border"></div>

                    {/* The Eye */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center relative shadow-sm border border-gray-100 z-20">
                        <motion.div
                            className="w-full h-full bg-white absolute top-0 left-0 z-30 origin-top rounded-full"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: [0, 1, 0, 1, 0] }} // Blink
                            transition={{ duration: 4, times: [0, 0.05, 0.1, 0.15, 0.2], repeat: Infinity, repeatDelay: 3 }}
                        ></motion.div>
                        <div className="w-6 h-6 bg-black rounded-full z-20"></div>
                    </div>
                </div>

                {/* Spectacle Bridge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-white z-10 mt-[-4px]"></div>
            </div>

        </div>
    );
};

const Intro = ({ onComplete }) => {
    const [text, setText] = useState('');
    const [isFadingOut, setIsFadingOut] = useState(false);
    const fullText = "Lock Your FOCUS";

    useEffect(() => {
        // Sequence
        let timer1 = setTimeout(() => {
            let i = 0;
            const typeInterval = setInterval(() => {
                setText(fullText.slice(0, i + 1));
                i++;
                if (i === fullText.length) clearInterval(typeInterval);
            }, 100);
        }, 1000);

        // Trigger Fade Out slightly before complete
        let timerFade = setTimeout(() => {
            setIsFadingOut(true);
        }, 4000);

        let timerComplete = setTimeout(() => {
            onComplete();
        }, 5500); // Extended time for fade out

        return () => {
            clearTimeout(timer1);
            clearTimeout(timerFade);
            clearTimeout(timerComplete);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isFadingOut ? (
                <motion.div
                    key="intro-container"
                    className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center gap-8"
                    exit={{ opacity: 0 }} // Corrected: AnimatePresence handles component removal
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                    <div className="scale-125">
                        <LockEyesAnimation />
                    </div>

                    <h1 className="text-4xl font-light tracking-widest font-sans h-12 flex items-center gap-2 text-white mt-8">
                        <span>{text.replace("FOCUS", "")}</span>
                        {text.includes("FOCUS") && (
                            <motion.span
                                layoutId="focus-text"
                                className="font-bold"
                            >
                                FOCUS
                            </motion.span>
                        )}
                    </h1>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

export default Intro;
