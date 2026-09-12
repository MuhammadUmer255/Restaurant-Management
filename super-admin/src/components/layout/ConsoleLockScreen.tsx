import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConsoleLockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  adminName: string;
  adminEmail: string;
  adminAvatar: string;
}

export const ConsoleLockScreen: React.FC<ConsoleLockScreenProps> = ({
  isLocked,
  onUnlock,
  adminName,
  adminEmail,
  adminAvatar,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept "admin", "1234", or any non-empty input for ease of testing
    if (pin.trim().length > 0) {
      setError(false);
      setPin('');
      onUnlock();
    } else {
      setError(true);
    }
  };

  const handleQuickSsoUnlock = () => {
    setError(false);
    setPin('');
    onUnlock();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0f141f] border border-slate-200/90 dark:border-slate-800 shadow-2xl p-7 text-center text-xs space-y-5"
        >
          {/* Avatar with lock badge */}
          <div className="relative w-20 h-20 mx-auto">
            <img
              src={adminAvatar}
              alt={adminName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Super Admin Console Locked
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {adminName}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {adminEmail}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Okta Enterprise SSO Session Active</span>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-3">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                autoFocus
                placeholder="Enter PIN or password (e.g. admin)..."
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                }`}
              />
            </div>
            {error && (
              <p className="text-rose-500 text-[11px] font-medium text-left pl-1">
                Please enter your unlock key or use SSO Re-authentication below.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Console</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleQuickSsoUnlock}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Verify with Hardware Passkey / SSO</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
