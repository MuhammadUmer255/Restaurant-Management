// Source: Google Maps Platform Code Assist
import React, { useState } from 'react';
import {
  X,
  MapPin,
  Key,
  ExternalLink,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Copy,
  Trash2,
} from 'lucide-react';
import { getGoogleMapsApiKey, saveGoogleMapsApiKey, clearGoogleMapsApiKey } from '../../lib/maps';
import { useToast } from '../common/Toast';

interface GoogleMapsKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (newKey: string) => void;
}

export const GoogleMapsKeyModal: React.FC<GoogleMapsKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const { showToast } = useToast();
  const [apiKeyInput, setApiKeyInput] = useState(() => getGoogleMapsApiKey());
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const currentKey = getGoogleMapsApiKey();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    saveGoogleMapsApiKey(cleanKey);
    onKeySaved(cleanKey);
    showToast(
      cleanKey ? 'Google Maps Key Saved' : 'Google Maps Key Cleared',
      cleanKey
        ? 'Your Google Maps Platform key is active for Pakistan maps and geocoding.'
        : 'Reverted to local coordinates view.',
      cleanKey ? 'success' : 'info'
    );
    onClose();
  };

  const handleClear = () => {
    clearGoogleMapsApiKey();
    setApiKeyInput('');
    onKeySaved('');
    showToast('Key Removed', 'Google Maps key cleared from browser storage.', 'info');
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(`VITE_GOOGLE_MAPS_API_KEY="${apiKeyInput.trim()}"`);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-2xs p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Google Maps Platform Configuration
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Powers Pakistan restaurant coordinates, dynamic maps & exact location picker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Prototyping Demo Key Callout */}
          <div className="p-3 rounded-md bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium text-emerald-800 dark:text-emerald-300 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Cost Maps Demo Key Available</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono">
                No Cloud Billing Card Required
              </span>
            </div>
            <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
              Google Maps Platform provides a public Maps Demo Key for prototyping. You can sign in with any Google account to generate a key in seconds:
            </p>
            <div className="pt-1 flex items-center gap-2">
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs shadow-xs transition-colors"
              >
                <span>Get Free Maps Demo Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-zinc-400">or use your Google Cloud Console key</span>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-zinc-700 dark:text-zinc-300 font-medium text-xs">
              Google Maps API Key / Demo Key
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (Paste Google Maps API key or Demo Key here)"
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Saved securely to your browser workspace. Enables real-time Google Maps vector tiles across Pakistan.
            </p>
          </div>

          {/* Production Note */}
          <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
            <div className="flex items-center gap-1 font-medium text-zinc-800 dark:text-zinc-200">
              <HelpCircle className="w-3 h-3 text-zinc-500" />
              <span>Production Setup Instructions</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              When launching in production, enable the <strong>Maps JavaScript API</strong> and <strong>Places API</strong> in your Google Cloud Project and restrict the key by HTTP referrer to prevent unauthorized usage.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div>
              {currentKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded font-medium transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Key</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded font-medium transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Activate Map</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
