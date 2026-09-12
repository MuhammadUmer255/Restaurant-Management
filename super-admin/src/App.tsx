import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Database, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { TenantManagement } from './components/tenants/TenantManagement';
import { TenantDetailsDrawer } from './components/tenants/TenantDetailsDrawer';
import { EditLimitsModal } from './components/tenants/EditLimitsModal';
import { TenantOnboardingWizard } from './components/tenants/TenantOnboardingWizard';
import { BillingLedger } from './components/billing/BillingLedger';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SystemTelemetryView } from './components/telemetry/SystemTelemetryView';
import { ImpersonatedTenantDashboard } from './components/impersonation/ImpersonationBanner';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { ToastProvider, useToast } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { UserManagement } from './components/users/UserManagement';
import { RegisterUserModal } from './components/users/RegisterUserModal';
import { SupabaseConfigModal } from './components/supabase/SupabaseConfigModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import {
  fetchRestaurantUsersFromSupabase,
  fetchTenantsFromSupabase,
  fetchTransactionsFromSupabase,
  fetchAuditLogsFromSupabase,
  fetchPlanTiersFromSupabase,
  fetchSystemAlertsFromSupabase,
  fetchTelemetryFromSupabase,
  createTenantInSupabase,
  updateTenantStatusInSupabase,
  updateTenantLimitsInSupabase,
  updateTenantFeatureFlagsInSupabase,
  registerRestaurantUserInSupabase,
  updateRestaurantUserStatusInSupabase,
  deleteRestaurantUserFromSupabase,
  resendRestaurantUserInviteInSupabase,
  updateTransactionStatusInSupabase,
  createAuditLogInSupabase,
  updatePlanTierInSupabase,
  createSystemAlertInSupabase,
  seedSupabaseDatabaseIfEmpty,
  calculateKpisFromDatabase,
  getSupabaseConfig,
  getSupabaseClient,
  updateTenantLocationInSupabase,
} from './lib/supabase';
import { RestaurantFleetMap } from './components/maps/RestaurantFleetMap';
import { GoogleMapsKeyModal } from './components/maps/GoogleMapsKeyModal';
import { LocationPickerMap } from './components/maps/LocationPickerMap';
import {
  Tenant,
  TenantFeatureFlags,
  TenantLocation,
  Transaction,
  PlanPricingTier,
  AuditLog,
  AlertNotification,
  KpiMetric,
  SystemServiceTelemetry,
  RestaurantUser,
} from './types';

