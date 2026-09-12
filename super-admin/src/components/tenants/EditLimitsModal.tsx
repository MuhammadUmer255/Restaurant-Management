import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant } from '../../types';

interface EditLimitsModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLimits: (
    tenantId: string,
    newLimits: {
      posTerminalsMax: number;
      staffSeatsMax: number;
      apiRateLimitPerMin: number;
    }
  ) => void;
}

export const EditLimitsModal: React.FC<EditLimitsModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSaveLimits,
}) => {
  if (!isOpen || !tenant) return null;

  const [posTerminalsMax, setPosTerminalsMax] = useState(tenant.limits.posTerminals.max);
  const [staffSeatsMax, setStaffSeatsMax] = useState(tenant.limits.staffSeats.max);
  const [apiRateLimitPerMin, setApiRateLimitPerMin] = useState(tenant.limits.apiRateLimitPerMin);
  const [changeReason, setChangeReason] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLimits(tenant.id, {
      posTerminalsMax,
      staffSeatsMax,
      apiRateLimitPerMin,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-2xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Edit Provisioning Limits
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {tenant.tradeName} ({tenant.id})
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

          {/* Form Body */}
          <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
            {/* Warning Note */}
            <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-500" />
              <p className="text-[11px] leading-relaxed">
                Changes to terminal caps and throughput limits immediately adjust cloud resource quotas and generate an audit record.
              </p>
            </div>

            {/* POS Terminals Limit */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="font-medium text-zinc-700 dark:text-zinc-300">
                  POS Terminals Limit
                </label>
                <span className="font-mono text-zinc-400">
                  Current: {tenant.limits.posTerminals.current} active
                </span>
              </div>
              <input
                type="number"
                min={tenant.limits.posTerminals.current}
                max={100}
                value={posTerminalsMax}
                onChange={(e) => setPosTerminalsMax(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-400"
                required
              />
              <p className="text-[10px] text-zinc-400">
                Baseline included in {tenant.planTier}. Add-ons: $29/terminal/mo.
              </p>
            </div>

            {/* Staff Seats Cap */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="font-medium text-zinc-700 dark:text-zinc-300">
                  Staff Account Seats Cap
                </label>
                <span className="font-mono text-zinc-400">
                  Current: {tenant.limits.staffSeats.current} seats
                </span>
              </div>
              <input
                type="number"
                min={tenant.limits.staffSeats.current}
                max={250}
                value={staffSeatsMax}
                onChange={(e) => setStaffSeatsMax(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-400"
                required
              />
            </div>

            {/* API Rate Limit */}
            <div className="space-y-1">
              <label className="font-medium text-zinc-700 dark:text-zinc-300">
                Inbound API Rate Limit
              </label>
              <select
                value={apiRateLimitPerMin}
                onChange={(e) => setApiRateLimitPerMin(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
              >
                <option value={150}>150 req/min (Starter)</option>
                <option value={600}>600 req/min (Pro)</option>
                <option value={1200}>1,200 req/min (Enterprise)</option>
                <option value={3000}>3,000 req/min (Custom SLA)</option>
              </select>
            </div>

            {/* Change Reason for Audit */}
            <div className="space-y-1">
              <label className="font-medium text-zinc-700 dark:text-zinc-300">
                Reason for Adjustment
              </label>
              <input
                type="text"
                placeholder="e.g. Contract addendum #C-902"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Limits</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
