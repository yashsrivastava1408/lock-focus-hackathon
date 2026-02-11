import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Activity } from 'lucide-react';
import { api } from '../services/api';

const LeaderboardWidget = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const data = await api.getLeaderboard();
                setLeaders(data);
            } catch (err) {
                console.error("Failed to load leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
        // Refresh every 30s for "live" feel
        const interval = setInterval(fetchLeaders, 30000);
        return () => clearInterval(interval);
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />;
        if (index === 1) return <Medal className="w-5 h-5 text-slate-300 fill-slate-300/20" />;
        if (index === 2) return <Medal className="w-5 h-5 text-amber-600 fill-amber-600/20" />;
        return <span className="text-sm font-bold text-slate-500 w-5 text-center">{index + 1}</span>;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 shadow-xl shadow-blue-900/5 h-full flex flex-col relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Elite</h3>
                        <p className="text-xs text-slate-500 font-medium">Top Performers this Week</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-3">
                {loading ? (
                    // Skeleton Loading
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    ))
                ) : leaders.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No scores yet. Be the first! 🚀
                    </div>
                ) : (
                    leaders.slice(0, 3).map((player, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${index === 0
                                ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20'
                                : 'bg-slate-50 dark:bg-slate-800/30 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}>
                                    {getRankIcon(index)}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {player.name}
                                        {index === 0 && <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-500 text-white">#1</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                                        {player.game} • Lvl {player.level}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                                    {player.score.toLocaleString()}
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase">XP</div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Fade effect at bottom of list */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-20" />
        </div>
    );
};

export default LeaderboardWidget;
