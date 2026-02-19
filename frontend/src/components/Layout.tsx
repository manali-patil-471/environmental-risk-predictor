import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  Radio,
  Heart,
  Leaf,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Wind,
  Activity,
  AlertTriangle,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ALERTS } from '@/lib/mockData';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'Map View', icon: Map },
  { path: '/station', label: 'Station Details', icon: Radio },
  { path: '/trends', label: 'Historical Trends', icon: TrendingUp },
  { path: '/health', label: 'Health Advisory', icon: Heart },
  { path: '/eco-credits', label: 'Eco Credits', icon: Leaf },
  { path: '/alerts', label: 'Alert Center', icon: Bell, badge: MOCK_ALERTS.filter((a: any) => !a.read).length },
  { path: '/profile', label: 'User Profile', icon: User },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = MOCK_ALERTS.filter((a: any) => !a.read).length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed ? "justify-center px-3" : ""
      )}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-eco flex items-center justify-center shadow-glow">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full status-live" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold gradient-text leading-tight">EcoNova</p>
            <p className="text-[10px] text-muted-foreground leading-tight tracking-widest uppercase">Sentinel</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                collapsed ? "justify-center px-2" : "",
                isActive
                  ? "nav-active"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn(
                "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
              )} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn(
        "px-3 py-4 border-t border-sidebar-border space-y-3",
        collapsed ? "px-2" : ""
      )}>
        {/* System status */}
        {!collapsed && (
          <div className="glass-card rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">System Status</span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
                <span className="w-1.5 h-1.5 rounded-full status-live inline-block" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-xs text-foreground">12 / 12 stations online</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-aqi-unhealthy-sg" />
              <span className="text-xs text-foreground">{unreadCount} active alerts</span>
            </div>
          </div>
        )}

        {/* Collapse button (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full z-50 md:hidden transition-transform duration-300 bg-sidebar",
        "w-64 border-r border-sidebar-border",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col transition-all duration-300 bg-sidebar border-r border-sidebar-border flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border glass-card flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">India Air Quality Monitor</h1>
              <p className="text-xs text-muted-foreground">Real-time environmental data across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
              <span className="w-2 h-2 rounded-full status-live" />
              <span className="text-primary font-medium">LIVE</span>
              <span className="text-muted-foreground hidden sm:inline">Updated 2 min ago</span>
            </div>

            {/* Alert bell */}
            <Link to="/alerts" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-4.5 h-4.5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User avatar */}
            <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center text-xs font-bold text-white hover:shadow-glow transition-all">
              RK
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-grid-pattern">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
