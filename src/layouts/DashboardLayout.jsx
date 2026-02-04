import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Sun, Moon } from 'lucide-react';
import LockEyesAnimation from '../components/LockEyesAnimation';
import Footer from '../components/Footer';
import { useTheme } from '../components/ThemeContext';
import ProfileDropdown from '../components/ProfileDropdown';

const Navbar = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItemClass = (path, isLogout = false) => `
        text-sm font-medium transition-all duration-200 px-2 py-1 relative
        ${isLogout ? 'text-red-500 hover:text-red-600 ml-8' : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'}
        ${!isLogout && location.pathname === path ? 'text-black dark:text-white font-semibold' : ''}
    `;

    return (
        <nav className="w-full h-20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-[100] transition-colors duration-300">
            {/* BRANDING - Left Aligned */}
            <div className="flex items-center gap-8">
                <Link to="/dashboard" className="flex items-center gap-6 group">
                    {/* Compact Icon */}
                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <LockEyesAnimation className="w-full h-full" />
                    </div>
                    {/* Wordmark */}
                    <motion.span
                        layoutId="focus-text"
                        className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pl-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        FOCUS
                    </motion.span>
                </Link>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                {/* NAV ITEMS */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/dashboard" className={navItemClass('/dashboard')}>Dashboard</Link>
                    <Link to="/focus-scan" className={navItemClass('/focus-scan')}>Start Scan</Link>
                    <Link to="/reader" className={navItemClass('/reader')}>Reader</Link>
                    <a href="#progress" className={navItemClass('#progress')}>Progress</a>
                </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-6">

                {/* Search */}
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-blue-500/20 w-64 transition-all dark:text-white dark:placeholder-gray-500"
                    />
                </div>

                {/* Profile User */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold hover:ring-2 hover:ring-blue-500/20 transition-all"
                    >
                        A
                    </button>
                    <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
                </div>
            </div>
        </nav>
    );
};

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
            <Navbar />
            <main className="container mx-auto px-6 py-8 md:px-12 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default DashboardLayout;
