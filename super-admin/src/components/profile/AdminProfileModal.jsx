import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, User, Check, X, Database, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateSuperAdminProfileInSupabase } from '../../lib/supabase';
import { useToast } from '../common/Toast';

export const AdminProfileModal = ({ isOpen, onClose, currentProfile, onProfileUpdated }) => {
    const { showToast } = useToast();
    const [fullName, setFullName] = useState(currentProfile?.fullName || 'Fatima Javaid');
    const [email, setEmail] = useState(currentProfile?.email || 'fatimajavaid1886@gmail.com');
    const [phone, setPhone] = useState(currentProfile?.phone || '+92 (300) 8412901');
    const [title, setTitle] = useState(currentProfile?.title || 'Lead Architect & Platform Admin');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fullName.trim() || !email.trim()) {
            showToast('Validation Error', 'Name and Email are required', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateSuperAdminProfileInSupabase({
                id: currentProfile?.id || 'ADM-01',
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                title: title.trim(),
                role: 'Super Admin',
                avatar: currentProfile?.avatar,
            });

            if (result.success) {
                showToast('Database Synchronized', 'Super Admin profile updated in Supabase.', 'success');
                onProfileUpdated?.(result.profile);
                onClose();
            } else {
                showToast('Sync Warning', result.message || 'Profile saved locally.', 'warning');
                onProfileUpdated?.({
                    ...currentProfile,
                    fullName: fullName.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.trim(),
                    title: title.trim(),
                });
                onClose();
            }
        } catch (err) {
            showToast('Error', err?.message || 'Failed to update admin profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs text-slate-800 dark:text-slate-200 space-y-5"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Super Admin Identity
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                    Live PostgreSQL Database Profile & SSO Credentials
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Live Database Sync Badge */}
                    <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2.5">
                        <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed">
                            These credentials belong to the primary platform Super Admin account stored directly in Supabase (<strong>admin_profiles</strong> and <strong>restaurant_users</strong> tables).
                        </span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <img
                                src={currentProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                                alt={fullName}
                                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-xs shrink-0"
                            />
                            <div className="space-y-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                                    Super Admin • Root Access
                                </span>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Active Platform Lead Architect session
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>Full Name</span>
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="Fatima Javaid"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>Email Address</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="fatimajavaid1886@gmail.com"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Phone Number</span>
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+92 (300) 8412901"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Designation / Role Title</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Lead Architect & Platform Admin"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                                />
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Console Lock Screen PIN</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">admin / 1234</span>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isSaving ? 'Saving to Database...' : 'Save to Live Database'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
