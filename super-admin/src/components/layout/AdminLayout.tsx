import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  ShieldCheck,
  Activity,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  LogOut,
  UserCheck,
  UserPlus,
  Database,
  Filter,
  Check,
  Sparkles,
  MapPin,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertNotification, Tenant } from '../../types';
import { getSupabaseConfig } from '../../lib/supabase';
import { ConsoleLockScreen } from './ConsoleLockScreen';
import { useToast } from '../common/Toast';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  category: 'Core' | 'Monetization' | 'Governance';
}

interface AdminLayoutProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onOpenOnboarding: () => void;
  onOpenRegisterUser?: () => void;
  onOpenSupabaseConfig?: () => void;
  onOpenMapsKeyModal?: () => void;
  usersCount?: number;
  tenantsCount?: number;
  systemLatencyMs?: number;
  onOpenSearch: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  alerts: AlertNotification[];
  onMarkAlertRead: (alertId: string) => void;
  onMarkAllAlertsRead: () => void;
  activeImpersonatedTenant: Tenant | null;
  onExitImpersonation: () => void;
  onAlertAction: (alert: AlertNotification) => void;
  isConsoleLocked?: boolean;
  onLockConsole?: () => void;
  onUnlockConsole?: () => void;
  onResetFleetData?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentView,
  onNavigate,
  onOpenOnboarding,
  onOpenRegisterUser,
  onOpenSupabaseConfig,
  onOpenMapsKeyModal,
  usersCount,
  tenantsCount,
  systemLatencyMs = 16,
  onOpenSearch,
  isDarkMode,
  onToggleDarkMode,
  alerts,
  onMarkAlertRead,
  onMarkAllAlertsRead,
  activeImpersonatedTenant,
  onExitImpersonation,
  onAlertAction,
  isConsoleLocked = false,
  onLockConsole,
  onUnlockConsole,
  onResetFleetData,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<'prod' | 'staging'>('prod');
  const { showToast } = useToast();

  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadAlerts = alerts.filter((a) => !a.read);
  const supabaseConfig = getSupabaseConfig();

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlertsMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, category: 'Core' },
    { id: 'tenants', label: 'Tenants Directory', icon: Building2, badge: tenantsCount !== undefined ? tenantsCount.toLocaleString() : undefined, category: 'Core' },
    { id: 'fleet-map', label: 'Pakistan Fleet Map', icon: MapPin, badge: 'Maps', category: 'Core' },
    { id: 'users', label: 'Users & Staff', icon: Users, badge: usersCount ? usersCount.toLocaleString() : undefined, category: 'Core' },
    { id: 'billing', label: 'Billing & Ledger', icon: Receipt, category: 'Monetization' },
    { id: 'audit', label: 'Audit Logs & SecOps', icon: ShieldCheck, category: 'Governance' },
    { id: 'telemetry', label: 'System Telemetry', icon: Activity, category: 'Governance' },
  ];

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Command Center';
      case 'tenants':
        return 'Tenant Management';
      case 'fleet-map':
        return 'Pakistan Restaurants & Location Fleet (Google Maps)';
      case 'users':
        return 'Restaurant Users & Staff Registry';
      case 'billing':
        return 'Billing & Financial Ledger';
      case 'audit':
        return 'Audit Logs & Security';
      case 'telemetry':
        return 'System Health Telemetry';
      default:
        return 'Overview';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#f9fafb] dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      {/* Impersonation Banner if active */}
      {activeImpersonatedTenant && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 border-b border-amber-600 shadow-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            <span>
              IMPERSONATING TENANT: <strong>{activeImpersonatedTenant.tradeName}</strong> ({activeImpersonatedTenant.id}) as Super Admin Sarah Lin.
            </span>
            <span className="hidden md:inline text-slate-900/80 font-normal">
              (All actions are cryptographically signed to audit trail)
            </span>
          </div>
          <button
            onClick={onExitImpersonation}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded font-medium hover:bg-slate-800 transition-colors text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Impersonation</span>
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f141f] flex flex-col justify-between transition-all duration-300 z-30 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div>
            {/* Brand / Logo Area */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                      GustoOS <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">HQ</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Super Admin Portal
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar Collapse Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label="Toggle sidebar"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="p-3 space-y-1.5">
              <button
                onClick={onOpenOnboarding}
                className={`w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 px-3 shadow-xs hover:shadow transition-all duration-150 ${
                  sidebarCollapsed ? 'px-0' : ''
                }`}
                title="Onboard New Restaurant Tenant"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                {!sidebarCollapsed && <span>New Restaurant</span>}
              </button>

              {onOpenRegisterUser && (
                <button
                  onClick={onOpenRegisterUser}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs py-2 px-3 transition-all duration-150 border border-slate-200/60 dark:border-slate-700/60 ${
                    sidebarCollapsed ? 'px-0' : ''
                  }`}
                  title="Register SaaS User in Supabase"
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  {!sidebarCollapsed && <span>Register User</span>}
                </button>
              )}
            </div>

            {/* Navigation Groups */}
            <nav className="px-3 space-y-6 pt-2">
              {['Core', 'Monetization', 'Governance'].map((category) => {
                const itemsInCategory = navItems.filter((i) => i.category === category);
                if (itemsInCategory.length === 0) return null;

                return (
                  <div key={category}>
                    {!sidebarCollapsed && (
                      <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {category}
                      </p>
                    )}
                    <div className="space-y-1">
                      {itemsInCategory.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group ${
                              isActive
                                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                            title={sidebarCollapsed ? item.label : undefined}
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <item.icon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                                }`}
                              />
                              {!sidebarCollapsed && (
                                <span className="truncate">{item.label}</span>
                              )}
                            </span>
                            {!sidebarCollapsed && item.badge && (
                              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer / System Badge */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/60">
            {!sidebarCollapsed ? (
              <button
                onClick={() => onNavigate('telemetry')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-xs transition-colors cursor-pointer group"
                title={`Cluster Telemetry: ${systemLatencyMs}ms live RTT ping • Click to inspect all edge nodes`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate pr-1">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        alerts.some((a) => !a.read && (a.severity === 'critical' || a.severity === 'warning'))
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-emerald-500 animate-pulse'
                      }`}
                    />
                    <span className="truncate">
                      {alerts.some((a) => !a.read && (a.severity === 'critical' || a.severity === 'warning'))
                        ? 'Attention Needed'
                        : 'Fleet Operational'}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">PK-Edge</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Live RTT Ping</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">
                    {systemLatencyMs}ms →
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('telemetry')}
                className="flex justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full cursor-pointer"
                title={`Fleet Telemetry: ${systemLatencyMs}ms live RTT ping - Click to view`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0f141f]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
            {/* Left: Breadcrumbs & Context */}
            <div className="flex items-center gap-3">
              <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-medium">
                <span className="text-slate-400">HQ</span>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {getBreadcrumbTitle()}
                </span>
              </nav>

              {/* Environment Indicator Pill - Interactive Cluster Switcher */}
              <button
                onClick={() => {
                  const nextEnv = selectedEnvironment === 'prod' ? 'staging' : 'prod';
                  setSelectedEnvironment(nextEnv);
                  showToast(
                    'Switched Cluster Context',
                    `Active management context changed to ${
                      nextEnv === 'prod' ? 'Production (us-east)' : 'Staging Sandbox (eu-west)'
                    }.`,
                    'info'
                  );
                }}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all shadow-2xs cursor-pointer hover:shadow-xs ${
                  selectedEnvironment === 'prod'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                }`}
                title="Click to toggle between Production and Staging clusters"
              >
                <Server
                  className={`w-3 h-3 ${
                    selectedEnvironment === 'prod' ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                />
                <span>
                  {selectedEnvironment === 'prod'
                    ? 'Production (us-east)'
                    : 'Staging Sandbox (eu-west)'}
                </span>
                <span className="text-[9px] opacity-70 ml-0.5">⇄</span>
              </button>
            </div>

            {/* Right: Search, Alerts, Theme, Admin Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cmd+K Search Bar Trigger */}
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-2xs group"
                title="Search Command Palette (Cmd+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                <span className="hidden md:inline">Quick search restaurants or actions...</span>
                <span className="md:hidden">Search...</span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  ⌘K
                </kbd>
              </button>

              {/* Supabase Status Button */}
              {onOpenSupabaseConfig && (
                <button
                  onClick={onOpenSupabaseConfig}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all shadow-2xs cursor-pointer ${
                    supabaseConfig.isConfigured
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title={
                    supabaseConfig.isConfigured
                      ? `Supabase Database active • Schema: ${supabaseConfig.schema || 'public'} • Prefix: "${supabaseConfig.tablePrefix}"`
                      : 'Connect your existing Supabase / PostgreSQL database'
                  }
                >
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {supabaseConfig.isConfigured
                      ? `Supabase (${supabaseConfig.tablePrefix || 'live'})`
                      : 'Connect DB'}
                  </span>
                </button>
              )}

              {/* Google Maps (Pakistan) Config Button */}
              {onOpenMapsKeyModal && (
                <button
                  onClick={onOpenMapsKeyModal}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all shadow-2xs bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50"
                  title="Google Maps Platform configured for Pakistan"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Maps (Pakistan)</span>
                </button>
              )}

              {/* Dark / Light Mode Switch */}
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Alert Notification Bell with Flyout */}
              <div className="relative" ref={alertsRef}>
                <button
                  onClick={() => setShowAlertsMenu(!showAlertsMenu)}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors relative"
                  aria-label="View system alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlerts.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {/* Alerts Dropdown Popover */}
                <AnimatePresence>
                  {showAlertsMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 text-xs"
                    >
                      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            Action & System Alerts
                          </span>
                          {unreadAlerts.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                              {unreadAlerts.length} new
                            </span>
                          )}
                        </div>
                        {unreadAlerts.length > 0 && (
                          <button
                            onClick={onMarkAllAlertsRead}
                            className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {alerts.length === 0 ? (
                          <div className="p-6 text-center text-slate-400">
                            No notifications right now.
                          </div>
                        ) : (
                          alerts.map((alert) => (
                            <div
                              key={alert.id}
                              className={`p-3.5 flex items-start gap-3 transition-colors ${
                                !alert.read
                                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                              }`}
                            >
                              {alert.severity === 'critical' && (
                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              )}
                              {alert.severity === 'warning' && (
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              )}
                              {alert.severity === 'info' && (
                                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                                  {alert.title}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                  {alert.description}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                                  {alert.actionLabel && (
                                    <button
                                      onClick={() => {
                                        onAlertAction(alert);
                                        setShowAlertsMenu(false);
                                      }}
                                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                      <span>{alert.actionLabel}</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {!alert.read && (
                                <button
                                  onClick={() => onMarkAlertRead(alert.id)}
                                  className="text-slate-400 hover:text-slate-600 p-1"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Super Admin Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 p-1 sm:pl-2 sm:pr-2.5 sm:py-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  aria-label="Admin profile menu"
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Sarah Lin"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold leading-none text-slate-900 dark:text-slate-100">
                      Sarah Lin
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Lead Architect
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Popover */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                            Super Admin
                          </span>
                          <span className="text-[10px] text-slate-400">ID: ADM-01</span>
                        </div>
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                          Sarah Lin
                        </p>
                        <p className="text-slate-400 text-[11px] truncate">
                          sarah.lin@restosaas.internal
                        </p>
                      </div>

                      {/* Environment switch */}
                      <div className="p-2">
                        <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Active Cluster
                        </p>
                        <div className="space-y-1">
                          <button
                            onClick={() => setSelectedEnvironment('prod')}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                              selectedEnvironment === 'prod'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Production (US-East)</span>
                            </span>
                            {selectedEnvironment === 'prod' && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setSelectedEnvironment('staging')}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                              selectedEnvironment === 'staging'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Staging Sandbox (EU-West)</span>
                            </span>
                            {selectedEnvironment === 'staging' && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
                        <button
                          onClick={() => {
                            onNavigate('audit');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>My Admin Audit Trail</span>
                        </button>
                        {onResetFleetData && (
                          <button
                            onClick={() => {
                              onResetFleetData();
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-medium"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Reset Fleet to Demo Seed</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onLockConsole?.();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Lock Console (SSO)</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Fluid Content Container */}
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Enterprise Security Console Lock Screen */}
      <ConsoleLockScreen
        isLocked={isConsoleLocked}
        onUnlock={() => onUnlockConsole?.()}
        adminName="Sarah Lin (Lead Architect)"
        adminEmail="sarah.lin@restosaas.internal"
        adminAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
      />
    </div>
  );
};
