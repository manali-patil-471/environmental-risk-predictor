import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  Wind, Activity, AlertTriangle,
  TrendingUp, TrendingDown, MapPin, ArrowRight, Zap, Shield,
  Heart, Leaf, Clock
} from 'lucide-react';
import { INDIA_STATIONS, HOURLY_TRENDS, MOCK_ALERTS, POLLUTION_SOURCES, getAQICategory } from '@/lib/mockData';
import { fetchFuturePredictions } from '@/lib/api';
import { StatCard } from '@/components/AQICard';
import { cn } from '@/lib/utils';

const TOP_POLLUTED = [...INDIA_STATIONS].sort((a, b) => b.aqi - a.aqi).slice(0, 5);
const TOP_CLEAN = [...INDIA_STATIONS].sort((a, b) => a.aqi - b.aqi).slice(0, 5);

const NATIONAL_AVG = Math.round(INDIA_STATIONS.reduce((s, st) => s + st.aqi, 0) / INDIA_STATIONS.length);

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedAQI, setAnimatedAQI] = useState(0);
  const [futurePredictions, setFuturePredictions] = useState<any[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let start = 0;
    const target = NATIONAL_AVG;
    const step = target / 60;
    const interval = setInterval(() => {
      start = Math.min(start + step, target);
      setAnimatedAQI(Math.round(start));
      if (start >= target) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // Fetch future predictions (24-48 hours)
  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const data = await fetchFuturePredictions();
        if (data && data.predictions) {
          setFuturePredictions(data.predictions);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setPredictionsLoading(false);
      }
    };
    loadPredictions();
  }, []);

  const unreadAlerts = MOCK_ALERTS.filter(a => !a.read);
  const nationalCategory = getAQICategory(NATIONAL_AVG);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Overview Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">National AQI</p>
            <p className="text-2xl font-bold font-mono" style={{ color: nationalCategory.color }}>{animatedAQI}</p>
            <p className="text-[10px]" style={{ color: nationalCategory.color }}>{nationalCategory.label}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitoring Stations"
          value="12"
          subtitle="Across 10 states"
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: 8, label: 'vs last month' }}
          color="primary"
          delay={0}
        />
        <StatCard
          title="Critical Alerts"
          value={unreadAlerts.length}
          subtitle="Require attention"
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={{ value: -12, label: 'vs yesterday' }}
          color="danger"
          delay={100}
        />
        <StatCard
          title="Avg PM2.5"
          value={`${Math.round(INDIA_STATIONS.reduce((s, st) => s + st.pm25, 0) / INDIA_STATIONS.length)}`}
          subtitle="μg/m³ · WHO limit: 15"
          icon={<Wind className="w-5 h-5" />}
          trend={{ value: -5, label: 'vs yesterday' }}
          color="warning"
          delay={200}
        />
        <StatCard
          title="Clean Stations"
          value={INDIA_STATIONS.filter(s => s.aqi <= 100).length}
          subtitle="AQI ≤ 100 today"
          icon={<Shield className="w-5 h-5" />}
          trend={{ value: 15, label: 'vs yesterday' }}
          color="teal"
          delay={300}
        />
      </div>

      {/* Future Predictions (24-48 hours) */}
      {futurePredictions.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-semibold text-foreground">Predicted AQI - Next 24-48 Hours</h3>
                <p className="text-xs text-muted-foreground">AI-based forecast for national average</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Confidence:</span>
              <span className="text-xs font-medium text-primary">75-65%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {futurePredictions.map((pred, idx) => {
              const category = getAQICategory(pred.predicted_aqi);
              const predDate = new Date(pred.timestamp);
              return (
                <div 
                  key={idx}
                  className="relative overflow-hidden rounded-xl p-4 border"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color}15 0%, transparent 100%)`,
                    borderColor: `${category.color}40`
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{pred.time}</span>
                    <span className="text-xs text-muted-foreground">
                      {predDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span 
                      className="text-3xl font-bold font-mono"
                      style={{ color: category.color }}
                    >
                      {pred.predicted_aqi}
                    </span>
                    <span 
                      className="text-xs font-medium mb-1"
                      style={{ color: category.color }}
                    >
                      {category.label}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Confidence</span>
                      <span>{Math.round(pred.confidence * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${pred.confidence * 100}%`,
                          background: category.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* AQI Trend chart */}
        <div className="xl:col-span-2 chart-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">National AQI Trend</h3>
              <p className="text-xs text-muted-foreground">24-hour rolling average</p>
            </div>
            <div className="flex gap-2">
              {['PM2.5', 'PM10', 'AQI'].map((l) => (
                <span key={l} className="text-xs px-2 py-1 rounded-full glass-card text-muted-foreground">{l}</span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={HOURLY_TRENDS} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pm10Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 18%)', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: 'hsl(150 15% 90%)' }}
              />
              <Area type="monotone" dataKey="aqi" stroke="#22c55e" strokeWidth={2} fill="url(#aqiGrad)" dot={false} name="AQI" />
              <Area type="monotone" dataKey="pm25" stroke="#eab308" strokeWidth={1.5} fill="url(#pm25Grad)" dot={false} name="PM2.5" />
              <Area type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={1.5} fill="url(#pm10Grad)" dot={false} name="PM10" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pollution sources pie */}
        <div className="chart-container">
          <h3 className="text-base font-semibold text-foreground mb-1">Pollution Sources</h3>
          <p className="text-xs text-muted-foreground mb-4">Contribution breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={POLLUTION_SOURCES}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="percentage"
              >
                {POLLUTION_SOURCES.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 18%)', borderRadius: '8px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {POLLUTION_SOURCES.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-muted-foreground">{s.icon} {s.name}</span>
                </div>
                <span className="font-mono text-foreground font-medium">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City rankings row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most polluted */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground">Most Polluted Cities</h3>
            </div>
            <Link to="/map" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {TOP_POLLUTED.map((station, i) => {
              const cat = getAQICategory(station.aqi);
              return (
                <Link
                  key={station.id}
                  to={`/station?id=${station.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <span className="w-6 text-center text-xs font-mono text-muted-foreground">#{i + 1}</span>
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{station.city}</p>
                    <p className="text-[10px] text-muted-foreground">{station.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono" style={{ color: cat.color }}>{station.aqi}</p>
                    <p className="text-[10px]" style={{ color: cat.color }}>{cat.label}</p>
                  </div>
                  {/* AQI bar */}
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(station.aqi / 500) * 100}%`, background: cat.color }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Cleanest cities */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Cleanest Cities</h3>
            </div>
            <Link to="/map" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {TOP_CLEAN.map((station, i) => {
              const cat = getAQICategory(station.aqi);
              return (
                <Link
                  key={station.id}
                  to={`/station?id=${station.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="w-6 text-center text-xs font-mono text-muted-foreground">#{i + 1}</span>
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{station.city}</p>
                    <p className="text-[10px] text-muted-foreground">{station.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono" style={{ color: cat.color }}>{station.aqi}</p>
                    <p className="text-[10px]" style={{ color: cat.color }}>{cat.label}</p>
                  </div>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(station.aqi / 500) * 100}%`, background: cat.color }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent alerts + Pollutant comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Alerts */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-aqi-unhealthy" />
              Recent Alerts
            </h3>
            <Link to="/alerts" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {MOCK_ALERTS.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border text-xs",
                  alert.level === 'critical' ? 'border-destructive/30 bg-destructive/5' :
                  alert.level === 'warning' ? 'border-aqi-unhealthy-sg/30 bg-aqi-unhealthy-sg/5' :
                  'border-primary/20 bg-primary/5'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground">{alert.city}, {alert.state}</span>
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide",
                    alert.level === 'critical' ? 'bg-destructive/20 text-destructive' :
                    alert.level === 'warning' ? 'bg-aqi-unhealthy-sg/20 text-aqi-unhealthy-sg' :
                    'bg-primary/20 text-primary'
                  )}>
                    {alert.level}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed line-clamp-2">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pollutant bar chart */}
        <div className="xl:col-span-2 chart-container">
          <h3 className="text-base font-semibold text-foreground mb-1">Pollutant Comparison</h3>
          <p className="text-xs text-muted-foreground mb-4">Top 6 cities — PM2.5 vs PM10 (μg/m³)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={INDIA_STATIONS.slice(0, 6).map(s => ({ city: s.city.split(' ')[0], pm25: s.pm25, pm10: s.pm10 }))}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" vertical={false} />
              <XAxis dataKey="city" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(220 25% 10%)', border: '1px solid hsl(220 20% 18%)', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="pm25" name="PM2.5" fill="#eab308" radius={[3, 3, 0, 0]} opacity={0.9} maxBarSize={20} />
              <Bar dataKey="pm10" name="PM10" fill="#f97316" radius={[3, 3, 0, 0]} opacity={0.8} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <MapPin className="w-5 h-5" />, label: 'Explore Map', sub: 'Interactive hotspots', to: '/map', color: 'text-primary' },
          { icon: <Heart className="w-5 h-5" />, label: 'Health Advisory', sub: 'Personalized tips', to: '/health', color: 'text-aqi-unhealthy' },
          { icon: <Leaf className="w-5 h-5" />, label: 'Eco Credits', sub: 'Earn rewards', to: '/eco-credits', color: 'text-aqi-good' },
          { icon: <Zap className="w-5 h-5" />, label: 'Alert Center', sub: `${unreadAlerts.length} new alerts`, to: '/alerts', color: 'text-aqi-moderate' },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="glass-card-hover rounded-xl p-4 flex items-center gap-3 group"
          >
            <span className={cn("transition-transform group-hover:scale-110", action.color)}>{action.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
