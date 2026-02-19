import { useState } from 'react';
import { cn } from '@/lib/utils';
import { User, Bell, Globe, Shield, Download, LogOut, Moon, ChevronRight, Check } from 'lucide-react';

const LANGUAGES = ['English', 'हिन्दी (Hindi)', 'বাংলা (Bengali)', 'తెలుగు (Telugu)', 'मराठी (Marathi)', 'தமிழ் (Tamil)'];

export default function UserProfile() {
  const [notifications, setNotifications] = useState({ critical: true, warning: true, info: false, email: false });
  const [selectedLang, setSelectedLang] = useState('English');
  const [tab, setTab] = useState<'profile' | 'notifications' | 'preferences'>('profile');

  const toggle = (key: keyof typeof notifications) => setNotifications(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text">User Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage settings and preferences</p>
      </div>

      {/* Profile card */}
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-eco flex items-center justify-center text-2xl font-bold text-white shadow-glow">RK</div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full status-live border-2 border-background" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-foreground">Rahul Kumar</h3>
          <p className="text-sm text-muted-foreground">rahul.kumar@econova.in</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">🏙️ New Delhi</span>
            <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-xs">Municipal Officer</span>
            <span className="px-2 py-1 rounded-full bg-aqi-moderate/10 text-aqi-moderate text-xs">Level 3 Eco User</span>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:shadow-glow transition-all">Edit Profile</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass-card rounded-xl w-fit">
        {(['profile', 'notifications', 'preferences'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all", tab === t ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4 animate-fade-up">
          <div className="glass-card rounded-xl divide-y divide-border">
            {[
              { label: 'Full Name', value: 'Rahul Kumar' },
              { label: 'Email', value: 'rahul.kumar@econova.in' },
              { label: 'Phone', value: '+91 98765 43210' },
              { label: 'Organization', value: 'Delhi Municipal Corporation' },
              { label: 'Role', value: 'Environmental Officer' },
              { label: 'Member Since', value: 'January 2024' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Download className="w-4 h-4" /> Export Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="glass-card rounded-xl divide-y divide-border animate-fade-up">
          {[
            { key: 'critical' as const, label: 'Critical AQI Alerts', desc: 'When AQI exceeds 200 (Very Unhealthy)', icon: <Bell className="w-4 h-4 text-destructive" /> },
            { key: 'warning' as const, label: 'Warning Alerts', desc: 'When AQI exceeds 150 (Unhealthy)', icon: <Bell className="w-4 h-4 text-aqi-unhealthy-sg" /> },
            { key: 'info' as const, label: 'Info Updates', desc: 'Daily AQI reports and forecasts', icon: <Bell className="w-4 h-4 text-primary" /> },
            { key: 'email' as const, label: 'Email Digest', desc: 'Weekly environmental summary', icon: <Bell className="w-4 h-4 text-muted-foreground" /> },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <button onClick={() => toggle(item.key)} className={cn("w-12 h-6 rounded-full transition-all relative flex-shrink-0", notifications[item.key] ? "bg-primary" : "bg-muted")}>
                <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", notifications[item.key] ? "left-6" : "left-0.5")} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'preferences' && (
        <div className="space-y-4 animate-fade-up">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Language</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all", selectedLang === lang ? "border-primary bg-primary/10 text-primary" : "border-border glass-card text-muted-foreground hover:text-foreground")}>
                  {selectedLang === lang && <Check className="w-3 h-3" />}
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Data & Privacy</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Your location data is used solely for providing personalized AQI alerts and is never shared with third parties.</p>
              <button className="text-primary hover:underline text-xs">View Privacy Policy →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
