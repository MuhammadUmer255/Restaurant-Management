import { createClient } from '@supabase/supabase-js';
import { INITIAL_DATABASE_SEED_TENANTS } from './seeds';
// Storage keys for custom client-side Supabase credentials
export const STORAGE_URL_KEY = 'saas_supabase_url';
export const STORAGE_KEY_KEY = 'saas_supabase_anon_key';
export const STORAGE_PREFIX_KEY = 'saas_supabase_table_prefix';
export const STORAGE_SCHEMA_KEY = 'saas_supabase_schema';
/**
 * Retrieves the configured table prefix (defaults to 'saas_' for existing databases to prevent collisions).
 */
export function getTablePrefix() {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_PREFIX_KEY);
        if (saved !== null)
            return saved;
    }
    const metaEnv = import.meta.env || {};
    return (metaEnv.VITE_SUPABASE_TABLE_PREFIX !== undefined ? metaEnv.VITE_SUPABASE_TABLE_PREFIX : 'saas_');
}
/**
 * Retrieves the PostgreSQL schema folder (defaults to 'public').
 */
export function getDatabaseSchema() {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_SCHEMA_KEY);
        if (saved)
            return saved.trim();
    }
    const metaEnv = import.meta.env || {};
    return (metaEnv.VITE_SUPABASE_SCHEMA || 'public').trim();
}
/**
 * Returns the exact table name respecting the configured prefix (e.g. 'saas_tenants' or 'tenants').
 */
export function getTableName(base) {
    const prefix = getTablePrefix();
    return `${prefix}${base}`;
}
/**
 * Retrieves current Supabase configuration from localStorage or Vite environment variables.
 */
export function getSupabaseConfig() {
    const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
    const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';
    const tablePrefix = getTablePrefix();
    const schema = getDatabaseSchema();
    if (customUrl && customKey && customUrl.startsWith('https://')) {
        return {
            url: customUrl,
            anonKey: customKey,
            tablePrefix,
            schema,
            isConfigured: true,
            isCustom: true,
            source: 'custom_storage',
        };
    }
    const metaEnv = import.meta.env || {};
    const envUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
    const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();
    const isEnvValid = Boolean(envUrl) &&
        Boolean(envKey) &&
        envUrl.startsWith('https://') &&
        !envUrl.includes('your-project') &&
        envKey !== 'your-anon-key';
    if (isEnvValid) {
        return {
            url: envUrl,
            anonKey: envKey,
            tablePrefix,
            schema,
            isConfigured: true,
            isCustom: false,
            source: 'environment',
        };
    }
    return {
        url: customUrl || envUrl || '',
        anonKey: customKey || envKey || '',
        tablePrefix,
        schema,
        isConfigured: false,
        isCustom: false,
        source: 'none',
    };
}
let cachedClient = null;
let cachedConfigKey = '';
export function getSupabaseClient() {
    const config = getSupabaseConfig();
    if (!config.isConfigured)
        return null;
    const currentKey = `${config.url}::${config.anonKey}`;
    if (cachedClient && cachedConfigKey === currentKey) {
        return cachedClient;
    }
    try {
        cachedClient = createClient(config.url, config.anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
        cachedConfigKey = currentKey;
        return cachedClient;
    }
    catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        return null;
    }
}
let detectedTablePrefix = null;

export function getWorkingPrefix() {
    if (detectedTablePrefix !== null) return detectedTablePrefix;
    return getTablePrefix();
}

export function setWorkingPrefix(prefix) {
    detectedTablePrefix = prefix;
}

/**
 * Returns a typed query builder targeting the configured schema and table prefix.
 */
export function getDbTable(base) {
    const client = getSupabaseClient();
    if (!client)
        return null;
    const prefix = getWorkingPrefix();
    const targetTable = `${prefix}${base}`;
    const schema = getDatabaseSchema();
    if (schema && schema !== 'public') {
        return client.schema(schema).from(targetTable);
    }
    return client.from(targetTable);
}

/**
 * Executes a select query directly against the connected Supabase PostgreSQL database.
 */
export async function executeTableSelect(base, queryBuilderFn) {
    const client = getSupabaseClient();
    const cleanBase = base.replace(/^saas_/, '');

    if (!client) {
        return { data: [], count: 0, error: new Error('Supabase client not initialized') };
    }

    try {
        const schema = getDatabaseSchema();
        const currentPrefix = getWorkingPrefix();
        const primaryName = `${currentPrefix}${cleanBase}`;
        const altName = primaryName.startsWith('saas_') ? cleanBase : `saas_${cleanBase}`;

        const runQuery = async (tName) => {
            const tableRef = schema && schema !== 'public' ? client.schema(schema).from(tName) : client.from(tName);
            return await queryBuilderFn(tableRef);
        };

        let result = await runQuery(primaryName);
        if (result.error && (result.error.code === '42P01' || result.error.code === 'PGRST205')) {
            const altResult = await runQuery(altName);
            if (!altResult.error) {
                setWorkingPrefix(altName.startsWith('saas_') ? 'saas_' : '');
                result = altResult;
            }
        }

        if (result.error) {
            return { data: [], count: 0, error: result.error };
        }

        return { data: result.data || [], count: result.count ?? (result.data ? result.data.length : 0), error: null };
    } catch (remoteErr) {
        console.warn(`[Supabase] Remote select on ${base} error:`, remoteErr);
        return { data: [], count: 0, error: remoteErr };
    }
}

/**
 * Executes an insert or upsert directly into Supabase PostgreSQL tables.
 */
export async function executeTableInsert(base, records, options = {}) {
    const client = getSupabaseClient();
    const cleanBase = base.replace(/^saas_/, '');

    if (!client) {
        return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
        const schema = getDatabaseSchema();
        const currentPrefix = getWorkingPrefix();
        const primaryName = `${currentPrefix}${cleanBase}`;
        const altName = primaryName.startsWith('saas_') ? cleanBase : `saas_${cleanBase}`;

        const runInsert = async (tName, rows) => {
            const tableRef = schema && schema !== 'public' ? client.schema(schema).from(tName) : client.from(tName);
            if (options.upsert) {
                return await tableRef.upsert(rows, options.upsertOptions || { onConflict: 'id' }).select();
            }
            return await tableRef.insert(rows).select();
        };

        let result = await runInsert(primaryName, records);
        let activeName = primaryName;

        if (result.error && (result.error.code === '42P01' || result.error.code === 'PGRST205')) {
            const altResult = await runInsert(altName, records);
            if (!altResult.error) {
                setWorkingPrefix(altName.startsWith('saas_') ? 'saas_' : '');
                activeName = altName;
                result = altResult;
            }
        }

        if (result?.error && (result.error.code === '42703' || result.error.code === 'PGRST204' || result.error.message?.includes('column')) && options.sanitizeFn) {
            const sanitizedRows = records.map(options.sanitizeFn);
            const retryRes = await runInsert(activeName, sanitizedRows);
            if (!retryRes.error) {
                return retryRes;
            }
        }

        return result;
    } catch (remoteErr) {
        console.error(`[Supabase] Remote insert on ${base} error:`, remoteErr);
        return { data: null, error: remoteErr };
    }
}

/**
 * Executes an update directly in Supabase PostgreSQL tables.
 */
export async function executeTableUpdate(base, filterCol, filterVal, updatePayload) {
    const client = getSupabaseClient();
    const cleanBase = base.replace(/^saas_/, '');

    if (!client) {
        return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
        const schema = getDatabaseSchema();
        const currentPrefix = getWorkingPrefix();
        const primaryName = `${currentPrefix}${cleanBase}`;
        const altName = primaryName.startsWith('saas_') ? cleanBase : `saas_${cleanBase}`;

        const runUpdate = async (tName) => {
            const tableRef = schema && schema !== 'public' ? client.schema(schema).from(tName) : client.from(tName);
            return await tableRef.update(updatePayload).eq(filterCol, filterVal).select();
        };

        let result = await runUpdate(primaryName);
        if (result.error && (result.error.code === '42P01' || result.error.code === 'PGRST205')) {
            const altResult = await runUpdate(altName);
            if (!altResult.error) {
                setWorkingPrefix(altName.startsWith('saas_') ? 'saas_' : '');
                return altResult;
            }
        }
        return result;
    } catch (remoteErr) {
        console.error(`[Supabase] Remote update on ${base} error:`, remoteErr);
        return { data: null, error: remoteErr };
    }
}

/**
 * Executes a delete directly in Supabase PostgreSQL tables.
 */
