import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Lock,
  Phone,
  Building2,
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Sparkles,
  MapPin,
  Utensils,
  Smartphone,
  ChefHat,
  Receipt,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RestaurantUser, RestaurantUserRole, Tenant } from '../../types';
import {
  registerRestaurantUserInSupabase,
  getSupabaseConfig,
} from '../../lib/supabase';

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  onUserRegistered: (newUser: RestaurantUser, syncedToSupabase: boolean, message: string) => void;
  onOpenSupabaseConfig: () => void;
}

const ROLE_DEFINITIONS: {
  role: RestaurantUserRole;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultPermissions: RestaurantUser['permissions'];
}[] = [
  {
    role: 'owner',
    label: 'Restaurant Owner / Partner',
    badge: 'Executive',
    icon: Building2,
    description: 'Full organizational control, billing, hardware, and staff administration.',
    defaultPermissions: {
      pos: true,
      kds: true,
      inventory: true,
      reports: true,
      staffManagement: true,
      billing: true,
    },
  },
  {
    role: 'manager',
    label: 'General Manager',
    badge: 'Operations',
    icon: Shield,
    description: 'Floor supervision, shift closures, staff schedules, and menu overrides.',
    defaultPermissions: {
      pos: true,
      kds: true,
      inventory: true,
      reports: true,
      staffManagement: true,
      billing: false,
    },
  },
  {
    role: 'chef',
    label: 'Head Chef / Kitchen Lead',
    badge: 'Kitchen',
    icon: ChefHat,
    description: 'Kitchen Display System (KDS) stations, line dispatching, and 86 list.',
    defaultPermissions: {
      pos: false,
      kds: true,
      inventory: true,
      reports: false,
      staffManagement: false,
      billing: false,
    },
  },
  {
    role: 'pos_cashier',
    label: 'POS Cashier / Server',
    badge: 'Front of House',
    icon: Smartphone,
    description: 'Terminal checkout, tableside QR orders, split checks, and cash drawer.',
    defaultPermissions: {
      pos: true,
      kds: false,
      inventory: false,
      reports: false,
      staffManagement: false,
      billing: false,
    },
  },
  {
    role: 'inventory_lead',
    label: 'Inventory & Supply Officer',
    badge: 'Supply Chain',
    icon: Layers,
    description: 'Ingredient replenishment, supplier invoices, waste tracking, and recipes.',
    defaultPermissions: {
      pos: false,
      kds: false,
      inventory: true,
      reports: true,
      staffManagement: false,
      billing: false,
    },
  },
];

export const RegisterUserModal: React.FC<RegisterUserModalProps> = ({
  isOpen,
  onClose,
  tenants,
  onUserRegistered,
  onOpenSupabaseConfig,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState(
    tenants.length > 0 ? tenants[0].id : ''
  );
  const [branch, setBranch] = useState('Main Dining Room - Flagship');
  const [selectedRole, setSelectedRole] = useState<RestaurantUserRole>('manager');
  const [password, setPassword] = useState('RestoPass!2026');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Permissions state
  const [permissions, setPermissions] = useState<RestaurantUser['permissions']>({
    pos: true,
    kds: true,
    inventory: true,
    reports: true,
    staffManagement: true,
    billing: false,
  });

  if (!isOpen) return null;

  const supabaseConfig = getSupabaseConfig();

  const handleRoleChange = (role: RestaurantUserRole) => {
    setSelectedRole(role);
    const def = ROLE_DEFINITIONS.find((r) => r.role === role);
    if (def) {
      setPermissions(def.defaultPermissions);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Full name and a valid email address are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerRestaurantUserInSupabase({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        role: selectedRole,
        tenantId: selectedTenantId || 'TEN-UNASSIGNED',
        tenantName: selectedTenant?.tradeName || 'General SaaS Pool',
        branch: branch.trim() || 'Main Location',
        password,
        permissions,
        inviteSent: sendInvite,
        status: 'active',
      });

      onUserRegistered(result.user, result.syncedToSupabase, result.message);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to register user. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-2xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-xs"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Register Restaurant SaaS User</span>
                </h2>
                <p className="text-zinc-500 text-[11px]">
                  Provision credentials and role entitlements for restaurant operators
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Supabase Connection Status Bar */}
          <div className="px-5 py-2 bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              {supabaseConfig.isConfigured ? (
                <span className="text-zinc-700 dark:text-zinc-300">
                  Target: <strong className="font-mono text-zinc-900 dark:text-zinc-100">restaurant_users</strong> (Live sync enabled)
                </span>
              ) : (
                <span className="text-zinc-500">
                  Supabase unconfigured. Persisting in local store.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onOpenSupabaseConfig}
              className="text-zinc-700 dark:text-zinc-300 hover:underline font-medium flex items-center gap-1"
            >
              <span>{supabaseConfig.isConfigured ? 'Configure' : 'Connect'}</span>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMessage && (
              <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: User Identity */}
            <div className="space-y-2.5">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">
                Account Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Chef Marco Rossi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="marco@trattoria.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Assigned Restaurant *
                  </label>
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tradeName} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-zinc-700 dark:text-zinc-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 349-2180"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-700 dark:text-zinc-300">
                  Store Branch
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Downtown Main Floor"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Role Selection */}
            <div className="space-y-2">
              <label className="font-medium text-zinc-900 dark:text-zinc-100 block">
                Access Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLE_DEFINITIONS.map((r) => {
                  const isSelected = selectedRole === r.role;
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.role}
                      onClick={() => handleRoleChange(r.role)}
                      className={`p-2.5 rounded-md border cursor-pointer transition-colors flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {r.label}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                          {r.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Credentials */}
            <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Temporary Password</span>
                </span>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate New</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 pr-8 rounded-md font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 flex items-center gap-1 font-medium"
                >
                  {passwordCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{passwordCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <label className="flex items-center gap-2 pt-0.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendInvite}
                  onChange={(e) => setSendInvite(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 h-3.5 w-3.5"
                />
                <span className="text-zinc-500 text-[11px]">
                  Send welcome email invitation with sign-in link to user.
                </span>
              </label>
            </div>

            {/* Section 4: Module Permissions */}
            <div className="space-y-1.5">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                Permissions & Module Entitlements
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { key: 'pos', label: 'POS Terminal' },
                  { key: 'kds', label: 'Kitchen (KDS)' },
                  { key: 'inventory', label: 'Inventory Costing' },
                  { key: 'reports', label: 'Financial Reports' },
                  { key: 'staffManagement', label: 'Staff Management' },
                  { key: 'billing', label: 'Subscription & Invoices' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 select-none"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={permissions[item.key as keyof typeof permissions]}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 h-3.5 w-3.5"
                    />
                  </label>
                ))}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register User</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
