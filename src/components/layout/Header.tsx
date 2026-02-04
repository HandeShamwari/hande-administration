import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, User, ChevronRight, Command, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

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
    <header className="sticky top-0 z-30 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-md"
        >
          <Menu size={20} />
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

          {/* User menu */}
          <button className="flex items-center gap-2 p-1.5 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-md transition-colors">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <User size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-slate-900/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-lg shadow-2xl">
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
    </header>
  );
}