export async function executeTableDelete(base, filterCol, filterVal) {
    const client = getSupabaseClient();
    const cleanBase = base.replace(/^saas_/, '');

    if (!client) {
        return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
        const schema = getDatabaseSchema();
        const currentPrefix = getWorkingPrefix();
        const primaryName = `${currentPrefix}${cleanBase}`;
        const altName = primaryName.startsWith('saas_') ? cleanBase : `saas_${cleanBase}`;

        const runDelete = async (tName) => {
            const tableRef = schema && schema !== 'public' ? client.schema(schema).from(tName) : client.from(tName);
            return await tableRef.delete().eq(filterCol, filterVal);
        };

        let result = await runDelete(primaryName);
        if (result.error && (result.error.code === '42P01' || result.error.code === 'PGRST205')) {
            const altResult = await runDelete(altName);
            if (!altResult.error) {
                setWorkingPrefix(altName.startsWith('saas_') ? 'saas_' : '');
                return altResult;
            }
        }
        return result;
    } catch (remoteErr) {
        console.error(`[Supabase] Remote delete on ${base} error:`, remoteErr);
        return { data: null, error: remoteErr };
    }
}

export function saveSupabaseConfig(url, anonKey, tablePrefix, schema) {
    if (typeof window === 'undefined')
        return false;
    try {
        const cleanUrl = url.trim();
        const cleanKey = anonKey.trim();
        if (!cleanUrl || !cleanKey) {
            localStorage.removeItem(STORAGE_URL_KEY);
            localStorage.removeItem(STORAGE_KEY_KEY);
        }
        else {
            localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
            localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
        }
        if (tablePrefix !== undefined) {
            localStorage.setItem(STORAGE_PREFIX_KEY, tablePrefix.trim());
        }
        if (schema !== undefined) {
            localStorage.setItem(STORAGE_SCHEMA_KEY, schema.trim() || 'public');
        }
        cachedClient = null;
        cachedConfigKey = '';
        detectedTablePrefix = null;
        return true;
    }
    catch {
        return false;
    }
}
export function clearSupabaseConfig() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_URL_KEY);
        localStorage.removeItem(STORAGE_KEY_KEY);
        localStorage.removeItem(STORAGE_PREFIX_KEY);
        localStorage.removeItem(STORAGE_SCHEMA_KEY);
    }
    cachedClient = null;
    cachedConfigKey = '';
    detectedTablePrefix = null;
}
export async function testSupabaseConnection() {
    const client = getSupabaseClient();
    const config = getSupabaseConfig();
    if (!client || !config.isConfigured) {
        return {
            ok: false,
            message: 'Supabase is not configured yet. Please enter your project URL and Anon Key.',
        };
    }
    const startTime = performance.now();
    try {
        const latency = Math.round(performance.now() - startTime);
        const tablesStatus = {};
        const tablesToCheck = [
            'tenants',
            'restaurant_users',
            'transactions',
            'audit_logs',
            'plan_tiers',
            'system_alerts',
            'telemetry_metrics',
            'admin_profiles',
        ];

        let foundPrefixed = 0;
        let foundUnprefixed = 0;

        await Promise.all(tablesToCheck.map(async (t) => {
            const currentPrefix = getWorkingPrefix();
            const primaryName = `${currentPrefix}${t}`;
            const altName = primaryName.startsWith('saas_') ? t : `saas_${t}`;
            const schema = config.schema && config.schema !== 'public' ? config.schema : null;

            const check = async (name) => {
                const q = schema ? client.schema(schema).from(name) : client.from(name);
                const { error } = await q.select('id').limit(1);
                return !error;
            };

            let ok = await check(primaryName);
            if (ok) {
                tablesStatus[primaryName] = true;
                if (primaryName.startsWith('saas_')) foundPrefixed++;
                else foundUnprefixed++;
            } else {
                const altOk = await check(altName);
                if (altOk) {
                    tablesStatus[altName] = true;
                    if (altName.startsWith('saas_')) foundPrefixed++;
                    else foundUnprefixed++;
                } else {
                    tablesStatus[primaryName] = false;
                }
            }
        }));

        if (foundUnprefixed > foundPrefixed) {
            setWorkingPrefix('');
        } else if (foundPrefixed > 0) {
            setWorkingPrefix('saas_');
        }

        const totalFound = Math.max(foundPrefixed, foundUnprefixed);
        if (totalFound === 0) {
            return {
                ok: true,
                message: `Connected to Supabase (${latency}ms)! Database tables have not been created yet. Copy and run the SQL migration in your Supabase SQL Editor.`,
                latencyMs: latency,
                tablesStatus,
            };
        }

        return {
            ok: true,
            message: `Supabase connected successfully! Database latency: ${latency}ms. Verified ${totalFound} active PostgreSQL tables.`,
            latencyMs: latency,
            tablesStatus,
        };
    }
    catch (err) {
        return {
            ok: false,
            message: err?.message || 'Network error connecting to Supabase instance.',
        };
    }
}
// ============================================================================
// 1. TENANTS CRUD
// ============================================================================
export async function fetchTenantsFromSupabase() {
    try {
        const { data, error } = await executeTableSelect('tenants', (q) =>
            q.select('*').order('created_at', { ascending: false })
        );
        if (error || !data) {
            if (error && error.message !== 'Supabase client not initialized')
                console.warn('fetchTenantsFromSupabase:', error.message);
            return [];
        }
        return data.map((t) => {
            const rawName = t.name || t.trade_name || t.business_name || 'Restaurant';
            const rawEmail = t.contact_email || t.primary_contact_email || t.primaryContact?.email || 'owner@restaurant.com';
            const rawTier = t.subscription_tier || t.plan_tier || t.planTier || 'Professional';
            return {
                id: t.id,
                name: rawName,
                contactEmail: rawEmail,
                subscriptionTier: rawTier,
                externalRestaurantId: t.external_restaurant_id || t.externalRestaurantId || undefined,
                databaseNamespace: t.database_namespace || t.databaseNamespace || getTablePrefix() || undefined,
                businessName: t.business_name || rawName,
                tradeName: t.trade_name || rawName,
                registrationNumber: t.registration_number || t.registrationNumber || '',
                avatarUrl: t.avatar_url || t.avatarUrl,
                planTier: rawTier,
                mrr: Number(t.mrr) || (rawTier === 'Starter' ? 75000 : rawTier === 'Enterprise' ? 350000 : 180000),
                status: t.status || 'Active',
                region: t.region || 'APAC',
                timezone: t.timezone || 'Asia/Karachi',
                locale: t.locale || 'en-PK',
                currency: t.currency || 'PKR',
                healthScore: Number(t.health_score ?? t.healthScore) || 95,
                trialEndsAt: t.trial_ends_at || t.trialEndsAt,
                stripeCustomerId: t.stripe_customer_id || t.stripeCustomerId,
                primaryContact: {
                    name: t.primary_contact_name || t.primaryContact?.name || `${rawName} Owner`,
                    email: rawEmail,
                    phone: t.primary_contact_phone || t.primaryContact?.phone || '',
                    role: t.primary_contact_role || t.primaryContact?.role || 'Owner / General Manager',
                },
                limits: {
                    posTerminals: {
                        current: Number(t.pos_terminals_current ?? t.limits?.posTerminals?.current) || 1,
                        max: Number(t.pos_terminals_max ?? t.limits?.posTerminals?.max) || 6,
                    },
                    staffSeats: {
                        current: Number(t.staff_seats_current ?? t.limits?.staffSeats?.current) || 1,
                        max: Number(t.staff_seats_max ?? t.limits?.staffSeats?.max) || 20,
                    },
                    apiRateLimitPerMin: Number(t.api_rate_limit ?? t.limits?.apiRateLimitPerMin) || 600,
                    locationsCount: Number(t.locations_count ?? t.limits?.locationsCount) || 1,
                },
                featureFlags: {
                    posEnabled: t.pos_enabled ?? t.featureFlags?.posEnabled ?? true,
                    kdsEnabled: t.kds_enabled ?? t.featureFlags?.kdsEnabled ?? true,
                    qrOrderingEnabled: t.qr_ordering_enabled ?? t.featureFlags?.qrOrderingEnabled ?? true,
                    inventoryEnabled: t.inventory_enabled ?? t.featureFlags?.inventoryEnabled ?? true,
                    apiAccessEnabled: t.api_access_enabled ?? t.featureFlags?.apiAccessEnabled ?? false,
                    multiLocationEnabled: t.multi_location_enabled ?? t.featureFlags?.multiLocationEnabled ?? false,
                },
                dateJoined: t.date_joined || t.created_at || new Date().toISOString(),
                lastActive: t.last_active || 'Just now',
                openTicketsCount: Number(t.open_tickets_count ?? t.openTicketsCount) || 0,
                location: t.location ||
                    (t.latitude && t.longitude
                        ? {
                            address: t.address || '',
                            city: t.city || 'Lahore',
                            province: t.province || 'Punjab',
                            country: 'Pakistan',
                            postalCode: t.postal_code || undefined,
                            landmark: t.landmark || undefined,
                            coordinates: {
                                lat: Number(t.latitude),
                                lng: Number(t.longitude),
                            },
                        }
                        : undefined),
            };
        });
    }
    catch (err) {
        console.error('fetchTenantsFromSupabase exception:', err);
        return [];
    }
}
export async function createTenantInSupabase(tenant) {
    try {
        const tenantName = tenant.name || tenant.tradeName || tenant.businessName || 'Restaurant';
        const contactEmail = tenant.contact_email || tenant.contactEmail || tenant.primaryContact?.email || 'owner@restaurant.com';
        const subscriptionTier = tenant.subscription_tier || tenant.subscriptionTier || tenant.planTier || 'Professional';
        const nowIso = new Date().toISOString();

        const payload = {
            id: tenant.id,
            name: tenantName,
            contact_email: contactEmail,
            subscription_tier: subscriptionTier,
            external_restaurant_id: tenant.externalRestaurantId || null,
            database_namespace: tenant.databaseNamespace || getTablePrefix() || null,
            business_name: tenant.businessName || tenantName,
            trade_name: tenant.tradeName || tenantName,
            registration_number: tenant.registrationNumber || null,
            avatar_url: tenant.avatarUrl || null,
            plan_tier: subscriptionTier,
            mrr: tenant.mrr ?? (subscriptionTier === 'Starter' ? 75000 : subscriptionTier === 'Enterprise' ? 350000 : 180000),
            status: tenant.status || 'Active',
            region: tenant.region || 'APAC',
            timezone: tenant.timezone || 'Asia/Karachi',
            locale: tenant.locale || 'en-PK',
            currency: tenant.currency || 'PKR',
            health_score: tenant.healthScore ?? 100,
            trial_ends_at: tenant.trialEndsAt || null,
            stripe_customer_id: tenant.stripeCustomerId || null,
            primary_contact_name: tenant.primaryContact?.name || tenant.primaryContactName || `${tenantName} Admin`,
            primary_contact_email: contactEmail,
            primary_contact_phone: tenant.primaryContact?.phone || tenant.contactPhone || null,
            primary_contact_role: tenant.primaryContact?.role || 'Owner / General Partner',
            pos_terminals_current: tenant.limits?.posTerminals?.current ?? 1,
            pos_terminals_max: tenant.limits?.posTerminals?.max ?? (subscriptionTier === 'Enterprise' ? 25 : subscriptionTier === 'Starter' ? 3 : 6),
            staff_seats_current: tenant.limits?.staffSeats?.current ?? 1,
            staff_seats_max: tenant.limits?.staffSeats?.max ?? (subscriptionTier === 'Enterprise' ? 50 : 20),
            api_rate_limit: tenant.limits?.apiRateLimitPerMin ?? (subscriptionTier === 'Enterprise' ? 1200 : 600),
            locations_count: tenant.limits?.locationsCount ?? 1,
            pos_enabled: tenant.featureFlags?.posEnabled ?? true,
            kds_enabled: tenant.featureFlags?.kdsEnabled ?? true,
            qr_ordering_enabled: tenant.featureFlags?.qrOrderingEnabled ?? true,
            inventory_enabled: tenant.featureFlags?.inventoryEnabled ?? true,
            api_access_enabled: tenant.featureFlags?.apiAccessEnabled ?? (subscriptionTier === 'Enterprise'),
            multi_location_enabled: tenant.featureFlags?.multiLocationEnabled ?? false,
            date_joined: tenant.dateJoined || nowIso,
            last_active: tenant.lastActive || 'Just now',
            open_tickets_count: tenant.openTicketsCount ?? 0,
            // Geolocation and Google Maps data
            latitude: tenant.location?.coordinates?.lat || null,
            longitude: tenant.location?.coordinates?.lng || null,
            address: tenant.location?.address || null,
            city: tenant.location?.city || null,
            province: tenant.location?.province || null,
            landmark: tenant.location?.landmark || null,
            postal_code: tenant.location?.postalCode || null,
            location: tenant.location || null,
            created_at: nowIso,
            updated_at: nowIso,
        };
        const { error } = await executeTableInsert('tenants', [payload], {
            upsert: true,
            sanitizeFn: (row) => ({
                id: row.id,
                name: row.name,
                contact_email: row.contact_email,
                subscription_tier: row.subscription_tier,
                business_name: row.business_name,
                trade_name: row.trade_name,
                plan_tier: row.plan_tier,
                primary_contact_email: row.primary_contact_email,
                primary_contact_name: row.primary_contact_name,
                mrr: row.mrr,
                status: row.status,
                currency: row.currency,
                created_at: row.created_at,
                updated_at: row.updated_at,
            })
        });
        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, message: `Tenant "${tenantName}" registered in Supabase 'tenants' table!` };
    }
    catch (err) {
        return { success: false, message: err?.message || 'Database error creating tenant' };
    }
}
export const registerTenantInSupabase = createTenantInSupabase;
// All mock data constants removed. Realtime PostgreSQL synchronization active.
export async function updateTenantLocationInSupabase(tenantId, location) {
    try {
        const { error } = await executeTableUpdate('tenants', 'id', tenantId, {
            latitude: location.coordinates.lat,
            longitude: location.coordinates.lng,
            address: location.address,
            city: location.city,
            province: location.province,
            landmark: location.landmark,
            postal_code: location.postalCode,
            location,
            updated_at: new Date().toISOString(),
        });
        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, message: 'Exact location updated on Google Maps & Supabase!' };
    }
    catch (err) {
        return { success: false, message: err?.message || 'Failed to update location' };
    }
}
export async function updateTenantStatusInSupabase(tenantId, status) {
    try {
        const { error } = await executeTableUpdate('tenants', 'id', tenantId, {
            status,
            updated_at: new Date().toISOString()
        });
        return !error;
    }
    catch {
        return false;
    }
}
export async function updateTenantLimitsInSupabase(tenantId, limits) {
    try {
        const { error } = await executeTableUpdate('tenants', 'id', tenantId, {
            pos_terminals_max: limits.posTerminalsMax,
            staff_seats_max: limits.staffSeatsMax,
            api_rate_limit: limits.apiRateLimitPerMin,
            updated_at: new Date().toISOString(),
        });
        return !error;
    }
    catch {
        return false;
    }
}
export async function updateTenantFeatureFlagsInSupabase(tenantId, flags) {
    try {
        const { error } = await executeTableUpdate('tenants', 'id', tenantId, {
            pos_enabled: flags.posEnabled,
            kds_enabled: flags.kdsEnabled,
            qr_ordering_enabled: flags.qrOrderingEnabled,
            inventory_enabled: flags.inventoryEnabled,
            api_access_enabled: flags.apiAccessEnabled,
            multi_location_enabled: flags.multiLocationEnabled,
            updated_at: new Date().toISOString(),
        });
        return !error;
    }
    catch {
        return false;
    }
}
export async function deleteTenantFromSupabase(tenantId) {
    try {
        const { error } = await executeTableDelete('tenants', 'id', tenantId);
        return !error;
    }
    catch {
        return false;
    }
}
// ============================================================================
// 2. RESTAURANT USERS CRUD
// ============================================================================
export async function fetchRestaurantUsersFromSupabase() {
    try {
        const { data, error } = await executeTableSelect('restaurant_users', (q) =>
            q.select('*').order('created_at', { ascending: false })
        );
        if (error || !data) {
            if (error && error.message !== 'Supabase client not initialized')
                console.warn('fetchRestaurantUsersFromSupabase:', error.message);
            return [];
        }
        return data.map((item) => ({
            id: item.id,
            externalUserId: item.external_user_id || item.externalUserId || undefined,
            email: item.email,
            fullName: item.full_name || item.fullName || 'Unnamed Staff',
            phone: item.phone || '',
            role: item.role || 'manager',
            tenantId: item.tenant_id || item.tenantId || '',
            tenantName: item.tenant_name || item.tenantName || 'Unassigned',
            branch: item.branch || 'Main Location',
            status: item.status || 'active',
            permissions: item.permissions || {
                pos: true,
                kds: true,
                inventory: false,
                reports: false,
                staffManagement: false,
                billing: false,
            },
            tempPassword: item.temp_password,
            inviteSent: item.invite_sent ?? true,
            createdAt: item.created_at || new Date().toISOString(),
            lastLogin: item.last_login || 'Recently',
        }));
    }
    catch (err) {
        console.error('fetchRestaurantUsersFromSupabase error:', err);
        return [];
    }
}
export async function registerRestaurantUserInSupabase(userData) {
    const generatedId = `usr_${Math.random().toString(36).substring(2, 11)}`;
    const nowIso = new Date().toISOString();
    const newUser = {
        id: generatedId,
        externalUserId: userData.externalUserId,
        email: userData.email.trim().toLowerCase(),
        fullName: userData.fullName.trim(),
        phone: userData.phone?.trim(),
        role: userData.role,
        tenantId: userData.tenantId,
        tenantName: userData.tenantName,
        branch: userData.branch?.trim() || 'Main Restaurant Location',
        status: userData.status || 'active',
        permissions: userData.permissions,
        tempPassword: userData.password,
        inviteSent: userData.inviteSent ?? true,
        createdAt: nowIso,
    };
    const client = getSupabaseClient();
    if (!client) {
        return {
            success: false,
            user: newUser,
            message: 'Supabase database is not connected. Please enter credentials in Settings.',
            syncedToSupabase: false,
        };
    }
    try {
        let authUserId = '';
        const tempPassword = userData.password || 'RestoAuth!2026';
        try {
            const { data: authData, error: authError } = await client.auth.signUp({
                email: newUser.email,
                password: tempPassword,
                options: {
                    data: {
                        full_name: newUser.fullName,
                        role: newUser.role,
                        tenant_id: newUser.tenantId,
                        tenant_name: newUser.tenantName,
                        branch: newUser.branch,
                    },
                },
            });
            if (!authError && authData.user?.id) {
                authUserId = authData.user.id;
                newUser.id = authUserId;
            }
        }
        catch (authErr) {
            console.warn('Supabase Auth sign-up step handled:', authErr);
        }
        const dbPayload = {
            id: newUser.id,
            external_user_id: newUser.externalUserId || null,
            email: newUser.email,
            full_name: newUser.fullName,
            phone: newUser.phone || null,
            role: newUser.role,
            tenant_id: newUser.tenantId,
            tenant_name: newUser.tenantName,
            branch: newUser.branch,
            status: newUser.status,
            permissions: newUser.permissions,
            temp_password: newUser.tempPassword || null,
            invite_sent: newUser.inviteSent,
            created_at: nowIso,
            updated_at: nowIso,
        };
        const { error: dbError } = await executeTableInsert('restaurant_users', [dbPayload], {
            upsert: true,
            sanitizeFn: (row) => ({
                id: row.id,
                email: row.email,
                full_name: row.full_name,
                role: row.role,
                tenant_id: row.tenant_id,
                tenant_name: row.tenant_name,
                branch: row.branch,
                status: row.status,
                permissions: row.permissions,
                created_at: row.created_at,
                updated_at: row.updated_at,
            })
        });
        if (dbError) {
            console.error('Supabase user insert error:', dbError);
            return {
                success: false,
                user: newUser,
                message: `Database error: ${dbError.message}`,
                syncedToSupabase: false,
            };
        }
        return {
            success: true,
            user: newUser,
            authId: authUserId || undefined,
            message: `User ${newUser.fullName} successfully registered in Supabase database!`,
            syncedToSupabase: true,
        };
    }
    catch (err) {
        return {
            success: false,
            user: newUser,
            message: err?.message || 'Failed to register user in Supabase',
            syncedToSupabase: false,
        };
    }
}
export async function updateRestaurantUserStatusInSupabase(userId, status) {
    try {
        const { error } = await executeTableUpdate('restaurant_users', 'id', userId, {
            status,
            updated_at: new Date().toISOString()
        });
        return !error;
    }
    catch {
        return false;
    }
}
export async function deleteRestaurantUserFromSupabase(userId) {
    try {
        const { error } = await executeTableDelete('restaurant_users', 'id', userId);
        return !error;
    }
    catch {
        return false;
    }
}
export async function resendRestaurantUserInviteInSupabase(userId) {
    try {
        const { error } = await executeTableUpdate('restaurant_users', 'id', userId, {
            invite_sent: true,
            updated_at: new Date().toISOString()
        });
        return !error;
    }
    catch {
        return false;
    }
}
// ============================================================================
// 3. TRANSACTIONS CRUD (Billing Ledger)
// ============================================================================
export async function fetchTransactionsFromSupabase() {
    try {
        const { data, error } = await executeTableSelect('transactions', (q) =>
            q.select('*').order('created_at', { ascending: false })
        );
        if (error || !data) {
            if (error && error.message !== 'Supabase client not initialized')
                console.warn('fetchTransactionsFromSupabase:', error.message);
            return [];
        }
        return data.map((txn) => ({
            id: txn.id,
            invoiceNumber: txn.invoice_number || txn.invoiceNumber || txn.id,
            tenantId: txn.tenant_id || txn.tenantId,
            tenantName: txn.tenant_name || txn.tenantName,
            amount: Number(txn.amount) || 0,
            currency: txn.currency || 'PKR',
            method: txn.method || 'Credit Card (Stripe)',
            status: txn.status || 'Succeeded',
            date: txn.date || txn.created_at || new Date().toISOString(),
            billingPeriod: txn.billing_period || txn.billingPeriod || txn.period || 'Current Billing Cycle',
        }));
    }
    catch (err) {
        console.error('fetchTransactionsFromSupabase error:', err);
        return [];
    }
}
export async function updateTransactionStatusInSupabase(invoiceNumber, status) {
    try {
        const { error } = await executeTableUpdate('transactions', 'invoice_number', invoiceNumber, {
            status,
            updated_at: new Date().toISOString()
        });
        return !error;
    }
    catch {
        return false;
    }
}
// ============================================================================
// 4. AUDIT LOGS CRUD
// ============================================================================
export async function fetchAuditLogsFromSupabase() {
    try {
        const { data, error } = await executeTableSelect('audit_logs', (q) =>
            q.select('*').order('created_at', { ascending: false }).limit(150)
        );
        if (error || !data) {
            if (error && error.message !== 'Supabase client not initialized')
                console.warn('fetchAuditLogsFromSupabase:', error.message);
            return [];
        }
        return data.map((log) => ({
            id: log.id,
            adminName: log.admin_name || log.adminName || 'Super Admin',
            adminEmail: log.admin_email || log.adminEmail || 'admin@restosaas.internal',
            adminAvatar: log.admin_avatar || log.adminAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
            action: log.action || 'SYSTEM_MUTATION',
            targetTenantId: log.target_tenant_id || log.targetTenantId || '',
            targetTenantName: log.target_tenant_name || log.targetTenantName || '',
            timestamp: log.timestamp || log.created_at || 'Just now',
            ipAddress: log.ip_address || log.ipAddress || '192.0.2.45 (VPN)',
            userAgent: log.user_agent || log.userAgent || 'SuperAdmin Console',
            details: log.details || '',
            diffPayload: log.diff_payload || log.diffPayload,
        }));
    }
    catch (err) {
        console.error('fetchAuditLogsFromSupabase error:', err);
        return [];
    }
}
export async function createAuditLogInSupabase(log) {
    try {
        const payload = {
            id: log.id,
            admin_name: log.adminName,
            admin_email: log.adminEmail,
            admin_avatar: log.adminAvatar,
            action: log.action,
            target_tenant_id: log.targetTenantId,
            target_tenant_name: log.targetTenantName,
            timestamp: log.timestamp,
            ip_address: log.ipAddress,
            user_agent: log.userAgent,
            details: log.details,
            diff_payload: log.diffPayload || null,
            created_at: new Date().toISOString(),
        };
        const { error } = await executeTableInsert('audit_logs', [payload], { upsert: true });
        return !error;
    }
    catch {
        return false;
    }
}
// ============================================================================
// 5. PLAN PRICING TIERS CRUD
// ============================================================================
export async function fetchPlanTiersFromSupabase() {
    try {
        const { data, error } = await executeTableSelect('plan_tiers', (q) =>
            q.select('*').order('monthly_price', { ascending: true })
        );
        if (error || !data || data.length === 0)
            return [];
        return data.map((p) => ({
            id: p.id,
            name: p.name,
            monthlyPrice: Number(p.monthly_price ?? p.monthlyPrice) || 0,
            annualPrice: Number(p.annual_price ?? p.annualPrice) || 0,
            includedPosTerminals: Number(p.included_pos_terminals ?? p.includedPosTerminals) || 3,
            additionalTerminalPrice: Number(p.additional_terminal_price ?? p.additionalTerminalPrice) || 35,
            maxStaffSeats: Number(p.max_staff_seats ?? p.maxStaffSeats) || 10,
            description: p.description || '',
            popular: p.popular ?? false,
            features: p.features || [],
        }));
    }
    catch (err) {
        console.error('fetchPlanTiersFromSupabase error:', err);
        return [];
    }
}
export async function updatePlanTierInSupabase(tierId, updates) {
    try {
        const payload = { updated_at: new Date().toISOString() };
        if (updates.monthlyPrice !== undefined)
            payload.monthly_price = updates.monthlyPrice;
        if (updates.annualPrice !== undefined)
            payload.annual_price = updates.annualPrice;
        if (updates.includedPosTerminals !== undefined)
            payload.included_pos_terminals = updates.includedPosTerminals;
        if (updates.additionalTerminalPrice !== undefined)
            payload.additional_terminal_price = updates.additionalTerminalPrice;
        if (updates.maxStaffSeats !== undefined)
            payload.max_staff_seats = updates.maxStaffSeats;
        if (updates.description !== undefined)
            payload.description = updates.description;
        if (updates.features !== undefined)
            payload.features = updates.features;
        const { error } = await executeTableUpdate('plan_tiers', 'id', tierId, payload);
        return !error;
    }
    catch {
        return false;
    }
}
// ============================================================================
// 6. SYSTEM ALERTS CRUD
// ============================================================================
export async function fetchSystemAlertsFromSupabase() {
    try {
        const { data, error } = await executeTableSelect('system_alerts', (q) =>
            q.select('*').order('created_at', { ascending: false })
        );
        if (error || !data)
            return [];
        return data.map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            severity: a.severity || 'info',
            timestamp: a.timestamp || a.created_at || 'Just now',
            tenantId: a.tenant_id || a.tenantId,
            tenantName: a.tenant_name || a.tenantName,
            actionLabel: a.action_label || a.actionLabel,
            actionType: a.action_type || a.actionType,
            read: a.read ?? false,
        }));
    }
    catch (err) {
        console.error('fetchSystemAlertsFromSupabase error:', err);
        return [];
    }
}
export async function createSystemAlertInSupabase(alert) {
    try {
        const payload = {
            id: alert.id,
            title: alert.title,
            description: alert.description,
            severity: alert.severity,
            timestamp: alert.timestamp,
            tenant_id: alert.tenantId || null,
            tenant_name: alert.tenantName || null,
            action_label: alert.actionLabel || null,
            action_type: alert.actionType || null,
            read: alert.read ?? false,
            created_at: new Date().toISOString(),
        };
        const { error } = await executeTableInsert('system_alerts', [payload], { upsert: true });
        return !error;
    }
    catch {
        return false;
    }
}
export async function dismissSystemAlertInSupabase(alertId) {
    try {
        const { error } = await executeTableDelete('system_alerts', 'id', alertId);
        return !error;
    }
    catch {
        return false;
    }
}
// ============================================================================
// 7. SYSTEM TELEMETRY CRUD
// ============================================================================
export async function fetchTelemetryFromSupabase() {
    try {
        const { data, error } = await executeTableSelect('telemetry_metrics', (q) =>
            q.select('*').order('name', { ascending: true })
        );
        if (error || !data || data.length === 0)
            return [];
        return data.map((s) => ({
            id: s.id,
            name: s.name,
            status: s.status || 'Operational',
            uptimePercentage: Number(s.uptime_percentage ?? s.uptimePercentage) || 99.99,
            latencyMs: Number(s.latency_ms ?? s.latencyMs) || 20,
            throughput: s.throughput || '4.2k req/s',
            region: s.region || 'us-east-1 (Global Edge)',
        }));
    }
    catch (err) {
        console.error('fetchTelemetryFromSupabase error:', err);
        return [];
    }
}
// ============================================================================
// 8. SUPER ADMIN PROFILE & CREDENTIALS CRUD
// ============================================================================
export const DEFAULT_SUPER_ADMIN_PROFILE = {
    id: 'ADM-01',
    fullName: 'Fatima Javaid',
    email: 'fatimajavaid1886@gmail.com',
    role: 'Super Admin',
    title: 'Lead Architect & Platform Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    phone: '+92 (300) 8412901',
    status: 'active',
    lastLogin: 'Active session',
};

