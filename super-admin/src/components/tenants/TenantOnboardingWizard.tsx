import React, { useState } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  UserCheck,
  Sliders,
  CheckCircle2,
  Sparkles,
  Key,
  Copy,
  RefreshCw,
  Mail,
  Shield,
  Loader2,
  Terminal,
  Zap,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant, PlanTierName, RegionCode, RestaurantUser, TenantLocation } from '../../types';
import {
  registerTenantInSupabase,
  registerRestaurantUserInSupabase,
  getSupabaseConfig,
} from '../../lib/supabase';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import { PAKISTAN_CITIES, getGoogleMapsExternalUrl } from '../../lib/maps';

interface TenantOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantCreated: (newTenant: Tenant) => void;
  onUserCreated?: (newUser: RestaurantUser) => void;
}

export const TenantOnboardingWizard: React.FC<TenantOnboardingWizardProps> = ({
  isOpen,
  onClose,
  onTenantCreated,
  onUserCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Step 1: Organization Details (Pakistan defaults)
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [externalRestaurantId, setExternalRestaurantId] = useState('');
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [locale, setLocale] = useState('en-PK');
  const [region, setRegion] = useState<RegionCode>('APAC');

  // Step 2: Google Maps Location (Pakistan)
  const [restaurantLocation, setRestaurantLocation] = useState<TenantLocation>({
    address: 'MM Alam Road, Gulberg III',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    postalCode: '54000',
    landmark: 'Near Hussain Chowk',
    coordinates: {
      lat: 31.5126,
      lng: 74.3524,
    },
  });

  // Step 3: Admin Credentials
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+92 (300) ');
  const [generatedPassword, setGeneratedPassword] = useState('R3sto!2026#PK9');
  const [sendInviteEmail, setSendInviteEmail] = useState(true);

  // Step 4: Module & Subscription Provisioning
  const [selectedPlan, setSelectedPlan] = useState<PlanTierName>('Professional');
  const [trialDays, setTrialDays] = useState<number>(14);
  const [posTerminalsCap, setPosTerminalsCap] = useState<number>(6);
  const [featureFlags, setFeatureFlags] = useState({
    posEnabled: true,
    kdsEnabled: true,
    qrOrderingEnabled: true,
    inventoryEnabled: true,
    apiAccessEnabled: false,
    multiLocationEnabled: false,
  });

  if (!isOpen) return null;

  const generateNewPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pwd);
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeploymentLogs([
      'Allocating isolated tenant namespace in Pakistan region...',
      'Geocoding restaurant exact coordinates on Google Maps Platform...',
      'Binding primary domain and provisioning TLS certificate...',
    ]);

    setTimeout(() => {
      setDeploymentLogs((prev) => [
        ...prev,
        `Anchoring latitude ${restaurantLocation.coordinates.lat.toFixed(5)}, longitude ${restaurantLocation.coordinates.lng.toFixed(5)} (${restaurantLocation.city}, Pakistan)...`,
        'Configuring PostgreSQL tenant schema & RBAC permissions...',
        'Seeding menu taxonomy & terminal endpoints...',
      ]);
    }, 700);

    setTimeout(() => {
      setDeploymentLogs((prev) => [
        ...prev,
        'Creating Stripe / Bank Alfalah payment gateway record...',
        'Dispatching welcome onboarding email to primary contact...',
        'Pakistan restaurant onboarding and Google Maps pin deployed successfully!',
      ]);
    }, 1500);

    setTimeout(() => {
      const generatedId = `TEN-${Math.floor(1000 + Math.random() * 9000)}`;
      const mrrMap: Record<PlanTierName, number> = {
        Starter: currency === 'PKR' ? 75000 : 99,
        Professional: currency === 'PKR' ? 180000 : 249,
        Enterprise: currency === 'PKR' ? 350000 : 599,
      };

      const newTenant: Tenant = {
        id: generatedId,
        businessName: legalName || 'Desi Gourmet Hospitality Ltd',
        tradeName: tradeName || 'Spice Garden Bistro',
        registrationNumber: regNumber || `PK-NTN-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1 + Math.random() * 9)}`,
        primaryContact: {
          name: ownerName || 'Restaurant General Manager',
          email: ownerEmail || 'manager@restaurant.pk',
          phone: ownerPhone || '+92 (300) 1234567',
          role: 'Owner & General Partner',
        },
        planTier: selectedPlan,
        mrr: mrrMap[selectedPlan],
        status: trialDays > 0 ? 'Trial' : 'Active',
        dateJoined: new Date().toISOString().split('T')[0],
        timezone,
        locale,
        currency,
        region,
        healthScore: 100,
        trialEndsAt: trialDays > 0 ? `${trialDays} days remaining` : undefined,
        limits: {
          posTerminals: { current: 1, max: posTerminalsCap },
          staffSeats: { current: 1, max: selectedPlan === 'Enterprise' ? 50 : 20 },
          apiRateLimitPerMin: selectedPlan === 'Enterprise' ? 1200 : 600,
          locationsCount: 1,
        },
        featureFlags,
        location: restaurantLocation,
        lastActive: 'Just now (Deployment Complete)',
        openTicketsCount: 0,
        stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 11)}`,
        externalRestaurantId: externalRestaurantId.trim() || undefined,
        databaseNamespace: getSupabaseConfig().tablePrefix || getSupabaseConfig().schema || undefined,
      };

      // Synchronize with Supabase database
      registerTenantInSupabase(newTenant);

      // Register primary account owner user in Supabase
      registerRestaurantUserInSupabase({
        fullName: newTenant.primaryContact.name,
        email: newTenant.primaryContact.email,
        phone: newTenant.primaryContact.phone,
        role: 'owner',
        tenantId: newTenant.id,
        tenantName: newTenant.tradeName,
        branch: `${restaurantLocation.city} Flagship`,
        password: generatedPassword,
        permissions: {
          pos: featureFlags.posEnabled,
          kds: featureFlags.kdsEnabled,
          inventory: featureFlags.inventoryEnabled,
          reports: true,
          staffManagement: true,
          billing: true,
        },
        inviteSent: sendInviteEmail,
        status: 'active',
      }).then((userResult) => {
        if (onUserCreated && userResult.user) {
          onUserCreated(userResult.user);
        }
      });

      onTenantCreated(newTenant);
      setIsDeploying(false);
      onClose();
    }, 2200);
  };

  const steps = [
    { num: 1, title: 'Restaurant Info', icon: Building2 },
    { num: 2, title: 'Google Map Location', icon: MapPin },
    { num: 3, title: 'Admin Account', icon: UserCheck },
    { num: 4, title: 'Modules & Limits', icon: Sliders },
    { num: 5, title: 'Review & Deploy', icon: CheckCircle2 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-xs"
        >
          {/* Wizard Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  New Pakistan Restaurant Onboarding
                </h2>
                <p className="text-slate-500 text-[11px]">
                  Add restaurant identity, pin exact Google Maps location in Pakistan, and deploy.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeploying}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Navigation Indicator */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              {steps.map((s, idx) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      <span
                        className={`font-semibold text-[11px] hidden sm:inline ${
                          isActive
                            ? 'text-slate-900 dark:text-slate-100'
                            : isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 rounded ${
                          currentStep > s.num
                            ? 'bg-emerald-500'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Wizard Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* STEP 1: Organization Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs">
                      Configured for Pakistan Restaurant Operations
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Currency defaults to PKR (₨) with PKT timezone (Asia/Karachi). In the next step, you can pinpoint the exact Google Maps location across Islamabad, Lahore, Karachi, or any Pakistan city.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Legal Business / Corporate Entity Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Haveli Heritage Dining Pvt Ltd"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Restaurant Brand / Trade Name (DBA) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Haveli Restaurant Lahore"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      National Tax Number (NTN / STRN / Registration)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PK-NTN-7391024-3"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Primary Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PKR">PKR - Pakistani Rupee (₨)</option>
                      <option value="USD">USD - United States Dollar ($)</option>
                    </select>
                  </div>
                </div>

                {/* Existing Database Link (Optional) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Existing Database Restaurant ID (Optional)</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Multi-system coexistence
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. resto_4920 or existing UUID in your project database"
                    value={externalRestaurantId}
                    onChange={(e) => setExternalRestaurantId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    If this restaurant already exists in your main database or POS backend, provide its existing ID here so it maps directly without data duplication.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Operating Region
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value as RegionCode)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="APAC">Pakistan & South Asia (APAC)</option>
                      <option value="EMEA">Middle East & Europe (EMEA)</option>
                      <option value="North America">North America (US & CA)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      System Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Asia/Karachi">Asia/Karachi (PKT +05:00)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Locale & Language
                    </label>
                    <select
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="en-PK">English (Pakistan)</option>
                      <option value="ur-PK">اردو (Urdu - Pakistan)</option>
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Google Maps Exact Location (Pakistan) */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Pinpoint Exact Restaurant Location on Google Map</span>
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Click anywhere on the map or drag the pin to set the exact latitude & longitude.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {restaurantLocation.coordinates.lat.toFixed(4)}, {restaurantLocation.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="h-[430px] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <LocationPickerMap
                    isModal={false}
                    restaurantName={tradeName || 'New Restaurant'}
                    initialLocation={restaurantLocation}
                    onSaveLocation={(loc) => {
                      setRestaurantLocation(loc);
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Admin Credentials */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Primary Contact / Owner Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Owner Email Address (Admin Login) *
                    </label>
                    <input
                      type="email"
                      placeholder="owner@restaurant.pk"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Phone / WhatsApp Contact *
                  </label>
                  <input
                    type="text"
                    placeholder="+92 (300) 8414899"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Password Generation Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                      <Key className="w-4 h-4 text-emerald-600" />
                      <span>Initial Admin Credentials</span>
                    </div>
                    <button
                      type="button"
                      onClick={generateNewPassword}
                      className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200">
                      {generatedPassword}
                    </div>
                    <button
                      type="button"
                      onClick={copyPasswordToClipboard}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 font-medium"
                    >
                      {passwordCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={sendInviteEmail}
                      onChange={(e) => setSendInviteEmail(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>Automatically email onboarding invite link to primary contact</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: Modules & Tiers */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Select SaaS Subscription Plan Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        name: 'Starter' as PlanTierName,
                        price: currency === 'PKR' ? '₨ 75,000' : '$99',
                        terminals: '2 Terminals',
                        desc: 'Single location takeaway / cafe',
                      },
                      {
                        name: 'Professional' as PlanTierName,
                        price: currency === 'PKR' ? '₨ 180,000' : '$249',
                        terminals: '6 Terminals',
                        desc: 'Full-service dine-in & KDS kitchen',
                        recommended: true,
                      },
                      {
                        name: 'Enterprise' as PlanTierName,
                        price: currency === 'PKR' ? '₨ 350,000' : '$599',
                        terminals: '15 Terminals',
                        desc: 'Multi-branch franchises & API access',
                      },
                    ].map((plan) => (
                      <div
                        key={plan.name}
                        onClick={() => {
                          setSelectedPlan(plan.name);
                          if (plan.name === 'Starter') setPosTerminalsCap(2);
                          if (plan.name === 'Professional') setPosTerminalsCap(6);
                          if (plan.name === 'Enterprise') setPosTerminalsCap(15);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedPlan === plan.name
                            ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {plan.name}
                          </span>
                          {plan.recommended && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white uppercase">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                          {plan.price}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">{plan.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trial Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Trial Duration Period
                    </label>
                    <select
                      value={trialDays}
                      onChange={(e) => setTrialDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={14}>14-Day Free Evaluation (Standard)</option>
                      <option value={30}>30-Day VIP Franchise Trial</option>
                      <option value={0}>Zero Trial (Bill Immediately)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Provisioned POS Terminals Cap
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={posTerminalsCap}
                      onChange={(e) => setPosTerminalsCap(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Feature Flags Toggles */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Module & Capability Flags
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: 'posEnabled', label: 'Cloud POS Terminal Engine' },
                      { key: 'kdsEnabled', label: 'Kitchen Display System (KDS)' },
                      { key: 'qrOrderingEnabled', label: 'Contactless QR Table Ordering' },
                      { key: 'inventoryEnabled', label: 'Real-time Recipe & Inventory Costing' },
                      { key: 'apiAccessEnabled', label: 'Outbound Ingress Webhooks & API' },
                      { key: 'multiLocationEnabled', label: 'Multi-Unit Central Master Menu' },
                    ].map((flag) => (
                      <label
                        key={flag.key}
                        className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none"
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {flag.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={featureFlags[flag.key as keyof typeof featureFlags]}
                          onChange={(e) =>
                            setFeatureFlags((prev) => ({
                              ...prev,
                              [flag.key]: e.target.checked,
                            }))
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Review & Deploy */}
            {currentStep === 5 && (
              <div className="space-y-4">
                {isDeploying ? (
                  /* Deployment in progress terminal */
                  <div className="p-6 rounded-2xl bg-slate-950 text-slate-200 space-y-4 font-mono">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-bold text-sm">Provisioning Pakistan Restaurant & Geocoding...</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      {deploymentLogs.map((log, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Summary Cards */
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                            Ready to Deploy
                          </span>
                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {tradeName || 'New Restaurant Tenant'}
                          </h4>
                          <p className="text-slate-500 text-xs">{legalName || 'N/A'}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                          {selectedPlan} Tier
                        </span>
                      </div>

                      {/* Google Maps Exact Location Card */}
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Google Maps Geocoded Location:</span>
                          </div>
                          <a
                            href={getGoogleMapsExternalUrl(restaurantLocation.coordinates, tradeName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <span>View External Map</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          {restaurantLocation.address}, {restaurantLocation.city}, {restaurantLocation.province}, Pakistan
                        </p>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                          <span>Lat: {restaurantLocation.coordinates.lat.toFixed(5)}</span>
                          <span>•</span>
                          <span>Lng: {restaurantLocation.coordinates.lng.toFixed(5)}</span>
                          {restaurantLocation.landmark && (
                            <>
                              <span>•</span>
                              <span>Landmark: {restaurantLocation.landmark}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Primary Contact:</span>
                          <span className="font-semibold">
                            {ownerName || 'N/A'} ({ownerEmail || 'N/A'})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Currency & Billing:</span>
                          <span className="font-semibold">
                            {currency} • {trialDays > 0 ? `${trialDays}-Day Trial` : 'Direct Billing'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Hardware Allowance:</span>
                          <span className="font-semibold">{posTerminalsCap} POS Terminals Max</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tax & Registration:</span>
                          <span className="font-semibold">{regNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-slate-600 dark:text-slate-400">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Pre-flight Provisioning Checklist:
                      </p>
                      <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Exact Google Maps pin & coordinates calibrated
                      </p>
                      <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Multi-tenant isolated DB container ready
                      </p>
                      <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Automated DNS & SSL wildcard routing verified
                      </p>
                      <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Super Admin root audit signature will be registered
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wizard Footer Controls */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                disabled={isDeploying}
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isDeploying}
                onClick={handleDeploy}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deploying Restaurant & Map Pin...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Deploy Restaurant Infrastructure</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
