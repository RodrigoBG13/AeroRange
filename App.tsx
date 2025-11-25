import React, { useState, useEffect, useMemo } from 'react';
import FlightMap from './components/FlightMap';
import ControlPanel from './components/ControlPanel';
import { 
  FlightMode, 
  BasicFlightData, 
  AdvancedFlightData, 
  CalculationResult, 
  Coordinates, 
  UnitSystem 
} from './types';
import { 
  DEFAULT_CENTER, 
  DEFAULT_BASIC_DATA, 
  DEFAULT_ADVANCED_DATA 
} from './constants';
import { calculateBasicRange, calculateAdvancedRange } from './utils/flightCalculations';

const App: React.FC = () => {
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [mode, setMode] = useState<FlightMode>(FlightMode.BASIC);
  
  const [basicData, setBasicData] = useState<BasicFlightData>(DEFAULT_BASIC_DATA);
  const [advancedData, setAdvancedData] = useState<AdvancedFlightData>(DEFAULT_ADVANCED_DATA);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Try to get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
        }
      );
    }
  }, []);

  const result: CalculationResult = useMemo(() => {
    if (mode === FlightMode.BASIC) {
      return calculateBasicRange(basicData);
    } else {
      return calculateAdvancedRange(advancedData);
    }
  }, [mode, basicData, advancedData]);

  return (
    <div className="relative w-full h-full font-sans antialiased text-slate-200">
      
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <FlightMap 
          center={center} 
          onCenterChange={setCenter} 
          result={result} 
        />
      </div>

      {/* Floating Glass Panel */}
      <div className={`absolute top-0 bottom-0 left-0 z-10 w-full md:w-[400px] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} pointer-events-none`}>
          <div className="h-full w-full pointer-events-auto">
             <div className="h-full w-full md:m-4 md:h-[calc(100%-2rem)] md:rounded-2xl bg-slate-900/80 backdrop-blur-xl border-r md:border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                <ControlPanel
                    mode={mode}
                    setMode={setMode}
                    basicData={basicData}
                    setBasicData={setBasicData}
                    advancedData={advancedData}
                    setAdvancedData={setAdvancedData}
                    result={result}
                    onLocationUpdate={setCenter}
                />
             </div>
          </div>
      </div>

      {/* Toggle Button (Mobile/Desktop) */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`absolute z-20 top-4 left-4 md:left-[420px] p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white shadow-lg transition-all duration-300 ${!sidebarOpen ? 'translate-x-[-420px] md:translate-x-[-420px]' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`}>
            <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {/* Mobile Overlay for closed sidebar click */}
      {sidebarOpen && (
          <div className="md:hidden absolute inset-0 z-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default App;
