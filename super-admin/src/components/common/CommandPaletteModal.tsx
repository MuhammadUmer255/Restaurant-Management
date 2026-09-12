import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Building2,
  Users,
  Receipt,
  ShieldCheck,
  Activity,
  PlusCircle,
  Moon,
  Sun,
  X,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant } from '../../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onNavigate: (viewId: string) => void;
  onOpenOnboarding: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  tenants,
  onSelectTenant,
  onNavigate,
  onOpenOnboarding,
  toggleDarkMode,
  isDarkMode,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTenants = query.trim()
    ? tenants.filter(
        (t) =>
          t.tradeName.toLowerCase().includes(query.toLowerCase()) ||
          t.id.toLowerCase().includes(query.toLowerCase()) ||
          t.businessName.toLowerCase().includes(query.toLowerCase()) ||
          t.primaryContact.name.toLowerCase().includes(query.toLowerCase()) ||
          t.primaryContact.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : tenants.slice(0, 4);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, search restaurants by name, ID, or contact..."
              className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
            />
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Quick Actions */}
            <div className="py-2">
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </p>
              <button
                onClick={() => {
                  onOpenOnboarding();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 group transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Onboard New Restaurant Tenant</span>
                </span>
                <span className="text-xs text-slate-400 group-hover:text-indigo-500 font-mono">
                  +N
                </span>
              </button>
              <button
                onClick={() => {
                  toggleDarkMode();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-500" />
                  )}
                  <span>Toggle {isDarkMode ? 'Light' : 'Dark'} Mode</span>
                </span>
                <span className="text-xs text-slate-400">Theme</span>
              </button>
            </div>

            {/* Navigation Section */}
            <div className="py-2">
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Platform Navigation
              </p>
              <div className="grid grid-cols-2 gap-1 px-1">
                {[
                  { id: 'dashboard', label: 'Command Center', icon: Activity },
                  { id: 'tenants', label: 'Tenant Directory', icon: Building2 },
                  { id: 'users', label: 'Users & Staff', icon: Users },
                  { id: 'billing', label: 'Billing & Ledger', icon: Receipt },
                  { id: 'audit', label: 'Security & Audit Logs', icon: ShieldCheck },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <item.icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Restaurants Section */}
            <div className="py-2">
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Restaurant Tenants ({filteredTenants.length})</span>
                {query && <span className="font-normal lowercase">matching "{query}"</span>}
              </p>
              {filteredTenants.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-slate-400">
                  No restaurants matching your query.
                </div>
              ) : (
                filteredTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTenant(t);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                        {t.tradeName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {t.tradeName}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {t.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t.primaryContact.name} • {t.primaryContact.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        ${t.mrr}/mo
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              ProTip: Use <kbd className="font-mono font-semibold">Cmd+K</kbd> anywhere to search
            </span>
            <span>Super Admin Internal Hub</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
