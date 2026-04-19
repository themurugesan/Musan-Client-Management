import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FolderKanban, Globe, Sun, Moon, LogOut, Menu } from 'lucide-react';

export default function Layout({ children, darkMode, toggleDarkMode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // To highlight active menu

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { name: 'Active Projects', path: '/dashboard', icon: FolderKanban },
        { name: 'Reachout Tracker', path: '/reachout', icon: Globe }
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-musan-light dark:bg-slate-900 font-['Plus_Jakarta_Sans',sans-serif] transition-colors">

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* ── Sidebar (Left 20%) ── */}
            <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 md:w-1/5 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-slate-700 shrink-0">
                    <FolderKanban className="text-musan-primary mr-3" size={30} />
                    <h1 className="text-2xl font-extrabold tracking-tight text-musan-dark dark:text-white">
                        <span className="text-musan-primary">Musan</span>CRM
                    </h1>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => { navigate(item.path); setIsMobileOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive ? 'bg-musan-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                            >
                                <Icon size={20} /> {item.name}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 space-y-2 shrink-0">
                    <button onClick={toggleDarkMode} className="w-full flex items-center justify-between px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg font-semibold transition-colors">
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-semibold transition-colors">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content (Right 80%) ── */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between h-16 bg-white dark:bg-slate-800 px-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
                    <button onClick={() => setIsMobileOpen(true)} className="text-gray-600 dark:text-gray-300 p-1">
                        <Menu size={28} />
                    </button>
                    <span className="font-extrabold text-xl text-musan-primary">MusanCRM</span>
                    <div className="w-8" /> {/* Spacer */}
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-slate-900/50 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}