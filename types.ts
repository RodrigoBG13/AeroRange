export interface Coordinates {
  lat: number;
  lng: number;
}

export enum FlightMode {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
}

export enum UnitSystem {
  METRIC = 'METRIC', // Liters
  IMPERIAL = 'IMPERIAL', // Gallons
}

export interface BasicFlightData {
  cruiseSpeed: number; // Knots
  endurance: number; // Hours
  isRoundTrip: boolean;
}

export interface AdvancedFlightData {
  // Units
  unitSystem: UnitSystem;
  
  // Phases
  climbSpeed: number; // Knots
  climbTime: number; // Minutes
  climbBurn: number; // Unit/hr

  cruiseSpeed: number; // Knots
  cruiseBurn: number; // Unit/hr

  descentSpeed: number; // Knots
  descentTime: number; // Minutes
  descentBurn: number; // Unit/hr

  // Fuel
  totalFuel: number; // Units
  isRoundTrip: boolean;
}

export interface CalculationResult {
  // Safe Range (With Reserve)
  safeRangeNm: number;
  safeRangeMeters: number;
  
  // Max Range (Zero Fuel)
  maxRangeNm: number;
  maxRangeMeters: number;

  enduranceHours: number;
  cruiseTimeMinutes: number;
  isLimited: boolean; // True if fuel doesn't cover climb/descent
  reserveFuel: number;
  message?: string;
}

export interface IcaoResponse {
  lat: number;
  lng: number;
  name: string;
  city: string;
}