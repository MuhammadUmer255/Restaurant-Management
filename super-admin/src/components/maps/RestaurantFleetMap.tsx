// Source: Google Maps Platform Code Assist
import React, { useState, useMemo, useCallback } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Crosshair,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Sliders,
  ExternalLink,
  PlusCircle,
  Key,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  PAKISTAN_CITIES,
  DEFAULT_PAKISTAN_CENTER,
  DEMO_MAP_ID,
  GMP_ATTRIBUTION_ID,
  getGoogleMapsApiKey,
  getGoogleMapsExternalUrl,
} from '../../lib/maps';
import { Tenant, GeoCoordinates, TenantLocation } from '../../types';
import { StatusBadge, PlanBadge } from '../common/Badge';

interface RestaurantFleetMapProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onImpersonate: (tenant: Tenant) => void;
  onOpenOnboarding: () => void;
  onEditLocation: (tenant: Tenant) => void;
  onOpenKeyConfig: () => void;
}

export const RestaurantFleetMap: React.FC<RestaurantFleetMapProps> = ({
  tenants,
  onSelectTenant,
  onImpersonate,
  onOpenOnboarding,
  onEditLocation,
  onOpenKeyConfig,
}) => {
  const [apiKey, setApiKey] = useState(() => getGoogleMapsApiKey());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);

  // Map viewport state
  const [mapCenter, setMapCenter] = useState<GeoCoordinates>({
    lat: 30.3753,
    lng: 69.3451, // Pakistan geographic center
  });
  const [zoom, setZoom] = useState<number>(6);

  // Filter tenants
  const mappedTenants = useMemo(() => {
    return tenants.filter((t) => {
      const hasLocation = Boolean(t.location?.coordinates?.lat && t.location?.coordinates?.lng);
      if (!hasLocation) return false;

      const matchesSearch =
        t.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === 'ALL' || (t.location?.city || '').toLowerCase() === selectedCity.toLowerCase();
      const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;

      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [tenants, searchQuery, selectedCity, selectedStatus]);

  // Handle city button quick filter
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    if (city === 'ALL') {
      setMapCenter({ lat: 30.3753, lng: 69.3451 });
      setZoom(6);
    } else {
      const cityPreset = PAKISTAN_CITIES.find((c) => c.name.toLowerCase() === city.toLowerCase());
      if (cityPreset) {
        setMapCenter(cityPreset.coordinates);
        setZoom(12);
      }
    }
  };

  // Focus single tenant on map
  const handleFocusTenant = (tenant: Tenant) => {
    setActiveTenant(tenant);
    if (tenant.location?.coordinates) {
      setMapCenter(tenant.location.coordinates);
      setZoom(15);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-115px)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden text-xs">
      {/* Top Controls Bar */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Pakistan Restaurant Fleet Map
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium font-mono">
                {mappedTenants.length} of {tenants.length} Geocoded
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Interactive Google Maps geolocations across Pakistani provinces & metropolitan hubs
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenKeyConfig}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium text-xs transition-colors ${
              apiKey
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey ? 'Maps Key Active' : 'Setup Maps Key (Free)'}</span>
          </button>

          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md font-medium text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Restaurant in Pakistan</span>
          </button>
        </div>
      </div>

      {/* City Filters & Search Bar */}
      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1 shrink-0">
            Pakistan Hubs:
          </span>
          {['ALL', 'Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Peshawar', 'Faisalabad'].map((cityName) => (
            <button
              key={cityName}
              onClick={() => handleCitySelect(cityName)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCity.toLowerCase() === cityName.toLowerCase()
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cityName === 'ALL' ? 'All Pakistan' : cityName}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurant or address..."
              className="w-48 sm:w-64 pl-8 pr-3 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Sidebar (List) + Right (Google Map) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden relative">
        {/* Left Side: Restaurant List */}
        <div className="lg:col-span-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden">
          <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900 text-[11px] text-zinc-500">
            <span>Showing {mappedTenants.length} restaurants</span>
            <span>Click any card to pan map</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800">
            {mappedTenants.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 space-y-2">
                <Building2 className="w-8 h-8 mx-auto stroke-1 text-zinc-400" />
                <p>No restaurants found matching filter criteria.</p>
              </div>
            ) : (
              mappedTenants.map((t) => {
                const isSelected = activeTenant?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleFocusTenant(t)}
                    className={`p-3 transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-l-2 border-emerald-600'
                        : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-xs">
                            {t.tradeName}
                          </span>
                          <StatusBadge status={t.status} size="sm" />
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {t.id} • {t.planTier}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-zinc-800 dark:text-zinc-200 shrink-0">
                        {t.currency === 'PKR' ? '₨' : '$'}{t.mrr.toLocaleString()}
                      </span>
                    </div>

                    {t.location && (
                      <div className="mt-2 space-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.location.city}, {t.location.province || 'Pakistan'}</span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 truncate pl-4 text-[10px]">
                          {t.location.address}
                        </p>
                        <p className="font-mono text-[9px] text-zinc-400 pl-4">
                          GPS: {t.location.coordinates.lat.toFixed(4)}° N, {t.location.coordinates.lng.toFixed(4)}° E
                        </p>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTenant(t);
                        }}
                        className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        View Full Details →
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditLocation(t);
                        }}
                        className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Edit Pin
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Full Google Map */}
        <div className="lg:col-span-8 relative h-full min-h-[400px] bg-zinc-100 dark:bg-zinc-950">
          {apiKey ? (
            <APIProvider apiKey={apiKey} region="PK" language="en">
              <div className="w-full h-full relative" style={{ height: '100%' }}>
                <Map
                  mapId={DEMO_MAP_ID}
                  center={mapCenter}
                  zoom={zoom}
                  onCenterChanged={(e) => setMapCenter(e.detail.center)}
                  onZoomChanged={(e) => setZoom(e.detail.zoom)}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
                  style={{ width: '100%', height: '100%' }}
                >
                  {mappedTenants.map((t) => {
                    if (!t.location?.coordinates) return null;
                    const isActive = activeTenant?.id === t.id;
                    const pinColor =
                      t.status === 'Active'
                        ? '#059669' // Emerald
                        : t.status === 'Trial'
                        ? '#d97706' // Amber
                        : '#e11d48'; // Rose

                    return (
                      <AdvancedMarker
                        key={t.id}
                        position={t.location.coordinates}
                        title={`${t.tradeName} - ${t.location.city}`}
                        onClick={() => setActiveTenant(t)}
                      >
                        <Pin
                          background={pinColor}
                          glyphColor="#ffffff"
                          borderColor="#0f172a"
                          scale={isActive ? 1.25 : 1.0}
                        />
                      </AdvancedMarker>
                    );
                  })}

                  {/* InfoWindow for active clicked pin */}
                  {activeTenant && activeTenant.location && (
                    <InfoWindow
                      position={activeTenant.location.coordinates}
                      onCloseClick={() => setActiveTenant(null)}
                    >
                      <div className="p-1 max-w-xs text-zinc-900 text-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-1.5 mb-1.5">
                          <h4 className="font-semibold text-xs text-zinc-900 truncate">
                            {activeTenant.tradeName}
                          </h4>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                              activeTenant.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {activeTenant.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] text-zinc-600 mb-2">
                          <p className="font-medium text-emerald-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{activeTenant.location.city}, {activeTenant.location.province}</span>
                          </p>
                          <p className="text-zinc-600 text-[10px] leading-tight">
                            {activeTenant.location.address}
                          </p>
                          <p className="font-mono text-[9px] text-zinc-500">
                            Coordinates: {activeTenant.location.coordinates.lat.toFixed(5)}° N, {activeTenant.location.coordinates.lng.toFixed(5)}° E
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            POS Terminals: {activeTenant.limits.posTerminals.current} / {activeTenant.limits.posTerminals.max}
                          </p>
                        </div>

                        <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectTenant(activeTenant)}
                            className="px-2 py-1 bg-zinc-900 text-white rounded text-[10px] font-medium hover:bg-zinc-800"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => onImpersonate(activeTenant)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-medium hover:bg-emerald-500"
                          >
                            Impersonate
                          </button>
                          <a
                            href={getGoogleMapsExternalUrl(activeTenant.location.coordinates, activeTenant.tradeName)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="p-1 text-zinc-600 hover:text-zinc-900"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>

                {/* Floating Quick Action Overlay */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMapCenter({ lat: 30.3753, lng: 69.3451 });
                      setZoom(6);
                    }}
                    className="p-2 rounded-md bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-200 shadow-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Fit Pakistan Nationwide View"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Pakistan View</span>
                  </button>
                </div>
              </div>
            </APIProvider>
          ) : (
            /* Key not set state */
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-xs">
                <MapPin className="w-8 h-8" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Google Maps Platform Integration
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  To render live interactive satellite and roadmap tiles for all {mappedTenants.length} restaurants in Pakistan, provide your Google Maps API key or instant zero-cost Maps Demo Key.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onOpenKeyConfig}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium text-xs shadow-xs transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>Configure Google Maps Key</span>
                </button>
                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs transition-colors"
                >
                  <span>Free Demo Key Quickstart</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
