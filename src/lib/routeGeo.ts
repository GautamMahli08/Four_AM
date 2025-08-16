export type LatLng = { lat: number; lng: number };

const PLACES: Record<string, LatLng> = {
  // Muscat area
  "Seeb Industrial Area": { lat: 23.6690, lng: 58.1890 },
  "Muttrah Port": { lat: 23.6160, lng: 58.5660 },
  "Ruwi Depot": { lat: 23.5950, lng: 58.5570 },
  "Qurum Fuel Station": { lat: 23.5940, lng: 58.4200 },
  "Seeb Logistics Park": { lat: 23.6760, lng: 58.1940 },
  "Muscat Intl Airport Cargo": { lat: 23.5933, lng: 58.2844 },

  // Outside Muscat (demo)
  "Barka Hub": { lat: 23.7080, lng: 57.8890 },
  "Sohar Refinery": { lat: 24.4840, lng: 56.6110 },
  "Quriyat Terminal": { lat: 23.2620, lng: 58.9440 },
  "Sur Distribution Hub": { lat: 22.5700, lng: 59.5280 },
};

export function placeLatLng(name?: string): LatLng | null {
  if (!name) return null;
  return PLACES[name] ?? null;
}
