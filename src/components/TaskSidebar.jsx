import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, Clock, Zap } from 'lucide-react';

const TaskSidebar = ({ tasks, onTaskToggle }) => {
    const priorityConfig = {
        urgent: {
            color: 'red',
            icon: AlertCircle,
            label: 'Urgent',
            bgClass: 'bg-red-100 dark:bg-red-900/20',
            textClass: 'text-red-600 dark:text-red-400',
            borderClass: 'border-red-200 dark:border-red-800'
        },
        high: {
            color: 'orange',
            icon: Zap,
            label: 'High Priority',
            bgClass: 'bg-orange-100 dark:bg-orange-900/20',
            textClass: 'text-orange-600 dark:text-orange-400',
            borderClass: 'border-orange-200 dark:border-orange-800'
        },
        medium: {
            color: 'yellow',
            icon: Clock,
            label: 'Medium Priority',
            bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
            textClass: 'text-yellow-600 dark:text-yellow-400',
            borderClass: 'border-yellow-200 dark:border-yellow-800'
        },
        low: {
            color: 'green',
            icon: Circle,
            label: 'Low Priority',
            bgClass: 'bg-green-100 dark:bg-green-900/20',
            textClass: 'text-green-600 dark:text-green-400',
            borderClass: 'border-green-200 dark:border-green-800'
        }
    };

    // Group tasks by priority
    const groupedTasks = {
        urgent: tasks.filter(t => t.priority === 'urgent'),
        high: tasks.filter(t => t.priority === 'high'),
        medium: tasks.filter(t => t.priority === 'medium'),
        low: tasks.filter(t => t.priority === 'low')
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;

    return (
        <div className="w-80 h-full glass-card border-l border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-foreground mb-2">Task List</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                        />
                    </div>
                    <span className="font-medium">{completedTasks}/{totalTasks}</span>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {totalTasks === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No tasks yet!</p>
                        <p className="text-xs mt-1">Tell me what you need to do 😊</p>
                    </div>
                ) : (
                    Object.entries(groupedTasks).map(([priority, taskList]) => {
                        if (taskList.length === 0) return null;

                        const config = priorityConfig[priority];
                        const Icon = config.icon;

                        return (
                            <div key={priority} className="space-y-2">
                                {/* Priority Header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className={`w-4 h-4 ${config.textClass}`} />
                                    <span className={`text-xs font-bold uppercase tracking-wide ${config.textClass}`}>
                                        {config.label}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.bgClass} ${config.textClass}`}>
                                        {taskList.length}
                                    </span>
                                </div>

                                {/* Tasks */}
                                {taskList.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-3 rounded-xl border ${config.borderClass} ${config.bgClass} cursor-pointer hover:scale-[1.02] transition-transform`}
                                        onClick={() => onTaskToggle(task.id)}
                                    >
                                        <div className="flex items-start gap-2">
                                            {task.completed ? (
                                                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.textClass}`} />
                                            ) : (
                                                <Circle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.textClass}`} />
                                            )}
                                            <span className={`text-sm flex-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
                                                {task.text}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TaskSidebar;
