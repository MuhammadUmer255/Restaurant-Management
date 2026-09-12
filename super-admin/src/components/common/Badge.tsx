import React from 'react';
import { TenantStatus, PlanTierName } from '../../types';

interface StatusBadgeProps {
  status: TenantStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<TenantStatus, { text: string; dot: string }> = {
    Active: {
      text: 'text-zinc-700 dark:text-zinc-200',
      dot: 'bg-emerald-500',
    },
    Trial: {
      text: 'text-zinc-700 dark:text-zinc-300',
      dot: 'bg-amber-500',
    },
    Suspended: {
      text: 'text-zinc-600 dark:text-zinc-400',
      dot: 'bg-rose-500',
    },
    Churned: {
      text: 'text-zinc-500 dark:text-zinc-400',
      dot: 'bg-zinc-400',
    },
  };

  const style = styles[status] || styles.Active;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 font-medium whitespace-nowrap ${style.text} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span>{status}</span>
    </span>
  );
};

interface PlanBadgeProps {
  plan: PlanTierName;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan }) => {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
    >
      {plan}
    </span>
  );
};

