import React, { useState, useMemo } from 'react';
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Activity,
  Server,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Zap,
  Store,
  Plus,
} from 'lucide-react';
import { Sparkline } from '../common/Sparkline';
import { StatusBadge, PlanBadge } from '../common/Badge';
import { useToast } from '../common/Toast';
import {
  KpiMetric,
  Tenant,
  AlertNotification,
  SystemServiceTelemetry,
} from '../../types';

interface DashboardHomeProps {
  kpis: KpiMetric[];
  tenants: Tenant[];
  alerts: AlertNotification[];
  telemetry: SystemServiceTelemetry[];
  onSelectTenant: (tenant: Tenant) => void;
  onNavigateToTenants: () => void;
  onNavigateToBilling: () => void;
  onNavigateToTelemetry: () => void;
  onOpenOnboarding: () => void;
  onResolveAlert: (alert: AlertNotification) => void;
  onRefreshMetrics?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  kpis,
  tenants,
  alerts,
  telemetry,
  onSelectTenant,
  onNavigateToTenants,
  onNavigateToBilling,
  onNavigateToTelemetry,
  onOpenOnboarding,
  onResolveAlert,
  onRefreshMetrics,
}) => {
  const { showToast } = useToast();
  const [timeframe, setTimeframe] = useState<'30D' | '90D' | '12M'>('12M');
  const [activeChartHoverIdx, setActiveChartHoverIdx] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefreshMetrics?.();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast(
        'Telemetry Synchronized',
        'Live fleet metrics, ingress latency, and active clusters updated.',
        'success'
      );
    }, 600);
  };

  // Dynamic currency detection from active database fleet
  const isPkr = useMemo(() => {
    return (
      tenants.length > 0 &&
      (tenants[0].currency === 'PKR' ||
        tenants.filter((t) => t.currency === 'PKR').length >= tenants.length / 2)
    );
  }, [tenants]);

  const currencySymbol = isPkr ? '₨ ' : '$';

  // Dynamically derive genuine monthly growth velocity from actual database tenants
  const fullChartData = useMemo(() => {
    const now = new Date();
    const monthsData = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const yearMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      const fullLabel = `${monthLabel} ${year}`;

      // Real signups in this month
      const onboarded = tenants.filter((t) => {
        if (!t.dateJoined) return false;
        return t.dateJoined.startsWith(yearMonthStr);
      });

      // Real cancellations / churn in this month
      const churned = tenants.filter((t) => {
        if (!t.dateJoined) return false;
        return t.status === 'Churned' && t.dateJoined.startsWith(yearMonthStr);
      });

      // Cumulative active tenants up to end of this month
      const lastDayOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const cumulativeActiveTenants = tenants.filter((t) => {
        if (!t.dateJoined) return false;
        return t.dateJoined <= lastDayOfMonth && t.status !== 'Churned';
      });

      const cumulativeMrr = cumulativeActiveTenants.reduce((acc, t) => acc + (t.mrr || 0), 0);

      monthsData.push({
        month: monthLabel,
        fullPeriod: fullLabel,
        yearMonth: yearMonthStr,
        signups: onboarded.length,
        onboardedNames: onboarded.map((t) => t.tradeName),
        cancellations: churned.length,
        churnedNames: churned.map((t) => t.tradeName),
        netExpansion: onboarded.length - churned.length,
        cumulativeFleet: cumulativeActiveTenants.length,
        cumulativeMrr,
      });
    }

    return monthsData;
  }, [tenants]);

  // Filter growth chart data based on timeframe
  const displayedChartData = useMemo(() => {
    if (timeframe === '30D') return fullChartData.slice(-3);
    if (timeframe === '90D') return fullChartData.slice(-6);
    return fullChartData;
  }, [timeframe, fullChartData]);

  // Real aggregations for the selected timeframe
  const periodStats = useMemo(() => {
    const totalSignups = displayedChartData.reduce((acc, d) => acc + d.signups, 0);
    const totalCancellations = displayedChartData.reduce((acc, d) => acc + d.cancellations, 0);
    const netGrowth = totalSignups - totalCancellations;
    const currentMrr = displayedChartData[displayedChartData.length - 1]?.cumulativeMrr || 0;
    const activeCount = tenants.filter((t) => t.status === 'Active').length;
    const trialCount = tenants.filter((t) => t.status === 'Trial').length;
    const churnedCount = tenants.filter((t) => t.status === 'Churned').length;
    const retentionRate =
      tenants.length > 0
        ? Math.round(((tenants.length - churnedCount) / tenants.length) * 100)
        : 100;

    return {
      totalSignups,
      totalCancellations,
      netGrowth,
      currentMrr,
      activeCount,
      trialCount,
      churnedCount,
      retentionRate,
    };
  }, [displayedChartData, tenants]);

  // Recent onboardings (sorted by dateJoined descending)
  const recentOnboardings = [...tenants]
    .sort((a, b) => new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime())
    .slice(0, 4);

  // Dynamic Telemetry Metrics strictly from live Supabase state
  const effectiveTelemetry = useMemo(() => {
    return telemetry || [];
  }, [telemetry]);

  const avgSla = useMemo(() => {
    if (effectiveTelemetry.length === 0) return '0.00';
    const total = effectiveTelemetry.reduce((acc, s) => acc + s.uptimePercentage, 0);
    return (total / effectiveTelemetry.length).toFixed(2);
  }, [effectiveTelemetry]);

  const operationalPops = useMemo(
    () => effectiveTelemetry.filter((s) => s.status === 'Operational').length,
    [effectiveTelemetry]
  );

  // Action required items calculated strictly from live fleet conditions
  const actionRequiredAlerts = useMemo(() => {
    const realItems: AlertNotification[] = [];

    // 1. Any tenant currently on Trial status
    tenants
      .filter((t) => t.status === 'Trial')
      .forEach((t) => {
        realItems.push({
          id: `alert-trial-${t.id}`,
          title: `Trial Expiring: ${t.tradeName}`,
          description: `${t.tradeName} is on Enterprise Trial (${t.trialEndsAt || '8 days remaining'}). ${t.limits?.posTerminals?.current || 4} POS terminals active in ${t.location?.city || 'Pakistan'}.`,
          severity: 'warning',
          timestamp: 'Live Fleet',
          tenantId: t.id,
          tenantName: t.tradeName,
          actionLabel: 'Review Trial',
          actionType: 'view_tenant',
          read: false,
        });
      });

    // 2. Any tenant with open support escalation tickets
    tenants
      .filter((t) => (t.openTicketsCount || 0) > 0)
      .forEach((t) => {
        realItems.push({
          id: `alert-ticket-${t.id}`,
          title: `Active Ticket: ${t.tradeName}`,
          description: `${t.openTicketsCount} open support escalation for ${t.location?.city || 'Pakistan'} outlet network. Requires L2 operational review.`,
          severity: 'warning',
          timestamp: 'Live Fleet',
          tenantId: t.id,
          tenantName: t.tradeName,
          actionLabel: 'Inspect Outlet',
          actionType: 'view_tenant',
          read: false,
        });
      });

    // 3. Any tenant approaching terminal limits (>= 70% utilization)
    tenants
      .filter(
        (t) =>
          t.limits?.posTerminals &&
          t.limits.posTerminals.current / t.limits.posTerminals.max >= 0.7
      )
      .forEach((t) => {
        const pct = Math.round((t.limits.posTerminals.current / t.limits.posTerminals.max) * 100);
        realItems.push({
          id: `alert-quota-${t.id}`,
          title: `Terminal Quota (${pct}%): ${t.tradeName}`,
          description: `${t.limits.posTerminals.current} of ${t.limits.posTerminals.max} licensed terminals active. Quota upgrade recommended before peak volume.`,
          severity: 'warning',
          timestamp: 'Live Fleet',
          tenantId: t.id,
          tenantName: t.tradeName,
          actionLabel: 'Manage Limits',
          actionType: 'view_tenant',
          read: false,
        });
      });

    // 4. Any unresolved alerts from alerts prop that aren't already represented
    alerts
      .filter((a) => !a.read && (a.severity === 'critical' || a.severity === 'warning'))
      .forEach((a) => {
        if (!realItems.some((r) => r.id === a.id || (r.tenantId && r.tenantId === a.tenantId))) {
          realItems.push(a);
        }
      });

    return realItems.slice(0, 4);
  }, [tenants, alerts]);

  const getKpiIcon = (id: string) => {
    switch (id) {
      case 'total-tenants':
        return Users;
      case 'active-subscriptions':
        return CreditCard;
      case 'mrr':
        return DollarSign;
      case 'churn-rate':
        return TrendingUp;
      case 'pending-tickets':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  // Max value calculation for bar heights
  const maxVal = Math.max(
    ...displayedChartData.map((d) => Math.max(d.signups, d.cancellations, 1)),
    2
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global fleet monitoring, revenue velocity, and immediate action items across all tenant clusters.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shadow-2xs"
            title="Refresh fleet telemetry & metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Deploy New Restaurant</span>
          </button>
        </div>
      </div>

      {/* 1. KPI Overview: Row of 5 widget cards with micro-sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = getKpiIcon(kpi.id);
          const isChurnCard = kpi.id === 'churn-rate';

          const handleCardClick = () => {
            if (kpi.id === 'mrr' || kpi.id === 'churn-rate') {
              onNavigateToBilling();
            } else if (kpi.id === 'pending-tickets') {
              onNavigateToTelemetry();
            } else {
              onNavigateToTenants();
            }
          };

          return (
            <div
              key={kpi.id}
              onClick={handleCardClick}
              className="bg-white dark:bg-[#0f141f] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between group hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all hover:shadow-md"
              title={`Click to manage in ${
                kpi.id === 'mrr' || kpi.id === 'churn-rate'
                  ? 'Billing Ledger'
                  : kpi.id === 'pending-tickets'
                  ? 'System Telemetry'
                  : 'Tenant Directory'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {kpi.title}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                    {kpi.value}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span
                    className={`inline-flex items-center font-semibold text-[11px] ${
                      kpi.isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {kpi.isPositive ? (
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    )}
                    {kpi.change}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {kpi.secondaryText}
                  </span>
                </div>
              </div>

              {/* Micro-sparkline & direct link */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-end justify-between">
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <Sparkline
                  data={kpi.sparkline}
                  height={28}
                  width={90}
                  isPositive={isChurnCard ? !kpi.change.startsWith('+') : kpi.isPositive}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. System Health & Growth Composite Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Composite Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f141f] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tenant Growth & Retention Velocity
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-mono">
                  {periodStats.netGrowth >= 0 ? `Net +${periodStats.netGrowth}` : `Net ${periodStats.netGrowth}`} ({tenants.length} Fleet Total)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time onboardings vs. cancellations synchronized from live database records.
              </p>
            </div>

            {/* Timeframe selector tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs self-start">
              {(['30D', '90D', '12M'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Composite Chart Container */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                  <span>New Signups</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
                  <span>Cancellations</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 rounded-full bg-emerald-500" />
                  <span>Net Expansion</span>
                </span>
              </div>
              <span className="text-[11px] font-mono">Unit: Outlets / Month</span>
            </div>

            {/* Bar Visualization */}
            <div className="h-56 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-1 border-b border-slate-100 dark:border-slate-800 relative">
              {displayedChartData.map((d, index) => {
                const signupHeight = d.signups > 0 ? Math.max(Math.round((d.signups / maxVal) * 125), 18) : 4;
                const cancelHeight = d.cancellations > 0 ? Math.max(Math.round((d.cancellations / maxVal) * 125), 18) : 4;
                const isHovered = activeChartHoverIdx === index;

                return (
                  <div
                    key={d.month + index}
                    onMouseEnter={() => setActiveChartHoverIdx(index)}
                    onMouseLeave={() => setActiveChartHoverIdx(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Hover Tooltip Card */}
                    {isHovered && (
                      <div className="absolute -top-20 z-30 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs shadow-xl pointer-events-none min-w-[200px] border border-slate-700 dark:border-slate-200">
                        <div className="flex items-center justify-between font-bold border-b border-slate-700 dark:border-slate-200 pb-1 mb-1.5">
                          <span>{d.fullPeriod}</span>
                          <span className="text-emerald-400 dark:text-emerald-600 font-mono">
                            {currencySymbol}{Math.round(d.cumulativeMrr / (isPkr ? 1000 : 1)).toLocaleString()}{isPkr ? 'k' : ''} MRR
                          </span>
                        </div>
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 dark:text-slate-600">Onboarded:</span>
                            <span className="font-bold text-indigo-300 dark:text-indigo-600">
                              +{d.signups} {d.signups === 1 ? 'outlet' : 'outlets'}
                            </span>
                          </div>
                          {d.onboardedNames.length > 0 && (
                            <p className="text-[10px] text-indigo-300 dark:text-indigo-600 truncate font-medium">
                              {d.onboardedNames.join(', ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-slate-300 dark:text-slate-600">Cancellations:</span>
                            <span className="font-bold text-rose-300 dark:text-rose-600">
                              -{d.cancellations}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-0.5 border-t border-slate-800 dark:border-slate-100 mt-1">
                            <span className="text-slate-400 dark:text-slate-500">Active Fleet:</span>
                            <span className="font-bold font-mono text-slate-200 dark:text-slate-800">
                              {d.cumulativeFleet} active
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Net Expansion Micro Indicator */}
                    <div className="flex items-center justify-center mb-1.5 h-3.5">
                      {d.netExpansion > 0 ? (
                        <span className="text-[9px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                          +{d.netExpansion}
                        </span>
                      ) : d.netExpansion < 0 ? (
                        <span className="text-[9px] font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1 rounded">
                          {d.netExpansion}
                        </span>
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>

                    {/* Dual grouped bars */}
                    <div className="w-full flex items-end justify-center gap-1">
                      {/* Signups bar */}
                      <div
                        style={{ height: `${signupHeight}px` }}
                        className={`w-full max-w-[14px] rounded-t-sm transition-all duration-200 ${
                          d.signups > 0
                            ? isHovered
                              ? 'bg-indigo-500'
                              : 'bg-indigo-600 group-hover:bg-indigo-500'
                            : 'bg-slate-200 dark:bg-slate-800 opacity-40'
                        }`}
                      />
                      {/* Cancellations bar */}
                      <div
                        style={{ height: `${cancelHeight}px` }}
                        className={`w-full max-w-[14px] rounded-t-sm transition-all duration-200 ${
                          d.cancellations > 0
                            ? isHovered
                              ? 'bg-rose-400'
                              : 'bg-rose-300 dark:bg-rose-900/60 group-hover:bg-rose-400'
                            : 'bg-slate-200 dark:bg-slate-800 opacity-40'
                        }`}
                      />
                    </div>

                    {/* Month label */}
                    <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                      {d.month.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 3-Column Real Metrics Strip */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Period Additions
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  +{periodStats.totalSignups} Restaurants
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Fleet Retention
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {periodStats.retentionRate}% Retained
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Active Fleet MRR
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {currencySymbol}{periodStats.currentMrr.toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live System Health & Infrastructure Telemetry Panel */}
        <div className="bg-white dark:bg-[#0f141f] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Fleet & Ingress Telemetry
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Real-time mesh across edge POPs & PostgreSQL
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToTelemetry}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Telemetry</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {effectiveTelemetry.slice(0, 4).map((svc) => (
                <div
                  key={svc.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {svc.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        svc.status === 'Operational'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {svc.status}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-[10px] text-slate-400">Uptime</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {svc.uptimePercentage}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Latency</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {svc.latencyMs}ms
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Throughput</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 truncate" title={svc.throughput}>
                        {svc.throughput}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToTelemetry}
            className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group cursor-pointer"
            title={`Inspect all ${effectiveTelemetry.length} live cluster nodes in System Telemetry`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${effectiveTelemetry.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>
                {effectiveTelemetry.length > 0
                  ? `Mesh: ${effectiveTelemetry.length} Edge POPs (${operationalPops} Operational)`
                  : 'Telemetry: Awaiting Supabase Nodes'}
              </span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span>{effectiveTelemetry.length > 0 ? `${avgSla}% SLA` : '0.00%'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* 3. Action Center: Split section containing "Recent Onboardings" and "Action Required" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Onboardings */}
        <div className="bg-white dark:bg-[#0f141f] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recent Onboardings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Newly registered restaurant tenants and trial accounts.
              </p>
            </div>
            <button
              onClick={onNavigateToTenants}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({tenants.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentOnboardings.length === 0 ? (
              <div className="py-8 text-center rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <Store className="w-5 h-5" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  No Restaurants In Supabase Database
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Provision new restaurant accounts or initialize your database tables.
                </p>
                <button
                  onClick={onOpenOnboarding}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard First Restaurant</span>
                </button>
              </div>
            ) : (
              recentOnboardings.map((tenant) => (
                <div
                  key={tenant.id}
                  onClick={() => onSelectTenant(tenant)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {tenant.tradeName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tenant.tradeName}
                        </p>
                        <PlanBadge plan={tenant.planTier} />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {tenant.primaryContact.name} • {tenant.region} • {tenant.dateJoined}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={tenant.status} size="sm" />
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                      {tenant.currency === 'PKR' ? '₨ ' : '$'}{tenant.mrr.toLocaleString()}/mo
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Required Items */}
        <div className="bg-white dark:bg-[#0f141f] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Action Required ({actionRequiredAlerts.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Expiring trials, support tickets, and terminal quotas
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {actionRequiredAlerts.length > 0 ? 'SLA: < 4 hours' : 'Zero Escalations'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {actionRequiredAlerts.length > 0 ? (
              actionRequiredAlerts.map((alert) => {
                const targetTenant = alert.tenantId ? tenants.find((t) => t.id === alert.tenantId) : null;
                return (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-xs flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      {alert.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {alert.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {alert.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                          {alert.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {alert.tenantName || 'Platform Global'}
                      </span>
                      <button
                        onClick={() => {
                          if (targetTenant) {
                            onSelectTenant(targetTenant);
                          } else {
                            onResolveAlert(alert);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{alert.actionLabel || 'Inspect'}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  All Fleet Systems Cleared
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  No open tickets, expiring trials, or terminal bottlenecks across {tenants.length} active restaurants.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
