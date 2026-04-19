import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { FolderKanban, Plus, Clock, IndianRupee, X, Pencil, Trash2, ImagePlus, UserCircle, MapPin, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

const DEFAULT_CONTACT_TYPES = ['Email', 'Mobile', 'WhatsApp', 'LinkedIn'];

// ADDED paymentType and subscriptionCycle to default state
const EMPTY_FORM = {
    clientName: '', projectName: '', status: 'Pending', budget: '',
    paymentType: 'One-Time', subscriptionCycle: 'Monthly', deadline: '',
    contacts: [{ contactType: 'Email', customType: '', value: '', hasReachedOut: false }],
    address: '', notes: '', images: []
};

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [viewProject, setViewProject] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [error, setError] = useState('');

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast({ message: '', type: '', visible: false }), 3000);
    };

    const fetchProjects = async () => {
        try {
            const res = await axiosInstance.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    const confirmDelete = (id) => setProjectToDelete(id);

    const executeDelete = async () => {
        if (!projectToDelete) return;
        try {
            await axiosInstance.delete(`/projects/${projectToDelete}`);
            setProjects(prev => prev.filter(p => p._id !== projectToDelete));
            showToast("Project and all attached images deleted!", "success");
        } catch (err) {
            showToast("Failed to delete project.", "error");
        } finally {
            setProjectToDelete(null);
        }
    };

    const openCreate = () => {
        setEditProject(null);
        setForm(EMPTY_FORM);
        setError('');
        setModalOpen(true);
    };

    const openEdit = (project) => {
        setEditProject(project);
        const mappedContacts = project.contacts?.length ? project.contacts.map(c => {
            const isStandard = DEFAULT_CONTACT_TYPES.includes(c.contactType);
            return {
                contactType: isStandard ? c.contactType : 'Other',
                customType: isStandard ? '' : c.contactType,
                value: c.value || '',
                hasReachedOut: c.hasReachedOut || false
            };
        }) : [{ contactType: 'Email', customType: '', value: '', hasReachedOut: false }];

        setForm({
            clientName: project.clientName || '', projectName: project.projectName || '',
            status: project.status || 'Pending', budget: project.budget ?? '',
            paymentType: project.paymentType || 'One-Time', // NEW
            subscriptionCycle: project.subscriptionCycle || 'Monthly', // NEW
            deadline: project.deadline ? project.deadline.split('T')[0] : '',
            contacts: mappedContacts, address: project.address || '',
            notes: project.notes || '', images: project.images || []
        });
        setError('');
        setModalOpen(true);
    };

    const handleView = (project) => setViewProject(project);

    const handleContactChange = (index, field, val) => {
        const newContacts = [...form.contacts];
        newContacts[index][field] = val;
        setForm({ ...form, contacts: newContacts });
    };

    const addContactRow = () => setForm({ ...form, contacts: [...form.contacts, { contactType: 'WhatsApp', customType: '', value: '', hasReachedOut: false }] });
    const removeContactRow = (index) => setForm({ ...form, contacts: form.contacts.filter((_, i) => i !== index) });

    const handleImageUpload = (e) => {
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setForm(prev => ({ ...prev, images: [...prev.images, reader.result] }));
        });
    };

    const removeImage = (indexToRemove) => setForm(prev => ({ ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.clientName.trim() || !form.projectName.trim()) return setError('Required fields missing.');
        setSaving(true); setError('');

        const payloadToSave = {
            ...form,
            contacts: form.contacts.map(c => ({
                contactType: c.contactType === 'Other' ? (c.customType || 'Other') : c.contactType,
                value: c.value,
                hasReachedOut: c.hasReachedOut
            }))
        };

        try {
            if (editProject) {
                const res = await axiosInstance.put(`/projects/${editProject._id}`, payloadToSave);
                setProjects(prev => prev.map(p => p._id === res.data._id ? res.data : p));
                showToast("Project updated successfully!", "success");
            } else {
                const res = await axiosInstance.post('/projects', payloadToSave);
                setProjects([res.data, ...projects]);
                showToast("New project created!", "success");
            }
            setModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
            showToast("Failed to save project.", "error");
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'In Progress') return 'bg-musan-light border-musan-primary text-musan-primary dark:bg-musan-primary/20 dark:text-purple-300 border border-musan-primary/30';
        if (status === 'Completed') return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 border';
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-gray-300 border';
    };

    return (
        <div className="h-full flex flex-col relative">
            {toast.visible && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl font-bold text-white flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${toast.type === 'error' ? 'bg-red-500' : 'bg-musan-primary'}`}>
                    {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    {toast.message}
                </div>
            )}

            {projectToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Project?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">This will permanently delete the project and all attached Cloudinary images. This action cannot be undone.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setProjectToDelete(null)} className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                            <button onClick={executeDelete} className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow-md transition-colors">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-musan-dark dark:text-white">Active Projects</h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Manage client deliverables.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-musan-primary hover:bg-musan-accent text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-bold shadow-md transition-transform active:scale-95">
                    <Plus size={20} /> <span className="hidden sm:inline">New Project</span>
                </button>
            </div>

            {loading ? (
                <div className="text-xl font-bold text-musan-primary animate-pulse text-center mt-20">Loading Projects...</div>
            ) : projects.length === 0 ? (
                <div className="text-center py-24 text-gray-400 dark:text-slate-500">
                    <FolderKanban size={56} className="mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">No projects yet. Create one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 pr-2 overflow-y-auto custom-scrollbar">
                    {projects.map((project) => (
                        <div key={project._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 flex flex-col h-full group transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-musan-dark dark:text-white truncate pr-4">{project.clientName}</h3>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.status)}`}>{project.status}</span>
                                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleView(project)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/30 transition-colors" title="View Details"><Eye size={15} /></button>
                                        <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg text-gray-400 hover:text-musan-primary hover:bg-musan-light dark:hover:text-musan-accent dark:hover:bg-slate-700 transition-colors" title="Edit"><Pencil size={15} /></button>
                                        <button onClick={() => confirmDelete(project._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 font-medium mb-4 flex-grow">{project.projectName}</p>

                            <div className="mb-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                {project.contacts?.length > 0 && (
                                    <div className="flex items-center gap-2 truncate">
                                        {project.contacts[0].hasReachedOut ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : <UserCircle size={16} className="text-musan-accent shrink-0" />}
                                        <span><strong>{project.contacts[0].contactType}: </strong>{project.contacts[0].value}</span>
                                    </div>
                                )}
                                {project.address && <div className="flex items-center gap-2"><MapPin size={16} className="text-musan-accent shrink-0" /><span>Location Saved</span></div>}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <IndianRupee size={16} className="text-musan-accent dark:text-purple-400" />
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{project.budget || '0'}</span>
                                    {/* PAYMENT CYCLE UI INDICATOR */}
                                    <span className="text-xs">
                                        {project.paymentType === 'Subscription' ? `/ ${project.subscriptionCycle}` : '(One-Time)'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5"><Clock size={16} className="text-gray-400 dark:text-gray-500" /><span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No date'}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewProject && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto transform transition-all flex flex-col">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-slate-700 z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-bold text-musan-dark dark:text-white">Project Overview</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(viewProject.status)}`}>{viewProject.status}</span>
                            </div>
                            <button onClick={() => setViewProject(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-slate-700 p-1.5 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 dark:bg-slate-700/30 p-5 rounded-xl border border-gray-100 dark:border-slate-700">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Client Name</p>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white truncate">{viewProject.clientName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Project Name</p>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white truncate">{viewProject.projectName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Budget / Payment</p>
                                    <p className="text-lg font-extrabold text-musan-primary flex items-center">
                                        <IndianRupee size={18} className="mr-1" /> {viewProject.budget || '0'}
                                    </p>
                                    {/* SHOW PAYMENT TYPE IN MODAL */}
                                    <p className="text-xs font-bold text-gray-500 mt-0.5">
                                        {viewProject.paymentType === 'Subscription' ? `Billed ${viewProject.subscriptionCycle}` : 'One-Time Payment'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center"><Clock size={18} className="mr-1.5 text-gray-400" /> {viewProject.deadline ? new Date(viewProject.deadline).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            {/* Contacts & Notes Sections Remain Unchanged */}
                            {viewProject.contacts && viewProject.contacts.length > 0 && (
                                <div>
                                    <h4 className="text-md font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2"><UserCircle size={18} className="text-musan-primary" /> Client Contacts</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {viewProject.contacts.map((contact, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm">
                                                <div className="flex items-center gap-3 truncate">
                                                    {contact.hasReachedOut ? <CheckCircle2 className="text-green-500 shrink-0" size={18} /> : <UserCircle className="text-gray-400 shrink-0" size={18} />}
                                                    <div className="truncate">
                                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">{contact.contactType}</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contact.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-md font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-slate-700 pb-2">Notes & Requirements</h4>
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600 min-h-[160px] whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {viewProject.notes || <span className="text-gray-400 italic">No notes added.</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-md font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2"><MapPin size={18} className="text-musan-primary" /> Saved Location</h4>
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-xl border border-gray-100 dark:border-slate-600 min-h-[160px] flex items-center justify-center overflow-hidden relative">
                                        {viewProject.address ? (
                                            <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-[142px] [&>iframe]:rounded-lg" dangerouslySetInnerHTML={{ __html: viewProject.address }} />
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">No map data available.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {viewProject.images && viewProject.images.length > 0 && (
                                <div>
                                    <h4 className="text-md font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2"><ImagePlus size={18} className="text-musan-primary" /> Assets & Screenshots</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {viewProject.images.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block relative group w-32 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 shadow-sm cursor-pointer bg-gray-50 dark:bg-slate-700">
                                                <img src={img} alt={`Asset ${i}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto transform transition-all">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-slate-700 z-10">
                            <h3 className="text-xl font-bold text-musan-dark dark:text-white">{editProject ? 'Edit Project Details' : 'New Project Setup'}</h3>
                            <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-slate-700 p-1.5 rounded-lg"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="px-6 py-6 space-y-6">
                            {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16} /> {error}</p>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
                                    <input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-musan-primary transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                                    <input type="text" value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-musan-primary transition-all" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-musan-primary transition-all cursor-pointer">
                                        <option>Pending</option><option>In Progress</option><option>Completed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Payment Type</label>
                                    <select value={form.paymentType} onChange={e => setForm({ ...form, paymentType: e.target.value })} className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-musan-primary transition-all cursor-pointer">
                                        <option value="One-Time">One-Time</option>
                                        <option value="Subscription">Subscription</option>
                                    </select>
                                </div>

                                {form.paymentType === 'Subscription' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Billing Cycle</label>
                                        <select value={form.subscriptionCycle} onChange={e => setForm({ ...form, subscriptionCycle: e.target.value })} className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-musan-primary transition-all cursor-pointer">
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Half-Yearly">Half-Yearly</option>
                                            <option value="Yearly">Yearly</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount / Budget</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input type="number" placeholder="Amount" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full pl-9 pr-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-musan-primary transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Deadline (Optional for Subs)</label>
                                    <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-musan-primary transition-all" />
                                </div>
                            </div>

                            {/* Contacts Section */}
                            <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Client Contacts</label>
                                    <button type="button" onClick={addContactRow} className="text-xs text-musan-primary font-bold hover:underline flex items-center gap-1"><Plus size={14} /> Add Contact</button>
                                </div>
                                {form.contacts.map((contact, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-2 mb-2 w-full items-start md:items-center bg-white dark:bg-slate-800 p-3 border border-gray-100 dark:border-slate-600 rounded-lg shadow-sm md:shadow-none">
                                        <select value={contact.contactType} onChange={(e) => handleContactChange(index, 'contactType', e.target.value)} className={`w-full md:w-auto px-2 py-1.5 bg-gray-50 dark:bg-slate-700 outline-none rounded-md dark:text-white cursor-pointer border border-transparent focus:border-musan-primary ${contact.contactType === 'Other' ? 'md:w-1/4' : 'md:w-1/3'}`}>
                                            {DEFAULT_CONTACT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}<option value="Other">Other...</option>
                                        </select>
                                        {contact.contactType === 'Other' && <input type="text" placeholder="Type (e.g. Skype)" value={contact.customType} onChange={(e) => handleContactChange(index, 'customType', e.target.value)} className="w-full md:w-1/4 px-3 py-1.5 bg-gray-50 dark:bg-slate-700 rounded-md dark:text-white outline-none focus:ring-1 focus:ring-musan-primary" />}
                                        <input type="text" placeholder="Contact details..." value={contact.value} onChange={(e) => handleContactChange(index, 'value', e.target.value)} className="w-full md:flex-grow px-3 py-1.5 bg-gray-50 dark:bg-slate-700 rounded-md dark:text-white outline-none focus:ring-1 focus:ring-musan-primary" />

                                        <div className="flex items-center justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-slate-700 mt-2 md:mt-0 pl-2">
                                            <button type="button" onClick={() => removeContactRow(index)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors md:ml-auto"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Map Iframe URL</label><textarea rows="3" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder='<iframe src="..."></iframe>' className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none resize-none text-xs font-mono focus:ring-2 focus:ring-musan-primary transition-all" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Project Notes</label><textarea rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Meeting details, requirements..." className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none resize-none focus:ring-2 focus:ring-musan-primary transition-all" /></div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assets / Screenshots</label>
                                <div className="flex flex-wrap gap-4 items-start">
                                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-musan-primary/50 rounded-xl cursor-pointer hover:bg-musan-primary/10 transition-colors">
                                        <ImagePlus className="text-musan-primary mb-1" size={24} /><span className="text-xs text-musan-primary font-bold">Upload</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                    {form.images.map((imgSrc, index) => (
                                        <div key={index} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 shadow-sm">
                                            <img src={imgSrc} alt="upload" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-musan-primary hover:bg-musan-accent text-white font-bold transition-all active:scale-95 shadow-md disabled:opacity-60 flex items-center gap-2">
                                    {saving ? 'Saving...' : editProject ? 'Update Project' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}