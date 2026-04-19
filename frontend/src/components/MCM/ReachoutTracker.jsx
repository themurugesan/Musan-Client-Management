import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Send, Clock, Globe, Link as LinkIcon, Activity, Pencil, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

const PLATFORMS = ['WhatsApp', 'Phone Call', 'Email', 'LinkedIn', 'Instagram', 'Facebook', 'Google Maps', 'Freelancer.com', 'Upwork', 'Referral'];
const STATUS_OPTIONS = ['Pending', 'Completed', 'Failed'];

export default function ReachoutTracker() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editAttempt, setEditAttempt] = useState(null);

    const [platformSelect, setPlatformSelect] = useState('LinkedIn');
    const [customPlatform, setCustomPlatform] = useState('');
    const [contactDetail, setContactDetail] = useState('');
    const [status, setStatus] = useState('Pending');

    // --- NEW: Toast & Modal State ---
    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    const [attemptToDelete, setAttemptToDelete] = useState(null);

    // Helper to show Tailwind Toast
    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast({ message: '', type: '', visible: false }), 3000);
    };

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const res = await axiosInstance.get('/reachouts');
                setAttempts(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAttempts();
    }, []);

    const openEdit = (attempt) => {
        setEditAttempt(attempt);
        const isStandard = PLATFORMS.includes(attempt.platform);
        setPlatformSelect(isStandard ? attempt.platform : 'Other');
        setCustomPlatform(isStandard ? '' : attempt.platform);
        setContactDetail(attempt.contactDetail);
        setStatus(attempt.status);
    };

    const cancelEdit = () => {
        setEditAttempt(null);
        setPlatformSelect('LinkedIn');
        setCustomPlatform('');
        setContactDetail('');
        setStatus('Pending');
    };

    // --- NEW: Custom Delete Logic ---
    const confirmDelete = (id) => {
        setAttemptToDelete(id); // Opens the confirmation modal
    };

    const executeDelete = async () => {
        if (!attemptToDelete) return;
        try {
            await axiosInstance.delete(`/reachouts/${attemptToDelete}`);
            setAttempts(prev => prev.filter(a => a._id !== attemptToDelete));
            if (editAttempt?._id === attemptToDelete) cancelEdit();
            showToast("Attempt deleted successfully!", "success");
        } catch (err) {
            showToast("Failed to delete attempt.", "error");
        } finally {
            setAttemptToDelete(null); // Close modal
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalPlatform = platformSelect === 'Other' ? customPlatform : platformSelect;
        if (!finalPlatform.trim() || !contactDetail.trim() || !status.trim()) return;

        setSubmitting(true);
        try {
            const payload = { platform: finalPlatform, contactDetail, status };

            if (editAttempt) {
                const res = await axiosInstance.put(`/reachouts/${editAttempt._id}`, payload);
                setAttempts(prev => prev.map(a => a._id === res.data._id ? res.data : a));
                showToast("Attempt updated successfully!", "success");
            } else {
                const res = await axiosInstance.post('/reachouts', payload);
                setAttempts([res.data, ...attempts]);
                showToast("Reachout logged successfully!", "success");
            }

            cancelEdit();
        } catch (err) {
            showToast(editAttempt ? "Failed to update attempt." : "Failed to log attempt.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadgeColor = (statusText) => {
        switch (statusText) {
            case 'Completed': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-500/50';
            case 'Failed': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-500/50';
            default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600';
        }
    };

    return (
        <div className="h-full flex flex-col relative">

            {/* --- TAILWIND TOAST NOTIFICATION --- */}
            {toast.visible && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl font-bold text-white flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${toast.type === 'error' ? 'bg-red-500' : 'bg-musan-primary'}`}>
                    {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    {toast.message}
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {attemptToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Attempt?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">This action cannot be undone. Are you sure you want to remove this log?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setAttemptToDelete(null)} className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                Cancel
                            </button>
                            <button onClick={executeDelete} className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow-md transition-colors">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mb-6 shrink-0">
                <Globe className="text-musan-primary" size={28} />
                <h2 className="text-2xl md:text-3xl font-bold text-musan-dark dark:text-white">Reachout Tracker</h2>
            </div>

            <form onSubmit={handleSubmit} className={`mb-6 p-4 md:p-6 rounded-2xl shadow-sm border transition-all shrink-0 ${editAttempt ? 'bg-musan-light/50 dark:bg-musan-primary/10 border-musan-primary' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>

                {editAttempt && (
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
                        <span className="text-sm font-bold text-musan-primary">Editing Attempt</span>
                        <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Source / Platform</label>
                        <select value={platformSelect} onChange={(e) => setPlatformSelect(e.target.value)} className="px-4 py-2.5 rounded-lg border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-musan-primary outline-none cursor-pointer">
                            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}<option value="Other">Other...</option>
                        </select>
                        {platformSelect === 'Other' && <input type="text" placeholder="Custom platform..." value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)} className="px-4 py-2.5 mt-1 rounded-lg border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-musan-primary outline-none" required />}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Detail / Link</label>
                        <div className="relative">
                            <LinkIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input type="text" placeholder="e.g. Profile URL" value={contactDetail} onChange={(e) => setContactDetail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-musan-primary outline-none" required />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action Taken</label>
                        <div className="relative">
                            <Activity size={16} className="absolute left-3 top-3 text-gray-400" />
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-musan-primary outline-none cursor-pointer">
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    {editAttempt && (
                        <button type="button" onClick={cancelEdit} className="px-5 py-2.5 rounded-lg border dark:border-slate-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            Cancel
                        </button>
                    )}
                    <button type="submit" disabled={submitting} className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-musan-primary hover:bg-musan-accent text-white font-bold shadow-md flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-60">
                        <Send size={18} /> {submitting ? 'Saving...' : editAttempt ? 'Update Attempt' : 'Log Attempt'}
                    </button>
                </div>
            </form>

            <div className="space-y-3 overflow-y-auto pb-6 custom-scrollbar pr-2">
                {loading ? (
                    <p className="text-musan-primary animate-pulse text-center font-bold mt-10">Loading history...</p>
                ) : attempts.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 dark:text-slate-500">
                        <Globe size={48} className="mx-auto mb-4 opacity-40" />
                        <p className="text-lg font-medium">No reachout attempts logged yet. Time to hunt for clients!</p>
                    </div>
                ) : (
                    attempts.map((attempt) => (
                        <div key={attempt._id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 truncate">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-musan-light dark:bg-musan-primary/20 text-musan-primary dark:text-purple-300 border border-musan-primary/30 w-max">
                                    {attempt.platform}
                                </span>
                                <a href={attempt.contactDetail.startsWith('http') ? attempt.contactDetail : '#'} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 dark:text-white truncate hover:underline hover:text-musan-accent transition-colors">
                                    {attempt.contactDetail}
                                </a>
                            </div>

                            <div className="flex justify-between md:justify-end items-center gap-4 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-none border-gray-100 dark:border-slate-700">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusBadgeColor(attempt.status)}`}>
                                    {attempt.status}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-md shrink-0">
                                    <Clock size={12} /> {new Date(attempt.createdAt).toLocaleDateString()}
                                </div>

                                {/* Edit and Delete Actions */}
                                <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button onClick={() => openEdit(attempt)} className="p-1.5 text-gray-400 hover:text-musan-primary dark:hover:text-musan-accent rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" title="Edit">
                                        <Pencil size={15} />
                                    </button>
                                    {/* --- NEW: Triggers the confirmDelete modal --- */}
                                    <button onClick={() => confirmDelete(attempt._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}