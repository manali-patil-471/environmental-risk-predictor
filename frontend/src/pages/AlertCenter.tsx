import { useState } from 'react';
import { MOCK_ALERTS, INDIA_STATIONS, getAQICategory } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Bell, AlertTriangle, Info, CheckCircle, Filter, Search, X } from 'lucide-react';

export default function AlertCenter() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [search, setSearch] = useState('');

  const filtered = alerts.filter(a => {
    const matchFilter = filter === 'all' || a.level === filter;
    const matchSearch = a.city.toLowerCase().includes(search.toLowerCase()) || a.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const markRead = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));

  const unread = alerts.filter(a => !a.read).length;

  const levelIcon = (level: string) => {
    if (level === 'critical') return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (level === 'warning') return <AlertTriangle className="w-4 h-4 text-aqi-unhealthy-sg" />;
    return <Info className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Bell className="w-6 h-6" /> Alert Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{unread} unread alerts · Municipal notifications</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="px-4 py-2 rounded-xl glass-card text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical', count: alerts.filter(a => a.level === 'critical').length, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Warning', count: alerts.filter(a => a.level === 'warning').length, color: 'text-aqi-unhealthy-sg', bg: 'bg-aqi-unhealthy-sg/10' },
          { label: 'Info', count: alerts.filter(a => a.level === 'info').length, color: 'text-primary', bg: 'bg-primary/10' },
        ].map(s => (
          <div key={s.label} className={cn("glass-card rounded-xl p-4 text-center", s.bg)}>
            <p className={cn("text-2xl font-bold font-mono", s.color)}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'critical', 'warning', 'info'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all", filter === f ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.map((alert, i) => (
          <div key={alert.id} className={cn("glass-card-hover rounded-xl p-4 animate-fade-up border-l-2", alert.level === 'critical' ? 'border-l-destructive' : alert.level === 'warning' ? 'border-l-aqi-unhealthy-sg' : 'border-l-primary', !alert.read && 'bg-muted/20')} style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{levelIcon(alert.level)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{alert.city}, {alert.state}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!alert.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    <span className="text-[10px] text-muted-foreground">{new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    <button onClick={() => markRead(alert.id)} className="p-1 rounded hover:bg-muted transition-colors"><X className="w-3 h-3 text-muted-foreground" /></button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>
                <span className={cn("mt-2 inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide", alert.level === 'critical' ? 'bg-destructive/15 text-destructive' : alert.level === 'warning' ? 'bg-aqi-unhealthy-sg/15 text-aqi-unhealthy-sg' : 'bg-primary/15 text-primary')}>
                  {alert.level}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No alerts match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
