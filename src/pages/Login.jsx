import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Activity, Zap } from 'lucide-react';
import { api } from '../services/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userData = await api.login(email, password);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            navigate('/home');
        } catch (err) {
            alert("Login Failed: Invalid credentials or Server Offline");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0f172a]">
            {/* --- Animated Background --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000"></div>
                <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px] mix-blend-screen"></div>
            </div>

            {/* --- Grid Pattern Overlay --- */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* --- Glass Card --- */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-8 overflow-hidden relative">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/30"
                        >
                            <Zap className="w-8 h-8 text-white fill-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-blue-200/80">Enter the flow state.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-5">
                            <div className="group relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-blue-200/30 outline-none focus:bg-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                                    required
                                />
                            </div>
                            <div className="group relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-blue-200/30 outline-none focus:bg-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-blue-200/60 hover:text-blue-200 transition-colors">
                                <input type="checkbox" className="rounded bg-white/10 border-white/20 text-blue-500 focus:ring-offset-0 focus:ring-blue-500/50" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</a>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-4 font-bold tracking-wide shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-blue-200/40">
                        Don't have an account? <Link to="/signup" className="font-bold text-white hover:text-blue-300 transition-colors">Create Account</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
