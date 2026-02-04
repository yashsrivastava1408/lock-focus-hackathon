import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LockConstellationAnimation = () => {
    // 1. Static Body Nodes (The Base)
    const bodyNodes = [
        { x: 50, y: 80 }, { x: 100, y: 80 }, { x: 150, y: 80 }, // Top
        { x: 150, y: 120 }, { x: 150, y: 160 }, // Right
        { x: 100, y: 160 }, { x: 50, y: 160 }, { x: 50, y: 120 } // Bottom & Left
    ];

    // 2. Keyhole Nodes (Center)
    const keyholeNodes = [
        { x: 100, y: 110 }, // Top
        { x: 110, y: 120 }, { x: 105, y: 135 }, // Right side
        { x: 95, y: 135 }, { x: 90, y: 120 } // Left side & Bottom
    ];

    // 3. Shackle Nodes (Dynamic: Open -> Closed)
    // We define the "Closed" positions. 
    // For "Open", we'll shift the left side UP and rotate slightly in the animation prop.
    const shackleNodesBase = [
        { x: 50, y: 80 }, { x: 50, y: 50 }, { x: 50, y: 30 }, // Left Up
        { x: 70, y: 15 }, { x: 100, y: 15 }, { x: 130, y: 15 }, // Arch Top
        { x: 150, y: 30 }, { x: 150, y: 50 }, { x: 150, y: 80 } // Right Down
    ];

    // Helper to generate Star Entry variants
    const starEntry = (i) => ({
        hidden: {
            x: Math.random() * 800 - 400,
            y: Math.random() * 800 - 400,
            opacity: 0,
            scale: 0
        },
        visible: {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1.5,
                delay: i * 0.05,
                type: "spring",
                stiffness: 40
            }
        }
    });

    const shackleVariants = {
        open: { y: -30, x: 20, rotate: 15, opacity: 1 },
        closed: {
            y: 0, x: 0, rotate: 0, opacity: 1,
            transition: { duration: 0.8, ease: "backOut", delay: 2.5 } // Lock after stars form
        }
    };

    return (
        <div className="relative w-72 h-72 flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible">

                {/* A. Thick Greyish Cover (Body) - Fades in */}
                <motion.rect
                    x="40" y="70" width="120" height="100" rx="15"
                    fill="white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 1, delay: 1 }}
                />

                {/* B. Thick Shackle Arch (Synced with Shackle Nodes) */}
                <motion.path
                    d="M50 80 V50 C50 20 150 20 150 50 V80"
                    fill="none"
                    stroke="white" strokeWidth="16" strokeOpacity="0.1"
                    strokeLinecap="round"
                    initial="open"
                    animate="closed"
                    variants={shackleVariants}
                />

                {/* C. Body Nodes & Lines */}
                <motion.g initial="hidden" animate="visible">
                    {/* Lines */}
                    <motion.path
                        d="M50 80 H150 V160 H50 V80 Z"
                        stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: 1 }}
                    />

                    {/* Keyhole Lines */}
                    <motion.path
                        d="M100 110 L110 120 L105 135 H95 L90 120 Z"
                        stroke="white" strokeWidth="1" strokeOpacity="0.5" fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                    />

                    {/* Nodes */}
                    {[...bodyNodes, ...keyholeNodes].map((node, i) => (
                        <motion.circle
                            key={`b-node-${i}`}
                            cx={node.x} cy={node.y} r={1.5}
                            fill="white"
                            variants={starEntry(i)}
                        />
                    ))}
                </motion.g>

                {/* D. Shackle Nodes & Lines (Animated Group) */}
                <motion.g
                    initial="open"
                    animate="closed"
                    variants={shackleVariants}
                >
                    {/* Shackle Line */}
                    <motion.path
                        d="M50 80 V50 C50 20 75 15 100 15 C125 15 150 20 150 50 V80"
                        stroke="white" strokeWidth="1" strokeOpacity="0.5" fill="none"
                    />

                    {shackleNodesBase.map((node, i) => (
                        <motion.circle
                            key={`s-node-${i}`}
                            cx={node.x} cy={node.y} r={2}
                            fill="white"
                            className="shadow-[0_0_10px_white]"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + (i * 0.05) }}
                        />
                    ))}
                </motion.g>

            </svg>
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
                        <LockConstellationAnimation />
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
