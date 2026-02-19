import { getAQICategory } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Wind, Droplets, Thermometer, Eye } from 'lucide-react';

interface AQIGaugeProps {
  aqi: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AQIGauge({ aqi, size = 'md' }: AQIGaugeProps) {
  const category = getAQICategory(aqi);
  const percentage = Math.min((aqi / 500) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizes = {
    sm: { svg: 80, r: 30, cx: 40, cy: 40, fontSize: 'text-sm', labelSize: 'text-[9px]' },
    md: { svg: 120, r: 45, cx: 60, cy: 60, fontSize: 'text-xl', labelSize: 'text-[10px]' },
    lg: { svg: 160, r: 60, cx: 80, cy: 80, fontSize: 'text-3xl', labelSize: 'text-xs' },
  };

  const s = sizes[size];
  const adjCircumference = 2 * Math.PI * s.r;
  const adjOffset = adjCircumference - (percentage / 100) * adjCircumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={s.svg} height={s.svg} viewBox={`0 0 ${s.svg} ${s.svg}`} className="-rotate-90">
        <circle
          cx={s.cx} cy={s.cy} r={s.r}
          fill="none" stroke="hsl(220 22% 15%)" strokeWidth="8"
        />
        <circle
          cx={s.cx} cy={s.cy} r={s.r}
          fill="none" stroke={category.color} strokeWidth="8"
          strokeDasharray={adjCircumference}
          strokeDashoffset={adjOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out', filter: `drop-shadow(0 0 6px ${category.color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold font-mono leading-none", s.fontSize)} style={{ color: category.color }}>
          {aqi}
        </span>
        <span className={cn("text-muted-foreground mt-0.5", s.labelSize)}>AQI</span>
      </div>
    </div>
  );
}

interface StationCardProps {
  station: {
    id: string;
    name: string;
    city: string;
    state: string;
    aqi: number;
    pm25: number;
    pm10: number;
    temp: number;
    humidity: number;
    wind: number;
    status: 'online' | 'offline' | 'maintenance';
    lastUpdated: string;
    sources: string[];
  };
  onClick?: () => void;
  compact?: boolean;
}

export function StationCard({ station, onClick, compact = false }: StationCardProps) {
  const category = getAQICategory(station.aqi);

  const sourceIcons: Record<string, string> = {
    traffic: '🚗',
    industry: '🏭',
    construction: '🏗️',
    agriculture: '🌾',
    residential: '🏠',
  };

  return (
    <div
      className={cn("glass-card-hover rounded-xl cursor-pointer p-4", compact ? "p-3" : "p-4")}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}>{station.city}</h3>
          <p className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>{station.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", category.class)}>
            {category.label}
          </span>
          <span className={cn(
            "text-[9px] px-1.5 py-0.5 rounded-full",
            station.status === 'online' ? 'text-aqi-good bg-aqi-good/10' :
            station.status === 'offline' ? 'text-destructive bg-destructive/10' :
            'text-aqi-moderate bg-aqi-moderate/10'
          )}>
            ● {station.status}
          </span>
        </div>
      </div>

      {/* AQI + Metrics */}
      <div className="flex items-center gap-4 mb-3">
        <AQIGauge aqi={station.aqi} size="sm" />
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <MetricPill label="PM2.5" value={`${station.pm25}`} unit="μg/m³" />
          <MetricPill label="PM10" value={`${station.pm10}`} unit="μg/m³" />
          {!compact && (
            <>
              <MetricPill label="Temp" value={`${station.temp}`} unit="°C" icon={<Thermometer className="w-2.5 h-2.5" />} />
              <MetricPill label="Humidity" value={`${station.humidity}`} unit="%" icon={<Droplets className="w-2.5 h-2.5" />} />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {station.sources.map(s => (
            <span key={s} title={s} className="text-sm">{sourceIcons[s] || '●'}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Wind className="w-2.5 h-2.5" />
          <span>{station.wind} km/h</span>
          <span className="mx-1">·</span>
          <span>{station.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, value, unit, icon }: { label: string; value: string; unit: string; icon?: React.ReactNode }) {
  return (
    <div className="metric-highlight rounded-lg px-2 py-1">
      <div className="flex items-center gap-1">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-xs font-bold text-foreground font-mono">{value}</span>
        <span className="text-[8px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'primary', delay = 0 }: StatCardProps) {
  return (
    <div
      className="glass-card-hover rounded-xl p-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          color === 'primary' ? "bg-primary/15 text-primary" :
          color === 'warning' ? "bg-aqi-moderate/15 text-aqi-moderate" :
          color === 'danger' ? "bg-destructive/15 text-destructive" :
          color === 'teal' ? "bg-secondary/20 text-secondary-foreground" :
          "bg-primary/15 text-primary"
        )}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            trend.value >= 0 ? "text-aqi-good bg-aqi-good/10" : "text-destructive bg-destructive/10"
          )}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
        <p className="text-sm text-foreground mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>}
      </div>
    </div>
  );
}
