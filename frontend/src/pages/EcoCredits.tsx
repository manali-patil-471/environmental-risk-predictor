import { useState } from 'react';
import { LEADERBOARD } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Trophy, Leaf, Zap, Share2, TrendingUp, Star, Award, Target } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const MY_CREDITS = 1420;
const MY_RANK = 12;
const NEXT_LEVEL_CREDITS = 1600;

const ECO_ACTIONS = [
  { id: 1, action: 'Used public transport', credits: 20, icon: '🚌', completed: true, date: 'Today' },
  { id: 2, action: 'Carpooled to work', credits: 15, icon: '🚗', completed: true, date: 'Today' },
  { id: 3, action: 'Cycled instead of driving', credits: 30, icon: '🚲', completed: false, date: null },
  { id: 4, action: 'Planted a tree', credits: 100, icon: '🌱', completed: true, date: 'Yesterday' },
  { id: 5, action: 'Reported pollution source', credits: 50, icon: '📸', completed: false, date: null },
  { id: 6, action: 'Shared AQI alert', credits: 10, icon: '📢', completed: true, date: 'Yesterday' },
  { id: 7, action: 'Used air purifier tips', credits: 5, icon: '💨', completed: false, date: null },
  { id: 8, action: 'Participated in cleanup drive', credits: 200, icon: '🧹', completed: false, date: null },
];

const BADGES = [
  { name: 'First Steps', icon: '🌱', description: 'Complete your first eco action', earned: true },
  { name: 'Tree Hugger', icon: '🌳', description: 'Plant 5 trees', earned: true },
  { name: 'Clean Commuter', icon: '🚌', description: 'Use public transport 10 times', earned: true },
  { name: 'Air Guardian', icon: '💨', description: 'Report 3 pollution sources', earned: false },
  { name: 'Eco Champion', icon: '🏆', description: 'Reach 2000 eco credits', earned: false },
  { name: 'Community Hero', icon: '🦸', description: 'Inspire 10 friends to join', earned: false },
];

export default function EcoCredits() {
  const [tab, setTab] = useState<'overview' | 'actions' | 'leaderboard' | 'badges'>('overview');
  const progressPct = (MY_CREDITS / NEXT_LEVEL_CREDITS) * 100;

  const radialData = [{ name: 'Progress', value: Math.round(progressPct), fill: '#22c55e' }];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Eco Credits</h2>
          <p className="text-sm text-muted-foreground mt-1">Earn rewards for sustainable actions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Hero credit card */}
      <div className="relative glass-card rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Radial progress */}
          <div className="flex-shrink-0 w-36 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="60%" outerRadius="90%"
                startAngle={90} endAngle={-270}
                data={radialData}
              >
                <RadialBar background={{ fill: 'hsl(220 22% 15%)' }} dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-20">
              <p className="text-2xl font-bold font-mono gradient-text">{Math.round(progressPct)}%</p>
              <p className="text-[10px] text-muted-foreground">to next level</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Your Eco Balance</span>
            </div>
            <p className="text-5xl font-bold font-mono gradient-text">{MY_CREDITS.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Eco Credits</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress to Level 4</span>
                <span className="font-mono">{MY_CREDITS} / {NEXT_LEVEL_CREDITS}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-eco transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="metric-highlight rounded-xl p-3 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold font-mono text-foreground">#{MY_RANK}</p>
              <p className="text-[10px] text-muted-foreground">National Rank</p>
            </div>
            <div className="metric-highlight rounded-xl p-3 text-center">
              <Target className="w-4 h-4 text-aqi-moderate mx-auto mb-1" />
              <p className="text-xl font-bold font-mono text-foreground">68</p>
              <p className="text-[10px] text-muted-foreground">Actions Done</p>
            </div>
            <div className="metric-highlight rounded-xl p-3 text-center">
              <Star className="w-4 h-4 text-aqi-good mx-auto mb-1" />
              <p className="text-xl font-bold font-mono text-foreground">3</p>
              <p className="text-[10px] text-muted-foreground">Badges Earned</p>
            </div>
            <div className="metric-highlight rounded-xl p-3 text-center">
              <Zap className="w-4 h-4 text-aqi-unhealthy-sg mx-auto mb-1" />
              <p className="text-xl font-bold font-mono text-foreground">+45</p>
              <p className="text-[10px] text-muted-foreground">Credits Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass-card rounded-xl w-fit">
        {(['overview', 'actions', 'leaderboard', 'badges'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
              tab === t ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Eco Actions */}
      {(tab === 'overview' || tab === 'actions') && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Eco Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ECO_ACTIONS.slice(0, tab === 'overview' ? 4 : ECO_ACTIONS.length).map((action, i) => (
              <div
                key={action.id}
                className={cn(
                  "glass-card-hover rounded-xl p-4 flex items-center gap-4 animate-fade-up",
                  action.completed ? 'opacity-70' : ''
                )}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <span className="text-3xl flex-shrink-0">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", action.completed ? 'line-through text-muted-foreground' : 'text-foreground')}>
                    {action.action}
                  </p>
                  {action.date && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{action.date}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono",
                    action.completed ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                  )}>
                    <Leaf className="w-3 h-3" />
                    +{action.credits}
                  </span>
                  {!action.completed && (
                    <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:shadow-glow transition-all">
                      Log
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {(tab === 'leaderboard' || tab === 'overview') && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-aqi-moderate" />
            National Leaderboard
          </h3>
          <div className="glass-card rounded-xl overflow-hidden">
            {LEADERBOARD.map((user, i) => (
              <div
                key={user.userId}
                className={cn(
                  "flex items-center gap-4 p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                  i < 3 ? 'bg-gradient-to-r from-aqi-moderate/5 to-transparent' : ''
                )}
              >
                <div className="w-8 text-center">
                  {i === 0 ? <span className="text-xl">🥇</span> :
                   i === 1 ? <span className="text-xl">🥈</span> :
                   i === 2 ? <span className="text-xl">🥉</span> :
                   <span className="text-sm font-mono text-muted-foreground">#{user.rank}</span>}
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-eco flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">{user.badge} · {user.actions} actions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-primary">{user.credits.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">credits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {(tab === 'badges') && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Achievement Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BADGES.map((badge, i) => (
              <div
                key={badge.name}
                className={cn(
                  "glass-card-hover rounded-xl p-4 text-center animate-fade-up",
                  !badge.earned && 'opacity-40 grayscale'
                )}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <span className="text-4xl block mb-2">{badge.icon}</span>
                <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                {badge.earned && (
                  <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                    Earned ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
