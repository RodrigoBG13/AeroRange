import React, { useState, useCallback } from 'react';
import { Plane, Search, AlertTriangle, Fuel, Clock, Gauge, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FlightMode, BasicFlightData, AdvancedFlightData, CalculationResult, UnitSystem, Coordinates } from '../types';
import { getAirportCoordinates } from '../services/airportService';

interface InputRowProps {
  label: string;
  icon: any;
  children: React.ReactNode;
}

const InputRow: React.FC<InputRowProps> = ({ label, icon: Icon, children }) => (
  <div className="mb-4">
    <label className="flex items-center text-xs font-semibold text-slate-300 mb-1.5">
      <Icon size={14} className="mr-1.5 text-blue-400" />
      {label}
    </label>
    {children}
  </div>
);

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  unit?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, unit }) => (
  <div className="relative">
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
    />
    {unit && <span className="absolute right-3 top-2 text-xs text-slate-400">{unit}</span>}
  </div>
);

interface ControlPanelProps {
  mode: FlightMode;
  setMode: (mode: FlightMode) => void;
  basicData: BasicFlightData;
  setBasicData: React.Dispatch<React.SetStateAction<BasicFlightData>>;
  advancedData: AdvancedFlightData;
  setAdvancedData: React.Dispatch<React.SetStateAction<AdvancedFlightData>>;
  result: CalculationResult;
  onLocationUpdate: (coords: Coordinates) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  setMode,
  basicData,
  setBasicData,
  advancedData,
  setAdvancedData,
  result,
  onLocationUpdate,
}) => {
  const [icaoCode, setIcaoCode] = useState('');
  const [loadingIcao, setLoadingIcao] = useState(false);
  const [icaoError, setIcaoError] = useState('');

  const handleIcaoSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icaoCode.trim()) return;

    setLoadingIcao(true);
    setIcaoError('');
    
    try {
      const data = await getAirportCoordinates(icaoCode);
      if (data) {
        onLocationUpdate({ lat: data.lat, lng: data.lng });
      } else {
        setIcaoError('Airport not found.');
      }
    } catch (err) {
      setIcaoError('Search failed.');
    } finally {
      setLoadingIcao(false);
    }
  }, [icaoCode, onLocationUpdate]);

  const updateBasic = (field: keyof BasicFlightData, value: number | boolean) => {
    setBasicData(prev => ({ ...prev, [field]: value }));
  };

  const updateAdvanced = (field: keyof AdvancedFlightData, value: any) => {
    setAdvancedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Plane className="text-white" size={20} />
             </div>
             <h1 className="text-xl font-bold text-white tracking-tight">AeroRange</h1>
          </div>
          <div className="flex bg-slate-800/80 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setMode(FlightMode.BASIC)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === FlightMode.BASIC ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Basic
            </button>
            <button
              onClick={() => setMode(FlightMode.ADVANCED)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === FlightMode.ADVANCED ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Adv
            </button>
          </div>
        </div>

        {/* ICAO Search */}
        <form onSubmit={handleIcaoSearch} className="relative">
          <input
            type="text"
            placeholder="ICAO (e.g., SBBP) or City"
            value={icaoCode}
            onChange={(e) => setIcaoCode(e.target.value.toUpperCase())}
            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="absolute left-3 top-3 text-slate-500" size={16} />
          <button 
             type="submit" 
             disabled={loadingIcao}
             className="absolute right-1.5 top-1.5 bg-slate-700 hover:bg-slate-600 text-xs px-2 py-1 rounded text-slate-200 transition-colors"
          >
             {loadingIcao ? '...' : 'Go'}
          </button>
        </form>
        {icaoError && <p className="text-red-400 text-xs mt-2 ml-1">{icaoError}</p>}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* BASIC MODE */}
        {mode === FlightMode.BASIC && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <InputRow label="Cruise Speed" icon={Gauge}>
              <NumberInput value={basicData.cruiseSpeed} onChange={(v) => updateBasic('cruiseSpeed', v)} unit="KT" />
            </InputRow>
            <InputRow label="Total Endurance" icon={Clock}>
              <NumberInput value={basicData.endurance} onChange={(v) => updateBasic('endurance', v)} unit="HRS" />
            </InputRow>
            <div className="flex items-center justify-between bg-slate-800/30 p-3 rounded-lg border border-white/5">
              <label className="text-sm text-slate-300">Round Trip</label>
              <input
                type="checkbox"
                checked={basicData.isRoundTrip}
                onChange={(e) => updateBasic('isRoundTrip', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
              />
            </div>
            <div className="text-xs text-slate-500 italic mt-2">
                * Calculates safe range with 1h reserve buffer.
            </div>
          </div>
        )}

        {/* ADVANCED MODE */}
        {mode === FlightMode.ADVANCED && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Unit Toggle */}
            <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateAdvanced('unitSystem', UnitSystem.IMPERIAL)}
                  className={`py-1.5 text-xs rounded border transition-colors ${advancedData.unitSystem === UnitSystem.IMPERIAL ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-700 text-slate-500'}`}
                >
                  Gal / US
                </button>
                <button 
                  onClick={() => updateAdvanced('unitSystem', UnitSystem.METRIC)}
                   className={`py-1.5 text-xs rounded border transition-colors ${advancedData.unitSystem === UnitSystem.METRIC ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-700 text-slate-500'}`}
                >
                  Liters / SI
                </button>
            </div>

            {/* Fuel Status */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center">
                    <Fuel size={14} className="mr-2 text-green-400"/> Fuel Status
                </h3>
                <InputRow label="Total Usable Fuel" icon={Fuel}>
                    <NumberInput 
                        value={advancedData.totalFuel} 
                        onChange={(v) => updateAdvanced('totalFuel', v)} 
                        unit={advancedData.unitSystem === UnitSystem.IMPERIAL ? 'GAL' : 'L'} 
                    />
                </InputRow>
                <div className="text-xs text-slate-400 flex items-center mt-2">
                    <AlertTriangle size={12} className="mr-1 text-amber-500" />
                    Reserve: 1h @ Cruise ({advancedData.cruiseBurn} {advancedData.unitSystem === UnitSystem.IMPERIAL ? 'gal' : 'l'})
                </div>
            </div>

            {/* Climb Phase */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <ArrowUpRight size={14} className="mr-2"/> Climb
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <NumberInput value={advancedData.climbSpeed} onChange={(v) => updateAdvanced('climbSpeed', v)} unit="KT" />
                    <NumberInput value={advancedData.climbTime} onChange={(v) => updateAdvanced('climbTime', v)} unit="MIN" />
                    <div className="col-span-2">
                        <NumberInput value={advancedData.climbBurn} onChange={(v) => updateAdvanced('climbBurn', v)} unit={advancedData.unitSystem === UnitSystem.IMPERIAL ? 'GPH' : 'LPH'} />
                    </div>
                </div>
            </div>

            {/* Cruise Phase */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <Plane size={14} className="mr-2 rotate-90"/> Cruise
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <NumberInput value={advancedData.cruiseSpeed} onChange={(v) => updateAdvanced('cruiseSpeed', v)} unit="KT" />
                    <NumberInput value={advancedData.cruiseBurn} onChange={(v) => updateAdvanced('cruiseBurn', v)} unit={advancedData.unitSystem === UnitSystem.IMPERIAL ? 'GPH' : 'LPH'} />
                </div>
            </div>

             {/* Descent Phase */}
             <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <ArrowDownRight size={14} className="mr-2"/> Descent
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <NumberInput value={advancedData.descentSpeed} onChange={(v) => updateAdvanced('descentSpeed', v)} unit="KT" />
                    <NumberInput value={advancedData.descentTime} onChange={(v) => updateAdvanced('descentTime', v)} unit="MIN" />
                    <div className="col-span-2">
                        <NumberInput value={advancedData.descentBurn} onChange={(v) => updateAdvanced('descentBurn', v)} unit={advancedData.unitSystem === UnitSystem.IMPERIAL ? 'GPH' : 'LPH'} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between bg-slate-800/30 p-3 rounded-lg border border-white/5">
              <label className="text-sm text-slate-300">Round Trip</label>
              <input
                type="checkbox"
                checked={advancedData.isRoundTrip}
                onChange={(e) => updateAdvanced('isRoundTrip', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
              />
            </div>

          </div>
        )}
      </div>

      {/* Footer / Results */}
      <div className="p-5 border-t border-white/10 bg-gradient-to-t from-slate-900/90 to-slate-900/50">
        <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-400 text-xs uppercase font-bold tracking-wider">Safe Range (w/ Reserve)</span>
            {result.isLimited && <span className="text-red-400 text-xs flex items-center"><AlertTriangle size={12} className="mr-1"/> Limited</span>}
        </div>
        <div className="flex items-baseline text-white">
            <span className="text-4xl font-bold tracking-tighter text-emerald-400">{Math.round(result.safeRangeNm)}</span>
            <span className="ml-2 text-sm text-slate-400 font-medium">NM</span>
        </div>
        
        {/* Secondary Max Range */}
        <div className="mt-1 flex items-center justify-between">
           <span className="text-[10px] text-amber-500/80 uppercase tracking-wider">Dry Tank Range</span>
           <span className="text-xs font-mono text-amber-500/80">{Math.round(result.maxRangeNm)} NM</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
            <div>
                 <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Total Time</span>
                 <span className="text-lg font-mono text-slate-200">
                    {Math.floor(result.enduranceHours)}<span className="text-xs">h</span> {Math.round((result.enduranceHours % 1) * 60)}<span className="text-xs">m</span>
                 </span>
            </div>
             <div>
                 <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Reserve</span>
                 <span className="text-lg font-mono text-slate-200">
                    {result.reserveFuel} <span className="text-xs">{mode === FlightMode.ADVANCED ? (advancedData.unitSystem === UnitSystem.IMPERIAL ? 'GAL' : 'L') : '(1 HR)'}</span>
                 </span>
            </div>
        </div>
        {result.message && (
             <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-xs">
                {result.message}
             </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;