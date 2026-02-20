<<<<<<< HEAD
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { INDIA_STATIONS, getAQICategory } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Search, Filter, MapPin, Wind, Droplets, Eye } from 'lucide-react';
import indiaBg from '@/assets/india-bg.jpg';

// Simplified India map — relative position percentages for each city
// Based on India's bounding box: lat 8-37°N, lng 68-97°E
function latLngToPercent(lat: number, lng: number) {
  const x = ((lng - 68) / (97 - 68)) * 100;
  const y = ((37 - lat) / (37 - 8)) * 100;
  return { x, y };
}

export default function MapView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'good' | 'moderate' | 'unhealthy' | 'hazardous'>('all');

  const filtered = INDIA_STATIONS.filter(s => {
=======
﻿import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { INDIA_STATIONS, getAQICategory } from '@/lib/mockData';
import { fetchLiveData } from '@/lib/api';
import { getPreferredCity, onPreferredCityChange, setPreferredCity } from '@/lib/preferredCity';
import { cn } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';

export default function MapView() {
  const indiaCenter: [number, number] = [22.9734, 78.6569];
  const [stations, setStations] = useState(INDIA_STATIONS);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'good' | 'moderate' | 'unhealthy' | 'hazardous'>('all');
  const [preferredCity, setPreferredCityState] = useState(getPreferredCity());

  useEffect(() => {
    const loadLiveStations = async () => {
      try {
        const data = await fetchLiveData();
        if (data?.stations?.length) {
          setStations(data.stations);
        }
      } catch {
        setStations(INDIA_STATIONS);
      }
    };

    loadLiveStations();
  }, []);

  useEffect(() => onPreferredCityChange(() => setPreferredCityState(getPreferredCity())), []);

  useEffect(() => {
    if (!stations.length) return;
    const preferredStation = stations.find((s) => s.city === preferredCity);
    if (preferredStation) {
      setSelected(preferredStation.id);
    }
  }, [preferredCity, stations]);

  const filtered = stations.filter((s) => {
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
    const matchSearch = s.city.toLowerCase().includes(search.toLowerCase()) ||
                        s.state.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'good') return s.aqi <= 100;
    if (filter === 'moderate') return s.aqi > 100 && s.aqi <= 150;
    if (filter === 'unhealthy') return s.aqi > 150 && s.aqi <= 300;
    if (filter === 'hazardous') return s.aqi > 300;
    return true;
  });

<<<<<<< HEAD
  const selectedStation = INDIA_STATIONS.find(s => s.id === selected);

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 57px)' }}>
      {/* Controls bar */}
=======
  const mapStations = filtered.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng) && s.lat !== 0 && s.lng !== 0);

  const toggleStationSelection = (stationId: string, city: string) => {
    const isSelected = selected === stationId;
    setSelected(isSelected ? null : stationId);
    if (!isSelected) {
      setPreferredCity(city);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 57px)' }}>
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border glass-card flex-shrink-0">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            placeholder="Search city or state..."
            value={search}
<<<<<<< HEAD
            onChange={e => setSearch(e.target.value)}
=======
            onChange={(e) => setSearch(e.target.value)}
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
<<<<<<< HEAD
          {(['all', 'good', 'moderate', 'unhealthy', 'hazardous'] as const).map(f => (
=======
          {(['all', 'good', 'moderate', 'unhealthy', 'hazardous'] as const).map((f) => (
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
<<<<<<< HEAD
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
                filter === f
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "glass-card text-muted-foreground hover:text-foreground"
=======
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize',
                filter === f
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'glass-card text-muted-foreground hover:text-foreground'
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
<<<<<<< HEAD
          {filtered.length} / {INDIA_STATIONS.length} stations
        </div>
      </div>

      {/* Map + sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Interactive map */}
        <div className="relative flex-1 overflow-hidden">
          {/* Background image */}
          <img
            src={indiaBg}
            alt="India map"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background/70" />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />

          {/* Title */}
          <div className="absolute top-4 left-4 z-10">
=======
          {filtered.length} / {stations.length} stations
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 overflow-hidden">
          <MapContainer
            center={indiaCenter}
            zoom={5}
            minZoom={4}
            maxZoom={12}
            className="absolute inset-0 h-full w-full"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mapStations.map((station) => {
              const cat = getAQICategory(station.aqi);
              const isSelected = selected === station.id;
              return (
                <CircleMarker
                  key={station.id}
                  center={[station.lat, station.lng]}
                  radius={isSelected ? 11 : 8}
                  pathOptions={{
                    color: cat.color,
                    fillColor: cat.color,
                    fillOpacity: isSelected ? 0.9 : 0.7,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => toggleStationSelection(station.id, station.city),
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-semibold">{station.city}</p>
                      <p>{station.state}</p>
                      <p style={{ color: cat.color, fontWeight: 700 }}>
                        AQI {station.aqi} - {cat.label}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          <div className="absolute top-4 left-4 z-[500] glass-card rounded-lg p-2">
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
            <h2 className="text-lg font-bold gradient-text">India AQI Map</h2>
            <p className="text-xs text-muted-foreground">Real-time monitoring stations</p>
          </div>

<<<<<<< HEAD
          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-10 glass-card rounded-xl p-3 text-xs space-y-1.5">
            <p className="font-semibold text-foreground mb-2">AQI Legend</p>
            {[
              { label: 'Good (0–50)', color: '#22c55e' },
              { label: 'Moderate (51–100)', color: '#eab308' },
              { label: 'Unhealthy SG (101–150)', color: '#f97316' },
              { label: 'Unhealthy (151–200)', color: '#ef4444' },
              { label: 'Very Unhealthy (201–300)', color: '#a855f7' },
              { label: 'Hazardous (300+)', color: '#7f1d1d' },
            ].map(item => (
=======
          <div className="absolute bottom-4 left-4 z-[500] glass-card rounded-xl p-3 text-xs space-y-1.5">
            <p className="font-semibold text-foreground mb-2">AQI Legend</p>
            {[
              { label: 'Good (0-50)', color: '#22c55e' },
              { label: 'Moderate (51-100)', color: '#eab308' },
              { label: 'Unhealthy SG (101-150)', color: '#f97316' },
              { label: 'Unhealthy (151-200)', color: '#ef4444' },
              { label: 'Very Unhealthy (201-300)', color: '#a855f7' },
              { label: 'Hazardous (300+)', color: '#7f1d1d' },
            ].map((item) => (
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
<<<<<<< HEAD

          {/* Station markers */}
          {filtered.map((station) => {
            const { x, y } = latLngToPercent(station.lat, station.lng);
            const cat = getAQICategory(station.aqi);
            const isSelected = selected === station.id;
            const markerSize = isSelected ? 20 : station.aqi > 200 ? 16 : 13;

            return (
              <button
                key={station.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 transition-all"
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => setSelected(isSelected ? null : station.id)}
              >
                {/* Pulse ring */}
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{
                    background: cat.color,
                    width: markerSize + 8,
                    height: markerSize + 8,
                    left: -(markerSize + 8) / 2 + markerSize / 2,
                    top: -(markerSize + 8) / 2 + markerSize / 2,
                  }}
                />
                {/* Marker dot */}
                <span
                  className="relative flex items-center justify-center rounded-full font-bold font-mono transition-all duration-300"
                  style={{
                    width: markerSize,
                    height: markerSize,
                    background: cat.color,
                    boxShadow: `0 0 ${isSelected ? 20 : 10}px ${cat.color}80`,
                    fontSize: markerSize > 14 ? '8px' : '6px',
                    color: 'white',
                    transform: isSelected ? 'scale(1.4)' : 'scale(1)',
                  }}
                >
                  {station.aqi > 150 ? station.aqi : ''}
                </span>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap">
                  <div className="glass-card rounded-lg px-3 py-2 text-xs text-center shadow-glass">
                    <p className="font-bold text-foreground">{station.city}</p>
                    <p style={{ color: cat.color }} className="font-mono font-bold">AQI {station.aqi}</p>
                    <p className="text-muted-foreground">{cat.label}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Station list sidebar */}
=======
        </div>

>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
        <div className="w-72 xl:w-80 flex-shrink-0 border-l border-border overflow-y-auto">
          <div className="p-3 space-y-2">
            {filtered.map((station) => {
              const cat = getAQICategory(station.aqi);
              const isSelected = selected === station.id;
              return (
                <div
                  key={station.id}
                  className={cn(
<<<<<<< HEAD
                    "rounded-xl p-3 cursor-pointer transition-all duration-200 border",
                    isSelected
                      ? "border-primary/40 bg-primary/5"
                      : "glass-card-hover border-transparent"
                  )}
                  onClick={() => setSelected(isSelected ? null : station.id)}
=======
                    'rounded-xl p-3 cursor-pointer transition-all duration-200 border',
                    isSelected
                      ? 'border-primary/40 bg-primary/5'
                      : 'glass-card-hover border-transparent'
                  )}
                  onClick={() => toggleStationSelection(station.id, station.city)}
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{station.city}</p>
                      <p className="text-[10px] text-muted-foreground">{station.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono" style={{ color: cat.color }}>{station.aqi}</p>
<<<<<<< HEAD
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full", cat.class)}>{cat.label}</span>
=======
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full', cat.class)}>{cat.label}</span>
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-border grid grid-cols-3 gap-2 animate-fade-up">
                      {[
<<<<<<< HEAD
                        { label: 'PM2.5', value: station.pm25, unit: 'μg' },
                        { label: 'PM10', value: station.pm10, unit: 'μg' },
                        { label: 'NO₂', value: station.no2, unit: 'ppb' },
                        { label: 'Temp', value: `${station.temp}°`, unit: 'C' },
                        { label: 'Wind', value: station.wind, unit: 'km/h' },
                        { label: 'Hum', value: `${station.humidity}%`, unit: '' },
                      ].map(m => (
                        <div key={m.label} className="metric-highlight rounded-lg p-1.5 text-center">
                          <p className="text-[9px] text-muted-foreground">{m.label}</p>
                          <p className="text-xs font-bold font-mono text-foreground">{m.value}<span className="text-[8px] text-muted-foreground">{m.unit}</span></p>
=======
                        { label: 'PM2.5', value: station.pm25, unit: 'ug' },
                        { label: 'PM10', value: station.pm10, unit: 'ug' },
                        { label: 'NO2', value: station.no2, unit: 'ppb' },
                        { label: 'Temp', value: `${station.temp}°`, unit: 'C' },
                        { label: 'Wind', value: station.wind, unit: 'km/h' },
                        { label: 'Hum', value: `${station.humidity}%`, unit: '' },
                      ].map((m) => (
                        <div key={m.label} className="metric-highlight rounded-lg p-1.5 text-center">
                          <p className="text-[9px] text-muted-foreground">{m.label}</p>
                          <p className="text-xs font-bold font-mono text-foreground">
                            {m.value}
                            <span className="text-[8px] text-muted-foreground">{m.unit}</span>
                          </p>
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
                        </div>
                      ))}
                    </div>
                  )}

                  {isSelected && (
                    <Link
<<<<<<< HEAD
                      to={`/station?id=${station.id}`}
                      className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                    >
                      View full details →
=======
                      to={`/station?id=${encodeURIComponent(station.id)}`}
                      className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                    >
                      View full details {'->'}
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
