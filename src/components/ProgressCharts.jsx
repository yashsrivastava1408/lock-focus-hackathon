import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, Zap, Eye, MousePointer } from 'lucide-react';

const Card = ({ children, className = "", title, headerAction }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm dark:shadow-none transition-colors duration-300 flex flex-col ${className}`}>
        <div className="flex justify-between items-center mb-6">
            {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>}
            {headerAction}
        </div>
        <div className="flex-1 min-h-0">
            {children}
        </div>
    </div>
);

const LineChart = () => {
    // Revised Data & Paths
    const trackingData = [50, 55, 65, 75];
    const peripheralData = [30, 35, 33, 45];
    const reactionData = [70, 65, 72, 85];

    // Smooth Path Generator (Catmull-Rom logic simplified for fixed points)
    // Points are spread across 0 to 100% width
    const generateSmoothPath = (data) => {
        // Mapping X to 0-100 range for SVG viewbox 0 0 100 100
        // Data is Y (0-100), we need to invert for SVG (100-Y)
        // X points: 0, 33.3, 66.6, 100
        const points = data.map((y, i) => [i * 33.33, 100 - y]);

        let path = `M ${points[0][0]} ${points[0][1]}`;

        // Simple smoothing using cubic bezier between points
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            // Control points for smooth curve
            const cp1x = p0[0] + (p1[0] - p0[0]) / 2;
            const cp1y = p0[1];
            const cp2x = p1[0] - (p1[0] - p0[0]) / 2;
            const cp2y = p1[1];

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1[0]} ${p1[1]}`;
        }
        return path;
    };

    const generateAreaPath = (data) => {
        return `${generateSmoothPath(data)} V 100 H 0 Z`;
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* 1. Chart Area (Fixed Height, improved padding) */}
            <div className="relative h-64 w-full pl-8 pr-2 pt-6">

                {/* Y-Axis Labels (Moved Inside/Padded) */}
                <div className="absolute left-0 top-6 bottom-0 flex flex-col justify-between text-xs text-gray-400 dark:text-slate-500 font-medium h-full pb-6">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 pl-8 pb-6 flex flex-col justify-between pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-full border-t border-gray-100 dark:border-slate-800/60 dashed-line"></div>
                    ))}
                </div>

                {/* The Chart SVG */}
                <svg className="w-full h-full overflow-visible pb-6" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradientTeal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3" /><stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" /></linearGradient>
                        <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" /><stop offset="100%" stopColor="#4ade80" stopOpacity="0" /></linearGradient>
                        <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" /><stop offset="100%" stopColor="#60a5fa" stopOpacity="0" /></linearGradient>
                    </defs>

                    {/* Reaction (Blue) */}
                    <motion.path d={generateAreaPath(reactionData)} fill="url(#gradientBlue)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
                    <motion.path d={generateSmoothPath(reactionData)} fill="none" stroke="#60a5fa" strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />

                    {/* Peripheral (Green) */}
                    <motion.path d={generateAreaPath(peripheralData)} fill="url(#gradientGreen)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                    <motion.path d={generateSmoothPath(peripheralData)} fill="none" stroke="#4ade80" strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }} />

                    {/* Tracking (Teal) */}
                    <motion.path d={generateAreaPath(trackingData)} fill="url(#gradientTeal)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} />
                    <motion.path d={generateSmoothPath(trackingData)} fill="none" stroke="#2dd4bf" strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }} />

                    {/* Dots for Tracking */}
                    {trackingData.map((val, i) => (
                        <motion.circle
                            key={i}
                            cx={i * 33.33}
                            cy={100 - val}
                            r="1.5"
                            className="fill-white dark:fill-slate-900 stroke-teal-500"
                            strokeWidth="0.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.5 + (i * 0.1) }}
                        />
                    ))}
                </svg>

                {/* X-Axis Labels */}
                <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 dark:text-slate-500 font-medium">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                </div>
            </div>

            {/* 2. New Stats / Details Section (Utilizing the empty space) */}
            <div className="flex-1 mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-slate-800 pt-4">
                <div className="flex flex-col items-center justify-center p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg. Reaction</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">280ms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-green-50/50 dark:bg-green-900/10 rounded-xl">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Focus Score</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">92%</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total XP</span>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">12,450</span>
                </div>
            </div>
        </div>
    );
};

const BarChart = () => (
    <div className="h-48 relative w-full pt-4 group flex flex-col justify-end">
        {/* Grid Lines */}
        {[0, 25, 50, 75, 100].map((val, i) => (
            <div key={i} className="absolute w-full border-t border-gray-100 dark:border-slate-800 transition-colors z-0" style={{ bottom: `${val}%`, left: 0 }}>
            </div>
        ))}

        <div className="flex items-end justify-between gap-2 z-10 h-full">
            {[
                { d: 'Mon', v: 40 }, { d: 'Tue', v: 25 }, { d: 'Wed', v: 60 },
                { d: 'Thu', v: 45 }, { d: 'Fri', v: 80 }, { d: 'Sat', v: 20 }, { d: 'Sun', v: 50 }
            ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.v}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="w-full max-w-[40px] bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-lg opacity-90 group-hover:opacity-100 transition-all relative hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-20">
                            {item.v * 10} XP
                        </div>
                    </motion.div>
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{item.d}</span>
                </div>
            ))}
        </div>
    </div>
);

