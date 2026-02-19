import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, BarChart, Bar
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Activity, Filter, RefreshCw } from 'lucide-react';
import { fetchHistoricalAQI, fetchAQITrends } from '@/lib/api';
import { getAQICategory } from '@/lib/mockData';

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

const CITIES = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 
  'Hyderabad', 'Pune', 'Ahmedabad', 'Lucknow', 'Jaipur'
];

export default function HistoricalTrends() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedCity]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch historical AQI data
      const aqiData = await fetchHistoricalAQI({
        city: selectedCity || undefined,
        days: days
      });
      setHistoricalData(aqiData.data || []);

      // Fetch trends data
      const trends = await fetchAQITrends(selectedCity || undefined, selectedPeriod);
      setTrendsData(trends.cities || []);
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const processedChartData = historicalData.slice(0, days * 8).map((item, idx) => ({
    time: new Date(item.timestamp).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    }),
    aqi: item.overall_aqi || 0,
    pm25: item['PM2.5'] || item.pm25 || 0,
    pm10: item['PM10'] || item.pm10 || 0,
  }));

  // Calculate statistics
  const avgAQI = trendsData.length > 0 
    ? Math.round(trendsData.reduce((sum, c) => sum + (c.avg_aqi || 0), 0) / trendsData.length)
    : 0;
  const maxAQI = trendsData.length > 0 
    ? Math.max(...trendsData.map(c => c.max_aqi || 0))
    : 0;
  const minAQI = trendsData.length > 0 
    ? Math.min(...trendsData.map(c => c.min_aqi || 0))
    : 0;
  const trend = trendsData.length > 1 
    ? trendsData[0].avg_aqi - trendsData[1].avg_aqi 
    : 0;

  const category = getAQICategory(avgAQI);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Historical AQI Trends</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze air quality patterns over time
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Period:</span>
          <div className="flex gap-1">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">City:</span>
          <select
            value={selectedCity || ''}
            onChange={(e) => setSelectedCity(e.target.value || null)}
            className="px-3 py-1.5 text-sm rounded-lg bg-muted border-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Average AQI</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color: category.color }}>
            {avgAQI}
          </p>
          <p className="text-xs" style={{ color: category.color }}>{category.label}</p>
        </div>
        
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Max AQI</p>
          <p className="text-2xl font-bold font-mono mt-1 text-destructive">{maxAQI}</p>
          <p className="text-xs text-muted-foreground">Highest in period</p>
        </div>
        
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Min AQI</p>
          <p className="text-2xl font-bold font-mono mt-1 text-primary">{minAQI}</p>
          <p className="text-xs text-muted-foreground">Lowest in period</p>
        </div>
        
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Trend</p>
          <div className="flex items-center gap-2 mt-1">
            {trend > 0 ? (
              <TrendingUp className="w-5 h-5 text-destructive" />
            ) : (
              <TrendingDown className="w-5 h-5 text-primary" />
            )}
            <span className={`text-2xl font-bold font-mono ${trend > 0 ? 'text-destructive' : 'text-primary'}`}>
              {Math.abs(Math.round(trend))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">vs previous period</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-base font-semibold text-foreground mb-4">
          AQI Over Time {selectedCity ? `- ${selectedCity}` : '- All Cities'}
        </h3>
        
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={processedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} 
                tickLine={false} 
                axisLine={false}
                interval={Math.floor(processedChartData.length / 7)}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  background: 'hsl(220 25% 10%)', 
                  border: '1px solid hsl(220 20% 18%)', 
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
                labelStyle={{ color: 'hsl(150 15% 90%)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area 
                type="monotone" 
                dataKey="aqi" 
                stroke="#22c55e" 
                strokeWidth={2}
                fill="url(#aqiTrendGrad)" 
                name="AQI" 
              />
              <Line 
                type="monotone" 
                dataKey="pm25" 
                stroke="#eab308" 
                strokeWidth={1.5} 
                dot={false}
                name="PM2.5" 
              />
              <Line 
                type="monotone" 
                dataKey="pm10" 
                stroke="#f97316" 
                strokeWidth={1.5} 
                dot={false}
                name="PM10" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* City Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-base font-semibold text-foreground mb-4">City Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={trendsData.slice(0, 8)} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} />
              <YAxis 
                type="category" 
                dataKey="city" 
                tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} 
                tickLine={false} 
                axisLine={false} 
                width={70}
              />
              <Tooltip
                contentStyle={{ 
                  background: 'hsl(220 25% 10%)', 
                  border: '1px solid hsl(220 20% 18%)', 
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="avg_aqi" name="Avg AQI" fill="#22c55e" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-4">
          <h3 className="text-base font-semibold text-foreground mb-4">AQI Range by City</h3>
          <div className="space-y-3">
            {trendsData.slice(0, 8).map((city, idx) => {
              const cat = getAQICategory(city.avg_aqi);
              const range = city.max_aqi - city.min_aqi;
              return (
                <div key={city.city} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-medium">{city.city}</span>
                    <span className="text-muted-foreground">
                      {Math.round(city.min_aqi)} - {Math.round(city.max_aqi)} (σ={Math.round(city.std_aqi)})
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(city.avg_aqi / 300) * 100}%`,
                        background: cat.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-base font-semibold text-foreground mb-4">Detailed Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-muted">
                <th className="text-left py-2 px-2 text-muted-foreground">City</th>
                <th className="text-right py-2 px-2 text-muted-foreground">Avg AQI</th>
                <th className="text-right py-2 px-2 text-muted-foreground">Min AQI</th>
                <th className="text-right py-2 px-2 text-muted-foreground">Max AQI</th>
                <th className="text-right py-2 px-2 text-muted-foreground">Std Dev</th>
                <th className="text-left py-2 px-2 text-muted-foreground">Category</th>
              </tr>
            </thead>
            <tbody>
              {trendsData.map((city) => {
                const cat = getAQICategory(city.avg_aqi);
                return (
                  <tr key={city.city} className="border-b border-muted/50 hover:bg-muted/30">
                    <td className="py-2 px-2 font-medium text-foreground">{city.city}</td>
                    <td className="py-2 px-2 text-right font-mono" style={{ color: cat.color }}>
                      {Math.round(city.avg_aqi)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-muted-foreground">
                      {Math.round(city.min_aqi)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-muted-foreground">
                      {Math.round(city.max_aqi)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-muted-foreground">
                      {Math.round(city.std_aqi)}
                    </td>
                    <td className="py-2 px-2">
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: `${cat.color}20`, color: cat.color }}
                      >
                        {cat.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
