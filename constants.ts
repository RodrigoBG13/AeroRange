export const MAP_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const DEFAULT_CENTER = {
  lat: 34.0522, // Los Angeles
  lng: -118.2437,
};

export const NM_TO_METERS = 1852;

export const DEFAULT_BASIC_DATA = {
  cruiseSpeed: 120,
  endurance: 4,
  isRoundTrip: false,
};

export const DEFAULT_ADVANCED_DATA = {
  unitSystem: 'IMPERIAL', // Gal
  climbSpeed: 90,
  climbTime: 15,
  climbBurn: 18, 
  cruiseSpeed: 135,
  cruiseBurn: 12,
  descentSpeed: 145,
  descentTime: 20,
  descentBurn: 10,
  totalFuel: 60, // Gallons
  isRoundTrip: false,
};