const HeatMap = () => (
    <div className="grid grid-cols-7 gap-1.5 ">
        {Array.from({ length: 28 }).map((_, i) => {
            const opacity = Math.random() > 0.3 ? `opacity-${[20, 40, 60, 80, 100][Math.floor(Math.random() * 5)]}` : 'opacity-10';
            // Simulating random activity shades
            const isActive = Math.random() > 0.5;

            return (
                <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`aspect-square rounded-sm ${isActive ? 'bg-teal-400' : 'bg-gray-100 dark:bg-slate-800'} ${isActive ? `opacity-${Math.floor(Math.random() * 4 + 2) * 25}` : ''}`}
                />
            )
        })}
    </div>
);

const CircularProgress = ({ value = 77 }) => (
    <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
        <svg className="w-full h-full -rotate-90">
            {/* Background Track */}
            <circle cx="64" cy="64" r="56" fill="none" className="stroke-gray-100 dark:stroke-slate-800 transition-colors" strokeWidth="12" />
            <motion.circle
                cx="64" cy="64" r="56" fill="none" stroke="#2dd4bf" strokeWidth="12" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: value / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeDasharray="1 1"
            />
        </svg>
        <div className="absolute text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{value}</div>
            <div className="text-[10px] text-gray-400 dark:text-slate-400 uppercase tracking-wider">out of 100</div>
        </div>
    </div>
);

const QuickStat = ({ icon: Icon, value, label, colorClass, bgClass }) => (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-3xl flex items-center gap-4 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className={`p-3 rounded-2xl ${bgClass} ${colorClass}`}><Icon size={20} /></div>
        <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
        </div>
    </div>
);

const ProgressCharts = () => {
    return (
        <div id="progress" className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Your Progress</h2>
                    <p className="text-gray-500 dark:text-slate-400">Track your vision improvement journey over time</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-teal-500/20">
                        <option>Last 30 Days</option>
                        <option>This Week</option>
                        <option>All Time</option>
                    </select>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStat icon={Calendar} value="22" label="Sessions This Month" colorClass="text-teal-600 dark:text-teal-400" bgClass="bg-teal-50 dark:bg-slate-800" />
                <QuickStat icon={Clock} value="5h 32m" label="Total Training Time" colorClass="text-green-600 dark:text-green-400" bgClass="bg-green-50 dark:bg-slate-800" />
                <QuickStat icon={TrendingUp} value="+18%" label="Overall Improvement" colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-50 dark:bg-slate-800" />
                <QuickStat icon={Zap} value="2,850" label="Total XP Earned" colorClass="text-yellow-600 dark:text-yellow-400" bgClass="bg-yellow-50 dark:bg-slate-800" />
            </div>

            {/* Main Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Monthly Progress (Line Chart) */}
                <div className="col-span-1 lg:col-span-8">
                    <Card title="Monthly Skill Progress" className="h-full min-h-[400px]">
                        <LineChart />
                    </Card>
                </div>

                {/* Right Column Mix */}
                <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                    <Card title="Activity Heatmap" className="flex-1">
                        <HeatMap />
                        <div className="flex justify-between items-center mt-6 text-xs text-gray-400 dark:text-slate-500">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-gray-100 dark:bg-slate-800 rounded-sm"></div>
                                <div className="w-3 h-3 bg-teal-900/20 dark:bg-teal-900 rounded-sm"></div>
                                <div className="w-3 h-3 bg-teal-700/40 dark:bg-teal-700 rounded-sm"></div>
                                <div className="w-3 h-3 bg-teal-500/60 dark:bg-teal-500 rounded-sm"></div>
                                <div className="w-3 h-3 bg-teal-400 rounded-sm"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </Card>

                    <Card title="Overall Score" className="flex-1">
                        <CircularProgress />
                        <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-4">You're in the top 25% of users!</p>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="col-span-1 lg:col-span-8">
                    <Card title="XP Earned This Week" className="h-full">
                        <BarChart />
                    </Card>
                </div>

                <div className="col-span-1 lg:col-span-4">
                    <Card title="Skill Breakdown" className="h-full">
                        <div className="space-y-6 pt-2">
                            {[
                                { l: 'Eye Tracking', v: 78, i: '12%', c: 'bg-teal-500', ic: Eye },
                                { l: 'Peripheral Vision', v: 73, i: '8%', c: 'bg-green-500', ic: Eye },
                                { l: 'Reaction Time', v: 82, i: '15%', c: 'bg-blue-500', ic: MousePointer },
                                { l: 'Cognitive Speed', v: 75, i: '10%', c: 'bg-indigo-500', ic: Zap },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-slate-300 mb-2">
                                        <div className="flex items-center gap-2">
                                            <s.ic size={14} className="text-gray-400 dark:text-slate-500" />
                                            {s.l}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white transition-colors">{s.v}</span>
                                            <span className="text-green-600 dark:text-green-400 text-xs">↗ {s.i}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.v}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                            className={`h-full ${s.c} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default ProgressCharts;
