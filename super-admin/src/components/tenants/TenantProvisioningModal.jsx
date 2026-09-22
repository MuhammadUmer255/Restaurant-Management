import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Layers,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  Key,
  Copy,
  Check,
  X,
  Loader2,
  Database,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  createTenantInSupabase,
  registerRestaurantUserInSupabase,
  createAuditLogInSupabase,
  getSupabaseConfig
} from '../../lib/supabase';
import { useToast } from '../common/Toast';

const SUBSCRIPTION_TIERS = [
  {
    id: 'Starter',
    name: 'Starter Tier',
    pricePKR: 75000,
    priceUSD: 99,
    description: 'Essential single-outlet restaurant POS and kitchen dispatch',
    posTerminals: 3,
    staffSeats: 5,
    features: ['Single POS Terminal', 'Basic Kitchen Display (KDS)', 'Daily Sales Reports', 'Standard Email Support'],
    recommended: false,
    color: 'border-slate-300 dark:border-slate-700'
  },
  {
    id: 'Professional',
    name: 'Professional Tier',
    pricePKR: 180000,
    priceUSD: 249,
    description: 'High-volume dining with inventory, QR table ordering & staff management',
    posTerminals: 8,
    staffSeats: 20,
    features: ['Multi-terminal Sync', 'Live KDS & Expeditor', 'Recipe & Ingredient Inventory', 'QR Dine-in Ordering', 'Role-Based Staff Access'],
    recommended: true,
    color: 'border-indigo-500 ring-2 ring-indigo-500/20'
  },
  {
    id: 'Enterprise',
    name: 'Enterprise Tier',
    pricePKR: 350000,
    priceUSD: 599,
    description: 'Multi-branch restaurant chains with REST API, custom webhooks & priority SLA',
    posTerminals: 25,
    staffSeats: 60,
    features: ['Multi-location Chain Dashboard', 'Full REST API & Webhooks', 'Unlimited POS Terminals', 'Automated Daily Payouts', 'Dedicated 24/7 Account SLA'],
    recommended: false,
    color: 'border-purple-500/80 ring-2 ring-purple-500/20'
  }
];

const CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Faisalabad',
  'Multan',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Dubai / GCC'
];

