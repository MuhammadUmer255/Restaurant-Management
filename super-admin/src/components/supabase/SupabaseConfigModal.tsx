import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Terminal,
  Zap,
  Layers,
  FolderGit2,
  ShieldCheck,
  Info,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  generateSupabaseSchemaSql,
  getTableName,
} from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [tablePrefix, setTablePrefix] = useState('saas_');
  const [schema, setSchema] = useState('public');
  const [activeTab, setActiveTab] = useState<'credentials' | 'schema' | 'coexistence'>('credentials');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTablePrefix(config.tablePrefix !== undefined ? config.tablePrefix : 'saas_');
      setSchema(config.schema || 'public');
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  // Dynamically generate the SQL based on selected prefix and schema
  const generatedSql = useMemo(() => {
    return generateSupabaseSchemaSql({
      prefix: tablePrefix.trim(),
      schemaName: schema.trim() || 'public',
    });
  }, [tablePrefix, schema]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    // Temporary save to test
    saveSupabaseConfig(url, anonKey, tablePrefix, schema);
    const result = await testSupabaseConnection();
    setTestResult({
      tested: true,
      ok: result.ok,
      message: result.message,
      latencyMs: result.latencyMs,
    });
    setIsTesting(false);
  };

  const handleSave = () => {
    const success = saveSupabaseConfig(url, anonKey, tablePrefix, schema);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onConfigUpdated) onConfigUpdated();
    }
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTablePrefix('');
    setSchema('public');
    setTestResult(null);
    if (onConfigUpdated) onConfigUpdated();
  };

  const copySql = () => {
    navigator.clipboard.writeText(generatedSql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2200);
  };

  const currentConfig = getSupabaseConfig();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-xs"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Database className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Connect Existing Database (Supabase / PostgreSQL)</span>
                  {currentConfig.isConfigured ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 font-semibold text-[10px]">
                      Demo Mode (Local State)
                    </span>
                  )}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Integrate your existing database with dedicated table prefixes or PostgreSQL schemas without touching your current tables.
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

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-950/30">
            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'credentials'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Connection & Namespace</span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'schema'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Custom SQL Schema Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('coexistence')}
              className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'coexistence'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Coexistence & Tenant Linking</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'credentials' && (
              <div className="space-y-4">
                {/* Information Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] space-y-1">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                      Zero Conflict with Your Existing Database:
                    </p>
                    <p>
                      This system creates dedicated tables using your chosen <strong className="font-semibold text-emerald-700 dark:text-emerald-300">Table Prefix</strong> (e.g.{' '}
                      <code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 font-mono text-emerald-700 dark:text-emerald-300">
                        {tablePrefix || 'none'}tenants
                      </code>
                      ) or a dedicated <strong className="font-semibold text-emerald-700 dark:text-emerald-300">PostgreSQL Schema</strong> (e.g.{' '}
                      <code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 font-mono text-emerald-700 dark:text-emerald-300">
                        {schema || 'public'}
                      </code>
                      ). Existing tables in your database are <strong>never modified or overwritten</strong>.
                    </p>
                  </div>
                </div>

                {/* Supabase URL */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Supabase Project URL *</span>
                    <a
                      href="https://app.supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Supabase Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Find in Supabase: Settings &gt; API &gt; Project URL.
                  </p>
                </div>

                {/* Supabase Anon Key */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Supabase API Key (Anon / Public or Service Role) *
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Find in Supabase: Project Settings &gt; API &gt; Project API keys (anon / public).
                  </p>
                </div>

                {/* Namespace & Isolation Section */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Database Coexistence & Namespace Settings
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Table Prefix Input */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Table Prefix (Recommended)</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Non-destructive
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="saas_"
                        value={tablePrefix}
                        onChange={(e) => setTablePrefix(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-400">Presets:</span>
                        {['saas_', 'portal_', 'crm_', ''].map((preset) => (
                          <button
                            key={preset || 'none'}
                            type="button"
                            onClick={() => setTablePrefix(preset)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors ${
                              tablePrefix === preset
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {preset || '(None)'}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Prefixes tables with <code className="font-mono font-semibold">{tablePrefix || ''}</code> (e.g.{' '}
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{getTableName('tenants')}</span>,{' '}
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{getTableName('restaurant_users')}</span>)
                        so they don't collide with existing tables.
                      </p>
                    </div>

                    {/* PostgreSQL Schema Input */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>PostgreSQL Schema / Folder</span>
                        <span className="text-[10px] text-slate-400 font-medium">Default: public</span>
                      </label>
                      <input
                        type="text"
                        placeholder="public or saas_portal"
                        value={schema}
                        onChange={(e) => setSchema(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-400">Presets:</span>
                        {['public', 'saas_portal', 'admin_portal'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setSchema(preset)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors ${
                              schema === preset
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Postgres schemas act like folders in your database. Using <code className="font-mono font-semibold">{schema}</code> isolates all portal tables completely.
                      </p>
                    </div>
                  </div>

                  {/* Active target summary preview */}
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Active Target Tables Preview:</span>
                    <div className="flex items-center gap-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                      <span>{schema}.{getTableName('tenants')}</span>
                      <span>•</span>
                      <span>{schema}.{getTableName('restaurant_users')}</span>
                      <span>•</span>
                      <span>{schema}.{getTableName('transactions')}</span>
                    </div>
                  </div>
                </div>

                {/* Test Feedback Area */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      testResult.ok
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {testResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs">{testResult.ok ? 'Connection Verified' : 'Connection Notice'}</p>
                        {testResult.latencyMs !== undefined && (
                          <span className="text-[10px] font-mono opacity-80">{testResult.latencyMs}ms latency</span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5">{testResult.message}</p>
                    </div>
                  </div>
                )}

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Configuration successfully saved. Live Supabase database sync is active.</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schema' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>Generated SQL Schema</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono">
                        Prefix: &quot;{tablePrefix}&quot; • Schema: &quot;{schema}&quot;
                      </span>
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      This script uses <code className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">CREATE TABLE IF NOT EXISTS</code> and will not affect any existing data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copySql}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
                  >
                    {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{sqlCopied ? 'Copied SQL to Clipboard!' : 'Copy SQL Script'}</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto border border-slate-800 selection:bg-emerald-500/30">
                    {generatedSql}
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 space-y-1.5 text-[11px]">
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>How to execute in your Supabase project:</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Copy the SQL script using the button above.</li>
                    <li>Open your existing Supabase Dashboard &gt; click <strong>SQL Editor</strong> on the left sidebar.</li>
                    <li>Click <strong>+ New Query</strong>, paste this script, and click <strong>RUN</strong>.</li>
                    <li>Tables will be created in your database without overwriting or deleting any existing tables.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'coexistence' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      How This Portal Integrates With Your Existing Database
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    This Super Admin Portal is designed to act as a governance, monitoring, and tenant control layer for a larger multi-tenant SaaS ecosystem. Here is how coexistence works:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Separate Tables via Prefix</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        By specifying a prefix like <code className="font-mono text-emerald-600 dark:text-emerald-400">saas_</code>, tables become <code className="font-mono">saas_tenants</code>, <code className="font-mono">saas_restaurant_users</code>, leaving your original <code className="font-mono">tenants</code> or <code className="font-mono">users</code> untouched.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Separate Folder via Schema</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        PostgreSQL supports multiple schemas within one database. Using a schema like <code className="font-mono text-emerald-600 dark:text-emerald-400">saas_portal</code> groups all portal tables in a dedicated folder.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Existing Tenant ID Mapping</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Every tenant record includes an optional <code className="font-mono text-emerald-600 dark:text-emerald-400">external_restaurant_id</code> field so you can directly link each tenant to your existing system's restaurant primary key.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Non-Destructive Operations</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        All schema queries use <code className="font-mono">IF NOT EXISTS</code>, avoiding destructive drops, alterations, or accidental schema wipes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Frequently Asked Questions</span>
                  </h4>
                  <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-100">Q: Will this overwrite my existing users or restaurant rows?</strong>
                      <p className="text-slate-500 dark:text-slate-400">No. Because you set a table prefix or schema, queries point strictly to those names. Your existing application continues running uninterrupted.</p>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-100">Q: Can I manage existing restaurants from this portal?</strong>
                      <p className="text-slate-500 dark:text-slate-400">Yes! When onboarding or editing a tenant, fill in the &quot;Existing Restaurant ID&quot; to link your existing backend entities.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-rose-600 dark:text-rose-400 hover:underline font-medium text-xs"
            >
              Reset to Demo Mode
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isTesting || !url || !anonKey}
                onClick={handleTest}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Database Settings</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