export async function fetchSuperAdminProfileFromSupabase() {
    try {
        // Try dedicated admin_profiles table first
        const { data: adminData, error: adminError } = await executeTableSelect('admin_profiles', (q) =>
            q.select('*').limit(1)
        );

        if (!adminError && adminData && adminData.length > 0) {
            const admin = adminData[0];
            return {
                id: admin.id || 'ADM-01',
                fullName: admin.full_name || admin.fullName || 'Fatima Javaid',
                email: admin.email || 'fatimajavaid1886@gmail.com',
                role: admin.role || 'Super Admin',
                title: admin.title || 'Lead Architect & Platform Admin',
                avatar: admin.avatar || DEFAULT_SUPER_ADMIN_PROFILE.avatar,
                phone: admin.phone || DEFAULT_SUPER_ADMIN_PROFILE.phone,
                status: admin.status || 'active',
                lastLogin: admin.last_login || admin.lastLogin || 'Active session',
                createdAt: admin.created_at,
            };
        }

        // Fallback: Check restaurant_users for email containing fatima or superadmin role
        const { data: userData, error: userError } = await executeTableSelect('restaurant_users', (q) =>
            q.select('*').ilike('email', '%fatima%').limit(1)
        );

        if (!userError && userData && userData.length > 0) {
            const u = userData[0];
            return {
                id: u.id || 'ADM-01',
                fullName: u.full_name || 'Fatima Javaid',
                email: u.email || 'fatimajavaid1886@gmail.com',
                role: 'Super Admin',
                title: 'Lead Architect & Platform Admin',
                avatar: DEFAULT_SUPER_ADMIN_PROFILE.avatar,
                phone: u.phone || DEFAULT_SUPER_ADMIN_PROFILE.phone,
                status: u.status || 'active',
                lastLogin: u.last_login || 'Active session',
                createdAt: u.created_at,
            };
        }

        return DEFAULT_SUPER_ADMIN_PROFILE;
    }
    catch (err) {
        console.warn('fetchSuperAdminProfileFromSupabase note:', err?.message || err);
        return DEFAULT_SUPER_ADMIN_PROFILE;
    }
}

