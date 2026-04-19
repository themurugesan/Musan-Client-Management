import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, User, Lock, ArrowRight, FolderKanban } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

export default function Login({ setToken, darkMode, toggleDarkMode }) {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Ensure your backend is running on port 5000
            const res = await axiosInstance.post('/login', form);
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-musan-light dark:bg-slate-900 transition-colors overflow-hidden">

            {/* ── LEFT SIDE: Lightweight Animated CSS Background ── */}
            {/* Swapped hardcoded hex for bg-musan-dark */}
            <div className="hidden lg:flex w-1/2 relative bg-musan-dark flex-col justify-center items-center">

                {/* Animated Glowing Blobs using Theme Colors */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-musan-primary/40 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-musan-accent/30 rounded-full mix-blend-screen filter blur-[150px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
                <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-musan-light/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>

                {/* Subtle Dot Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

                {/* Glassmorphism Branding Overlay */}
                <div className="z-10 text-center backdrop-blur-md bg-white/5 p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-5 bg-musan-primary/20 rounded-2xl shadow-[0_0_30px_rgba(93,63,211,0.4)]">
                            <FolderKanban className="text-white" size={64} />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
                        Musan<span className="text-transparent bg-clip-text bg-gradient-to-r from-musan-accent to-musan-light">CRM</span>
                    </h1>
                    <p className="text-lg text-gray-300 font-medium max-w-sm mx-auto leading-relaxed">
                        Elevate your freelance workflow. Manage clients, track projects, and scale your business effortlessly.
                    </p>
                </div>
            </div>

            {/* ── RIGHT SIDE: Functional Login Form ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="absolute top-8 right-8 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 p-2.5 rounded-full transition-all"
                    aria-label="Toggle Dark Mode"
                >
                    {darkMode ? <Sun size={22} /> : <Moon size={22} />}
                </button>

                <div className="w-full max-w-md">
                    {/* Mobile Branding (Hidden on Desktop) */}
                    <div className="text-center mb-10 lg:hidden">
                        <FolderKanban className="text-musan-primary mx-auto mb-3" size={48} />
                        <h2 className="text-4xl font-black text-musan-dark dark:text-white">MusanCRM</h2>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-musan-primary/5 border border-gray-100 dark:border-slate-700 transition-colors">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Enter your admin credentials to access the portal.</p>

                        <form onSubmit={handleLogin} className="space-y-6">

                            {/* Error Message Display */}
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm font-bold text-red-500 text-center animate-pulse">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="admin"
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-musan-primary bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white outline-none transition-all font-medium"
                                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-musan-primary bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white outline-none transition-all font-medium"
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-musan-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-musan-accent transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-musan-primary/30"
                            >
                                {loading ? 'Authenticating...' : 'Access Dashboard'}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm font-medium text-gray-400 mt-8">
                        Secure Authentication Pipeline
                    </p>
                </div>
            </div>
        </div>
    );
}