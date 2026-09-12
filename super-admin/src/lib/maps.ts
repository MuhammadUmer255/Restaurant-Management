// Source: Google Maps Platform Code Assist
import { GeoCoordinates, TenantLocation } from '../types';

export const STORAGE_MAPS_KEY = 'google_maps_api_key';

export interface PakistanCityPreset {
  name: string;
  province: string;
  coordinates: GeoCoordinates;
  zoom: number;
}

export const PAKISTAN_CITIES: PakistanCityPreset[] = [
  { name: 'Nationwide (Pakistan)', province: 'All Regions', coordinates: { lat: 30.3753, lng: 69.3451 }, zoom: 6 },
  { name: 'Islamabad', province: 'Islamabad Capital Territory', coordinates: { lat: 33.6844, lng: 73.0479 }, zoom: 13 },
  { name: 'Lahore', province: 'Punjab', coordinates: { lat: 31.5204, lng: 74.3587 }, zoom: 13 },
  { name: 'Karachi', province: 'Sindh', coordinates: { lat: 24.8607, lng: 67.0011 }, zoom: 13 },
  { name: 'Rawalpindi', province: 'Punjab', coordinates: { lat: 33.5984, lng: 73.0441 }, zoom: 13 },
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', coordinates: { lat: 34.0151, lng: 71.5249 }, zoom: 13 },
  { name: 'Faisalabad', province: 'Punjab', coordinates: { lat: 31.4504, lng: 73.1350 }, zoom: 13 },
  { name: 'Multan', province: 'Punjab', coordinates: { lat: 30.1575, lng: 71.5249 }, zoom: 13 },
  { name: 'Quetta', province: 'Balochistan', coordinates: { lat: 30.1798, lng: 66.9750 }, zoom: 13 },
  { name: 'Sialkot', province: 'Punjab', coordinates: { lat: 32.4945, lng: 74.5229 }, zoom: 13 },
  { name: 'Gujranwala', province: 'Punjab', coordinates: { lat: 32.1877, lng: 74.1945 }, zoom: 13 },
  { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', coordinates: { lat: 34.1688, lng: 73.2215 }, zoom: 13 },
];

export const DEFAULT_PAKISTAN_CENTER: GeoCoordinates = {
  lat: 31.5204,
  lng: 74.3587, // Lahore central / Punjab commercial hub
};

export const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';
export const DEMO_MAP_ID = 'DEMO_MAP_ID';

/**
 * Returns the currently active Google Maps API key from environment variable or localStorage.
 */
export function getGoogleMapsApiKey(): string {
  if (typeof window === 'undefined') return '';
  const localKey = localStorage.getItem(STORAGE_MAPS_KEY) || '';
  if (localKey.trim()) return localKey.trim();

  const metaEnv = (import.meta as any).env || {};
  const envKey = (metaEnv.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  return envKey;
}

/**
 * Saves a custom Google Maps API key or Maps Demo Key to client storage.
 */
export function saveGoogleMapsApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim();
  if (!clean) {
    localStorage.removeItem(STORAGE_MAPS_KEY);
  } else {
    localStorage.setItem(STORAGE_MAPS_KEY, clean);
  }
}

/**
 * Clear the saved Google Maps API key
 */
export function clearGoogleMapsApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_MAPS_KEY);
}

/**
 * Generates an external Google Maps directions / search link
 */
export function getGoogleMapsExternalUrl(coords: GeoCoordinates, placeName?: string): string {
  const query = placeName
    ? encodeURIComponent(`${placeName}, ${coords.lat},${coords.lng}`)
    : `${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Seed locations for Pakistani restaurants
 */
export const SAMPLE_PAKISTAN_RESTAURANTS_LOCATIONS: Record<string, TenantLocation> = {
  'TEN-8841': {
    address: 'Pir Sohawa, Margalla Hills Road',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    country: 'Pakistan',
    postalCode: '44000',
    landmark: 'Margalla Ridge View Point',
    coordinates: { lat: 33.7483, lng: 73.0649 },
  },
  'TEN-4921': {
    address: 'Food Street, Fort Road, Opposite Badshahi Mosque',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    postalCode: '54000',
    landmark: 'Walled City Heritage Quarter',
    coordinates: { lat: 31.5882, lng: 74.3105 },
  },
  'TEN-7102': {
    address: 'Beach Avenue, Phase 8, Defence Housing Authority (DHA)',
    city: 'Karachi',
    province: 'Sindh',
    country: 'Pakistan',
    postalCode: '75500',
    landmark: 'Do Darya Coastal Promenade',
    coordinates: { lat: 24.7869, lng: 67.0427 },
  },
  'TEN-1033': {
    address: 'MM Alam Road, Block C-2, Gulberg III',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    postalCode: '54660',
    landmark: 'Main Boulevard Gulberg Intersection',
    coordinates: { lat: 31.5126, lng: 74.3524 },
  },
  'TEN-5510': {
    address: 'University Road, Tahkal Payan',
    city: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    country: 'Pakistan',
    postalCode: '25000',
    landmark: 'Near Board of Intermediate Education',
    coordinates: { lat: 33.9991, lng: 71.4939 },
  },
  'TEN-3392': {
    address: 'Plot 13-A, Jinnah Avenue, Blue Area',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    country: 'Pakistan',
    postalCode: '44000',
    landmark: 'Metro Bus Station 7th Avenue',
    coordinates: { lat: 33.7172, lng: 73.0611 },
  },
  'TEN-9921': {
    address: 'Street 4, Block 4, Clifton',
    city: 'Karachi',
    province: 'Sindh',
    country: 'Pakistan',
    postalCode: '75600',
    landmark: 'Near Bilawal House Roundabout',
    coordinates: { lat: 24.8291, lng: 67.0319 },
  },
  'TEN-6644': {
    address: '103-B, Commercial Area, D-Ground, Peoples Colony No. 1',
    city: 'Faisalabad',
    province: 'Punjab',
    country: 'Pakistan',
    postalCode: '38000',
    landmark: 'D-Ground Central Circle',
    coordinates: { lat: 31.4087, lng: 73.0948 },
  },
};
