import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { api } from '../services/api';

// Using simple Lock icon here, but in real app could reuse the Logo component
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500">Unlock your focus potential today.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input name="fullName" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="John Doe" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="hello@example.com" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input name="password" type="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="••••••••" required />
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex justify-center items-center">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/" className="text-primary font-bold hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
