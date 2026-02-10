import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Moon, Bell, Volume2, Shield, HelpCircle,
    LogOut, ChevronRight, Award, Zap, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useTheme } from '../components/ThemeContext';

const UserProfile = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState({
        full_name: "Guest User",
        email: "guest@example.com",
        initials: "GU"
    });

    // Mock Stats - In a real app, fetch these from backend
    const stats = {
        xp: 2850,
        streak: 12,
        badges: 15,
        memberSince: "Oct 2024"
    };

    const [settings, setSettings] = useState({
        darkMode: theme === 'dark',
        notifications: true,
        sound: true
    });

    useEffect(() => {
        // Load User Data
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser({
                ...parsed,
                initials: parsed.full_name ? parsed.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "GU"
            });
        }
    }, []);

    const handleToggle = (key) => {
        if (key === 'darkMode') {
            toggleTheme();
        }
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSignOut = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.removeItem('currentUser');
            navigate('/login');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-md mx-auto">
                {/* PROFILE CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                    {/* Header */}
                    <div className="p-8 pb-6 flex flex-col items-center text-center bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-600">
                                    {user.initials}
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full"></div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.full_name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Vision training since {stats.memberSince}</p>

                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            <Calendar size={12} /> Member for 4 months
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 border-y border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800">
                        <div className="p-4 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="text-xl font-black text-gray-900 dark:text-white mb-1">{stats.xp.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total XP</div>
                        </div>
                        <div className="p-4 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="text-xl font-black text-gray-900 dark:text-white mb-1">{stats.streak}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Day Streak</div>
                        </div>
                        <div className="p-4 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="text-xl font-black text-gray-900 dark:text-white mb-1">{stats.badges}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Badges</div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-4 space-y-2">
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">General</div>

                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <Moon size={18} />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
                            </div>
                            <button
                                onClick={() => handleToggle('darkMode')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.darkMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                                    <Bell size={18} />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Push Notifications</span>
                            </div>
                            <button
                                onClick={() => handleToggle('notifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.notifications ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Sound Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                                    <Volume2 size={18} />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Sound Effects</span>
                            </div>
                            <button
                                onClick={() => handleToggle('sound')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.sound ? 'bg-cyan-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.sound ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                        {/* Privacy Link */}
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    <Shield size={18} />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Privacy & Security</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                        </button>

                        {/* Help Link */}
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    <HelpCircle size={18} />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Help & Support</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                        </button>
                    </div>

                    {/* Footer Sign Out */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={handleSignOut}
                            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>

                </motion.div>

                <p className="text-center text-xs text-gray-400 mt-6">Lock Focus v2.4.0 • Build 8921</p>
            </div>
        </DashboardLayout>
    );
};

export default UserProfile;
