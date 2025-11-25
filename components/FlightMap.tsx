import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Coordinates, CalculationResult } from '../types';
import { MAP_TILE_URL, MAP_ATTRIBUTION } from '../constants';

// Fix for default Leaflet marker icons in React
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface FlightMapProps {
  center: Coordinates;
  onCenterChange: (coords: Coordinates) => void;
  result: CalculationResult;
}

const MapUpdater: React.FC<{ center: Coordinates }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
};

const LocationSelector: React.FC<{ onLocationSelected: (coords: Coordinates) => void }> = ({ onLocationSelected }) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng);
    },
  });
  return null;
};

const Legend: React.FC = () => {
  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar bg-slate-900/90 backdrop-blur border border-white/10 p-3 text-white rounded-lg shadow-xl m-4 text-xs">
        <h4 className="font-bold mb-2 uppercase tracking-wider text-slate-400">Range Legend</h4>
        <div className="flex items-center mb-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500/20 mr-2"></span>
          <span>Safe Range (with Reserve)</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-dashed mr-2"></span>
          <span>Max Range (Dry Tanks)</span>
        </div>
      </div>
    </div>
  );
};

const FlightMap: React.FC<FlightMapProps> = ({ center, onCenterChange, result }) => {
  const mapRef = useRef<L.Map>(null);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={8}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      ref={mapRef}
    >
      <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
      
      <MapUpdater center={center} />
      <LocationSelector onLocationSelected={onCenterChange} />
      
      {/* Legend Control */}
      <Legend />

      {/* Origin Marker */}
      <Marker position={[center.lat, center.lng]}>
        <Tooltip permanent direction="top" className="font-bold">
          Origin
        </Tooltip>
      </Marker>

      {/* Max Range Circle (Dry Tanks) - Warning Color */}
      {result.maxRangeMeters > 0 && (
        <Circle
          center={[center.lat, center.lng]}
          radius={result.maxRangeMeters}
          pathOptions={{
            color: '#f59e0b', // Amber 500
            fillOpacity: 0,
            weight: 2,
            dashArray: '8, 8'
          }}
        >
          <Tooltip direction="right" sticky>
            <div className="text-center">
              <span className="font-bold text-amber-500">{Math.round(result.maxRangeNm)} NM</span>
              <br/>
              <span className="text-xs text-amber-300">Max (Dry)</span>
            </div>
          </Tooltip>
        </Circle>
      )}

      {/* Safe Range Circle (With Reserve) - Green/Safe Color */}
      {result.safeRangeMeters > 0 && (
        <Circle
          center={[center.lat, center.lng]}
          radius={result.safeRangeMeters}
          pathOptions={{
            color: '#10b981', // Emerald 500
            fillColor: '#10b981',
            fillOpacity: 0.1,
            weight: 2,
          }}
        >
          <Tooltip direction="top" sticky>
             <div className="text-center">
              <span className="font-bold text-lg text-emerald-400">{Math.round(result.safeRangeNm)} NM</span>
              <br/>
              <span className="text-xs text-emerald-200">Safe Range</span>
            </div>
          </Tooltip>
        </Circle>
      )}
    </MapContainer>
  );
};

export default FlightMap;