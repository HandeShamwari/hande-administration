import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Car,
  Headphones,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  MapPin,
  Truck,
  Star,
  AlertTriangle,
  Map,
  ScrollText,
  Tag,
  Bell,
  Layers,
  UserCog,
  FileBarChart,
  Download,
  Search,
  Command,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Drivers', href: '/users', icon: Users },
  { name: 'Riders', href: '/riders', icon: UserCircle },
  { name: 'Trips', href: '/trips', icon: Car },
  { name: 'Zones', href: '/zones', icon: MapPin },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'Ratings', href: '/ratings', icon: Star },
  { name: 'Emergencies', href: '/emergencies', icon: AlertTriangle },
  { name: 'Live Map', href: '/live-map', icon: Map },
  { name: 'System Logs', href: '/logs', icon: ScrollText },
  { name: 'Promotions', href: '/promotions', icon: Tag },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Content', href: '/content', icon: Layers },
  { name: 'Support', href: '/support', icon: Headphones },
  { name: 'Financial', href: '/financial', icon: DollarSign },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileBarChart },
  { name: 'Data Exports', href: '/exports', icon: Download },
  { name: 'Admin Users', href: '/admin-users', icon: UserCog },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  // Generate breadcrumb from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/' + pathSegments.slice(0, index + 1).join('/'),
    })),
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar - Render style */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#7ED957] rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">H</span>
              </div>
              <span className="text-slate-50 font-semibold">Hande Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-50"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-[#7ED957] border-l-2 border-[#7ED957]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-800 p-3">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-50 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@hande.co'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Render style */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden md:flex items-center space-x-1 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <ChevronRight size={14} className="mx-1 text-slate-600" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-slate-50 font-medium">{crumb.name}</span>
                  ) : (
                    <Link
                      to={crumb.href}
                      className="text-slate-400 hover:text-slate-50 transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-800 border border-slate-700 rounded-md hover:border-slate-600 hover:text-slate-300 transition-colors"
              >
                <Search size={16} />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono bg-slate-700 rounded">
                  <Command size={10} /> K
                </kbd>
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-md transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7ED957] rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-slate-900/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-lg shadow-2xl mx-4">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
              <Search size={20} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search users, trips, settings..."
                className="flex-1 bg-transparent text-slate-50 placeholder:text-slate-500 outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              />
              <kbd className="px-2 py-1 text-xs font-mono text-slate-400 bg-slate-700 rounded">ESC</kbd>
            </div>
            <div className="p-4 text-sm text-slate-400 text-center">
              Start typing to search...
            </div>
          </div>
          <div className="fixed inset-0 -z-10" onClick={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