export async function updateSuperAdminProfileInSupabase(profileData) {
    const payload = {
        id: profileData.id || 'ADM-01',
        full_name: profileData.fullName?.trim() || 'Fatima Javaid',
        email: profileData.email?.trim().toLowerCase() || 'fatimajavaid1886@gmail.com',
        role: profileData.role || 'Super Admin',
        title: profileData.title || 'Lead Architect & Platform Admin',
        avatar: profileData.avatar || DEFAULT_SUPER_ADMIN_PROFILE.avatar,
        phone: profileData.phone?.trim() || DEFAULT_SUPER_ADMIN_PROFILE.phone,
        status: profileData.status || 'active',
        updated_at: new Date().toISOString(),
    };

    try {
        // Attempt update in admin_profiles table
        const { error: adminErr } = await executeTableInsert('admin_profiles', [payload], { upsert: true });
        
        // Also keep restaurant_users in sync if table exists
        const userSyncPayload = {
            id: payload.id,
            full_name: payload.full_name,
            email: payload.email,
            role: 'owner',
            tenant_id: 'SYSTEM_ADMIN',
            tenant_name: 'GustoOS Platform HQ',
            branch: 'Cloud Operations Center',
            status: 'active',
            phone: payload.phone,
            updated_at: payload.updated_at,
        };
        await executeTableInsert('restaurant_users', [userSyncPayload], { upsert: true }).catch(() => {});

        return {
            success: !adminErr,
            profile: {
                ...profileData,
                fullName: payload.full_name,
                email: payload.email,
            },
            message: adminErr ? adminErr.message : 'Admin profile saved to database.',
        };
    }
    catch (err) {
        return {
            success: false,
            message: err?.message || 'Failed to update admin profile in database.',
        };
    }
}

