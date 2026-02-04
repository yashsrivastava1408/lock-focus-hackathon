import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Instagram, Send } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-white dark:bg-slate-950 relative overflow-hidden pt-20 pb-8 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
            {/* Grid Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col justify-between min-h-[400px]">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                    {/* Left: Branding */}
                    <div className="max-w-2xl">
                        <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6 text-black dark:text-white">
                            Lock<br />
                            <span className="text-gray-200 dark:text-slate-800">Focus.</span>
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-md font-light">
                            Neuro-inclusive tools for the modern mind.
                            Reclaim your attention span, one session at a time.
                        </p>
                    </div>

                    {/* Right: Contact & Links */}
                    <div className="flex flex-col items-end gap-8 text-right">
                        <a href="mailto:hello@lockfocus.ai" className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white hover:text-primary transition-colors">
                            hello@lockfocus.ai
                        </a>

                        <div className="flex items-center gap-4">
                            {[Github, Linkedin, Twitter, Instagram].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-primary hover:border-primary dark:hover:text-white dark:hover:border-white transition-colors hover:scale-110"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>

                        <div className="flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Home</a>
                            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Science</a>
                            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">About</a>
                            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-100 dark:border-slate-800 mt-auto pt-8 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">
                    <div>
                        Based in <strong className="text-gray-800 dark:text-gray-200">Chennai, India</strong><br />
                        Operating Worldwide
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                        &copy; 2026 LockFocus AI. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
