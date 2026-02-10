import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, RotateCcw, Play, Pencil, Music } from 'lucide-react';
import { storage } from '../utils/storage';

const ZenDrive = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState([]); // The path drawn by the user
    const [carPos, setCarPos] = useState(null);
    const [carAngle, setCarAngle] = useState(0);
    const [progress, setProgress] = useState(0); // Progress along the path [0, 1]
    const [isPlaying, setIsPlaying] = useState(false);
    const [distance, setDistance] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    // Canvas dimensions
    const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Drawing Game Logic
    const startDrawing = (e) => {
        if (isPlaying) return;
        setIsDrawing(true);
        const { x, y } = getPos(e);
        setPoints([{ x, y }]);
    };

    const draw = (e) => {
        if (!isDrawing || isPlaying) return;
        const { x, y } = getPos(e);

        // Only add point if it's far enough from the last one
        setPoints(prev => {
            const last = prev[prev.length - 1];
            const dist = Math.sqrt(Math.pow(x - last.x, 2) + Math.pow(y - last.y, 2));
            if (dist > 10) return [...prev, { x, y }];
            return prev;
        });
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (points.length > 5) {
            startCar();
        }
    };

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startCar = () => {
        setIsPlaying(true);
        setProgress(0);
        setCarPos(points[0]);
    };

    const reset = () => {
        setPoints([]);
        setCarPos(null);
        setIsPlaying(false);
        setProgress(0);
    };

    // Animation Loop
    useEffect(() => {
        if (!isPlaying || points.length < 2) return;

        let animationFrame;
        const speed = 0.005; // Adjust for smoothness

        const animate = () => {
            setProgress(prev => {
                const next = prev + speed;
                if (next >= 1) {
                    setIsPlaying(false);
                    const runScore = Math.round(points.length * 0.1);
                    setDistance(d => d + runScore);

                    // --- BACKEND INTEGRATION ---
                    try {
                        const user = JSON.parse(localStorage.getItem('currentUser'));
                        if (user && user.user_id) {
                            import('../services/api').then(m => {
                                m.api.submitScore(
                                    user.user_id,
                                    runScore,
                                    "ZenDrive",
                                    0,
                                    0,
                                    {}
                                ).then(res => console.log("ZenDrive Score Saved:", res));
                            });
                        }
                    } catch (e) { console.error("ZenDrive save error", e); }
                    // ---------------------------

                    return 1;
                }

                // Calculate position on the path
                const index = Math.floor(next * (points.length - 1));
                const subProgress = (next * (points.length - 1)) % 1;

                const p1 = points[index];
                const p2 = points[index + 1] || p1;

                const x = p1.x + (p2.x - p1.x) * subProgress;
                const y = p1.y + (p2.y - p1.y) * subProgress;

                // Calculate angle
                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                setCarAngle(angle);
                setCarPos({ x, y });

                return next;
            });
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying, points]);

    // Canvas Rendering
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, dims.w, dims.h);

        // Draw Paper Texture (Simulation)
        ctx.fillStyle = '#fdfcf0'; // Slightly yellowish paper
        ctx.fillRect(0, 0, dims.w, dims.h);

        // Draw grid lines (sketchbook style)
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i < dims.w; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, dims.h); ctx.stroke();
        }
        for (let i = 0; i < dims.h; i += 40) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(dims.w, i); ctx.stroke();
        }

        // Draw the Road (Doodle style)
        if (points.length > 1) {
            ctx.strokeStyle = '#5c4033'; // Dark brown/pencil color
            ctx.lineWidth = 25;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw outer stroke
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();

            // Draw inner dashed line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw Start/Finish indicators
        if (points.length > 0) {
            ctx.fillStyle = '#4caf50';
            ctx.beginPath(); ctx.arc(points[0].x, points[0].y, 10, 0, Math.PI * 2); ctx.fill();

            if (points.length > 1) {
                const end = points[points.length - 1];
                ctx.fillStyle = '#f44336';
                ctx.beginPath(); ctx.arc(end.x, end.y, 10, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Draw the Car
        if (carPos) {
            ctx.save();
            ctx.translate(carPos.x, carPos.y);
            ctx.rotate(carAngle);

            // Simple Doodle Car
            ctx.fillStyle = '#2196f3';
            ctx.fillRect(-15, -8, 30, 16);
            ctx.fillStyle = '#1976d2';
            ctx.fillRect(0, -6, 12, 12);

            // Wheels
            ctx.fillStyle = '#000';
            ctx.fillRect(-12, -10, 6, 4);
            ctx.fillRect(6, -10, 6, 4);
            ctx.fillRect(-12, 6, 6, 4);
            ctx.fillRect(6, 6, 6, 4);

            ctx.restore();
        }
    }, [points, carPos, carAngle, dims]);

    return (
        <div className="h-screen w-full bg-[#fdfcf0] overflow-hidden relative select-none font-sans">
            {/* HUD */}
            <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
                <button
                    onClick={() => navigate('/stress-dashboard')}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm hover:scale-105 transition-all text-gray-600 pointer-events-auto"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Masterpieces</span>
                    <span className="text-2xl font-black text-gray-900 leading-none">{distance}</span>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <button
                        onClick={reset}
                        className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm hover:scale-105 transition-all text-gray-600"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm hover:scale-105 transition-all text-gray-600"
                    >
                        <Info size={20} />
                    </button>
                </div>
            </nav>

            {/* Canvas Area */}
            <canvas
                ref={canvasRef}
                width={dims.w}
                height={dims.h}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair block"
            />

            {/* Instructions */}
            {!isPlaying && points.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 backdrop-blur-lg p-8 rounded-[3rem] border-2 border-dashed border-gray-300 flex flex-col items-center gap-4 shadow-xl"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <Pencil size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tighter italic">Doodle Your Road</h2>
                        <p className="text-sm text-gray-500 font-medium text-center">Draw a creative path from start to finish.<br />The car will follow your imagination.</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase mt-2">Tap and Drag to Draw</p>
                    </motion.div>
                </div>
            )}

            {/* Ambient Sound Icon */}
            <div className="fixed bottom-8 left-8 flex items-center gap-3 text-gray-400/60">
                <Music size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider italic">Paper & Pencil Ambient</span>
            </div>

            {/* Custom Cursor Overlay */}
            {isDrawing && (
                <div className="pointer-events-none fixed inset-0 z-10" />
            )}
        </div>
    );
};

export default ZenDrive;
