import React from 'react';
import { AlertTriangle, LogOut, ShieldAlert, Utensils, Monitor, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { Tenant } from '../../types';

interface ImpersonationBannerProps {
  tenant: Tenant;
  onExit: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ tenant, onExit }) => {
  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-medium shadow-md flex items-center justify-between sticky top-0 z-40 border-b border-amber-600">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
        <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
        <div>
          <span className="font-bold">IMPERSONATION MODE ACTIVE:</span> You are currently viewing the platform as{' '}
          <strong className="underline underline-offset-2">{tenant.tradeName}</strong> ({tenant.id}) • Primary Admin: {tenant.primaryContact.name}.
          <span className="hidden md:inline ml-2 opacity-80">
            All write actions are recorded to immutable audit log.
          </span>
        </div>
      </div>
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded-md font-semibold hover:bg-slate-800 transition-colors shadow-sm shrink-0 text-xs"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Exit Impersonation</span>
      </button>
    </div>
  );
};

interface ImpersonatedTenantDashboardProps {
  tenant: Tenant;
  onExit: () => void;
}

export const ImpersonatedTenantDashboard: React.FC<ImpersonatedTenantDashboardProps> = ({
  tenant,
  onExit,
}) => {
  const isPkr = tenant.currency === 'PKR';
  const currencySymbol = isPkr ? '₨ ' : '$';

  // Dynamic daily sales computed from tenant MRR & operational capacity
  const liveDailySales = Math.round(tenant.mrr * (isPkr ? 0.085 : 0.11));
  const activeTicketsCount = tenant.featureFlags.kdsEnabled
    ? Math.max(2, Math.round(tenant.limits.posTerminals.current * 0.8))
    : 0;

  // Realistic localized orders based on tenant currency and cuisine
  const sampleOrders = isPkr
    ? [
        {
          id: '#ORD-9941',
          table: 'Table 7 (Terrace View)',
          items: '1x Mutton Shinwari Karahi (Full), 4x Roghani Naan, 2x Mint Margarita',
          total: `${currencySymbol}4,850`,
          status: 'In Kitchen (9m)',
          terminal: 'POS-01 Floor',
        },
        {
          id: '#ORD-9940',
          table: 'Table 14 (Family Hall)',
          items: '2x Special Chicken Biryani, 1x Seekh Kabab Platter, 4x Fresh Lime Soda',
          total: `${currencySymbol}3,450`,
          status: 'Ready to Serve',
          terminal: 'POS-02 Main Dining',
        },
        {
          id: '#ORD-9939',
          table: 'Online QR Order #D4',
          items: '1x Peshawari Chappal Kabab, 2x Garlic Naan, 2x Doodh Patti Chai',
          total: `${currencySymbol}1,950`,
          status: 'Dispatched',
          terminal: 'QR Digital Ingress',
        },
      ]
    : [
        {
          id: '#ORD-9941',
          table: 'Table 7 (Patio)',
          items: '2x Prime Ribeye Steak, 1x Truffle Fries, 1x Pinot Noir',
          total: `${currencySymbol}148.00`,
          status: 'In Kitchen (11m)',
          terminal: 'POS-02 Main Bar',
        },
        {
          id: '#ORD-9940',
          table: 'Table 14 (Dining Room)',
          items: '1x Caesar Salad, 2x Duck Confit, 2x Espresso',
          total: `${currencySymbol}112.50`,
          status: 'Ready to Serve',
          terminal: 'POS-01 Floor',
        },
        {
          id: '#ORD-9939',
          table: 'Online QR Delivery #D4',
          items: '1x Margherita Pizza, 1x Burrata Pugliese, 2x San Pellegrino',
          total: `${currencySymbol}44.00`,
          status: 'Dispatched',
          terminal: 'API Webhook Ingress',
        },
      ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Restaurant Overview Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {tenant.tradeName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {tenant.tradeName}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                {tenant.planTier} Plan
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Legal: {tenant.businessName} • {tenant.region} • Timezone: {tenant.timezone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Super Admin Session</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Read/Write Delegated
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Return to Super Admin Hub
          </button>
        </div>
      </div>

      {/* Simulated Live Restaurant Operations */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Today's Live Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {currencySymbol}{liveDailySales.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">+14.2% vs previous day</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active POS Terminals</span>
            <Monitor className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {tenant.limits.posTerminals.current} / {tenant.limits.posTerminals.max}
          </p>
          <p className="text-xs text-slate-500 mt-1">All online & synced to Cloud</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Kitchen Display (KDS)</span>
            <Utensils className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {tenant.featureFlags.kdsEnabled ? `${activeTicketsCount} Active Tickets` : 'KDS Disabled'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Avg prep time: 13.8 mins</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Tenant Health Score</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {tenant.healthScore}/100
          </p>
          <p className="text-xs text-slate-500 mt-1">Optimal telemetry & zero API errors</p>
        </div>
      </div>

      {/* Live Order Queue Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>Tenant Live Order Queue (Support Inspection View)</span>
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sampleOrders.map((order) => (
            <div key={order.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 mr-2 font-mono">{order.id}</span>
                <span className="text-slate-500">{order.table}</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{order.items}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Terminal: {order.terminal}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-slate-100 font-mono">{order.total}</p>
                <span className="inline-block px-2 py-0.5 mt-1 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
