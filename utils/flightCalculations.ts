import { BasicFlightData, AdvancedFlightData, CalculationResult, UnitSystem } from '../types';
import { NM_TO_METERS } from '../constants';

export const calculateBasicRange = (data: BasicFlightData): CalculationResult => {
  let effectiveEndurance = data.endurance;
  
  // Safe endurance subtracts 1 hour reserve
  let safeEndurance = Math.max(0, data.endurance - 1);

  if (data.isRoundTrip) {
    effectiveEndurance = effectiveEndurance / 2;
    safeEndurance = safeEndurance / 2;
  }

  const maxRangeNm = data.cruiseSpeed * effectiveEndurance;
  const safeRangeNm = data.cruiseSpeed * safeEndurance;

  return {
    safeRangeNm: Math.max(0, safeRangeNm),
    safeRangeMeters: Math.max(0, safeRangeNm * NM_TO_METERS),
    maxRangeNm: Math.max(0, maxRangeNm),
    maxRangeMeters: Math.max(0, maxRangeNm * NM_TO_METERS),
    enduranceHours: data.endurance,
    cruiseTimeMinutes: data.endurance * 60,
    isLimited: false,
    reserveFuel: 0, // Not calculated in Basic
  };
};

export const calculateAdvancedRange = (data: AdvancedFlightData): CalculationResult => {
  // --- Common Variables ---
  const climbFuel = (data.climbTime / 60) * data.climbBurn;
  const descentFuel = (data.descentTime / 60) * data.descentBurn;
  const climbDist = data.climbSpeed * (data.climbTime / 60);
  const descentDist = data.descentSpeed * (data.descentTime / 60);

  // Helper to calculate range for a specific amount of available fuel
  const calculateRangeForFuel = (availableFuel: number) => {
    // 1. Check if fuel covers climb/descent
    const cruiseFuelAvailable = availableFuel - climbFuel - descentFuel;

    if (cruiseFuelAvailable < 0) {
       return { dist: 0, isLimited: true };
    }

    // 2. Cruise Time
    const cruiseTimeHours = cruiseFuelAvailable / data.cruiseBurn;
    const cruiseDist = data.cruiseSpeed * cruiseTimeHours;

    let totalDist = climbDist + descentDist + cruiseDist;

    // 3. Round Trip Logic
    if (data.isRoundTrip) {
      totalDist = totalDist / 2;
    }

    return { dist: totalDist, isLimited: false, cruiseTime: cruiseTimeHours };
  };

  // --- 1. Calculate Max Range (Burn everything) ---
  const maxResult = calculateRangeForFuel(data.totalFuel);

  // --- 2. Calculate Safe Range (Reserve 1 Hour @ Cruise Burn) ---
  const reserveFuel = 1 * data.cruiseBurn;
  const safeResult = calculateRangeForFuel(data.totalFuel - reserveFuel);

  return {
    safeRangeNm: safeResult.dist,
    safeRangeMeters: safeResult.dist * NM_TO_METERS,
    
    maxRangeNm: maxResult.dist,
    maxRangeMeters: maxResult.dist * NM_TO_METERS,

    enduranceHours: (data.climbTime/60) + (data.descentTime/60) + maxResult.cruiseTime,
    cruiseTimeMinutes: maxResult.cruiseTime * 60,
    isLimited: maxResult.isLimited,
    reserveFuel,
    message: safeResult.isLimited && !maxResult.isLimited 
      ? "Fuel sufficient for flight but cuts into reserve." 
      : maxResult.isLimited ? "Insufficient fuel for Climb/Descent." : undefined
  };
};