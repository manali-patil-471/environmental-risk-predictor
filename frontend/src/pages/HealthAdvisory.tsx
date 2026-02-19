import { useState } from 'react';
import { INDIA_STATIONS, getAQICategory } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Heart, Shield, AlertTriangle, Baby, User, UserCheck, Wind, Eye, Activity } from 'lucide-react';

const HEALTH_TIPS = {
  general: [
    { icon: '😷', tip: 'Wear N95/N99 masks when outdoors in high AQI areas', priority: 'high' },
    { icon: '🏠', tip: 'Keep windows closed and use air purifiers indoors', priority: 'high' },
    { icon: '💧', tip: 'Stay hydrated — drink at least 8 glasses of water daily', priority: 'medium' },
    { icon: '🌿', tip: 'Use indoor plants like peace lily and spider plant for air purification', priority: 'low' },
    { icon: '🕐', tip: 'Avoid outdoor activities from 6–9 AM and 5–8 PM (peak pollution)', priority: 'medium' },
    { icon: '🚗', tip: 'Use car air recirculation mode in high pollution zones', priority: 'medium' },
  ],
  children: [
    { icon: '👶', tip: 'Keep children indoors when AQI exceeds 100', priority: 'high' },
    { icon: '📚', tip: 'Reschedule outdoor school activities on high pollution days', priority: 'high' },
    { icon: '🫁', tip: 'Monitor breathing patterns and consult doctor if breathing difficulty', priority: 'high' },
  ],
  elderly: [
    { icon: '👴', tip: 'Elderly with heart or lung conditions must avoid outdoor exposure above AQI 150', priority: 'high' },
    { icon: '💊', tip: 'Keep emergency inhalers and medication accessible at all times', priority: 'high' },
    { icon: '🏥', tip: 'Regular health checkups during high pollution seasons', priority: 'medium' },
  ],
  pregnant: [
    { icon: '🤰', tip: 'Pregnant women should minimize outdoor exposure above AQI 100', priority: 'high' },
    { icon: '🍎', tip: 'Consume antioxidant-rich foods (berries, citrus, leafy greens)', priority: 'medium' },
    { icon: '🩺', tip: 'Inform your healthcare provider about prolonged high AQI exposure', priority: 'high' },
  ],
};

const CONDITIONS = ['Asthma', 'Heart Disease', 'COPD', 'Diabetes', 'Hypertension', 'Allergies'];