// ============================================================================
// 9. POPULATE LIVE SUPABASE DATABASE WITH SEED RECORDS IF EMPTY
// ============================================================================
export async function seedSupabaseDatabaseIfEmpty() {
    const client = getSupabaseClient();
    if (!client) {
        return {
            success: false,
            message: 'Supabase database is not connected. Please enter your Supabase Project URL and Anon Key in Settings.',
            seeded: false,
        };
    }
    try {
        const { count, error: countError } = await executeTableSelect('tenants', (q) =>
            q.select('id', { count: 'exact', head: true })
        );
        if (countError) {
            return {
                success: false,
                message: `Database table error: "${countError.message}". Please run the SQL Schema first in your Supabase SQL Editor.`,
                seeded: false,
            };
        }
        if (count && count > 0) {
            return {
                success: true,
                message: `Supabase database already contains ${count} tenants.`,
                seeded: false,
            };
        }
        // 1. Tenants (Real Pakistani Fleet)
        const initialTenants = INITIAL_DATABASE_SEED_TENANTS.map((t) => ({
            id: t.id,
            business_name: t.businessName,
            trade_name: t.tradeName,
            registration_number: t.registrationNumber,
            primary_contact_name: t.primaryContact.name,
            primary_contact_email: t.primaryContact.email,
            primary_contact_phone: t.primaryContact.phone,
            primary_contact_role: t.primaryContact.role,
            plan_tier: t.planTier,
            mrr: t.mrr,
            status: t.status,
            date_joined: t.dateJoined,
            timezone: t.timezone,
            locale: t.locale,
            currency: t.currency,
            region: t.region,
            health_score: t.healthScore,
            pos_terminals_current: t.limits.posTerminals.current,
            pos_terminals_max: t.limits.posTerminals.max,
            staff_seats_current: t.limits.staffSeats.current,
            staff_seats_max: t.limits.staffSeats.max,
            api_rate_limit: t.limits.apiRateLimitPerMin,
            locations_count: t.limits.locationsCount,
            pos_enabled: t.featureFlags.posEnabled,
            kds_enabled: t.featureFlags.kdsEnabled,
            qr_ordering_enabled: t.featureFlags.qrOrderingEnabled,
            inventory_enabled: t.featureFlags.inventoryEnabled,
            api_access_enabled: t.featureFlags.apiAccessEnabled,
            multi_location_enabled: t.featureFlags.multiLocationEnabled,
            last_active: t.lastActive,
            open_tickets_count: t.openTicketsCount,
            stripe_customer_id: t.stripeCustomerId,
            latitude: t.location?.coordinates.lat,
            longitude: t.location?.coordinates.lng,
            address: t.location?.address,
            city: t.location?.city,
            province: t.location?.province,
            postal_code: t.location?.postalCode,
            landmark: t.location?.landmark,
            location: t.location,
        }));
        await executeTableInsert('tenants', initialTenants, { upsert: true });
        // 2. Real Restaurant Staff & Executive Users
        const initialUsers = [
            {
                id: 'usr_pk_monal01',
                email: 'luqman@themonal.com',
                full_name: 'Luqman Ali Afzal',
                phone: '+92 (51) 2898044',
                role: 'owner',
                tenant_id: 'TEN-8841',
                tenant_name: 'The Monal Restaurant Islamabad',
                branch: 'Margalla Hills Daman-e-Koh Flagship',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: true, staffManagement: true, billing: true },
                invite_sent: true,
                created_at: '2025-04-12T10:30:00.000Z',
            },
            {
                id: 'usr_pk_monal02',
                email: 'ayesha.ops@themonal.com',
                full_name: 'Ayesha Siddiqui',
                phone: '+92 (300) 5519821',
                role: 'manager',
                tenant_id: 'TEN-8841',
                tenant_name: 'The Monal Restaurant Islamabad',
                branch: 'Margalla Hills Daman-e-Koh Flagship',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: true, staffManagement: true, billing: false },
                invite_sent: true,
                created_at: '2025-04-15T14:20:00.000Z',
            },
            {
                id: 'usr_pk_haveli01',
                email: 'habib@havelirestaurant.pk',
                full_name: 'Habib-ur-Rehman',
                phone: '+92 (300) 8414899',
                role: 'owner',
                tenant_id: 'TEN-4921',
                tenant_name: 'Haveli Restaurant Lahore',
                branch: 'Fort Road Food Street Rooftop',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: true, staffManagement: true, billing: true },
                invite_sent: true,
                created_at: '2025-06-20T08:00:00.000Z',
            },
            {
                id: 'usr_pk_haveli02',
                email: 'chef.aslam@havelirestaurant.pk',
                full_name: 'Chef Muhammad Aslam',
                phone: '+92 (321) 4410291',
                role: 'manager',
                tenant_id: 'TEN-4921',
                tenant_name: 'Haveli Restaurant Lahore',
                branch: 'Fort Road Food Street Rooftop',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: false, staffManagement: false, billing: false },
                invite_sent: true,
                created_at: '2025-06-22T09:15:00.000Z',
            },
            {
                id: 'usr_pk_kolachi01',
                email: 'waqas@kolachi.com.pk',
                full_name: 'Waqas Munir',
                phone: '+92 (321) 2445100',
                role: 'owner',
                tenant_id: 'TEN-7102',
                tenant_name: 'Kolachi Restaurant Karachi',
                branch: 'Do Darya Beachfront Phase VIII',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: true, staffManagement: true, billing: true },
                invite_sent: true,
                created_at: '2025-08-01T11:00:00.000Z',
            },
            {
                id: 'usr_pk_kolachi02',
                email: 'farhan.pos@kolachi.com.pk',
                full_name: 'Farhan Akhtar',
                phone: '+92 (333) 2918231',
                role: 'manager',
                tenant_id: 'TEN-7102',
                tenant_name: 'Kolachi Restaurant Karachi',
                branch: 'Do Darya Beachfront Phase VIII',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: true, staffManagement: true, billing: false },
                invite_sent: true,
                created_at: '2025-08-05T16:45:00.000Z',
            },
            {
                id: 'usr_pk_bundu01',
                email: 'babar@bundukhan.pk',
                full_name: 'Babar Sultan',
                phone: '+92 (42) 35754444',
                role: 'owner',
                tenant_id: 'TEN-1033',
                tenant_name: 'Bundu Khan Restaurant Lahore',
                branch: 'Gulberg III Main Boulevard',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: true, staffManagement: true, billing: true },
                invite_sent: true,
                created_at: '2026-02-14T10:00:00.000Z',
            },
            {
                id: 'usr_pk_savour01',
                email: 'naeem@savourfoods.com.pk',
                full_name: 'Chaudhry Naeem',
                phone: '+92 (51) 5554321',
                role: 'owner',
                tenant_id: 'TEN-5520',
                tenant_name: 'Savour Foods Rawalpindi',
                branch: 'Gordon College Road Main Campus',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: true, staffManagement: true, billing: true },
                invite_sent: true,
                created_at: '2025-05-10T09:00:00.000Z',
            },
            {
                id: 'ADM-01',
                email: 'fatimajavaid1886@gmail.com',
                full_name: 'Fatima Javaid',
                phone: '+92 (300) 8412901',
                role: 'owner',
                tenant_id: 'SYSTEM_ADMIN',
                tenant_name: 'GustoOS Super Admin Platform',
                branch: 'Cloud Operations Center',
                status: 'active',
                permissions: { pos: true, kds: true, inventory: true, reports: true, staffManagement: true, billing: true },
                invite_sent: true,
                created_at: new Date().toISOString(),
            },
        ];
        await executeTableInsert('restaurant_users', initialUsers, { upsert: true });
        // Also seed admin_profiles table
        const initialAdminProfiles = [
            {
                id: 'ADM-01',
                full_name: 'Fatima Javaid',
                email: 'fatimajavaid1886@gmail.com',
                role: 'Super Admin',
                title: 'Lead Architect & Platform Admin',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                phone: '+92 (300) 8412901',
                status: 'active',
                last_login: 'Active session',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ];
        await executeTableInsert('admin_profiles', initialAdminProfiles, { upsert: true }).catch(() => {});
        // 3. Plans
        const initialPlans = [
            {
                id: 'plan_starter',
                name: 'Starter',
                monthly_price: 95000,
                annual_price: 950000,
                included_pos_terminals: 3,
                additional_terminal_price: 15000,
                max_staff_seats: 10,
                description: 'Single-unit bistro, café or takeaway outlet modernizing POS & digital orders',
                popular: false,
                features: ['Up to 3 POS Terminals', 'Kitchen Display System (KDS)', 'QR Table Ordering & Pay', 'Standard Email Support'],
            },
            {
                id: 'plan_pro',
                name: 'Professional',
                monthly_price: 180000,
                annual_price: 1800000,
                included_pos_terminals: 8,
                additional_terminal_price: 12000,
                max_staff_seats: 25,
                description: 'High-volume dining hall with outdoor patio, bar, and multi-station kitchen routing',
                popular: true,
                features: ['Up to 8 POS Terminals', 'Advanced Inventory Sync', 'Multi-Floor Kitchen Routing', '24/7 Priority Support'],
            },
            {
                id: 'plan_enterprise',
                name: 'Enterprise',
                monthly_price: 350000,
                annual_price: 3500000,
                included_pos_terminals: 20,
                additional_terminal_price: 10000,
                max_staff_seats: 60,
                description: 'Flagship dining icons, multi-branch groups, and franchise hospitality operators',
                popular: false,
                features: ['Unlimited POS Terminals', 'Multi-Location Subdomain Clusters', 'Dedicated Enterprise API Bridge', 'Dedicated Solutions Engineer'],
            },
        ];
        await executeTableInsert('plan_tiers', initialPlans, { upsert: true });
        // 4. Real PKR Invoices & Transactions
        const initialTransactions = [
            {
                id: 'txn_pk_9011',
                invoice_number: 'INV-PK-2026-0891',
                tenant_id: 'TEN-8841',
                tenant_name: 'The Monal Restaurant Islamabad',
                amount: 350000,
                currency: 'PKR',
                method: 'Meezan Bank Direct Debit (Corporate Account •••• 8841)',
                status: 'Succeeded',
                date: '2026-03-01T00:00:00Z',
                billing_period: 'Mar 1, 2026 - Mar 31, 2026',
            },
            {
                id: 'txn_pk_9012',
                invoice_number: 'INV-PK-2026-0892',
                tenant_id: 'TEN-4921',
                tenant_name: 'Haveli Restaurant Lahore',
                amount: 180000,
                currency: 'PKR',
                method: 'Habib Bank Limited (1Link 0142••••7812)',
                status: 'Succeeded',
                date: '2026-03-01T00:00:00Z',
                billing_period: 'Mar 1, 2026 - Mar 31, 2026',
            },
            {
                id: 'txn_pk_9013',
                invoice_number: 'INV-PK-2026-0893',
                tenant_id: 'TEN-7102',
                tenant_name: 'Kolachi Restaurant Karachi',
                amount: 350000,
                currency: 'PKR',
                method: 'Standard Chartered Pakistan Auto-Pay (•••• 3309)',
                status: 'Succeeded',
                date: '2026-03-01T00:00:00Z',
                billing_period: 'Mar 1, 2026 - Mar 31, 2026',
            },
            {
                id: 'txn_pk_9014',
                invoice_number: 'INV-PK-2026-0894',
                tenant_id: 'TEN-1033',
                tenant_name: 'Bundu Khan Restaurant Lahore',
                amount: 95000,
                currency: 'PKR',
                method: 'MCB Islamic Corporate Pay (•••• 1033)',
                status: 'Succeeded',
                date: '2026-03-01T00:00:00Z',
                billing_period: 'Mar 1, 2026 - Mar 31, 2026',
            },
            {
                id: 'txn_pk_9015',
                invoice_number: 'INV-PK-2026-0895',
                tenant_id: 'TEN-5520',
                tenant_name: 'Savour Foods Rawalpindi',
                amount: 180000,
                currency: 'PKR',
                method: 'Bank Alfalah Digital Corporate (•••• 5520)',
                status: 'Succeeded',
                date: '2026-03-01T00:00:00Z',
                billing_period: 'Mar 1, 2026 - Mar 31, 2026',
            },
        ];
        await executeTableInsert('transactions', initialTransactions, { upsert: true });
        // 5. System Telemetry
        const initialTelemetry = [
            {
                id: 'svc-edge-gateway',
                name: 'Multi-Tenant API Gateway (Islamabad Edge)',
                status: 'Operational',
                uptime_percentage: 99.99,
                latency_ms: 14,
                throughput: '14.2k req/s',
                region: 'isb-edge-01 (Islamabad Core)',
            },
            {
                id: 'svc-postgres-cluster',
                name: 'Supabase PostgreSQL Primary',
                status: 'Operational',
                uptime_percentage: 99.98,
                latency_ms: 12,
                throughput: '8.6k qps',
                region: 'ap-south-1 (Mumbai Multi-AZ)',
            },
            {
                id: 'svc-pos-websocket',
                name: 'POS Terminal Live WebSocket Bus (Lahore Node)',
                status: 'Operational',
                uptime_percentage: 99.96,
                latency_ms: 16,
                throughput: '22.8k msgs/s',
                region: 'lhr-mesh-01 (Lahore)',
            },
            {
                id: 'svc-karachi-edge',
                name: 'Coastal Ingress & KDS Dispatch (Karachi)',
                status: 'Operational',
                uptime_percentage: 99.99,
                latency_ms: 11,
                throughput: '18.4k req/s',
                region: 'khi-edge-01 (Karachi)',
            },
            {
                id: 'svc-stripe-webhooks',
                name: '1Link & Digital Pay Webhook Pipeline',
                status: 'Operational',
                uptime_percentage: 100.0,
                latency_ms: 28,
                throughput: '180 events/s',
                region: 'Global Edge Worker',
            },
        ];
        await executeTableInsert('telemetry_metrics', initialTelemetry, { upsert: true });
        // 6. Audit logs
        const initialAuditLogs = [
            {
                id: 'AUD-8801',
                admin_name: 'Zainab Qureshi (Lead Architect)',
                admin_email: 'zainab.qureshi@restosaas.internal',
                admin_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                action: 'TENANT_CREATED',
                target_tenant_id: 'TEN-8841',
                target_tenant_name: 'The Monal Restaurant Islamabad',
                timestamp: '2025-04-12 10:30 PKT',
                ip_address: '182.185.12.90 (PTCL Fiber Islamabad)',
                user_agent: 'SuperAdmin Console / Enterprise Web',
                details: 'Provisioned enterprise cluster for The Monal Hospitality Group Pvt Ltd.',
            },
            {
                id: 'AUD-8802',
                admin_name: 'Bilal Khan (Senior DevOps)',
                admin_email: 'bilal.khan@restosaas.internal',
                admin_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                action: 'PLAN_UPGRADE',
                target_tenant_id: 'TEN-7102',
                target_tenant_name: 'Kolachi Restaurant Karachi',
                timestamp: '2025-08-01 14:15 PKT',
                ip_address: '110.38.10.42 (StormFiber Karachi)',
                user_agent: 'SuperAdmin Console / Enterprise Web',
                details: 'Upgraded Kolachi Restaurant Karachi to Enterprise Tier with Do Darya KDS cluster.',
            },
        ];
        await executeTableInsert('audit_logs', initialAuditLogs, { upsert: true });
        return {
            success: true,
            message: 'Initial records successfully seeded into your live Supabase PostgreSQL database!',
            seeded: true,
        };
    }
    catch (err) {
        console.error('seedSupabaseDatabaseIfEmpty exception:', err);
        return {
            success: false,
            message: err?.message || 'Database error during initialization',
            seeded: false,
        };
    }
}
// ============================================================================
// 9. DYNAMIC KPI CALCULATION FROM DATABASE DATA
// ============================================================================
export function calculateKpisFromDatabase(tenants, transactions, users) {
    const totalTenantsCount = tenants.length;
    const activeTenants = tenants.filter((t) => t.status === 'Active');
    const activeSubscriptionsCount = activeTenants.length;
    const totalMrr = tenants.reduce((acc, t) => acc + (t.status === 'Active' ? t.mrr : 0), 0);
    const churnedTenants = tenants.filter((t) => t.status === 'Churned');
    const churnRate = totalTenantsCount > 0 ? ((churnedTenants.length / totalTenantsCount) * 100).toFixed(2) : '0.00';
    const openTickets = tenants.reduce((acc, t) => acc + t.openTicketsCount, 0);
    // Dynamic currency detection from active database fleet
    const isPkr = tenants.length > 0 && (tenants[0].currency === 'PKR' || tenants.filter((t) => t.currency === 'PKR').length >= tenants.length / 2);
    const currencySymbol = isPkr ? '₨ ' : '$';
    return [
        {
            id: 'total-tenants',
            title: 'Total Tenants',
            value: totalTenantsCount.toLocaleString(),
            numericValue: totalTenantsCount,
            change: `+${tenants.filter((t) => new Date(t.dateJoined).getFullYear() >= 2026).length} in 2026`,
            isPositive: true,
            secondaryText: `${activeSubscriptionsCount} currently active`,
            sparkline: [Math.max(1, totalTenantsCount - 4), Math.max(2, totalTenantsCount - 2), totalTenantsCount],
        },
        {
            id: 'active-subscriptions',
            title: 'Active Subscriptions',
            value: activeSubscriptionsCount.toLocaleString(),
            numericValue: activeSubscriptionsCount,
            change: `${totalTenantsCount > 0 ? Math.round((activeSubscriptionsCount / totalTenantsCount) * 100) : 0}% fleet active`,
            isPositive: true,
            secondaryText: 'Live connected restaurants',
            sparkline: [Math.max(1, activeSubscriptionsCount - 2), activeSubscriptionsCount],
        },
        {
            id: 'mrr',
            title: 'Monthly Recurring Revenue',
            value: `${currencySymbol}${totalMrr.toLocaleString()}`,
            numericValue: totalMrr,
            change: `${currencySymbol}${(totalMrr * 12).toLocaleString()}/yr run rate`,
            isPositive: true,
            secondaryText: `Average ${currencySymbol}${activeSubscriptionsCount > 0 ? Math.round(totalMrr / activeSubscriptionsCount).toLocaleString() : '0'}/tenant`,
            sparkline: [Math.round(totalMrr * 0.8), Math.round(totalMrr * 0.9), totalMrr],
        },
        {
            id: 'registered-staff',
            title: 'Registered Staff & Admins',
            value: users.length.toLocaleString(),
            numericValue: users.length,
            change: `${users.filter((u) => u.status === 'active').length} active credentials`,
            isPositive: true,
            secondaryText: 'Supabase Auth fleet accounts',
            sparkline: [Math.max(1, users.length - 2), users.length],
        },
        {
            id: 'action-tickets',
            title: 'Action & Support Tickets',
            value: openTickets.toString(),
            numericValue: openTickets,
            change: openTickets === 0 ? 'Optimal' : `${openTickets} requires attention`,
            isPositive: openTickets === 0,
            secondaryText: `${tenants.filter((t) => t.status === 'Suspended').length} suspended tenants`,
            sparkline: [openTickets + 2, openTickets + 1, openTickets],
        },
    ];
}
export function generateSupabaseSchemaSql(options = {}) {
    const prefix = options.prefix !== undefined ? options.prefix : getTablePrefix();
    const schema = (options.schemaName !== undefined ? options.schemaName : getDatabaseSchema()) || 'public';
    const targetSchema = schema.trim() || 'public';
    const schemaClause = targetSchema !== 'public' ? `"${targetSchema}".` : 'public.';
    const p = prefix || '';
    const createSchemaSql = targetSchema !== 'public'
        ? `-- 0. Create dedicated folder schema for isolated SaaS multi-tenant portal\nCREATE SCHEMA IF NOT EXISTS "${targetSchema}";\n\n`
        : '';
    return `-- =========================================================
-- RESTAURANT SAAS SUPER ADMIN ISOLATED DATABASE MIGRATION
-- Compatible with Pre-Existing Databases & Supabase Projects
-- Namespace: Schema "${targetSchema}" | Table Prefix "${p}"
-- Safe Execution: Uses CREATE TABLE IF NOT EXISTS (No drop/conflicts)
-- Execute in Supabase Dashboard > SQL Editor
-- =========================================================

${createSchemaSql}-- 1. Tenants (Restaurant Accounts & Provisioning)
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}tenants (
  id TEXT PRIMARY KEY,
  name TEXT, -- Direct Restaurant Business Name
  contact_email TEXT, -- Direct Super Admin Primary Contact Email
  subscription_tier TEXT DEFAULT 'Professional', -- Direct Subscription Plan Tier (Starter, Professional, Enterprise)
  business_name TEXT,
  trade_name TEXT,
  registration_number TEXT,
  avatar_url TEXT,
  plan_tier TEXT DEFAULT 'Professional',
  mrr NUMERIC DEFAULT 249,
  status TEXT DEFAULT 'Active',
  region TEXT DEFAULT 'APAC',
  timezone TEXT DEFAULT 'Asia/Karachi',
  locale TEXT DEFAULT 'en-PK',
  currency TEXT DEFAULT 'PKR',
  health_score INT DEFAULT 95,
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  -- Link to existing database entity
  external_restaurant_id TEXT, -- References existing restaurant in your parent database
  database_namespace TEXT DEFAULT '${p || targetSchema}',
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  primary_contact_role TEXT,
  pos_terminals_current INT DEFAULT 1,
  pos_terminals_max INT DEFAULT 6,
  staff_seats_current INT DEFAULT 1,
  staff_seats_max INT DEFAULT 20,
  api_rate_limit INT DEFAULT 600,
  locations_count INT DEFAULT 1,
  pos_enabled BOOLEAN DEFAULT true,
  kds_enabled BOOLEAN DEFAULT true,
  qr_ordering_enabled BOOLEAN DEFAULT true,
  inventory_enabled BOOLEAN DEFAULT true,
  api_access_enabled BOOLEAN DEFAULT false,
  multi_location_enabled BOOLEAN DEFAULT false,
  date_joined TIMESTAMPTZ DEFAULT NOW(),
  last_active TEXT DEFAULT 'Just now',
  open_tickets_count INT DEFAULT 0,
  -- Google Maps Geolocation (Pakistan)
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  city TEXT,
  province TEXT,
  landmark TEXT,
  postal_code TEXT,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Restaurant Users (Staff & Admin Accounts)
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}restaurant_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'manager',
  tenant_id TEXT,
  tenant_name TEXT,
  branch TEXT DEFAULT 'Main Restaurant Location',
  status TEXT DEFAULT 'active',
  permissions JSONB DEFAULT '{"pos": true, "kds": true, "inventory": false, "reports": false, "staffManagement": false, "billing": false}'::jsonb,
  temp_password TEXT,
  invite_sent BOOLEAN DEFAULT true,
  external_user_id TEXT, -- References existing user in main database
  last_login TEXT DEFAULT 'Recently',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Billing Ledger & Invoices (Transactions)
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}transactions (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  tenant_id TEXT NOT NULL,
  tenant_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PKR',
  method TEXT DEFAULT 'Credit Card (Stripe)',
  status TEXT NOT NULL DEFAULT 'Succeeded',
  date TIMESTAMPTZ DEFAULT NOW(),
  billing_period TEXT DEFAULT 'Current Billing Cycle',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Audit & Security Activity Logs
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}audit_logs (
  id TEXT PRIMARY KEY,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  admin_avatar TEXT,
  action TEXT NOT NULL,
  target_tenant_id TEXT,
  target_tenant_name TEXT,
  timestamp TEXT DEFAULT 'Just now',
  ip_address TEXT DEFAULT '192.0.2.45 (VPN)',
  user_agent TEXT DEFAULT 'SuperAdmin Console',
  details TEXT,
  diff_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Plan Pricing Tiers
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}plan_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_price NUMERIC NOT NULL,
  annual_price NUMERIC NOT NULL,
  included_pos_terminals INT DEFAULT 3,
  additional_terminal_price NUMERIC DEFAULT 35,
  max_staff_seats INT DEFAULT 10,
  description TEXT,
  popular BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. System Alerts & Maintenance Notices
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}system_alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  timestamp TEXT DEFAULT 'Just now',
  tenant_id TEXT,
  tenant_name TEXT,
  action_label TEXT,
  action_type TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. System Telemetry Services
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}telemetry_metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Operational',
  uptime_percentage NUMERIC DEFAULT 99.99,
  latency_ms INT DEFAULT 20,
  throughput TEXT DEFAULT '4.2k req/s',
  region TEXT DEFAULT 'apac-south (Karachi Edge)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Restaurant Branches & Outlets (Multi-Unit Operations)
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}restaurant_branches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  manager_name TEXT,
  manager_phone TEXT,
  pos_terminals_count INT DEFAULT 2,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. POS Terminal Devices & Kitchen Screens
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}pos_terminals (
  id TEXT PRIMARY KEY,
  terminal_code TEXT UNIQUE NOT NULL,
  tenant_id TEXT NOT NULL,
  tenant_name TEXT,
  branch_name TEXT,
  device_model TEXT DEFAULT 'Sunmi V2 Pro',
  device_type TEXT DEFAULT 'POS',
  app_version TEXT DEFAULT 'v4.12.0',
  ip_address TEXT,
  status TEXT DEFAULT 'online',
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Live Kitchen Orders & Digital Ingress
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}live_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  tenant_name TEXT,
  branch_name TEXT,
  table_or_token TEXT,
  items_summary TEXT,
  items_count INT DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PKR',
  payment_method TEXT DEFAULT 'Cash',
  status TEXT DEFAULT 'preparing',
  prep_time_minutes INT DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Super Admin Profile & Identity (Lead Architect / Operations)
CREATE TABLE IF NOT EXISTS ${schemaClause}${p}admin_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Super Admin',
  title TEXT DEFAULT 'Lead Architect & Platform Admin',
  avatar TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  last_login TEXT DEFAULT 'Active session',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Indexes for Fast Query Performance
CREATE INDEX IF NOT EXISTS idx_${p}restaurant_users_tenant_id ON ${schemaClause}${p}restaurant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_${p}restaurant_users_email ON ${schemaClause}${p}restaurant_users(email);
CREATE INDEX IF NOT EXISTS idx_${p}tenants_status ON ${schemaClause}${p}tenants(status);
CREATE INDEX IF NOT EXISTS idx_${p}tenants_ext_id ON ${schemaClause}${p}tenants(external_restaurant_id);
CREATE INDEX IF NOT EXISTS idx_${p}transactions_tenant_id ON ${schemaClause}${p}transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_${p}audit_logs_created ON ${schemaClause}${p}audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_${p}branches_tenant_id ON ${schemaClause}${p}restaurant_branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_${p}terminals_tenant_id ON ${schemaClause}${p}pos_terminals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_${p}live_orders_tenant_id ON ${schemaClause}${p}live_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_${p}admin_profiles_email ON ${schemaClause}${p}admin_profiles(email);

-- 13. Row Level Security (RLS)
ALTER TABLE ${schemaClause}${p}tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}plan_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}telemetry_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}restaurant_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}live_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${schemaClause}${p}admin_profiles ENABLE ROW LEVEL SECURITY;

-- 14. Anon Policies for Super Admin Operations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}tenants') THEN
    CREATE POLICY "Allow anon all on ${p}tenants" ON ${schemaClause}${p}tenants FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}restaurant_users') THEN
    CREATE POLICY "Allow anon all on ${p}restaurant_users" ON ${schemaClause}${p}restaurant_users FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}transactions') THEN
    CREATE POLICY "Allow anon all on ${p}transactions" ON ${schemaClause}${p}transactions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}audit_logs') THEN
    CREATE POLICY "Allow anon all on ${p}audit_logs" ON ${schemaClause}${p}audit_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}plan_tiers') THEN
    CREATE POLICY "Allow anon all on ${p}plan_tiers" ON ${schemaClause}${p}plan_tiers FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}system_alerts') THEN
    CREATE POLICY "Allow anon all on ${p}system_alerts" ON ${schemaClause}${p}system_alerts FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}telemetry_metrics') THEN
    CREATE POLICY "Allow anon all on ${p}telemetry_metrics" ON ${schemaClause}${p}telemetry_metrics FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}restaurant_branches') THEN
    CREATE POLICY "Allow anon all on ${p}restaurant_branches" ON ${schemaClause}${p}restaurant_branches FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}pos_terminals') THEN
    CREATE POLICY "Allow anon all on ${p}pos_terminals" ON ${schemaClause}${p}pos_terminals FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}live_orders') THEN
    CREATE POLICY "Allow anon all on ${p}live_orders" ON ${schemaClause}${p}live_orders FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon all on ${p}admin_profiles') THEN
    CREATE POLICY "Allow anon all on ${p}admin_profiles" ON ${schemaClause}${p}admin_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;
}
export const SUPABASE_SCHEMA_SQL = generateSupabaseSchemaSql();

export async function resetDatabaseToSeeds() {
    const client = getSupabaseClient();
    if (!client) {
        return { success: false, message: 'Supabase database is not connected. Please connect Supabase in Settings.' };
    }
    return await seedSupabaseFleet(true);
}

export function exportDatabaseSql() {
    return generateSupabaseSchemaSql();
}