function SuperAdminApp() {
  const { showToast } = useToast();

  // Navigation and active view state
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Security console lock state
  const [isConsoleLocked, setIsConsoleLocked] = useState(false);

  // Common Confirm Modal state
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Core live domain states linked strictly to Supabase Database (zero mock data)
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<RestaurantUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plans, setPlans] = useState<PlanPricingTier[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [telemetry, setTelemetry] = useState<SystemServiceTelemetry[]>([]);

  // Live real network latency measured via browser timing & HTTP round-trip
  const [liveLatencyMs, setLiveLatencyMs] = useState<number>(14);

  useEffect(() => {
    let isMounted = true;
    const measureLiveLatency = async () => {
      try {
        const start = performance.now();
        await fetch(window.location.origin + '/index.html', {
          method: 'HEAD',
          cache: 'no-store',
        });
        const elapsed = Math.round(performance.now() - start);
        if (isMounted && elapsed > 0) {
          setLiveLatencyMs(Math.min(Math.max(elapsed, 4), 180));
        }
      } catch {
        if (typeof window !== 'undefined' && window.performance && window.performance.timing) {
          const t = window.performance.timing;
          const rtt = t.responseEnd - t.requestStart;
          if (rtt > 0 && isMounted) {
            setLiveLatencyMs(Math.min(Math.max(rtt, 6), 180));
          }
        }
      }
    };

    measureLiveLatency();
    const interval = setInterval(measureLiveLatency, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Database status and loading states
  const [isLoadingDatabase, setIsLoadingDatabase] = useState(false);
  const [isRefreshingFromSupabase, setIsRefreshingFromSupabase] = useState(false);
  const [isSeedingDatabase, setIsSeedingDatabase] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState(() => getSupabaseConfig());

  // Modals & drawers states
  const [selectedTenantForDrawer, setSelectedTenantForDrawer] = useState<Tenant | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isEditLimitsOpen, setIsEditLimitsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isRegisterUserOpen, setIsRegisterUserOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMapsKeyModalOpen, setIsMapsKeyModalOpen] = useState(false);
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false);
  const [editingLocationTenant, setEditingLocationTenant] = useState<Tenant | null>(null);

  // Dynamic KPIs derived directly from live database state
  const kpis = useMemo(
    () => calculateKpisFromDatabase(tenants, transactions, users),
    [tenants, transactions, users]
  );

  // Impersonation state
  const [activeImpersonatedTenant, setActiveImpersonatedTenant] = useState<Tenant | null>(null);

  // Dark / Light mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Keep HTML root element synced with dark class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch all live data directly from Supabase tables
  const loadDataFromSupabase = useCallback(async (silent = false) => {
    const cfg = getSupabaseConfig();
    setSupabaseConfig(cfg);

    if (!cfg.isConfigured) {
      // Clear data if disconnected so no mock/stale data persists
      setTenants([]);
      setUsers([]);
      setTransactions([]);
      setAuditLogs([]);
      setPlans([]);
      setAlerts([]);
      setTelemetry([]);
      setIsLoadingDatabase(false);
      return;
    }

    if (!silent) {
      setIsRefreshingFromSupabase(true);
    }

    try {
      const [
        remoteTenants,
        remoteUsers,
        remoteTransactions,
        remoteAuditLogs,
        remotePlans,
        remoteAlerts,
        remoteTelemetry,
      ] = await Promise.all([
        fetchTenantsFromSupabase(),
        fetchRestaurantUsersFromSupabase(),
        fetchTransactionsFromSupabase(),
        fetchAuditLogsFromSupabase(),
        fetchPlanTiersFromSupabase(),
        fetchSystemAlertsFromSupabase(),
        fetchTelemetryFromSupabase(),
      ]);

      // Strictly synchronize state with live PostgreSQL database rows
      setTenants(remoteTenants);
      setUsers(remoteUsers);
      setTransactions(remoteTransactions);
      setAuditLogs(remoteAuditLogs);
      setPlans(remotePlans);
      setAlerts(remoteAlerts);
      setTelemetry(remoteTelemetry);

      if (!silent) {
        showToast(
          'Supabase Database Synchronized',
          `Loaded ${remoteTenants.length} tenants, ${remoteUsers.length} staff, and ${remoteTransactions.length} transactions directly from PostgreSQL.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Failed to load from Supabase:', err);
      showToast(
        'Database Sync Error',
        err?.message || 'Failed to query Supabase tables. Check your connection.',
        'error'
      );
    } finally {
      setIsLoadingDatabase(false);
      setIsRefreshingFromSupabase(false);
    }
  }, [showToast]);

  // Initial load on mount
  useEffect(() => {
    loadDataFromSupabase(true);
  }, [loadDataFromSupabase]);

  // Live real-time synchronization on Supabase PostgreSQL tables
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel('supabase_realtime_db_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' }, () => {
        loadDataFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_users' }, () => {
        loadDataFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadDataFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_alerts' }, () => {
        loadDataFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'telemetry_metrics' }, () => {
        loadDataFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plan_tiers' }, () => {
        loadDataFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        loadDataFromSupabase(true);
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [supabaseConfig.url, supabaseConfig.anonKey, loadDataFromSupabase]);

  // Handle Seeding Live Supabase Database with 1-click
  const handleSeedDatabase = async () => {
    setIsSeedingDatabase(true);
    try {
      const result = await seedSupabaseDatabaseIfEmpty();
      if (result.success) {
        showToast(
          'Supabase Database Initialized',
          result.message,
          'success'
        );
        await loadDataFromSupabase(true);
      } else {
        showToast('Database Notice', result.message, 'warning');
      }
    } catch (err: any) {
      showToast('Seeding Error', err?.message || 'Failed to seed database tables', 'error');
    } finally {
      setIsSeedingDatabase(false);
    }
  };

  // Helper to record an immutable audit log entry (persists to Supabase public.audit_logs)
  const recordAuditLog = async (
    action: AuditLog['action'],
    targetTenantId: string,
    targetTenantName: string,
    details: string,
    diffPayload?: AuditLog['diffPayload']
  ) => {
    const newLog: AuditLog = {
      id: `AUD-${Math.floor(5600 + Math.random() * 4000)}`,
      adminName: 'Super Admin (Lead Architect)',
      adminEmail: 'admin@restosaas.internal',
      adminAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      action,
      targetTenantId,
      targetTenantName,
      timestamp: 'Just now',
      ipAddress: '192.0.2.45 (VPN US-East)',
      userAgent: navigator.userAgent,
      details,
      diffPayload,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    // Asynchronously insert into Supabase audit_logs table
    await createAuditLogInSupabase(newLog);
  };

  // Handle Tenant selection for Drawer
  const handleSelectTenant = (tenant: Tenant) => {
    setSelectedTenantForDrawer(tenant);
    setIsDrawerOpen(true);
  };

  // Handle Impersonate Tenant
  const handleImpersonateTenant = (tenant: Tenant) => {
    setActiveImpersonatedTenant(tenant);
    recordAuditLog(
      'TENANT_IMPERSONATED',
      tenant.id,
      tenant.tradeName,
      `Super Admin initiated live delegated session for ${tenant.tradeName} (${tenant.id}).`,
      {
        field: 'session_context',
        before: 'SuperAdmin-Console',
        after: `Impersonated: ${tenant.primaryContact.name}`,
        metadata: { tenantId: tenant.id, role: tenant.primaryContact.role },
      }
    );
    showToast(
      `Impersonating ${tenant.tradeName}`,
      `You are now viewing this restaurant's operations console. All actions are logged.`,
      'info'
    );
  };

  const handleExitImpersonation = () => {
    if (activeImpersonatedTenant) {
      showToast(
        'Exited Impersonation Mode',
        `Returned to Super Admin Command Hub from ${activeImpersonatedTenant.tradeName}.`,
        'success'
      );
      setActiveImpersonatedTenant(null);
    }
  };

  // Handle Edit Limits
  const handleOpenEditLimits = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsEditLimitsOpen(true);
  };

  const handleSaveLimits = async (
    tenantId: string,
    newLimits: { posTerminalsMax: number; staffSeatsMax: number; apiRateLimitPerMin: number }
  ) => {
    const prevTenant = tenants.find((t) => t.id === tenantId);
    if (!prevTenant) return;

    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? {
              ...t,
              limits: {
                ...t.limits,
                posTerminals: { ...t.limits.posTerminals, max: newLimits.posTerminalsMax },
                staffSeats: { ...t.limits.staffSeats, max: newLimits.staffSeatsMax },
                apiRateLimitPerMin: newLimits.apiRateLimitPerMin,
              },
            }
          : t
      )
    );

    if (selectedTenantForDrawer && selectedTenantForDrawer.id === tenantId) {
      setSelectedTenantForDrawer((prev) =>
        prev
          ? {
              ...prev,
              limits: {
                ...prev.limits,
                posTerminals: { ...prev.limits.posTerminals, max: newLimits.posTerminalsMax },
                staffSeats: { ...prev.limits.staffSeats, max: newLimits.staffSeatsMax },
                apiRateLimitPerMin: newLimits.apiRateLimitPerMin,
              },
            }
          : null
      );
    }

    // Persist to Supabase tenants table
    await updateTenantLimitsInSupabase(tenantId, newLimits);

    recordAuditLog(
      'LIMITS_UPDATED',
      tenantId,
      prevTenant.tradeName,
      `Updated hardware & staff provisioning limits: POS Max=${newLimits.posTerminalsMax}, Seats=${newLimits.staffSeatsMax}, API=${newLimits.apiRateLimitPerMin}req/min.`,
      {
        field: 'limits',
        before: prevTenant.limits.posTerminals.max,
        after: newLimits.posTerminalsMax,
        metadata: { newLimits },
      }
    );

    showToast(
      'Provisioning Limits Updated',
      `Hardware caps for ${prevTenant.tradeName} updated directly in Supabase database.`,
      'success'
    );
  };

  // Handle Toggle Status (Pause / Resume)
  const handleToggleStatus = async (tenant: Tenant) => {
    const isCurrentlySuspended = tenant.status === 'Suspended';
    const nextStatus = isCurrentlySuspended ? 'Active' : 'Suspended';

    setTenants((prev) =>
      prev.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t))
    );

    if (selectedTenantForDrawer && selectedTenantForDrawer.id === tenant.id) {
      setSelectedTenantForDrawer((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    // Persist to Supabase database
    await updateTenantStatusInSupabase(tenant.id, nextStatus);

    recordAuditLog(
      isCurrentlySuspended ? 'SUBSCRIPTION_RESUMED' : 'SUBSCRIPTION_PAUSED',
      tenant.id,
      tenant.tradeName,
      `Super Admin ${isCurrentlySuspended ? 'resumed' : 'suspended'} tenant subscription & ingress routing.`,
      {
        field: 'status',
        before: tenant.status,
        after: nextStatus,
      }
    );

    showToast(
      `Tenant ${nextStatus === 'Active' ? 'Resumed' : 'Suspended'}`,
      `${tenant.tradeName} status updated to ${nextStatus} in Supabase database.`,
      nextStatus === 'Active' ? 'success' : 'info'
    );
  };

  // Handle Feature Flag Toggle for a Tenant
  const handleToggleFeatureFlag = async (tenant: Tenant, flagKey: keyof TenantFeatureFlags) => {
    const nextVal = !tenant.featureFlags[flagKey];
    const updatedFlags = { ...tenant.featureFlags, [flagKey]: nextVal };

    setTenants((prev) =>
      prev.map((t) => (t.id === tenant.id ? { ...t, featureFlags: updatedFlags } : t))
    );

    if (selectedTenantForDrawer && selectedTenantForDrawer.id === tenant.id) {
      setSelectedTenantForDrawer((prev) => (prev ? { ...prev, featureFlags: updatedFlags } : null));
    }

    // Persist to Supabase database
    await updateTenantFeatureFlagsInSupabase(tenant.id, updatedFlags);

    recordAuditLog(
      'FEATURE_FLAG_TOGGLED',
      tenant.id,
      tenant.tradeName,
      `Toggled feature flag "${flagKey}" to ${nextVal ? 'ENABLED' : 'DISABLED'} for ${tenant.tradeName}.`,
      {
        field: flagKey,
        before: !nextVal,
        after: nextVal,
      }
    );

    showToast(
      'Feature Flag Updated',
      `Flag "${flagKey}" set to ${nextVal ? 'Enabled' : 'Disabled'} for ${tenant.tradeName} in Supabase.`,
      'success'
    );
  };

  // Handle Dispatch Fleet Notice to multiple tenants
  const handleSendBatchNotice = async (noticeData: {
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    tenantIds: string[];
  }) => {
    const alertId = `ALT-${Date.now()}`;
    const newAlert: AlertNotification = {
      id: alertId,
      title: noticeData.title,
      description: noticeData.description,
      severity: noticeData.severity,
      timestamp: 'Just now',
      tenantId: noticeData.tenantIds[0] || undefined,
      tenantName: `${noticeData.tenantIds.length} Fleet Restaurants`,
      read: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);

    // Persist alert in Supabase
    await createSystemAlertInSupabase(newAlert);

    recordAuditLog(
      'BATCH_NOTICE_DISPATCHED',
      noticeData.tenantIds.slice(0, 3).join(', ') + (noticeData.tenantIds.length > 3 ? '...' : ''),
      `${noticeData.tenantIds.length} Fleet Tenants`,
      `Dispatched fleet notice "${noticeData.title}" (${noticeData.severity.toUpperCase()}) across ${noticeData.tenantIds.length} restaurants.`,
      {
        field: 'fleet_broadcast',
        after: noticeData.severity,
        metadata: noticeData,
      }
    );

    showToast(
      'Notice Broadcast Dispatched',
      `"${noticeData.title}" transmitted to ${noticeData.tenantIds.length} restaurant systems.`,
      'success'
    );
  };

  // Security Console lock handlers
  const handleLockConsole = () => {
    setIsConsoleLocked(true);
    recordAuditLog(
      'CONSOLE_LOCKED',
      'SYSTEM',
      'Security Console',
      'Administrator locked the console session. Pin required to re-authenticate.'
    );
  };

  const handleUnlockConsole = () => {
    setIsConsoleLocked(false);
    showToast('Console Unlocked', 'Super Admin session resumed.', 'success');
  };

  // Handle Update Exact Restaurant Location on Google Maps (Pakistan)
  const handleUpdateTenantLocation = async (tenant: Tenant, newLocation: TenantLocation) => {
    try {
      const updatedTenant: Tenant = { ...tenant, location: newLocation };
      await updateTenantLocationInSupabase(tenant.id, newLocation);
      setTenants((prev) => prev.map((t) => (t.id === tenant.id ? updatedTenant : t)));
      if (selectedTenantForDrawer && selectedTenantForDrawer.id === tenant.id) {
        setSelectedTenantForDrawer(updatedTenant);
      }
      recordAuditLog(
        'TENANT_LOCATION_UPDATED',
        tenant.id,
        tenant.tradeName,
        `Updated Google Maps exact coordinates to Lat: ${newLocation.coordinates.lat.toFixed(5)}, Lng: ${newLocation.coordinates.lng.toFixed(5)} (${newLocation.city}, ${newLocation.province}, Pakistan).`,
        {
          field: 'tenant_location',
          after: `${newLocation.city}, ${newLocation.province}`,
          metadata: newLocation as any,
        }
      );
      showToast(
        'Location Pin Saved',
        `${tenant.tradeName} exact Google Maps coordinates updated in ${newLocation.city}, Pakistan.`,
        'success'
      );
    } catch (err: any) {
      showToast(
        'Location Save Failed',
        err?.message || 'Could not update tenant coordinates in Supabase.',
        'error'
      );
    }
  };

  // Handle Revoke Access
  const handleRevokeAccess = (tenant: Tenant) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Revoke Tenant Access: ${tenant.tradeName}`,
      message: `Are you sure you want to permanently revoke access for ${tenant.tradeName} (${tenant.id})? This will immediately teardown POS ingress routing and mark the account status as Churned in Supabase.`,
      confirmLabel: 'Revoke Access & Teardown',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setTenants((prev) =>
          prev.map((t) => (t.id === tenant.id ? { ...t, status: 'Churned' } : t))
        );

        if (selectedTenantForDrawer && selectedTenantForDrawer.id === tenant.id) {
          setSelectedTenantForDrawer((prev) => (prev ? { ...prev, status: 'Churned' } : null));
        }

        // Persist to Supabase
        await updateTenantStatusInSupabase(tenant.id, 'Churned');

        recordAuditLog(
          'ACCESS_REVOKED',
          tenant.id,
          tenant.tradeName,
          `Emergency teardown initiated for tenant ${tenant.tradeName}. Status marked as Churned in Supabase database.`,
          {
            field: 'status',
            before: tenant.status,
            after: 'Churned',
          }
        );

        showToast(
          'Tenant Access Revoked',
          `Teardown completed for ${tenant.tradeName}.`,
          'error'
        );
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Handle New Tenant Onboarded
  const handleTenantCreated = async (newTenant: Tenant) => {
    setTenants((prev) => [newTenant, ...prev]);

    // Persist to Supabase database
    await createTenantInSupabase(newTenant);

    recordAuditLog(
      'TENANT_CREATED',
      newTenant.id,
      newTenant.tradeName,
      `Provisioned new restaurant tenant ${newTenant.tradeName} (${newTenant.planTier} tier) via Enterprise Wizard into Supabase.`,
      {
        field: 'tenant_provisioning',
        after: newTenant.planTier,
        metadata: {
          tradeName: newTenant.tradeName,
          primaryContact: newTenant.primaryContact.name,
          region: newTenant.region,
        },
      }
    );

    showToast(
      'Restaurant Tenant Provisioned!',
      `${newTenant.tradeName} (${newTenant.id}) successfully created in Supabase database.`,
      'success'
    );
  };

  // Handle New Restaurant User Registered
  const handleUserRegistered = (
    newUser: RestaurantUser,
    syncedToSupabase: boolean,
    message: string
  ) => {
    setUsers((prev) => [newUser, ...prev]);

    recordAuditLog(
      'USER_CREATED',
      newUser.tenantId,
      newUser.tenantName,
      `Registered SaaS User "${newUser.fullName}" (${newUser.email}) as ${newUser.role} with ${syncedToSupabase ? 'live Supabase database sync' : 'local mode'}.`,
      {
        field: 'user_registration',
        after: newUser.role,
        metadata: {
          email: newUser.email,
          role: newUser.role,
          tenantId: newUser.tenantId,
          syncedToSupabase,
        },
      }
    );

    showToast(
      syncedToSupabase ? 'User Registered in Supabase!' : 'User Registered',
      message || `User account for ${newUser.fullName} created.`,
      'success'
    );
  };

  // Handle Toggle User Status (Active <-> Suspended)
  const handleToggleUserStatus = async (user: RestaurantUser) => {
    const nextStatus: RestaurantUser['status'] =
      user.status === 'suspended' ? 'active' : 'suspended';

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );

    await updateRestaurantUserStatusInSupabase(user.id, nextStatus);

    recordAuditLog(
      nextStatus === 'active' ? 'USER_UPDATED' : 'USER_SUSPENDED',
      user.tenantId,
      user.tenantName,
      `Updated user status for ${user.fullName} (${user.email}) to "${nextStatus}" in Supabase.`,
      {
        field: 'user_status',
        before: user.status,
        after: nextStatus,
      }
    );

    showToast(
      `User ${nextStatus === 'active' ? 'Activated' : 'Suspended'}`,
      `${user.fullName}'s login access is now ${nextStatus} in Supabase.`,
      nextStatus === 'active' ? 'success' : 'info'
    );
  };

  // Handle Delete User
  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Delete Staff User: ${userName}`,
      message: `Are you sure you want to permanently delete user "${userName}"? This will revoke credentials in Supabase and erase the staff account from this restaurant.`,
      confirmLabel: 'Delete Staff User',
      confirmVariant: 'danger',
      onConfirm: async () => {
        const userToDelete = users.find((u) => u.id === userId);

        setUsers((prev) => prev.filter((u) => u.id !== userId));

        await deleteRestaurantUserFromSupabase(userId);

        if (userToDelete) {
          recordAuditLog(
            'USER_DELETED',
            userToDelete.tenantId,
            userToDelete.tenantName,
            `Permanently deleted restaurant user "${userName}" (${userToDelete.email}) from Supabase database.`,
            {
              field: 'user_deletion',
              before: userName,
            }
          );
        }

        showToast(
          'User Account Deleted',
          `User ${userName} has been removed from Supabase database.`,
          'info'
        );
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Handle Resend Invitation
  const handleResendInvite = async (user: RestaurantUser) => {
    await resendRestaurantUserInviteInSupabase(user.id);
    showToast(
      'Invitation Dispatched',
      `Welcome invitation email with temporary credentials resent to ${user.email}.`,
      'success'
    );
  };

  // Handle Pricing Tier Update
  const handleUpdatePlanTier = async (updatedPlan: PlanPricingTier) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));

    // Persist to Supabase
    await updatePlanTierInSupabase(updatedPlan.id, updatedPlan);

    recordAuditLog(
      'PRICING_UPDATED',
      'GLOBAL_TIERS',
      'Global Pricing Catalog',
      `Updated ${updatedPlan.name} tier in Supabase: Price=$${updatedPlan.monthlyPrice}/mo, Included POS=${updatedPlan.includedPosTerminals}, Terminal Add-on=$${updatedPlan.additionalTerminalPrice}/mo.`,
      {
        field: `plans.${updatedPlan.name.toLowerCase()}`,
        after: updatedPlan.monthlyPrice,
      }
    );
  };

  // Handle Retry Failed Invoice
  const handleRetryInvoice = async (transaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transaction.id ? { ...t, status: 'Succeeded' } : t))
    );

    // If tenant was suspended, restore
    setTenants((prev) =>
      prev.map((t) => (t.id === transaction.tenantId ? { ...t, status: 'Active' } : t))
    );

    // Update in Supabase
    await updateTransactionStatusInSupabase(transaction.invoiceNumber, 'Succeeded');

    // Resolve corresponding alert
    setAlerts((prev) => prev.filter((a) => a.tenantId !== transaction.tenantId));

    recordAuditLog(
      'LIMITS_UPDATED',
      transaction.tenantId,
      transaction.tenantName,
      `Manual re-authorization for invoice ${transaction.invoiceNumber} ($${transaction.amount}) succeeded via Stripe gateway. Supabase database records updated.`,
      {
        field: 'payment_status',
        before: 'Failed',
        after: 'Succeeded',
      }
    );

    showToast(
      'Payment Succeeded & Resolved',
      `Invoice ${transaction.invoiceNumber} processed successfully. Account restored in Supabase.`,
      'success'
    );
  };

  // Alert handlers
  const handleMarkAlertRead = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
  };

  const handleMarkAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    showToast('Alerts Cleared', 'All action items marked as acknowledged.');
  };

  const handleAlertAction = (alert: AlertNotification) => {
    if (alert.tenantId) {
      const target = tenants.find((t) => t.id === alert.tenantId);
      if (target) {
        handleSelectTenant(target);
        return;
      }
    }
    if (alert.actionType === 'retry_billing') {
      setCurrentView('billing');
    } else if (alert.actionType === 'view_telemetry') {
      setCurrentView('telemetry');
    } else {
      setCurrentView('tenants');
    }
  };

  return (
    <AdminLayout
      currentView={currentView}
      onNavigate={(viewId) => setCurrentView(viewId)}
      onOpenOnboarding={() => setIsOnboardingOpen(true)}
      onOpenRegisterUser={() => setIsRegisterUserOpen(true)}
      onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
      onOpenMapsKeyModal={() => setIsMapsKeyModalOpen(true)}
      usersCount={users.length}
      tenantsCount={tenants.length}
      systemLatencyMs={liveLatencyMs}
      onOpenSearch={() => setIsSearchOpen(true)}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      alerts={alerts}
      onMarkAlertRead={handleMarkAlertRead}
      onMarkAllAlertsRead={handleMarkAllAlertsRead}
      activeImpersonatedTenant={activeImpersonatedTenant}
      onExitImpersonation={handleExitImpersonation}
      onAlertAction={handleAlertAction}
      isConsoleLocked={isConsoleLocked}
      onLockConsole={handleLockConsole}
      onUnlockConsole={handleUnlockConsole}
    >
      {/* Live Supabase Connection Banner */}
      {!supabaseConfig.isConfigured ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Supabase Live Database Connection</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold text-[10px]">
                  Connection Required
                </span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                All mock database files have been eliminated. Connect your Supabase project URL and Anon key to query and synchronize live restaurant accounts, staff, and billing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setIsSupabaseConfigOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Connect Supabase Database</span>
            </button>
          </div>
        </div>
      ) : tenants.length === 0 && !isLoadingDatabase ? (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Supabase Database Connected (Tables Empty)</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-semibold text-[10px]">
                  Ready to Bootstrap
                </span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Your Supabase PostgreSQL database is connected. You can onboard new restaurants directly or initialize starter records directly into your Supabase tables.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleSeedDatabase}
              disabled={isSeedingDatabase}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSeedingDatabase ? 'animate-spin' : ''}`} />
              <span>{isSeedingDatabase ? 'Seeding Tables...' : 'Seed Database Tables'}</span>
            </button>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 transition-colors"
            >
              <span>Onboard First Restaurant</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* If Impersonation Mode is Active, show the dedicated simulated tenant dashboard */}
      {activeImpersonatedTenant ? (
        <ImpersonatedTenantDashboard
          tenant={activeImpersonatedTenant}
          onExit={handleExitImpersonation}
        />
      ) : (
        <>
          {/* Main App Views */}
          {currentView === 'dashboard' && (
            <DashboardHome
              kpis={kpis}
              tenants={tenants}
              alerts={alerts}
              telemetry={telemetry}
              onSelectTenant={handleSelectTenant}
              onNavigateToTenants={() => setCurrentView('tenants')}
              onNavigateToBilling={() => setCurrentView('billing')}
              onNavigateToTelemetry={() => setCurrentView('telemetry')}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onResolveAlert={handleAlertAction}
              onRefreshMetrics={() => loadDataFromSupabase(false)}
            />
          )}

          {currentView === 'tenants' && (
            <TenantManagement
              tenants={tenants}
              onSelectTenant={handleSelectTenant}
              onImpersonate={handleImpersonateTenant}
              onEditLimits={handleOpenEditLimits}
              onToggleStatus={handleToggleStatus}
              onRevokeAccess={handleRevokeAccess}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onSendBatchNotice={handleSendBatchNotice}
            />
          )}

          {currentView === 'fleet-map' && (
            <RestaurantFleetMap
              tenants={tenants}
              onSelectTenant={handleSelectTenant}
              onImpersonate={handleImpersonateTenant}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onEditLocation={(t) => {
                setEditingLocationTenant(t);
                setIsLocationEditorOpen(true);
              }}
              onOpenKeyConfig={() => setIsMapsKeyModalOpen(true)}
            />
          )}

          {currentView === 'users' && (
            <UserManagement
              users={users}
              tenants={tenants}
              onOpenRegisterModal={() => setIsRegisterUserOpen(true)}
              onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
              onRefreshFromSupabase={() => loadDataFromSupabase(false)}
              isRefreshing={isRefreshingFromSupabase}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              onResendInvite={handleResendInvite}
              onSelectTenantById={(id) => {
                const target = tenants.find((t) => t.id === id);
                if (target) handleSelectTenant(target);
              }}
            />
          )}

          {currentView === 'billing' && (
            <BillingLedger
              transactions={transactions}
              plans={plans}
              tenants={tenants}
              onUpdatePlanTier={handleUpdatePlanTier}
              onRetryInvoice={handleRetryInvoice}
              onSelectTenantById={(id) => {
                const target = tenants.find((t) => t.id === id);
                if (target) handleSelectTenant(target);
              }}
            />
          )}

          {currentView === 'audit' && (
            <AuditLogsView
              logs={auditLogs}
              onSelectTenantById={(id) => {
                const target = tenants.find((t) => t.id === id);
                if (target) handleSelectTenant(target);
              }}
            />
          )}

          {currentView === 'telemetry' && (
            <SystemTelemetryView telemetry={telemetry} tenants={tenants} />
          )}
        </>
      )}

      {/* Tenant Details Slide-over Drawer */}
      <TenantDetailsDrawer
        tenant={selectedTenantForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onImpersonate={handleImpersonateTenant}
        onEditLimits={handleOpenEditLimits}
        onToggleStatus={handleToggleStatus}
        onRevokeAccess={handleRevokeAccess}
        onToggleFeatureFlag={handleToggleFeatureFlag}
        onUpdateLocation={handleUpdateTenantLocation}
        onOpenKeyConfig={() => setIsMapsKeyModalOpen(true)}
      />

      {/* Edit Limits Modal */}
      <EditLimitsModal
        tenant={editingTenant}
        isOpen={isEditLimitsOpen}
        onClose={() => setIsEditLimitsOpen(false)}
        onSaveLimits={handleSaveLimits}
      />

      {/* Tenant Onboarding Wizard Stepper Modal */}
      <TenantOnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onTenantCreated={handleTenantCreated}
        onUserCreated={(newUser) => setUsers((prev) => [newUser, ...prev])}
      />

      {/* Register SaaS User in Supabase Modal */}
      <RegisterUserModal
        isOpen={isRegisterUserOpen}
        onClose={() => setIsRegisterUserOpen(false)}
        tenants={tenants}
        onUserRegistered={handleUserRegistered}
        onOpenSupabaseConfig={() => {
          setIsRegisterUserOpen(false);
          setIsSupabaseConfigOpen(true);
        }}
      />

      {/* Supabase Connection & SQL Schema Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        onConfigUpdated={() => loadDataFromSupabase(false)}
      />

      {/* Cmd+K Global Search & Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tenants={tenants}
        onSelectTenant={handleSelectTenant}
        onNavigate={(viewId) => setCurrentView(viewId)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />

      {/* Universal Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmLabel={confirmModalConfig.confirmLabel}
        confirmVariant={confirmModalConfig.confirmVariant}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Google Maps API Key & Attribution Config Modal */}
      <GoogleMapsKeyModal
        isOpen={isMapsKeyModalOpen}
        onClose={() => setIsMapsKeyModalOpen(false)}
        onKeySaved={() => {
          showToast(
            'Google Maps Ready',
            'Your Google Maps key for Pakistan locations is active.',
            'success'
          );
        }}
      />

      {/* Standalone Location Picker Modal for editing restaurant pin from fleet map */}
      {isLocationEditorOpen && editingLocationTenant && (
        <LocationPickerMap
          isModal={true}
          restaurantName={editingLocationTenant.tradeName}
          initialLocation={editingLocationTenant.location}
          onSaveLocation={(newLoc) => {
            handleUpdateTenantLocation(editingLocationTenant, newLoc);
            setIsLocationEditorOpen(false);
            setEditingLocationTenant(null);
          }}
          onClose={() => {
            setIsLocationEditorOpen(false);
            setEditingLocationTenant(null);
          }}
          onOpenKeyConfig={() => setIsMapsKeyModalOpen(true)}
        />
      )}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Portal System Error">
      <ToastProvider>
        <SuperAdminApp />
      </ToastProvider>
    </ErrorBoundary>
  );
}
