import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Globe,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  LogOut,
  Pause,
  Play,
  Trash2,
  KeyRound,
  ExternalLink,
  MapPin,
  Clock,
  Layers,
  Monitor,
  Utensils,
  Receipt,
  FileCode,
  Edit3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant, TenantFeatureFlags, TenantLocation } from '../../types';
import { StatusBadge, PlanBadge } from '../common/Badge';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import { getGoogleMapsExternalUrl } from '../../lib/maps';

interface TenantDetailsDrawerProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onImpersonate: (tenant: Tenant) => void;
  onEditLimits: (tenant: Tenant) => void;
  onToggleStatus: (tenant: Tenant) => void;
  onRevokeAccess: (tenant: Tenant) => void;
  onToggleFeatureFlag?: (tenant: Tenant, flagKey: keyof TenantFeatureFlags) => void;
  onUpdateLocation?: (tenant: Tenant, location: TenantLocation) => void;
  onOpenKeyConfig?: () => void;
}

export const TenantDetailsDrawer: React.FC<TenantDetailsDrawerProps> = ({
  tenant,
  isOpen,
  onClose,
  onImpersonate,
  onEditLimits,
  onToggleStatus,
  onRevokeAccess,
  onToggleFeatureFlag,
  onUpdateLocation,
  onOpenKeyConfig,
}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  if (!isOpen || !tenant) return null;

  const loc = tenant.location;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/50 backdrop-blur-2xs">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%', transition: { ease: 'easeInOut', duration: 0.2 } }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full z-10 overflow-hidden text-xs"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-medium text-sm text-zinc-900 dark:text-zinc-100 shrink-0">
                {tenant.tradeName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {tenant.tradeName}
                  </h2>
                  <StatusBadge status={tenant.status} size="sm" />
                </div>
                <p className="text-zinc-500 font-mono text-[10px]">
                  ID: {tenant.id} • Joined {tenant.dateJoined}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Impersonate & Action Bar */}
          <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onImpersonate(tenant);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium rounded-md transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Impersonate Tenant</span>
            </button>
            <button
              onClick={() => onEditLimits(tenant)}
              className="flex items-center gap-1 py-1.5 px-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md font-medium transition-colors"
            >
              <Sliders className="w-3 h-3" />
              <span>Limits</span>
            </button>
            <button
              onClick={() => onToggleStatus(tenant)}
              className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title={tenant.status === 'Suspended' ? 'Resume Subscription' : 'Pause Subscription'}
            >
              {tenant.status === 'Suspended' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Health & Revenue Card */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] font-medium">
                  Monthly Revenue
                </span>
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block font-mono">
                  ${tenant.mrr}/mo
                </span>
                <span className="text-[10px] text-zinc-400">
                  {tenant.planTier} Tier
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] font-medium">
                  Health Score
                </span>
                <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
                  {tenant.healthScore}/100
                </span>
                <span className="text-[10px] text-zinc-400">Telemetry OK</span>
              </div>
              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] font-medium">
                  Open Tickets
                </span>
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block font-mono">
                  {tenant.openTicketsCount}
                </span>
                <span className="text-[10px] text-zinc-400">Active</span>
              </div>
            </div>

            {/* Business & Legal Identity */}
            <div className="space-y-2">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-[11px] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Organization Identity</span>
              </h3>
              <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Legal Entity</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {tenant.businessName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reg ID</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {tenant.registrationNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Region</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {tenant.region} ({tenant.locale})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Timezone</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {tenant.timezone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Stripe ID</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {tenant.stripeCustomerId || 'cus_unlinked'}
                  </span>
                </div>
              </div>
            </div>

            {/* Google Maps Exact Location (Pakistan) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Google Maps Exact Location (Pakistan)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Adjust Pin</span>
                </button>
              </div>

              <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-emerald-50/30 dark:bg-emerald-950/15 space-y-2.5">
                {loc ? (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                          {loc.address}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                          {loc.city}, {loc.province}, {loc.country || 'Pakistan'} {loc.postalCode ? `(${loc.postalCode})` : ''}
                        </p>
                        {loc.landmark && (
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            Landmark: <span className="font-medium text-zinc-700 dark:text-zinc-300">{loc.landmark}</span>
                          </p>
                        )}
                      </div>

                      <a
                        href={getGoogleMapsExternalUrl(loc.coordinates, tenant.tradeName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1 text-[10px] shrink-0"
                        title="Open in Google Maps in new window"
                      >
                        <span>Open Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-[10px]">
                      <div className="font-mono text-zinc-600 dark:text-zinc-400">
                        Lat: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{loc.coordinates.lat.toFixed(5)}</span> • Lng: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{loc.coordinates.lng.toFixed(5)}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[9px] uppercase">
                        Geocoded
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 space-y-1.5">
                    <p className="text-zinc-500 text-[11px]">
                      No exact Google Maps coordinates set yet for this restaurant.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                    >
                      Set Exact Location Pin
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Contact Info */}
            <div className="space-y-2">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-[11px] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Primary Contact</span>
              </h3>
              <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Name</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {tenant.primaryContact.name} ({tenant.primaryContact.role})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email</span>
                  <a
                    href={`mailto:${tenant.primaryContact.email}`}
                    className="text-zinc-700 dark:text-zinc-300 hover:underline font-medium"
                  >
                    {tenant.primaryContact.email}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Phone</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {tenant.primaryContact.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Hardware & Provisioning Limits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-[11px] flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Hardware & Limits</span>
                </h3>
                <button
                  onClick={() => onEditLimits(tenant)}
                  className="text-zinc-600 dark:text-zinc-400 hover:underline text-xs"
                >
                  Adjust
                </button>
              </div>

              <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
                {/* POS Terminals Progress Bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-500">POS Terminals</span>
                    <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {tenant.limits.posTerminals.current} / {tenant.limits.posTerminals.max}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                      style={{
                        width: `${Math.min(100, (tenant.limits.posTerminals.current / tenant.limits.posTerminals.max) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Staff Seats Progress Bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-500">Staff Seats</span>
                    <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {tenant.limits.staffSeats.current} / {tenant.limits.staffSeats.max}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-zinc-600 dark:bg-zinc-400 rounded-full"
                      style={{
                        width: `${Math.min(100, (tenant.limits.staffSeats.current / tenant.limits.staffSeats.max) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">API Rate Limit</span>
                  <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                    {tenant.limits.apiRateLimitPerMin} req/min
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Flags & Modules */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Feature Flags</span>
                </h3>
                <span className="text-[10px] text-zinc-400">Toggle to update</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(tenant.featureFlags).map(([flagKey, enabled]) => (
                  <button
                    key={flagKey}
                    type="button"
                    onClick={() => onToggleFeatureFlag?.(tenant, flagKey as keyof TenantFeatureFlags)}
                    className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors text-left"
                  >
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                      {flagKey.replace('Enabled', '').replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div
                      className={`relative inline-flex h-3.5 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                        enabled ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full ${
                          enabled ? 'bg-white dark:bg-zinc-900 translate-x-3.5' : 'bg-white translate-x-0.5'
                        } shadow-xs transition duration-200 ease-in-out mt-0.5`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                Danger Zone
              </p>
              <button
                onClick={() => onRevokeAccess(tenant)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke Access & Teardown Tenant</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Google Map Location Editor Modal */}
      {isLocationModalOpen && (
        <LocationPickerMap
          isModal={true}
          restaurantName={tenant.tradeName}
          initialLocation={tenant.location}
          onSaveLocation={(updatedLoc) => {
            if (onUpdateLocation) {
              onUpdateLocation(tenant, updatedLoc);
            }
            setIsLocationModalOpen(false);
          }}
          onClose={() => setIsLocationModalOpen(false)}
          onOpenKeyConfig={onOpenKeyConfig}
        />
      )}
    </AnimatePresence>
  );
};
