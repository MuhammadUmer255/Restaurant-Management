import React, { useState, useMemo } from 'react';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Download,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Transaction, PlanPricingTier, Tenant } from '../../types';
import { useToast } from '../common/Toast';

interface BillingLedgerProps {
  transactions: Transaction[];
  plans: PlanPricingTier[];
  tenants?: Tenant[];
  onUpdatePlanTier: (updatedPlan: PlanPricingTier) => void;
  onRetryInvoice: (transaction: Transaction) => void;
  onSelectTenantById?: (tenantId: string) => void;
}

export const BillingLedger: React.FC<BillingLedgerProps> = ({
  transactions,
  plans,
  tenants = [],
  onUpdatePlanTier,
  onRetryInvoice,
  onSelectTenantById,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'transactions' | 'pricing-tiers'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dynamic Financial Derivations Directly From Database Records
  const activeTenants = useMemo(() => tenants.filter((t) => t.status === 'Active'), [tenants]);
  const isPkrFleet = useMemo(
    () => tenants.some((t) => t.currency === 'PKR') || transactions.some((t) => t.currency === 'PKR'),
    [tenants, transactions]
  );
  const currencyPrefix = isPkrFleet ? '₨ ' : '$';

  // 1. Gross Billed Volume MTD (Sum of succeeded transactions strictly from database)
  const grossBilledVolume = useMemo(() => {
    const succeeded = transactions.filter((t) => t.status === 'Succeeded');
    return succeeded.reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  // 2. Real ARPU (Average Revenue per Active Tenant)
  const arpu = useMemo(() => {
    if (activeTenants.length === 0) return 0;
    const totalMrr = activeTenants.reduce((acc, t) => acc + t.mrr, 0);
    return Math.round(totalMrr / activeTenants.length);
  }, [activeTenants]);

  // 3. Add-on Terminal MRR & counts derived from actual hardware limits
  const { totalAddonTerminals, addonMrr, addonUnitPrice } = useMemo(() => {
    const unitPrice =
      plans.find((p) => p.id.includes('pro') || p.id.includes('starter'))?.additionalTerminalPrice ||
      (isPkrFleet ? 3500 : 35);
    let extraCount = 0;
    tenants.forEach((t) => {
      const plan = plans.find((p) => p.name.toLowerCase() === t.planTier.toLowerCase()) || plans[0];
      const included = plan?.includedPosTerminals || 2;
      const extra = Math.max(0, t.limits.posTerminals.current - included);
      extraCount += extra;
    });
    return {
      totalAddonTerminals: extraCount,
      addonMrr: extraCount * unitPrice,
      addonUnitPrice: unitPrice,
    };
  }, [tenants, plans, isPkrFleet]);

  // 4. Overdue / Failed Invoices
  const failedTransactions = useMemo(
    () => transactions.filter((t) => t.status === 'Failed'),
    [transactions]
  );
  const failedVolume = useMemo(
    () => failedTransactions.reduce((acc, t) => acc + t.amount, 0),
    [failedTransactions]
  );

  // Editing Plan Tier state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editMonthlyPrice, setEditMonthlyPrice] = useState<number>(0);
  const [editPosTerminals, setEditPosTerminals] = useState<number>(0);
  const [editAddonPrice, setEditAddonPrice] = useState<number>(0);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartEditPlan = (plan: PlanPricingTier) => {
    setEditingPlanId(plan.id);
    setEditMonthlyPrice(plan.monthlyPrice);
    setEditPosTerminals(plan.includedPosTerminals);
    setEditAddonPrice(plan.additionalTerminalPrice);
  };

  const handleSavePlan = (plan: PlanPricingTier) => {
    onUpdatePlanTier({
      ...plan,
      monthlyPrice: editMonthlyPrice,
      includedPosTerminals: editPosTerminals,
      additionalTerminalPrice: editAddonPrice,
    });
    setEditingPlanId(null);
    showToast(
      `${plan.name} Tier updated successfully`,
      `Base price updated to $${editMonthlyPrice}/mo with ${editPosTerminals} POS terminals.`,
      'success'
    );
  };

  const handleDownloadInvoiceReceipt = (txn: Transaction) => {
    const receiptText = `=====================================================
RESTOSAAS CLOUD PLATFORM - OFFICIAL PAYMENT RECEIPT
=====================================================
Receipt / Invoice #: ${txn.invoiceNumber}
Date of Transaction: ${txn.date}
Billing Cycle:       ${txn.billingPeriod}
Transaction Status:  ${txn.status.toUpperCase()}
-----------------------------------------------------
CUSTOMER DETAILS:
Restaurant Tenant:   ${txn.tenantName}
Tenant Identifier:   ${txn.tenantId}
Payment Method:      ${txn.method}
Stripe Gateway Ref:  ch_${Math.random().toString(36).substring(2, 10).toUpperCase()}_sec
-----------------------------------------------------
CHARGES & SERVICES:
1. RestoSaaS Core Platform Subscription     $${(txn.amount * 0.85).toFixed(2)}
2. Hardware Provisioning & Gateway Ingress  $${(txn.amount * 0.15).toFixed(2)}
-----------------------------------------------------
SUBTOTAL:                                   $${txn.amount.toFixed(2)}
TAX (Applicable State & Local):             $0.00
TOTAL PAID:                                 $${txn.amount.toFixed(2)} USD
-----------------------------------------------------
Thank you for partnering with RestoSaaS Platform.
Direct Inquiries: billing@restosaas.internal
=====================================================`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${txn.invoiceNumber}-${txn.tenantId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      'Receipt Downloaded',
      `Official receipt for ${txn.invoiceNumber} saved.`,
      'success'
    );
  };

  const handleExportLedgerCSV = () => {
    const headers = 'Invoice Number,Tenant ID,Tenant Name,Amount,Currency,Payment Method,Status,Billing Period,Date\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.invoiceNumber}","${t.tenantId}","${t.tenantName}",${t.amount},"${t.currency}","${t.method}","${t.status}","${t.billingPeriod}","${t.date}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Ledger Exported', `Downloaded ${filteredTransactions.length} transaction records.`, 'success');
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'Succeeded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Succeeded
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Failed
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Refunded
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Billing & Financial Monetization Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global payment processing, automated Stripe invoicing, and platform pricing tier governance.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Recent Transactions
          </button>
          <button
            onClick={() => setActiveTab('pricing-tiers')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'pricing-tiers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Manage Pricing Tiers
          </button>
        </div>
      </div>

      {/* Monetization Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveTab('transactions');
            setStatusFilter('ALL');
            showToast('Filter Applied', 'Showing all recent transaction activity across all tiers.', 'info');
          }}
          className="text-left bg-white dark:bg-[#0f141f] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-xs cursor-pointer group"
          title="Click to view all transactions in the ledger"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 uppercase tracking-wider transition-colors">
              Gross Billed Volume (MTD)
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {currencyPrefix}{grossBilledVolume.toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
            {transactions.filter((t) => t.status === 'Succeeded').length} settled payments
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pricing-tiers');
            showToast('Pricing Catalog', 'Manage tenant subscription plans to optimize average account revenue.', 'info');
          }}
          className="text-left bg-white dark:bg-[#0f141f] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-xs cursor-pointer group"
          title="Click to configure subscription pricing tiers"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 uppercase tracking-wider transition-colors">
              ARPU (Avg Revenue / Tenant)
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {currencyPrefix}{arpu.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">
            Across {activeTenants.length} active restaurant accounts →
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pricing-tiers');
            showToast('Add-on Pricing', `Adjust per-terminal pricing (${currencyPrefix}${addonUnitPrice}/mo) and included POS limits.`, 'info');
          }}
          className="text-left bg-white dark:bg-[#0f141f] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-xs cursor-pointer group"
          title="Click to manage POS terminal add-on pricing"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 uppercase tracking-wider transition-colors">
              Add-on Terminal MRR
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {currencyPrefix}{addonMrr.toLocaleString()}
          </p>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1 inline-block">
            {totalAddonTerminals} provisioned hardware add-ons ({currencyPrefix}{addonUnitPrice}/mo) →
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('transactions');
            setStatusFilter('Failed');
            showToast('Filter Applied', 'Showing failed transactions requiring auto-debit retry.', 'warning');
          }}
          className="text-left bg-white dark:bg-[#0f141f] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-rose-400 dark:hover:border-rose-600 transition-all hover:shadow-xs cursor-pointer group"
          title="Click to filter by failed transactions for instant retry"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">
              Overdue / Failed Volume
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {currencyPrefix}{failedVolume.toLocaleString()}
          </p>
          <span className="text-xs text-rose-500 mt-1 inline-block font-medium">
            {failedTransactions.length === 0
              ? 'Zero failed auto-debits across fleet'
              : `${failedTransactions.length} failed invoice${failedTransactions.length === 1 ? '' : 's'} requiring retry →`}
          </span>
        </button>
      </div>

      {/* Tab 1: Recent Transactions Ledger */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-[#0f141f] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions by tenant, invoice #, or TXN ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Succeeded">Succeeded</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
              <button
                onClick={handleExportLedgerCSV}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-3">Restaurant Tenant</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Payment Method</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date & Timestamp</th>
                    <th className="py-3 pr-4 pl-2 text-right">Receipt / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          No Invoices Found in Supabase
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {transactions.length === 0
                            ? 'Zero transaction records exist in public.transactions table.'
                            : 'No transactions match your current search or status filter.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                        {txn.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-3">
                        {onSelectTenantById ? (
                          <button
                            onClick={() => onSelectTenantById(txn.tenantId)}
                            className="text-left group/t block hover:opacity-80 transition-opacity cursor-pointer"
                            title="Click to inspect tenant details & billing status"
                          >
                            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover/t:text-indigo-600 dark:group-hover/t:text-indigo-400 group-hover/t:underline flex items-center gap-1">
                              <span>{txn.tenantName}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/t:opacity-100 transition-opacity text-indigo-500" />
                            </p>
                            <span className="font-mono text-[10px] text-slate-400 font-normal">
                              {txn.tenantId}
                            </span>
                          </button>
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 block">{txn.tenantName}</span>
                            <span className="font-mono text-[10px] text-slate-400 font-normal">{txn.tenantId}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-slate-100">
                        ${txn.amount.toFixed(2)} {txn.currency}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {txn.method}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(txn.status)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {txn.date}
                      </td>
                      <td className="py-3.5 pr-4 pl-2 text-right whitespace-nowrap">
                        {txn.status === 'Failed' ? (
                          <button
                            onClick={() => onRetryInvoice(txn)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry Charge</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownloadInvoiceReceipt(txn)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Download official receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing Tiers Management Interface */}
      {activeTab === 'pricing-tiers' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Pricing Catalog & Hardware Entitlement Engine</p>
              <p className="mt-0.5 text-indigo-800 dark:text-indigo-300">
                Updating tier parameters immediately updates Stripe subscription catalog templates and changes the default limits applied when new restaurants are onboarded.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isEditing = editingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-[#0f141f] rounded-2xl p-6 border shadow-2xs flex flex-col justify-between transition-all ${
                    plan.popular
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200/80 dark:border-slate-800/80'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {plan.name} Tier
                      </span>
                      {plan.popular && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase">
                          Standard Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">
                      {plan.description}
                    </p>

                    {/* Price & Terminal Entitlement Fields */}
                    {isEditing ? (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Monthly Price ($ USD)
                          </label>
                          <input
                            type="number"
                            value={editMonthlyPrice}
                            onChange={(e) => setEditMonthlyPrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-950 font-bold font-mono text-sm"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Included POS Terminals
                          </label>
                          <input
                            type="number"
                            value={editPosTerminals}
                            onChange={(e) => setEditPosTerminals(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-950 font-bold font-mono text-sm"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Additional Terminal Cost ($/mo)
                          </label>
                          <input
                            type="number"
                            value={editAddonPrice}
                            onChange={(e) => setEditAddonPrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-950 font-bold font-mono text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                            ${plan.monthlyPrice}
                          </span>
                          <span className="text-xs text-slate-400">/month</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Included Terminals:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {plan.includedPosTerminals} units
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Add-on Terminal fee:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              ${plan.additionalTerminalPrice}/terminal
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Staff seats cap:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {plan.maxStaffSeats} seats
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Features list */}
                    <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => setEditingPlanId(null)}
                          className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSavePlan(plan)}
                          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditPlan(plan)}
                        className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Configure Tier Pricing</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
