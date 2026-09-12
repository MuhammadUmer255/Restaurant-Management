// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  Compass,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  Info,
  Navigation,
  Key,
} from 'lucide-react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import {
  PAKISTAN_CITIES,
  DEFAULT_PAKISTAN_CENTER,
  DEMO_MAP_ID,
  GMP_ATTRIBUTION_ID,
  getGoogleMapsApiKey,
  getGoogleMapsExternalUrl,
} from '../../lib/maps';
import { GeoCoordinates, TenantLocation } from '../../types';

interface LocationPickerMapProps {
  initialLocation?: Partial<TenantLocation>;
  onSaveLocation: (location: TenantLocation) => void;
  onClose?: () => void;
  onOpenKeyConfig?: () => void;
  restaurantName?: string;
  isModal?: boolean;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLocation,
  onSaveLocation,
  onClose,
  onOpenKeyConfig,
  restaurantName = 'Restaurant Branch',
  isModal = false,
}) => {
  const [apiKey, setApiKey] = useState(() => getGoogleMapsApiKey());
  const [selectedCoords, setSelectedCoords] = useState<GeoCoordinates>(() => ({
    lat: initialLocation?.coordinates?.lat || DEFAULT_PAKISTAN_CENTER.lat,
    lng: initialLocation?.coordinates?.lng || DEFAULT_PAKISTAN_CENTER.lng,
  }));

  const [mapCenter, setMapCenter] = useState<GeoCoordinates>(() => ({
    lat: initialLocation?.coordinates?.lat || DEFAULT_PAKISTAN_CENTER.lat,
    lng: initialLocation?.coordinates?.lng || DEFAULT_PAKISTAN_CENTER.lng,
  }));

  const [zoom, setZoom] = useState<number>(() =>
    initialLocation?.coordinates?.lat ? 15 : 13
  );

  const [address, setAddress] = useState(initialLocation?.address || '');
  const [city, setCity] = useState(initialLocation?.city || 'Lahore');
  const [province, setProvince] = useState(initialLocation?.province || 'Punjab');
  const [landmark, setLandmark] = useState(initialLocation?.landmark || '');
  const [postalCode, setPostalCode] = useState(initialLocation?.postalCode || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Keep API key state synchronized
  useEffect(() => {
    setApiKey(getGoogleMapsApiKey());
  }, []);

  // Quick jump to popular Pakistani cities
  const handleSelectCityPreset = (cityName: string) => {
    const preset = PAKISTAN_CITIES.find((c) => c.name === cityName);
    if (preset) {
      setCity(preset.name === 'Nationwide (Pakistan)' ? 'Islamabad' : preset.name);
      if (preset.name !== 'Nationwide (Pakistan)') {
        setProvince(preset.province);
      }
      setMapCenter(preset.coordinates);
      setSelectedCoords(preset.coordinates);
      setZoom(preset.zoom);
    }
  };

  // Map click handler to place exact pin
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (e.detail.latLng) {
      const newCoords: GeoCoordinates = {
        lat: Number(e.detail.latLng.lat.toFixed(6)),
        lng: Number(e.detail.latLng.lng.toFixed(6)),
      };
      setSelectedCoords(newCoords);
    }
  }, []);

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newCoords: GeoCoordinates = {
        lat: Number(e.latLng.lat().toFixed(6)),
        lng: Number(e.latLng.lng().toFixed(6)),
      };
      setSelectedCoords(newCoords);
    }
  }, []);

  const handleApply = () => {
    const finalLocation: TenantLocation = {
      address: address.trim() || `${city}, Pakistan`,
      city: city.trim() || 'Lahore',
      province: province.trim() || 'Punjab',
      country: 'Pakistan',
      postalCode: postalCode.trim() || undefined,
      landmark: landmark.trim() || undefined,
      coordinates: selectedCoords,
      googleMapsUrl: getGoogleMapsExternalUrl(selectedCoords, restaurantName),
    };
    onSaveLocation(finalLocation);
  };

  const containerContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 text-xs">
      {/* City Quick Selector & Controls Bar */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pakistan Location Selector:</span>
          </div>
          <select
            value={city}
            onChange={(e) => handleSelectCityPreset(e.target.value)}
            className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
          >
            {PAKISTAN_CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.province})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Coordinates indicator */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-200/60 dark:bg-zinc-800 rounded font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            <Crosshair className="w-3 h-3 text-emerald-600" />
            <span>{selectedCoords.lat.toFixed(4)}° N, {selectedCoords.lng.toFixed(4)}° E</span>
          </div>

          {onOpenKeyConfig && (
            <button
              type="button"
              onClick={onOpenKeyConfig}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                apiKey
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20'
                  : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20'
              }`}
            >
              <Key className="w-3 h-3" />
              <span>{apiKey ? 'Maps Key Active' : 'Configure Maps Key'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map + Form Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left / Bottom Form Inputs */}
        <div className="lg:col-span-4 p-4 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto space-y-3 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
              Restaurant Geocoding Data
            </span>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {restaurantName}
            </h3>
            <p className="text-[11px] text-zinc-500">
              Click anywhere on the map or drag the pin to set exact coordinates in Pakistan.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-zinc-700 dark:text-zinc-300 font-medium text-xs">
              Street Address / Market Area
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. MM Alam Road, Gulberg III"
              className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium text-xs">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lahore"
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium text-xs">
                Province / Territory
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="e.g. Punjab"
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium text-xs">
                Landmark / Sector
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Food Street"
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium text-xs">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 54000"
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Exact Lat/Lng inputs */}
          <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-800 dark:text-zinc-200 text-[11px] flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-emerald-600" />
                <span>Exact GPS Coordinates</span>
              </span>
              <span className="text-[10px] text-zinc-400">WGS84 Format</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">Latitude (N)</span>
                <input
                  type="number"
                  step="0.000001"
                  value={selectedCoords.lat}
                  onChange={(e) =>
                    setSelectedCoords((prev) => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-[11px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">Longitude (E)</span>
                <input
                  type="number"
                  step="0.000001"
                  value={selectedCoords.lng}
                  onChange={(e) =>
                    setSelectedCoords((prev) => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-[11px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-end gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>

        {/* Right Map Canvas */}
        <div className="lg:col-span-8 relative min-h-[320px] lg:min-h-full h-full bg-zinc-100 dark:bg-zinc-950 flex flex-col">
          {apiKey ? (
            <APIProvider apiKey={apiKey} region="PK" language="en">
              <div className="w-full h-full relative" style={{ minHeight: '340px', height: '100%' }}>
                <Map
                  mapId={DEMO_MAP_ID}
                  center={mapCenter}
                  zoom={zoom}
                  onCenterChanged={(e) => setMapCenter(e.detail.center)}
                  onZoomChanged={(e) => setZoom(e.detail.zoom)}
                  onClick={handleMapClick}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
                  style={{ width: '100%', height: '100%' }}
                >
                  <AdvancedMarker
                    position={selectedCoords}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    title={`${restaurantName} (Exact Location)`}
                  >
                    <Pin
                      background="#059669"
                      glyphColor="#ffffff"
                      borderColor="#065f46"
                    />
                  </AdvancedMarker>
                </Map>

                {/* Overlay Instruction Badge */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none bg-zinc-900/85 text-white backdrop-blur-xs px-2.5 py-1.5 rounded-md text-[11px] shadow-md flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Click anywhere on the map or drag the green pin to set location</span>
                </div>
              </div>
            </APIProvider>
          ) : (
            /* Fallback Interactive Pakistan Map View when API Key is pending */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Compass className="w-7 h-7" />
              </div>

              <div className="max-w-md space-y-1.5">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Interactive Pakistan Google Maps
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Enter your free zero-cost <strong>Google Maps Demo Key</strong> or Cloud API Key to render real-time vector satellite and roadmap tiles for Pakistan.
                </p>
              </div>

              {/* Current Selection Summary */}
              <div className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-left text-xs max-w-sm w-full space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Selected City:
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {city}, {province}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Coordinates:</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {selectedCoords.lat}° N, {selectedCoords.lng}° E
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Address:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                    {address || 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {onOpenKeyConfig && (
                  <button
                    type="button"
                    onClick={onOpenKeyConfig}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium text-xs shadow-xs transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Enter Google Maps Key</span>
                  </button>
                )}
                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs transition-colors"
                >
                  <span>Get Free Demo Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-2xs p-3 sm:p-6">
        <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Pinpoint Restaurant Exact Location (Pakistan)
              </h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0">{containerContent}</div>
        </div>
      </div>
    );
  }

  return containerContent;
};
