import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Database,
  Building2,
  Shield,
  MoreVertical,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  Mail,
  Phone,
  Copy,
  Check,
  Smartphone,
  ChefHat,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { RestaurantUser, RestaurantUserRole, Tenant } from '../../types';
import { getSupabaseConfig } from '../../lib/supabase';

interface UserManagementProps {
  users: RestaurantUser[];
  tenants: Tenant[];
  onOpenRegisterModal: () => void;
  onOpenSupabaseConfig: () => void;
  onRefreshFromSupabase: () => void;
  isRefreshing?: boolean;
  onToggleUserStatus: (user: RestaurantUser) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onResendInvite: (user: RestaurantUser) => void;
  onSelectTenantById?: (tenantId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  tenants,
  onOpenRegisterModal,
  onOpenSupabaseConfig,
  onRefreshFromSupabase,
  isRefreshing = false,
  onToggleUserStatus,
  onDeleteUser,
  onResendInvite,
  onSelectTenantById,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const supabaseConfig = getSupabaseConfig();

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm));

      const matchesTenant =
        selectedTenantFilter === 'ALL' || u.tenantId === selectedTenantFilter;

      const matchesRole =
        selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

      const matchesStatus =
        selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter;

      return matchesSearch && matchesTenant && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedTenantFilter, selectedRoleFilter, selectedStatusFilter]);

  const copyUserCredentials = (u: RestaurantUser) => {
    const text = `Restaurant: ${u.tenantName}\nEmail: ${u.email}\nTemp Password: ${u.tempPassword || 'RestoPass!2026'}`;
    navigator.clipboard.writeText(text);
    setCopiedUserId(u.id);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const getRoleBadge = (role: RestaurantUserRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
            <Building2 className="w-3 h-3" />
            Owner
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Shield className="w-3 h-3" />
            Manager
          </span>
        );
      case 'chef':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <ChefHat className="w-3 h-3" />
            Head Chef
          </span>
        );
      case 'pos_cashier':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Smartphone className="w-3 h-3" />
            Cashier
          </span>
        );
      case 'inventory_lead':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Layers className="w-3 h-3" />
            Inventory
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            Staff
          </span>
        );
    }
  };

  const getStatusBadge = (status: RestaurantUser['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            <Ban className="w-3 h-3" />
            Suspended
          </span>
        );
    }
  };

  // Metrics
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const ownersCount = users.filter((u) => u.role === 'owner').length;
  const managersCount = users.filter((u) => u.role === 'manager').length;

  return (
    <div className="space-y-4 text-xs">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Users & Access</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {totalUsersCount} Total
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 text-xs">
            User directory syncing with your Supabase database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseConfig}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
              supabaseConfig.isConfigured
                ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>{supabaseConfig.isConfigured ? 'Supabase' : 'Connect DB'}</span>
          </button>

          {/* Refresh From Supabase Button */}
          <button
            onClick={onRefreshFromSupabase}
            disabled={isRefreshing}
            className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-zinc-900 dark:text-zinc-100' : ''}`} />
          </button>

          {/* Primary Action: Register New User */}
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New User</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setSelectedStatusFilter('ALL');
            setSelectedRoleFilter('ALL');
            setSelectedTenantFilter('ALL');
            setSearchTerm('');
          }}
          className="text-left p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
            Total Users
          </p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
            {totalUsersCount}
          </p>
          <span className="text-[10px] text-zinc-400 mt-0.5 inline-block">
            Across {tenants.length} tenants
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedStatusFilter('active');
          }}
          className="text-left p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
            Active
          </p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
            {activeUsersCount}
          </p>
          <span className="text-[10px] text-zinc-400 mt-0.5 inline-block">
            {totalUsersCount > 0 ? Math.round((activeUsersCount / totalUsersCount) * 100) : 0}% fleet active
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedRoleFilter('owner');
          }}
          className="text-left p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
            Owners & Managers
          </p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
            {ownersCount + managersCount}
          </p>
          <span className="text-[10px] text-zinc-400 mt-0.5 inline-block">
            Administrators
          </span>
        </button>

        <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">Database State</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                supabaseConfig.isConfigured ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {supabaseConfig.isConfigured ? 'Live Database' : 'Local Sandbox'}
            </p>
          </div>
          <button
            onClick={onOpenSupabaseConfig}
            className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:underline mt-1 block"
          >
            {supabaseConfig.isConfigured ? 'View Schema' : 'Configure'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user, email, tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* Restaurant / Tenant Filter */}
          <div>
            <select
              value={selectedTenantFilter}
              onChange={(e) => setSelectedTenantFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="ALL">All Tenants ({tenants.length})</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tradeName} ({t.id})
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="chef">Chef</option>
              <option value="pos_cashier">Cashier</option>
              <option value="inventory_lead">Inventory Lead</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                <th className="py-2.5 px-3.5">User</th>
                <th className="py-2.5 px-3">Tenant</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Permissions</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Registered</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-medium text-zinc-700 dark:text-zinc-300">
                        No users found
                      </p>
                      <button
                        onClick={onOpenRegisterModal}
                        className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register User</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Name & Email */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium flex items-center justify-center text-[10px] shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {user.fullName}
                          </p>
                          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Restaurant / Tenant */}
                    <td className="py-2.5 px-3">
                      {onSelectTenantById ? (
                        <button
                          onClick={() => onSelectTenantById(user.tenantId)}
                          className="text-left block hover:underline cursor-pointer"
                          title="View restaurant"
                        >
                          <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{user.tenantName}</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate font-mono">
                            {user.tenantId}
                          </p>
                        </button>
                      ) : (
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{user.tenantName}</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate font-mono">
                            {user.tenantId}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Entitlements / Permissions */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {user.permissions.pos && (
                          <span className="px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono text-zinc-600 dark:text-zinc-400">
                            POS
                          </span>
                        )}
                        {user.permissions.kds && (
                          <span className="px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono text-zinc-600 dark:text-zinc-400">
                            KDS
                          </span>
                        )}
                        {user.permissions.inventory && (
                          <span className="px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono text-zinc-600 dark:text-zinc-400">
                            INV
                          </span>
                        )}
                        {user.permissions.billing && (
                          <span className="px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono text-zinc-700 dark:text-zinc-300">
                            BILLING
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>

                    {/* Registered Date */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                      {user.createdAt.split('T')[0]}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Copy Credentials */}
                        <button
                          onClick={() => copyUserCredentials(user)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Copy login credentials"
                        >
                          {copiedUserId === user.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Resend Invite */}
                        <button
                          onClick={() => onResendInvite(user)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Resend invite"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>

                        {/* Suspend / Resume User */}
                        <button
                          onClick={() => onToggleUserStatus(user)}
                          className={`p-1 rounded transition-colors ${
                            user.status === 'suspended'
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                          title={user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                        >
                          {user.status === 'suspended' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => onDeleteUser(user.id, user.fullName)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
