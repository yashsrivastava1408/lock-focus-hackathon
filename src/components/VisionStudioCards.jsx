import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Book, Target, Activity, Check, ArrowRight, Eye } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

const VisionCard = ({ title, description, icon: Icon, to, colorClass, active, onClick, delay }) => {
    return (
        <Link to={to} onClick={onClick} className="block group">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay, ease: "easeOut" }}
                className={`
                    relative overflow-hidden rounded-[2rem] p-6 h-full border transition-all duration-300
                    ${active
                        ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-1'}
                `}
            >
                {/* Background gradient splash */}
                <div className={`
                    absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-10
                `} />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110
                            ${active ? 'bg-blue-600 text-white' : `bg-gray-50 dark:bg-slate-800 ${colorClass.replace('bg-', 'text-').replace('/10', '')}`}
                        `}>
                            <Icon size={24} />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                            {title}
                        </h3>

                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                            {description}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                            {active ? 'Active' : 'Enable'}
                        </span>
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center transition-all
                            ${active ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-slate-700 group-hover:text-gray-900 dark:group-hover:text-white'}
                        `}>
                            {active ? <Check size={14} /> : <ArrowRight size={14} />}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

const VisionStudioCards = () => {
    const { accessibilityMode } = useTheme();

    const features = [
        {
            id: 'adhd',
            title: 'ADHD Mode',
            description: 'Reduces distractions and improves focus consistency.',
            icon: Zap,
            to: '/adhd-dashboard',
            colorClass: 'bg-orange-500',
            active: accessibilityMode === 'adhd'
        },
        {
            id: 'dyslexia',
            title: 'Dyslexia Mode',
            description: 'Specialized fonts and spacing for easier reading.',
            icon: Book,
            to: '/dyslexia-dashboard',
            colorClass: 'bg-green-500',
            active: accessibilityMode === 'dyslexia'
        },
        {
            id: 'peripheral',
            title: 'Peripheral',
            description: 'Expand your visual field awareness training.',
            icon: Target,
            to: '/peripheral-vision',
            colorClass: 'bg-red-500',
            active: false
        },
        {
            id: 'stress',
            title: 'Stress Relief',
            description: 'Calming visuals to lower cognitive load.',
            icon: Activity,
            to: '/stress-dashboard',
            colorClass: 'bg-pink-500',
            active: accessibilityMode === 'stress'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
                <VisionCard
                    key={feature.id}
                    {...feature}
                    delay={0.1 * index}
                    onClick={() => { }}
                />
            ))}
        </div>
    );
};

export default VisionStudioCards;
