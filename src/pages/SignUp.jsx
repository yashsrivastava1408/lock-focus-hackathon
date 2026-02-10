import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Zap } from 'lucide-react';
import { api } from '../services/api';

const SignUp = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const fullName = formData.get('fullName');
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            // 1. Register User
            await api.register(email, password, fullName);

            // 2. Auto Login
            const userData = await api.login(email, password);

            // 3. Save Session
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // 4. Redirect
            navigate('/home');
        } catch (error) {
            console.error("Signup failed", error);
            alert("Registration Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0f172a]">
            {/* --- Animated Background --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
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
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mb-6 shadow-lg shadow-purple-500/30"
                        >
                            <User className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
                        <p className="text-purple-200/80">Unlock your focus potential today.</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-5">
                        <div className="space-y-4">
                            <div className="group relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    name="fullName"
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-purple-200/30 outline-none focus:bg-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            <div className="group relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-purple-200/30 outline-none focus:bg-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                                    placeholder="Email address"
                                    required
                                />
                            </div>
                            <div className="group relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-purple-200/30 outline-none focus:bg-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl py-4 font-bold tracking-wide shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                                <>
                                    Get Started <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-purple-200/40">
                        Already have an account? <Link to="/" className="text-white font-bold hover:text-purple-300 transition-colors">Sign In</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUp;