export const TenantProvisioningModal = ({
  isOpen,
  onClose,
  onTenantProvisioned,
  superAdminProfile
}) => {
  const { showToast } = useToast();

  // Core required fields
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('Professional');

  // Secondary operational fields
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryContactPhone, setPrimaryContactPhone] = useState('+92 (300) ');
  const [city, setCity] = useState('Lahore');
  const [branchAddress, setBranchAddress] = useState('Main Boulevard, Gulberg III');
  const [currency, setCurrency] = useState('PKR');
  const [isTrial, setIsTrial] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [provisionOwnerAccount, setProvisionOwnerAccount] = useState(true);

  // Module toggles
  const [featureFlags, setFeatureFlags] = useState({
    posEnabled: true,
    kdsEnabled: true,
    qrOrderingEnabled: true,
    inventoryEnabled: true,
    apiAccessEnabled: false,
  });

  // UI & Execution state
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState(0);
  const [provisioningLogs, setProvisioningLogs] = useState([]);
  const [provisionedResult, setProvisionedResult] = useState(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  if (!isOpen) return null;

  const currentTierConfig = SUBSCRIPTION_TIERS.find((t) => t.id === subscriptionTier) || SUBSCRIPTION_TIERS[1];

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'password') {
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } else {
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    }
  };

  const handleResetForm = () => {
    setName('');
    setContactEmail('');
    setSubscriptionTier('Professional');
    setLegalBusinessName('');
    setPrimaryContactName('');
    setPrimaryContactPhone('+92 (300) ');
    setIsProvisioning(false);
    setProvisionedResult(null);
    setProvisioningLogs([]);
    setProvisioningStep(0);
  };

  const handleProvision = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = contactEmail.trim().toLowerCase();

    if (!trimmedName) {
      showToast('Validation Error', 'Restaurant business name is required.', 'error');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      showToast('Validation Error', 'Please enter a valid primary contact email.', 'error');
      return;
    }

    setIsProvisioning(true);
    setProvisioningStep(1);
    setProvisioningLogs(['Allocating unique tenant namespace & cryptographic record...']);

    // Generate tenant ID
    const generatedTenantId = `TEN-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempPassword = `Gusto!${Math.floor(1000 + Math.random() * 9000)}#PK`;
    const mrr = currency === 'PKR' ? currentTierConfig.pricePKR : currentTierConfig.priceUSD;

    setTimeout(async () => {
      setProvisioningStep(2);
      setProvisioningLogs((prev) => [
        ...prev,
        `Inserting row into Supabase table 'tenants' [name: "${trimmedName}", contact_email: "${trimmedEmail}", subscription_tier: "${subscriptionTier}"]...`
      ]);

      const newTenantRecord = {
        id: generatedTenantId,
        name: trimmedName,
        contact_email: trimmedEmail,
        subscription_tier: subscriptionTier,
        businessName: legalBusinessName.trim() || `${trimmedName} Hospitality Pvt Ltd`,
        tradeName: trimmedName,
        registrationNumber: `PK-NTN-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1 + Math.random() * 9)}`,
        planTier: subscriptionTier,
        mrr,
        status: isTrial ? 'Trial' : 'Active',
        dateJoined: new Date().toISOString().split('T')[0],
        timezone: 'Asia/Karachi',
        locale: 'en-PK',
        currency,
        region: 'APAC',
        healthScore: 100,
        trialEndsAt: isTrial ? `${trialDays} days remaining` : undefined,
        primaryContact: {
          name: primaryContactName.trim() || `${trimmedName} Managing Partner`,
          email: trimmedEmail,
          phone: primaryContactPhone.trim() || '+92 (300) 1234567',
          role: 'Owner & General Partner'
        },
        limits: {
          posTerminals: { current: 1, max: currentTierConfig.posTerminals },
          staffSeats: { current: 1, max: currentTierConfig.staffSeats },
          apiRateLimitPerMin: subscriptionTier === 'Enterprise' ? 1200 : 600,
          locationsCount: 1
        },
        featureFlags: {
          ...featureFlags,
          apiAccessEnabled: subscriptionTier === 'Enterprise' ? true : featureFlags.apiAccessEnabled
        },
        location: {
          address: branchAddress,
          city,
          province: city === 'Karachi' ? 'Sindh' : city === 'Peshawar' ? 'KPK' : 'Punjab',
          country: 'Pakistan',
          coordinates: {
            lat: city === 'Karachi' ? 24.8607 : city === 'Islamabad' ? 33.6844 : 31.5204,
            lng: city === 'Karachi' ? 67.0011 : city === 'Islamabad' ? 73.0479 : 74.3587
          }
        },
        lastActive: 'Just now (Provisioned)',
        openTicketsCount: 0
      };

      try {
        // 1. Direct insert to Supabase 'tenants' table
        const tenantResult = await createTenantInSupabase(newTenantRecord);

        setProvisioningStep(3);
        setProvisioningLogs((prev) => [
          ...prev,
          tenantResult.success ? '✓ Supabase table "tenants" synchronized.' : `! DB note: ${tenantResult.message}`,
          provisionOwnerAccount ? 'Creating primary store manager in Supabase "restaurant_users"...' : 'Skipping user account provisioning...'
        ]);

        let createdUser = null;
        if (provisionOwnerAccount) {
          const userResult = await registerRestaurantUserInSupabase({
            fullName: newTenantRecord.primaryContact.name,
            email: trimmedEmail,
            phone: newTenantRecord.primaryContact.phone,
            role: 'owner',
            tenantId: newTenantRecord.id,
            tenantName: newTenantRecord.name,
            branch: `${city} Flagship`,
            tempPassword,
            permissions: {
              pos: newTenantRecord.featureFlags.posEnabled,
              kds: newTenantRecord.featureFlags.kdsEnabled,
              inventory: newTenantRecord.featureFlags.inventoryEnabled,
              reports: true,
              staffManagement: true,
              billing: true
            },
            inviteSent: true,
            status: 'active'
          });
          createdUser = userResult.user;
        }

        // 2. Insert audit log
        setProvisioningStep(4);
        setProvisioningLogs((prev) => [
          ...prev,
          'Writing audit record in Supabase "audit_logs"...',
          '✓ Provisioning completed successfully!'
        ]);

        await createAuditLogInSupabase({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          admin_name: superAdminProfile?.fullName || 'Fatima Javaid',
          admin_email: superAdminProfile?.email || 'fatimajavaid1886@gmail.com',
          admin_avatar: superAdminProfile?.avatar,
          action: 'TENANT_PROVISIONED',
          target_tenant_id: newTenantRecord.id,
          target_tenant_name: newTenantRecord.name,
          details: `Provisioned new ${subscriptionTier} tier tenant in Supabase table "tenants" for ${trimmedEmail}`
        });

        // Notify parent state
        if (onTenantProvisioned) {
          onTenantProvisioned(newTenantRecord, createdUser);
        }

        setProvisionedResult({
          tenant: newTenantRecord,
          user: createdUser,
          tempPassword
        });
        setIsProvisioning(false);
        showToast(
          'Tenant Provisioned',
          `"${trimmedName}" registered in Supabase table 'tenants' under ${subscriptionTier} tier.`,
          'success'
        );
      } catch (err) {
        setIsProvisioning(false);
        showToast('Provisioning Error', err?.message || 'Failed to insert tenant to Supabase', 'error');
      }
    }, 900);
  };

  const isConfigured = getSupabaseConfig().isConfigured;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-xs text-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tenant Provisioning Module
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-mono flex items-center gap-1 font-semibold">
                    <Database className="w-3 h-3" />
                    table: tenants
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Register new restaurant businesses into live Supabase PostgreSQL database
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Database Status Alert */}
          {!isConfigured && (
            <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Supabase credentials not yet saved in Settings. Form will register tenant locally and attempt sync once Supabase is connected.
              </span>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* SUCCESS STATE */}
            {provisionedResult ? (
              <div className="space-y-6 py-2">
                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                      Restaurant Successfully Provisioned!
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      Business row inserted into Supabase table <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded text-[11px]">tenants</code> with primary credentials.
                    </p>
                  </div>
                </div>

                {/* Provisioned Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-[11px] text-slate-500 uppercase font-semibold">Restaurant Name</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {provisionedResult.tenant.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 uppercase font-semibold">Generated Tenant ID</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <code className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          {provisionedResult.tenant.id}
                        </code>
                        <button
                          onClick={() => handleCopy(provisionedResult.tenant.id, 'id')}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                          title="Copy Tenant ID"
                        >
                          {idCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Contact Email:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                        {provisionedResult.tenant.contact_email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Subscription Tier:</span>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
                        {provisionedResult.tenant.subscription_tier}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location / Branch:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {provisionedResult.tenant.location?.city}, Pakistan
                      </span>
                    </div>
                  </div>

                  {provisionedResult.tempPassword && (
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-500" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Initial Manager Password</div>
                          <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {provisionedResult.tempPassword}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(provisionedResult.tempPassword, 'password')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors text-[11px]"
                      >
                        {passwordCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{passwordCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleResetForm}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Provision Another Tenant
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs transition-colors"
                  >
                    Done & View Console
                  </button>
                </div>
              </div>
            ) : (
              /* PROVISIONING FORM */
              <form onSubmit={handleProvision} className="space-y-6">
                {/* SECTION 1: CORE FIELDS (name, contact_email, subscription_tier) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-500" />
                      Required Provisioning Identity
                    </span>
                    <span className="text-[11px] text-slate-400">PostgreSQL Columns: name, contact_email, subscription_tier</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Restaurant Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Restaurant Business Name (name)</span>
                        </span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Salt'n Pepper Village Lahore"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                      />
                      <p className="text-[10px] text-slate-400">Public brand name and store identifier.</p>
                    </div>

                    {/* Contact Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Primary Contact Email (contact_email)</span>
                        </span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="owner@restaurant.pk"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                      />
                      <p className="text-[10px] text-slate-400">Receives store credentials and billing statements.</p>
                    </div>
                  </div>

                  {/* Subscription Tier Cards */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Subscription Tier (subscription_tier)</span>
                      </span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {SUBSCRIPTION_TIERS.map((tier) => {
                        const isSelected = subscriptionTier === tier.id;
                        return (
                          <div
                            key={tier.id}
                            onClick={() => setSubscriptionTier(tier.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                              isSelected
                                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {tier.recommended && (
                              <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">
                                Popular
                              </span>
                            )}

                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {tier.name}
                              </span>
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>

                            <div className="mb-2">
                              <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                                PKR {tier.pricePKR.toLocaleString()}
                              </span>
                              <span className="text-slate-500 text-[10px]"> / month</span>
                            </div>

                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2.5">
                              {tier.description}
                            </p>

                            <div className="space-y-1 border-t border-slate-200 dark:border-slate-700/60 pt-2 text-[10px] text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span>{tier.posTerminals} POS Terminals Included</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span>Up to {tier.staffSeats} Staff Accounts</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: OPERATIONAL & LOCATION ATTRIBUTES */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Branch & Contact Person Details
                    </span>
                    <span className="text-[11px] text-slate-400">Optional operational metadata</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Primary Manager Name
                      </label>
                      <input
                        type="text"
                        value={primaryContactName}
                        onChange={(e) => setPrimaryContactName(e.target.value)}
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={primaryContactPhone}
                        onChange={(e) => setPrimaryContactPhone(e.target.value)}
                        placeholder="+92 (300) 8412901"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        City / Region
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Flagship Branch Address
                      </label>
                      <input
                        type="text"
                        value={branchAddress}
                        onChange={(e) => setBranchAddress(e.target.value)}
                        placeholder="MM Alam Road, Gulberg III"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Legal Business Entity (Optional)
                      </label>
                      <input
                        type="text"
                        value={legalBusinessName}
                        onChange={(e) => setLegalBusinessName(e.target.value)}
                        placeholder="e.g. Gourmet Hospitality Services Ltd"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: AUTOMATION & CREDENTIALS CHECKBOX */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={provisionOwnerAccount}
                        onChange={(e) => setProvisionOwnerAccount(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                      />
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        Auto-provision Manager Account in Supabase table <code className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">restaurant_users</code>
                      </span>
                    </label>

                    <span className="text-[10px] text-slate-500 font-mono">
                      role: 'owner'
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isTrial}
                        onChange={(e) => setIsTrial(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Grant 14-day zero-charge trial access before billing start
                      </span>
                    </label>
                  </div>
                </div>

                {/* LIVE LOGS DURING EXECUTION */}
                {isProvisioning && (
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] space-y-1.5 border border-slate-800">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing to Supabase Database...</span>
                    </div>
                    {provisioningLogs.map((log, idx) => (
                      <div key={idx} className="text-slate-300">
                        &gt; {log}
                      </div>
                    ))}
                  </div>
                )}

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Super Admin: <strong>{superAdminProfile?.fullName || 'Fatima Javaid'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isProvisioning}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProvisioning}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs disabled:opacity-50 transition-all"
                    >
                      {isProvisioning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Provisioning to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Provision Tenant</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
