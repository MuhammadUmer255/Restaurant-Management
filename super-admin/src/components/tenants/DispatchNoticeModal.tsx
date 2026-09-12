import React, { useState } from 'react';
import {
  Bell,
  X,
  Send,
  AlertTriangle,
  Info,
  CheckCircle2,
  Building2,
  Shield,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant } from '../../types';

interface DispatchNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTenantIds: string[];
  tenants: Tenant[];
  onDispatchNotice: (data: {
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    tenantIds: string[];
  }) => void;
}

export const DispatchNoticeModal: React.FC<DispatchNoticeModalProps> = ({
  isOpen,
  onClose,
  selectedTenantIds,
  tenants,
  onDispatchNotice,
}) => {
  const [noticeType, setNoticeType] = useState<'maintenance' | 'upgrade' | 'policy' | 'custom'>('maintenance');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('warning');
  const [title, setTitle] = useState('Scheduled Cloud POS Gateway Maintenance');
  const [description, setDescription] = useState(
    'Platform core maintenance scheduled for Sunday at 03:00 AM UTC (duration: ~15 minutes). POS offline order caching will engage automatically.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetTenants = tenants.filter((t) => selectedTenantIds.includes(t.id));

  const handleSelectTemplate = (type: 'maintenance' | 'upgrade' | 'policy' | 'custom') => {
    setNoticeType(type);
    switch (type) {
      case 'maintenance':
        setSeverity('warning');
        setTitle('Scheduled Cloud POS Gateway Maintenance');
        setDescription(
          'Platform core maintenance scheduled for Sunday at 03:00 AM UTC (duration: ~15 minutes). POS offline order caching will engage automatically.'
        );
        break;
      case 'upgrade':
        setSeverity('info');
        setTitle('New Kitchen Display (KDS) & POS Engine Deployed');
        setDescription(
          'Your restaurant cluster has been upgraded with ultra-low latency WebSocket push and split-billing speed improvements.'
        );
        break;
      case 'policy':
        setSeverity('critical');
        setTitle('Urgent: Merchant Processing Regulatory Update Required');
        setDescription(
          'Please verify your legal entity tax registration and banking information to prevent automated Stripe payout holds.'
        );
        break;
      case 'custom':
        setTitle('');
        setDescription('');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onDispatchNotice({
        title,
        description,
        severity,
        tenantIds: selectedTenantIds,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-2xs">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden z-10 text-xs flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Broadcast Fleet Notice
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Transmitting announcement to {selectedTenantIds.length} target restaurants
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
            {/* Target Recipients Badge Row */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Targeted Fleet ({selectedTenantIds.length})
              </label>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                {targetTenants.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 text-[10px] font-medium"
                  >
                    <Building2 className="w-2.5 h-2.5" />
                    {t.tradeName}
                  </span>
                ))}
              </div>
            </div>

            {/* Template Presets */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Notice Category
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'maintenance', label: 'Maintenance' },
                  { key: 'upgrade', label: 'Release' },
                  { key: 'policy', label: 'Compliance' },
                  { key: 'custom', label: 'Custom' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectTemplate(item.key as any)}
                    className={`py-1.5 px-2 rounded-md border text-center text-xs transition-colors ${
                      noticeType === item.key
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Urgency Level
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { key: 'info', label: 'Info', color: 'bg-zinc-400' },
                  { key: 'warning', label: 'Warning', color: 'bg-amber-500' },
                  { key: 'critical', label: 'Critical', color: 'bg-rose-500' },
                ].map((sev) => (
                  <label
                    key={sev.key}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md border cursor-pointer text-xs font-medium transition-colors ${
                      severity === sev.key
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={sev.key}
                      checked={severity === sev.key}
                      onChange={() => setSeverity(sev.key as any)}
                      className="sr-only"
                    />
                    <span className={`w-1.5 h-1.5 rounded-full ${sev.color}`} />
                    <span>{sev.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Notice Title / Subject
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Gateway Maintenance"
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
              />
            </div>

            {/* Description / Message Body */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Message Content
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write notice content..."
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title || !description}
                className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting...' : `Dispatch Notice (${selectedTenantIds.length})`}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
