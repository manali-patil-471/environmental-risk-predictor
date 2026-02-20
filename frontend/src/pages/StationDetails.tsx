<<<<<<< HEAD
import { useState } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
import { useSearchParams, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { INDIA_STATIONS, HOURLY_TRENDS, getAQICategory } from '@/lib/mockData';
<<<<<<< HEAD
=======
import { fetchLiveData } from '@/lib/api';
import { getPreferredCity, onPreferredCityChange } from '@/lib/preferredCity';
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
import { AQIGauge } from '@/components/AQICard';
import { ArrowLeft, Wind, Droplets, Thermometer, MapPin, Clock, Radio, Factory, Car, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StationDetails() {
  const [params] = useSearchParams();
<<<<<<< HEAD
  const stationId = params.get('id') || INDIA_STATIONS[0].id;
  const station = INDIA_STATIONS.find(s => s.id === stationId) || INDIA_STATIONS[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'forecast'>('overview');
=======
  const [stations, setStations] = useState(INDIA_STATIONS);
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'forecast'>('overview');
  const [preferredCity, setPreferredCity] = useState(getPreferredCity());
  const routeStationId = params.get('id');

  useEffect(() => {
    const loadLiveStations = async () => {
      try {
        const data = await fetchLiveData();
        if (data?.stations?.length) {
          setStations(data.stations);
          setDataSource(data.status === 'mock' ? 'mock' : 'live');
        }
      } catch {
        setDataSource('mock');
      } finally {
        setLoading(false);
      }
    };

    loadLiveStations();
  }, []);

  useEffect(() => {
    return onPreferredCityChange(() => setPreferredCity(getPreferredCity()));
  }, []);

  const station =
    (routeStationId
      ? stations.find(s => String(s.id) === routeStationId) ||
        stations.find(s => String(s.name) === routeStationId)
      : undefined) ||
    stations.find(s => String(s.city) === preferredCity) ||
    stations[0] ||
    INDIA_STATIONS[0];
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)

  const cat = getAQICategory(station.aqi);

  const pollutants = [
    { name: 'PM2.5', value: station.pm25, limit: 60, unit: 'μg/m³', safe: 15, color: '#eab308' },
    { name: 'PM10', value: station.pm10, limit: 100, unit: 'μg/m³', safe: 45, color: '#f97316' },
    { name: 'NO₂', value: station.no2, limit: 80, unit: 'ppb', safe: 40, color: '#ef4444' },
    { name: 'SO₂', value: station.so2, limit: 80, unit: 'ppb', safe: 20, color: '#a855f7' },
    { name: 'CO', value: station.co, limit: 10, unit: 'ppm', safe: 4, color: '#3b82f6' },
    { name: 'O₃', value: station.o3, limit: 100, unit: 'ppb', safe: 50, color: '#06b6d4' },
  ];

  const radarData = pollutants.map(p => ({
    pollutant: p.name,
    value: Math.min((p.value / p.limit) * 100, 100),
    fullMark: 100,
  }));

  const sourceIconMap: Record<string, React.ReactNode> = {
    traffic: <Car className="w-4 h-4" />,
    industry: <Factory className="w-4 h-4" />,
    construction: <Building className="w-4 h-4" />,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link to="/map" className="p-2 rounded-lg glass-card hover:bg-muted transition-colors flex-shrink-0 mt-0.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-foreground">{station.city}</h2>
            <span className={cn("px-3 py-1 rounded-full text-sm font-semibold", cat.class)}>
              {cat.label}
            </span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs",
              station.status === 'online' ? 'text-aqi-good bg-aqi-good/10' :
              station.status === 'offline' ? 'text-destructive bg-destructive/10' :
              'text-aqi-moderate bg-aqi-moderate/10'
            )}>
              ● {station.status}
            </span>
<<<<<<< HEAD
=======
            <span className={cn(
              "px-2 py-1 rounded-full text-xs",
              dataSource === 'live' ? 'text-primary bg-primary/10' : 'text-aqi-unhealthy bg-aqi-unhealthy/10'
            )}>
              {loading ? 'loading...' : dataSource === 'live' ? 'live' : 'mock'}
            </span>
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{station.state}</span>
            <span className="flex items-center gap-1"><Radio className="w-3.5 h-3.5" />{station.name}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Updated {station.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* AQI gauge */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
          <AQIGauge aqi={station.aqi} size="lg" />
          <p className="text-sm font-semibold text-foreground mt-1">Air Quality Index</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            {station.sources.map(s => (
              <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full glass-card text-xs text-muted-foreground">
                {sourceIconMap[s] || '●'}
                <span className="capitalize">{s}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Weather metrics */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: <Thermometer className="w-5 h-5" />, label: 'Temperature', value: `${station.temp}°C`, sub: 'Feels like 26°C', color: 'text-aqi-moderate' },
            { icon: <Droplets className="w-5 h-5" />, label: 'Humidity', value: `${station.humidity}%`, sub: 'High moisture', color: 'text-blue-400' },
            { icon: <Wind className="w-5 h-5" />, label: 'Wind Speed', value: `${station.wind} km/h`, sub: 'From NW', color: 'text-primary' },
            { icon: <span className="text-lg">🌫️</span>, label: 'Visibility', value: '2.4 km', sub: 'Reduced', color: 'text-muted-foreground' },
            { icon: <span className="text-lg">🌡️</span>, label: 'Pressure', value: '1012 hPa', sub: 'Normal', color: 'text-cyan-400' },
            { icon: <span className="text-lg">🌤️</span>, label: 'UV Index', value: '5 (Moderate)', sub: 'Protection advised', color: 'text-aqi-unhealthy-sg' },
          ].map((m, i) => (
            <div key={i} className="glass-card-hover rounded-xl p-4">
              <div className={cn("mb-2", m.color)}>{m.icon}</div>
              <p className="text-lg font-bold font-mono text-foreground">{m.value}</p>
              <p className="text-xs font-medium text-foreground">{m.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 glass-card rounded-xl w-fit">
        {(['overview', 'trend', 'forecast'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up">
          {/* Pollutant bars */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Pollutant Levels</h3>
            <div className="space-y-4">
              {pollutants.map((p) => {
                const pct = Math.min((p.value / p.limit) * 100, 100);
                const safePct = (p.safe / p.limit) * 100;
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-foreground font-bold">{p.value} <span className="text-muted-foreground font-normal">{p.unit}</span></span>
                        {p.value > p.safe && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive">
                            ↑ {((p.value / p.safe - 1) * 100).toFixed(0)}% over safe
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      {/* Safe limit marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary/40 z-10"
                        style={{ left: `${safePct}%` }}
                      />
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, background: p.color, boxShadow: `0 0 6px ${p.color}50` }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5 text-[9px] text-muted-foreground">
                      <span>0</span>
                      <span>Safe: {p.safe}</span>
                      <span>Limit: {p.limit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Radar chart */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">Pollution Radar</h3>
            <p className="text-xs text-muted-foreground mb-2">% of permissible limit</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220 20% 18%)" />
                <PolarAngleAxis dataKey="pollutant" tick={{ fontSize: 11, fill: 'hsl(215 15% 55%)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(215 15% 55%)' }} />
                <Radar name="Level" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 18%)', borderRadius: '8px', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'trend' && (
        <div className="chart-container animate-fade-up">
          <h3 className="text-base font-semibold text-foreground mb-1">24-Hour AQI Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">{station.city} — Hourly readings</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={HOURLY_TRENDS} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cat.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={cat.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 18%)', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="aqi" stroke={cat.color} strokeWidth={2.5} fill="url(#aqiGrad2)" dot={false} name="AQI" />
              <Area type="monotone" dataKey="pm25" stroke="#eab308" strokeWidth={1.5} fill="none" dot={false} name="PM2.5" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="chart-container animate-fade-up">
          <h3 className="text-base font-semibold text-foreground mb-1">6-Hour AI Forecast</h3>
          <p className="text-xs text-muted-foreground mb-4">Predictive model confidence: 87%</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {['+1h', '+2h', '+3h', '+4h', '+5h', '+6h'].map((t, i) => {
              const forecastAqi = Math.round(station.aqi + (Math.random() - 0.4) * 30 * (i + 1) * 0.3);
              const fc = getAQICategory(forecastAqi);
              return (
                <div key={t} className="glass-card rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground font-mono">{t}</p>
                  <p className="text-xl font-bold font-mono mt-1" style={{ color: fc.color }}>{forecastAqi}</p>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full mt-1 inline-block", fc.class)}>{fc.label}</span>
                  <div className="mt-2 text-[9px] text-muted-foreground">{Math.round(85 - i * 4)}% conf.</div>
                </div>
              );
            })}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={HOURLY_TRENDS.slice(12, 18).map((t, i) => ({ ...t, time: `+${(i+1)}h` }))} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 18%)', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="aqi" stroke="#06b6d4" strokeWidth={2} fill="url(#forecastGrad)" dot={false} strokeDasharray="6 2" name="Forecast AQI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
