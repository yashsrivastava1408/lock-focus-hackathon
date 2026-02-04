import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Settings, Type, AlignLeft, Eye, EyeOff,
    Maximize2, Minimize2, Bold, Italic, Minus, Plus,
    PlayCircle, PauseCircle, Download, Monitor, Move
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Reader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { content, settings: importedSettings, fileName } = location.state || {};

    const [text, setText] = useState(content || "Welcome to your focused reading space.\n\nType or paste content here. Use the tools on the right to customize your experience. Enabling 'Focus Mode' will dim distractions, while 'Zen Mode' removes all UI for pure immersion.\n\nTry adjusting the font to 'Dyslexic' or increasing the line height to see how it affects your reading speed.");

    // Core Settings
    const [settings, setSettings] = useState({
        fontSize: 20,
        lineHeight: 1.8,
        letterSpacing: 0.5,
        maxWidth: 700,
        font: 'inter', // inter, serif, mono, dyslexic
        theme: 'dark', // dark, warm, light
        ...importedSettings
    });

    // States
    const [isZenMode, setIsZenMode] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showToolbar, setShowToolbar] = useState(true);

    // Font Options
    const fonts = [
        { id: 'inter', name: 'Sans', family: 'Inter, sans-serif' },
        { id: 'serif', name: 'Serif', family: 'Merriweather, serif' },
        { id: 'mono', name: 'Mono', family: 'JetBrains Mono, monospace' },
        { id: 'dyslexic', name: 'Dyslexic', family: 'OpenDyslexic, sans-serif' }
    ];

    // Theme Styles
    const themes = {
        dark: { bg: 'bg-slate-950', text: 'text-slate-300', accent: 'text-blue-400', selection: 'selection:bg-blue-500/30' },
        warm: { bg: 'bg-stone-900', text: 'text-stone-300', accent: 'text-amber-400', selection: 'selection:bg-amber-500/30' },
        light: { bg: 'bg-white', text: 'text-slate-800', accent: 'text-blue-600', selection: 'selection:bg-blue-200' }
    };
    const currentTheme = themes[settings.theme];

    // Speech Synthesis
    useEffect(() => {
        window.speechSynthesis.cancel();
    }, []);

    const toggleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.metaKey && e.key === 'Enter') setIsZenMode(p => !p);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className={`min-h-screen transition-colors duration-700 ${currentTheme.bg} ${currentTheme.selection} flex flex-col items-center relative overflow-hidden`}>

            {/* Ambient Background Glow (Dark Mode Only) */}
            {settings.theme !== 'light' && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]"></div>
                </div>
            )}

            {/* Top Bar - Hidden in Zen Mode */}
            <AnimatePresence>
                {!isZenMode && (
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 w-full z-40 px-6 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-full transition-colors ${settings.theme === 'light' ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-400'}`}>
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <span className={`font-medium tracking-tight ${currentTheme.text} opacity-50`}>
                                {fileName || 'Untitled Draft'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Theme Toggles */}
                            <div className={`flex p-1 rounded-full mr-4 ${settings.theme === 'light' ? 'bg-slate-100' : 'bg-white/5'}`}>
                                {Object.keys(themes).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSettings(p => ({ ...p, theme: t }))}
                                        className={`w-6 h-6 rounded-full transition-all ${settings.theme === t ? 'scale-110 shadow-sm ring-2 ring-emerald-500/50' : 'opacity-40 hover:opacity-100'}`}
                                        style={{ backgroundColor: t === 'light' ? '#e2e8f0' : t === 'warm' ? '#44403c' : '#0f172a' }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setIsZenMode(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${settings.theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                            >
                                <Maximize2 className="w-4 h-4" />
                                Zen Mode
                            </button>
                            <button
                                onClick={() => setShowToolbar(p => !p)}
                                className={`p-2 rounded-full transition-colors ${showToolbar ? (settings.theme === 'light' ? 'bg-slate-200 text-slate-900' : 'bg-white/20 text-white') : (settings.theme === 'light' ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-500')}`}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Main Editor Area */}
            <main
                className={`flex-1 w-full transition-all duration-500 pt-32 pb-32 px-6 overflow-y-auto no-scrollbar`}
                style={{
                    maxWidth: settings.maxWidth,
                }}
            >
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={`w-full h-[80vh] bg-transparent outline-none resize-none transition-all duration-300 ${currentTheme.text} placeholder:opacity-20`}
                    style={{
                        fontSize: `${settings.fontSize}px`,
                        lineHeight: settings.lineHeight,
                        letterSpacing: `${settings.letterSpacing}px`,
                        fontFamily: fonts.find(f => f.id === settings.font)?.family,
                        opacity: isFocusMode ? 0.8 : 1
                    }}
                    placeholder="Start typing..."
                    spellCheck="false"
                />
            </main>

            {/* Floating Toolbar - Right Side */}
            <AnimatePresence>
                {showToolbar && !isZenMode && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ spring: { stiffness: 300, damping: 30 } }}
                        className={`fixed right-8 top-1/2 -translate-y-1/2 w-72 backdrop-blur-xl border shadow-2xl rounded-3xl p-6 z-50 ${settings.theme === 'light' ? 'bg-white/80 border-slate-200 shadow-slate-200/50' : 'bg-slate-900/80 border-slate-800 shadow-black/50'}`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-xs font-bold uppercase tracking-widest ${currentTheme.text} opacity-50`}>Reading Tools</h3>
                            <button onClick={() => setShowToolbar(false)} className={`p-1 rounded-full hover:bg-white/10 ${currentTheme.text} opacity-50 hover:opacity-100 transition-opacity`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Font Family */}
                            <div className="grid grid-cols-4 gap-2">
                                {fonts.map(font => (
                                    <button
                                        key={font.id}
                                        onClick={() => setSettings(p => ({ ...p, font: font.id }))}
                                        className={`h-10 rounded-lg text-xs font-medium transition-all ${settings.font === font.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : `${settings.theme === 'light' ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}`}
                                    >
                                        {font.name}
                                    </button>
                                ))}
                            </div>

                            {/* Size & Spacing */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Type className={`w-4 h-4 ${currentTheme.text} opacity-50`} />
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSettings(p => ({ ...p, fontSize: Math.max(12, p.fontSize - 1) }))} className={`p-1 rounded hover:bg-white/10 ${currentTheme.text}`}><Minus className="w-4 h-4" /></button>
                                        <span className={`text-sm font-bold w-8 text-center ${currentTheme.text}`}>{settings.fontSize}</span>
                                        <button onClick={() => setSettings(p => ({ ...p, fontSize: Math.min(48, p.fontSize + 1) }))} className={`p-1 rounded hover:bg-white/10 ${currentTheme.text}`}><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <AlignLeft className={`w-4 h-4 ${currentTheme.text} opacity-50`} />
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSettings(p => ({ ...p, lineHeight: Math.max(1, p.lineHeight - 0.1) }))} className={`p-1 rounded hover:bg-white/10 ${currentTheme.text}`}><Minus className="w-4 h-4" /></button>
                                        <span className={`text-sm font-bold w-8 text-center ${currentTheme.text}`}>{settings.lineHeight.toFixed(1)}</span>
                                        <button onClick={() => setSettings(p => ({ ...p, lineHeight: Math.min(3, p.lineHeight + 0.1) }))} className={`p-1 rounded hover:bg-white/10 ${currentTheme.text}`}><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Width Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs opacity-50">
                                    <span className={currentTheme.text}>Narrow</span>
                                    <span className={currentTheme.text}>Wide</span>
                                </div>
                                <input
                                    type="range" min="400" max="1400" step="50"
                                    value={settings.maxWidth}
                                    onChange={(e) => setSettings(p => ({ ...p, maxWidth: Number(e.target.value) }))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            <div className={`h-px w-full ${settings.theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}></div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsFocusMode(p => !p)}
                                    className={`py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${isFocusMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : `${settings.theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}`}
                                >
                                    {isFocusMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    <span className="text-xs font-bold">Focus</span>
                                </button>
                                <button
                                    onClick={toggleSpeak}
                                    className={`py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${isSpeaking ? 'bg-green-600 text-white animate-pulse' : `${settings.theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}`}
                                >
                                    {isSpeaking ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                    <span className="text-xs font-bold">Read</span>
                                </button>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Zen Mode Escape Hint */}
            <AnimatePresence>
                {isZenMode && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 0.3, y: 0 }}
                        whileHover={{ opacity: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={() => setIsZenMode(false)}
                        className="fixed bottom-8 right-8 p-3 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20 transition-all"
                    >
                        <Minimize2 className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Reader;
