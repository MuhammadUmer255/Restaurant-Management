export type TenantStatus = 'Active' | 'Trial' | 'Suspended' | 'Churned';
export type PlanTierName = 'Starter' | 'Professional' | 'Enterprise';
export type RegionCode = 'North America' | 'EMEA' | 'APAC' | 'LATAM';

export interface TenantContact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface TenantFeatureFlags {
  posEnabled: boolean;
  kdsEnabled: boolean;
  qrOrderingEnabled: boolean;
  inventoryEnabled: boolean;
  apiAccessEnabled: boolean;
  multiLocationEnabled: boolean;
}

export interface TenantLimits {
  posTerminals: {
    current: number;
    max: number;
  };
  staffSeats: {
    current: number;
    max: number;
  };
  apiRateLimitPerMin: number;
  locationsCount: number;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface TenantLocation {
  address: string;
  city: string;
  province?: string;
  country: string;
  postalCode?: string;
  coordinates: GeoCoordinates;
  placeId?: string;
  googleMapsUrl?: string;
  landmark?: string;
}

export interface Tenant {
  id: string; // e.g. "TEN-8841"
  externalRestaurantId?: string; // ID of existing restaurant entity in your main application database
  databaseNamespace?: string; // Table prefix or schema folder (e.g. "saas_")
  businessName: string; // Legal entity name
  tradeName: string; // DBA / Restaurant Display name
  registrationNumber: string; // Tax ID / NTN
  avatarUrl?: string;
  primaryContact: TenantContact;
  planTier: PlanTierName;
  mrr: number;
  status: TenantStatus;
  dateJoined: string; // ISO date
  timezone: string;
  locale: string;
  currency: string;
  region: RegionCode;
  healthScore: number; // 0-100
  trialEndsAt?: string;
  limits: TenantLimits;
  featureFlags: TenantFeatureFlags;
  location?: TenantLocation;
  lastActive: string;
  openTicketsCount: number;
  stripeCustomerId?: string;
}

export interface Transaction {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  method: string; // e.g. "Visa ending in 4242", "ACH Debit"
  status: 'Succeeded' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  billingPeriod: string;
  invoiceNumber: string;
}

export interface PlanPricingTier {
  id: string;
  name: PlanTierName;
  monthlyPrice: number;
  annualPrice: number;
  includedPosTerminals: number;
  additionalTerminalPrice: number;
  maxStaffSeats: number;
  description: string;
  popular?: boolean;
  features: string[];
}

export type AuditActionType =
  | 'TENANT_IMPERSONATED'
  | 'TENANT_CREATED'
  | 'TENANT_LOCATION_UPDATED'
  | 'USER_CREATED'
  | 'USER_REGISTERED'
  | 'USER_UPDATED'
  | 'USER_SUSPENDED'
  | 'USER_DELETED'
  | 'USER_STATUS_CHANGED'
  | 'LIMITS_UPDATED'
  | 'PASSWORD_RESET_TRIGGERED'
  | 'SUBSCRIPTION_PAUSED'
  | 'SUBSCRIPTION_RESUMED'
  | 'ACCESS_REVOKED'
  | 'PRICING_UPDATED'
  | 'FEATURE_FLAG_TOGGLED'
  | 'API_KEY_ROTATED'
  | 'BATCH_NOTICE_DISPATCHED'
  | 'CONSOLE_LOCKED'
  | 'DATA_RESET';

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  adminAvatar: string;
  action: AuditActionType;
  targetTenantId: string;
  targetTenantName: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  diffPayload?: {
    field?: string;
    before?: string | number | boolean;
    after?: string | number | boolean;
    metadata?: Record<string, any>;
  };
}

export interface AlertNotification {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  tenantId?: string;
  tenantName?: string;
  actionLabel?: string;
  actionType?: 'view_tenant' | 'retry_billing' | 'view_telemetry';
  read: boolean;
}

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  change: string; // e.g. "+14.2%"
  isPositive: boolean;
  secondaryText: string;
  sparkline: number[];
}

export interface SystemServiceTelemetry {
  id: string;
  name: string;
  status: 'Operational' | 'Degraded' | 'Incident';
  uptimePercentage: number;
  latencyMs: number;
  throughput: string;
  region: string;
}

export type RestaurantUserRole =
  | 'owner'
  | 'manager'
  | 'chef'
  | 'pos_cashier'
  | 'inventory_lead'
  | 'waitstaff';

export interface RestaurantUserPermissions {
  pos: boolean;
  kds: boolean;
  inventory: boolean;
  reports: boolean;
  staffManagement: boolean;
  billing: boolean;
}

export interface RestaurantUser {
  id: string;
  externalUserId?: string; // ID of existing user in main database
  email: string;
  fullName: string;
  phone?: string;
  role: RestaurantUserRole;
  tenantId: string;
  tenantName: string;
  branch?: string;
  status: 'active' | 'pending' | 'suspended';
  permissions: RestaurantUserPermissions;
  tempPassword?: string;
  inviteSent?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  tablePrefix?: string;
  schema?: string;
  isConfigured: boolean;
  isCustom: boolean;
}
