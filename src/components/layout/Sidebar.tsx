import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  Route,
  FileText,
  Settings,
  BarChart3,
  Bell,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Activity,
  Globe,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Drivers', href: '/users?tab=drivers', icon: Car },
  { name: 'Trips', href: '/trips', icon: Route },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Zones', href: '/zones', icon: MapPin },
  { name: 'Financials', href: '/financial', icon: DollarSign },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Live Map', href: '/live-map', icon: Globe },
];

const secondaryNav: NavItem[] = [
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Support', href: '/support', icon: HelpCircle },
  { name: 'Emergencies', href: '/emergencies', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7ED957] rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">H</span>
            </div>
            <span className="text-slate-50 font-semibold text-lg">Hande</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-[#7ED957] rounded-lg flex items-center justify-center mx-auto">
            <span className="text-slate-900 font-bold text-lg">H</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-50 hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#7ED957]/10 text-[#7ED957]'
                    : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={20} className={active ? 'text-[#7ED957]' : ''} />
                {!collapsed && <span>{item.name}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto bg-[#7ED957] text-slate-900 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-slate-800" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#7ED957]/10 text-[#7ED957]'
                    : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={20} className={active ? 'text-[#7ED957]' : ''} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Status indicator */}
      <div className="p-4 border-t border-slate-800">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            <Activity size={18} className="text-[#7ED957]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#7ED957] rounded-full animate-pulse" />
          </div>
          {!collapsed && (
            <div className="text-xs">
              <p className="text-slate-50 font-medium">System Online</p>
              <p className="text-slate-500">All services running</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
