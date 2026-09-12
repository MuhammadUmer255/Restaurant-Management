import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Sliders,
  ShieldCheck,
  Pause,
  Play,
  Trash2,
  Download,
  PlusCircle,
  Copy,
  Check,
  ChevronDown,
  Eye,
  ExternalLink,
  Building2,
  Users,
  CheckSquare,
  Square,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { Tenant, TenantStatus, PlanTierName, RegionCode } from '../../types';
import { StatusBadge, PlanBadge } from '../common/Badge';
import { DispatchNoticeModal } from './DispatchNoticeModal';
import { useToast } from '../common/Toast';

interface TenantManagementProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onImpersonate: (tenant: Tenant) => void;
  onEditLimits: (tenant: Tenant) => void;
  onToggleStatus: (tenant: Tenant) => void;
  onRevokeAccess: (tenant: Tenant) => void;
  onOpenOnboarding: () => void;
  onSendBatchNotice?: (data: {
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    tenantIds: string[];
  }) => void;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  onSelectTenant,
  onImpersonate,
  onEditLimits,
  onToggleStatus,
  onRevokeAccess,
  onOpenOnboarding,
  onSendBatchNotice,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPlan, setSelectedPlan] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [isDispatchNoticeOpen, setIsDispatchNoticeOpen] = useState(false);
  const [activeMenuTenantId, setActiveMenuTenantId] = useState<string | null>(null);
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'tradeName' | 'mrr' | 'dateJoined' | 'healthScore'>('dateJoined');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered & Sorted tenants
  const filteredTenants = useMemo(() => {
    return tenants
      .filter((t) => {
        const matchesSearch =
          t.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.primaryContact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.primaryContact.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
        const matchesPlan = selectedPlan === 'ALL' || t.planTier === selectedPlan;
        const matchesRegion = selectedRegion === 'ALL' || t.region === selectedRegion;

        return matchesSearch && matchesStatus && matchesPlan && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === 'mrr') {
          return sortDirection === 'asc' ? a.mrr - b.mrr : b.mrr - a.mrr;
        }
        if (sortField === 'healthScore') {
          return sortDirection === 'asc' ? a.healthScore - b.healthScore : b.healthScore - a.healthScore;
        }
        if (sortField === 'dateJoined') {
          return sortDirection === 'asc'
            ? new Date(a.dateJoined).getTime() - new Date(b.dateJoined).getTime()
            : new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime();
        }
        return sortDirection === 'asc'
          ? a.tradeName.localeCompare(b.tradeName)
          : b.tradeName.localeCompare(a.tradeName);
      });
  }, [tenants, searchQuery, selectedStatus, selectedPlan, selectedRegion, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(filteredTenants.length / pageSize) || 1;
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedTenantIds.length === paginatedTenants.length) {
      setSelectedTenantIds([]);
    } else {
      setSelectedTenantIds(paginatedTenants.map((t) => t.id));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTenantIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedTenantId(id);
    setTimeout(() => setCopiedTenantId(null), 1800);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = 'Tenant ID,Trade Name,Legal Entity,Contact Name,Contact Email,Plan,MRR,Status,Region,Date Joined\n';
    const rows = filteredTenants
      .map(
        (t) =>
          `"${t.id}","${t.tradeName}","${t.businessName}","${t.primaryContact.name}","${t.primaryContact.email}","${t.planTier}",${t.mrr},"${t.status}","${t.region}","${t.dateJoined}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenants-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Export Successful', `Exported ${filteredTenants.length} tenants to CSV.`, 'success');
  };

  const handleExportSelectedCSV = () => {
    const selected = tenants.filter((t) => selectedTenantIds.includes(t.id));
    if (selected.length === 0) return;
    const headers = 'Tenant ID,Trade Name,Legal Entity,Contact Name,Contact Email,Plan,MRR,Status,Region,Date Joined\n';
    const rows = selected
      .map(
        (t) =>
          `"${t.id}","${t.tradeName}","${t.businessName}","${t.primaryContact.name}","${t.primaryContact.email}","${t.planTier}",${t.mrr},"${t.status}","${t.region}","${t.dateJoined}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenants-selected-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Export Complete', `Exported ${selected.length} selected restaurants to CSV.`, 'success');
    setSelectedTenantIds([]);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Tenant Directory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage {tenants.length} customer organizations, subscriptions, and provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Onboard Tenant</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by restaurant name, ID, contact, or legal entity..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none"
              >
                <option value="ALL">All</option>
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
                <option value="Churned">Churned</option>
              </select>
            </div>

            {/* Plan Tier Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Tier:</span>
              <select
                value={selectedPlan}
                onChange={(e) => {
                  setSelectedPlan(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none"
              >
                <option value="ALL">All</option>
                <option value="Starter">Starter ($99)</option>
                <option value="Professional">Professional ($249)</option>
                <option value="Enterprise">Enterprise ($599)</option>
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none"
              >
                <option value="ALL">All</option>
                <option value="North America">North America</option>
                <option value="EMEA">EMEA</option>
                <option value="APAC">APAC</option>
                <option value="LATAM">LATAM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedTenantIds.length > 0 && (
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {selectedTenantIds.length} restaurant{selectedTenantIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDispatchNoticeOpen(true)}
                className="px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 font-medium"
              >
                Notice
              </button>
              <button
                onClick={handleExportSelectedCSV}
                className="px-2.5 py-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium"
              >
                Export
              </button>
              <button
                onClick={() => setSelectedTenantIds([])}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[11px]"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Data Table Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
            {/* Table Header */}
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 pl-3.5 pr-2 w-8">
                  <button
                    onClick={handleSelectAll}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    aria-label="Select all tenants"
                  >
                    {selectedTenantIds.length === paginatedTenants.length && paginatedTenants.length > 0 ? (
                      <CheckSquare className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3">ID</th>
                <th
                  onClick={() => handleSort('tradeName')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Restaurant</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Tier</th>
                <th
                  onClick={() => handleSort('mrr')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <div className="flex items-center gap-1">
                    <span>MRR</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Status</th>
                <th
                  onClick={() => handleSort('dateJoined')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Joined</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </th>
                <th className="py-2.5 pr-3.5 pl-2 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {paginatedTenants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-zinc-400">
                    No restaurant tenants found.
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant) => {
                  const isSelected = selectedTenantIds.includes(tenant.id);
                  const isMenuOpen = activeMenuTenantId === tenant.id;

                  return (
                    <tr
                      key={tenant.id}
                      onClick={() => onSelectTenant(tenant)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-zinc-100/60 dark:bg-zinc-800/40'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 pl-3.5 pr-2">
                        <button
                          onClick={(e) => handleToggleSelectOne(tenant.id, e)}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Tenant ID with copy icon */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-zinc-600 dark:text-zinc-400">
                            {tenant.id}
                          </span>
                          <button
                            onClick={(e) => handleCopyId(tenant.id, e)}
                            className="p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            title="Copy ID"
                          >
                            {copiedTenantId === tenant.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Business & Trade Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] flex items-center justify-center shrink-0">
                            {tenant.tradeName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate hover:underline">
                              {tenant.tradeName}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {tenant.businessName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Primary Contact */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {tenant.primaryContact.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {tenant.primaryContact.email}
                        </p>
                      </td>

                      {/* Plan Tier */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <PlanBadge plan={tenant.planTier} />
                      </td>

                      {/* MRR */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-zinc-900 dark:text-zinc-100">
                        ${tenant.mrr.toLocaleString()}
                        <span className="text-[10px] text-zinc-400">/mo</span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge status={tenant.status} />
                      </td>

                      {/* Date Joined */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                        {tenant.dateJoined}
                      </td>

                      {/* Row Actions Ellipsis Dropdown */}
                      <td className="py-2.5 pr-3.5 pl-2 text-right relative">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block"
                        >
                          <button
                            onClick={() =>
                              setActiveMenuTenantId(isMenuOpen ? null : tenant.id)
                            }
                            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Action Menu Popover */}
                          {isMenuOpen && (
                            <div className="absolute right-3 top-8 w-44 rounded-md bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 py-1 z-30 text-left text-xs">
                              <button
                                onClick={() => {
                                  onSelectTenant(tenant);
                                  setActiveMenuTenantId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              >
                                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                                <span>View Details</span>
                              </button>

                              <button
                                onClick={() => {
                                  onEditLimits(tenant);
                                  setActiveMenuTenantId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              >
                                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Edit Limits</span>
                              </button>

                              <button
                                onClick={() => {
                                  onToggleStatus(tenant);
                                  setActiveMenuTenantId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              >
                                {tenant.status === 'Suspended' ? (
                                  <>
                                    <Play className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Resume</span>
                                  </>
                                ) : (
                                  <>
                                    <Pause className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Pause</span>
                                  </>
                                )}
                              </button>

                              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                              <button
                                onClick={() => {
                                  onImpersonate(tenant);
                                  setActiveMenuTenantId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Impersonate</span>
                              </button>

                              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                              <button
                                onClick={() => {
                                  onRevokeAccess(tenant);
                                  setActiveMenuTenantId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Revoke Access</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">
            Showing{' '}
            <strong className="text-zinc-700 dark:text-zinc-300">
              {paginatedTenants.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-zinc-700 dark:text-zinc-300">
              {Math.min(currentPage * pageSize, filteredTenants.length)}
            </strong>{' '}
            of{' '}
            <strong className="text-zinc-700 dark:text-zinc-300">
              {filteredTenants.length}
            </strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 text-[11px]"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-6 h-6 rounded text-[11px] font-medium ${
                    currentPage === p
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 text-[11px]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Dispatch Fleet Notice Modal */}
      <DispatchNoticeModal
        isOpen={isDispatchNoticeOpen}
        onClose={() => setIsDispatchNoticeOpen(false)}
        selectedTenantIds={selectedTenantIds}
        tenants={tenants}
        onDispatchNotice={(noticeData) => {
          if (onSendBatchNotice) {
            onSendBatchNotice(noticeData);
          } else {
            showToast(
              'Notice Broadcast Dispatched',
              `"${noticeData.title}" transmitted to ${noticeData.tenantIds.length} restaurant systems.`,
              'success'
            );
          }
          setSelectedTenantIds([]);
        }}
      />
    </div>
  );
};