export default function HealthAdvisory() {
  const [selectedCity, setSelectedCity] = useState(INDIA_STATIONS[0].id);
  const [group, setGroup] = useState<'general' | 'children' | 'elderly' | 'pregnant'>('general');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const station = INDIA_STATIONS.find(s => s.id === selectedCity) || INDIA_STATIONS[0];
  const cat = getAQICategory(station.aqi);

  const getRiskLevel = (aqi: number) => {
    if (aqi <= 50) return { level: 'Low', color: '#22c55e', advice: 'Air quality is good. Enjoy outdoor activities freely.' };
    if (aqi <= 100) return { level: 'Moderate', color: '#eab308', advice: 'Unusually sensitive individuals should limit prolonged outdoor exertion.' };
    if (aqi <= 150) return { level: 'High', color: '#f97316', advice: 'Members of sensitive groups may experience health effects. Limit outdoor activities.' };
    if (aqi <= 200) return { level: 'Very High', color: '#ef4444', advice: 'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion.' };
    return { level: 'Extreme', color: '#a855f7', advice: 'Health alert: everyone may experience serious health effects. Stay indoors.' };
  };

  const risk = getRiskLevel(station.aqi);
  const tips = HEALTH_TIPS[group];

  const toggleCondition = (c: string) => {
    setSelectedConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text">Health Advisory</h2>
        <p className="text-sm text-muted-foreground mt-1">Personalized recommendations based on air quality</p>
      </div>

      {/* City selector */}
      <div className="glass-card rounded-xl p-4">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Select your city</label>
        <div className="flex flex-wrap gap-2">
          {INDIA_STATIONS.map(s => {
            const c = getAQICategory(s.aqi);
            return (
              <button
                key={s.id}
                onClick={() => setSelectedCity(s.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  selectedCity === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border glass-card text-muted-foreground hover:text-foreground"
                )}
              >
                {s.city}
                <span className="ml-1.5 font-mono" style={{ color: c.color }}>{s.aqi}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk overview */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(ellipse at top right, ${risk.color}, transparent)` }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0">
            <div
              className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center"
              style={{ background: `${risk.color}20`, border: `2px solid ${risk.color}40` }}
            >
              <span className="text-3xl font-bold font-mono" style={{ color: risk.color }}>{station.aqi}</span>
              <span className="text-[10px] text-muted-foreground">AQI</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-foreground">{station.city}</h3>
              <span className={cn("px-3 py-1 rounded-full text-sm font-semibold", cat.class)}>{cat.label}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" style={{ color: risk.color }} />
              <span className="text-sm font-semibold" style={{ color: risk.color }}>Risk Level: {risk.level}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{risk.advice}</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'PM2.5', value: station.pm25, unit: 'μg/m³', limit: 60 },
              { label: 'PM10', value: station.pm10, unit: 'μg/m³', limit: 100 },
              { label: 'NO₂', value: station.no2, unit: 'ppb', limit: 80 },
            ].map(m => (
              <div key={m.label} className="metric-highlight rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className={cn("text-lg font-bold font-mono", m.value > m.limit * 0.7 ? "text-aqi-unhealthy" : "text-foreground")}>
                  {m.value}
                </p>
                <p className="text-[9px] text-muted-foreground">{m.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User profile selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { key: 'general', label: 'General Public', icon: <User className="w-5 h-5" /> },
          { key: 'children', label: 'Children', icon: <Baby className="w-5 h-5" /> },
          { key: 'elderly', label: 'Elderly', icon: <UserCheck className="w-5 h-5" /> },
          { key: 'pregnant', label: 'Pregnant Women', icon: <Heart className="w-5 h-5" /> },
        ] as const).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setGroup(key)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
              group === key
                ? "border-primary bg-primary/10 text-primary shadow-glow"
                : "glass-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {icon}
            <span className="text-xs font-medium text-center">{label}</span>
          </button>
        ))}
      </div>

      {/* Medical conditions */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Do you have any pre-existing conditions?</p>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(c => (
            <button
              key={c}
              onClick={() => toggleCondition(c)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                selectedConditions.includes(c)
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-border glass-card text-muted-foreground hover:text-foreground"
              )}
            >
              {selectedConditions.includes(c) ? '✓ ' : ''}{c}
            </button>
          ))}
        </div>
        {selectedConditions.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-xs text-destructive font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              High-Risk Profile Detected
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              With your conditions ({selectedConditions.join(', ')}), you are more susceptible to air pollution effects.
              We strongly recommend staying indoors when AQI exceeds 100.
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Recommendations for {group === 'general' ? 'General Public' : group === 'children' ? 'Children' : group === 'elderly' ? 'Elderly' : 'Pregnant Women'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div
              key={i}
              className={cn(
                "glass-card-hover rounded-xl p-4 flex items-start gap-3 animate-fade-up",
                tip.priority === 'high' ? 'border-l-2 border-l-destructive' :
                tip.priority === 'medium' ? 'border-l-2 border-l-aqi-moderate' :
                'border-l-2 border-l-primary'
              )}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <span className="text-2xl flex-shrink-0">{tip.icon}</span>
              <div>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide mb-1 inline-block",
                  tip.priority === 'high' ? 'bg-destructive/15 text-destructive' :
                  tip.priority === 'medium' ? 'bg-aqi-moderate/15 text-aqi-moderate' :
                  'bg-primary/15 text-primary'
                )}>
                  {tip.priority} priority
                </span>
                <p className="text-sm text-foreground leading-relaxed">{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency contacts */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          Emergency Contacts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Ambulance', number: '102', color: 'text-destructive' },
            { label: 'Pollution Control', number: '1800-180-5005', color: 'text-aqi-moderate' },
            { label: 'Health Helpline', number: '104', color: 'text-primary' },
            { label: 'Disaster Management', number: '108', color: 'text-blue-400' },
          ].map(c => (
            <div key={c.label} className="metric-highlight rounded-lg p-3 text-center">
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
              <p className={cn("text-sm font-bold font-mono mt-1", c.color)}>{c.number}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
