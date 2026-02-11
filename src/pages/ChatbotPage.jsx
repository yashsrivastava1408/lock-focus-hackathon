import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Brain,
    Sparkles,
    Loader2,
    RotateCcw,
    History,
    Trash2,
    CheckCircle2,
    Calendar,
    MessageSquare
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ChatMessage from '../components/ChatMessage';
import TaskSidebar from '../components/TaskSidebar';
import ChatInput from '../components/ChatInput';
import chatbotAPI from '../utils/chatbot-api';

const ChatbotPage = () => {
    const [messages, setMessages] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [sessionId, setSessionId] = useState(() => {
        const savedSession = localStorage.getItem('adhd_chatbot_current_session_id');
        return savedSession || `session_${Date.now()}`;
    });
    const messagesEndRef = useRef(null);
    const scrollAreaRef = useRef(null);

    // Initial load
    useEffect(() => {
        const savedMessages = localStorage.getItem('adhd_chatbot_messages');
        const savedTasks = localStorage.getItem('adhd_chatbot_tasks');
        const savedHistory = localStorage.getItem('adhd_chatbot_history');

        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) { console.error(e); }
        } else {
            setMessages([{
                id: 'welcome',
                text: "Hey there! 👋 I'm your ADHD support companion. I'm here to help you manage tasks, understand ADHD better, and provide coping strategies.\n\nTell me what's on your mind, or share your to-do list and I'll help you prioritize! 😊",
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
        }

        if (savedTasks) {
            try { setTasks(JSON.parse(savedTasks)); } catch (e) { console.error(e); }
        }

        if (savedHistory) {
            try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
        }
    }, []);

    // Persistence
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('adhd_chatbot_messages', JSON.stringify(messages));
        }
        localStorage.setItem('adhd_chatbot_current_session_id', sessionId);
    }, [messages, sessionId]);

    useEffect(() => {
        localStorage.setItem('adhd_chatbot_tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('adhd_chatbot_history', JSON.stringify(history));
    }, [history]);

    // Scroll to bottom (Fixed: Only scroll container, not window)
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current;
            // Immediate scroll for new messages to prevent "jumpiness"
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = async (messageText) => {
        const userMsg = {
            id: `msg_${Date.now()}`,
            text: messageText,
            isUser: true,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await chatbotAPI.sendMessage(messageText, sessionId);
            const botMsg = {
                id: `msg_${Date.now()}_bot`,
                text: response.response,
                isUser: false,
                timestamp: new Date().toISOString(),
                action: response.action,
                ruleTriggered: response.ruleTriggered
            };
            setMessages(prev => [...prev, botMsg]);

            if (response.tasks && response.tasks.length > 0) {
                setTasks(prev => {
                    const existingTexts = new Set(prev.map(t => t.text.toLowerCase()));
                    const newTasks = response.tasks.filter(t => !existingTexts.has(t.text.toLowerCase()));
                    return [...prev, ...newTasks];
                });
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: `msg_${Date.now()}_error`,
                text: "I'm having a little trouble connecting. Please check if the backend is running! 💙",
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaskToggle = (taskId) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    };

    const handleResetSession = () => {
        if (window.confirm('Start a fresh session? Current chat will be saved to history.')) {
            // Archive current session
            const sessionTitle = messages.find(m => m.isUser)?.text.slice(0, 30) + '...' || 'New Session';
            const newHistoryItem = {
                id: sessionId,
                title: sessionTitle,
                date: new Date().toISOString(),
                messages: messages,
                tasks: tasks
            };

            setHistory(prev => [newHistoryItem, ...prev]);

            // Reset
            setMessages([{
                id: 'welcome',
                text: "Fresh start! 🌟 What's on your mind now?",
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
            setTasks([]);
            const newId = `session_${Date.now()}`;
            setSessionId(newId);

            localStorage.removeItem('adhd_chatbot_messages');
            localStorage.removeItem('adhd_chatbot_tasks');
        }
    };

    const loadHistorySession = (session) => {
        if (window.confirm('Load this session? Current unsaved progress will be lost.')) {
            setMessages(session.messages);
            setTasks(session.tasks);
            setSessionId(session.id);
            setShowHistory(false);
        }
    };

    const deleteHistoryItem = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this history item?')) {
            setHistory(prev => prev.filter(item => item.id !== id));
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-background to-background dark:from-amber-900/20 dark:via-background dark:to-background">
                <div className="h-screen flex flex-col relative overflow-hidden">

                    {/* Header */}
                    <div className="glass-card border-b border-white/10 px-6 py-4 z-20">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/adhd-dashboard" className="p-2 glass rounded-xl hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-foreground">ADHD Support</h1>
                                        <p className="text-xs text-muted-foreground">External Executive Function 🧠</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-amber-500 text-white' : 'glass text-muted-foreground hover:text-foreground'}`}
                                    title="View History"
                                >
                                    <History className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleResetSession}
                                    className="p-2 glass rounded-xl hover:scale-105 transition-all text-muted-foreground hover:text-orange-500"
                                    title="Reset Session"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* App Content */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* History Overlay */}
                        <AnimatePresence>
                            {showHistory && (
                                <motion.div
                                    initial={{ x: -320 }}
                                    animate={{ x: 0 }}
                                    exit={{ x: -320 }}
                                    className="absolute left-0 top-[73px] bottom-0 w-80 glass-card border-r border-white/10 z-30 shadow-2xl p-4 flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="font-bold flex items-center gap-2">
                                            <History className="w-4 h-4 text-amber-500" />
                                            Past Sessions
                                        </h2>
                                        <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground">
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                        {history.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground text-sm">
                                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                No saved history yet
                                            </div>
                                        ) : (
                                            history.map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => loadHistorySession(item)}
                                                    className="glass-card p-3 rounded-xl border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(item.date).toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            onClick={(e) => deleteHistoryItem(item.id, e)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-medium line-clamp-2 text-foreground/80">{item.title}</p>
                                                    <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="w-2.5 h-2.5" />
                                                            {item.messages.length}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                            {item.tasks.length}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex-1 overflow-y-auto px-6 py-6" ref={scrollAreaRef}>
                                <div className="max-w-3xl mx-auto">
                                    <div className="space-y-6">
                                        {messages.map((message) => (
                                            <ChatMessage
                                                key={message.id}
                                                message={message.text}
                                                isUser={message.isUser}
                                                timestamp={message.timestamp}
                                            />
                                        ))}

                                        {isLoading && (
                                            <div className="flex gap-3 mb-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                                    <Brain className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="glass-card border border-white/10 rounded-2xl px-4 py-3">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                                        <span>Processing...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
                                <div className="max-w-3xl mx-auto">
                                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                                        History is saved locally. Resetting creates a new archive entry.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Task Sidebar */}
                        <div className="hidden lg:block w-80 border-l border-white/10">
                            <TaskSidebar tasks={tasks} onTaskToggle={handleTaskToggle} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChatbotPage;
