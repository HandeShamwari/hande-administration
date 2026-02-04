import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { Users, Car, DollarSign, TrendingUp, Activity, Clock } from 'lucide-react';
import { DocumentExpiryAlerts } from '../components/dashboard/DocumentExpiryAlerts';

interface RealtimeMetrics {
  trips: {
    active: number;
    searching: number;
    hourly_requests: number;
    hourly_completed: number;
  };
  drivers: {
    online: number;
    available: number;
    busy: number;
    utilization_percent: number;
  };
  marketplace: {
    liquidity_ratio: number;
    liquidity_status: string;
    hourly_gmv: number;
  };
}

interface DailyKPIs {
  trips: {
    total_requests: number;
    completed: number;
    cancelled: number;
    completion_rate: number;
  };
  revenue: {
    gross_gmv: number;
    platform_revenue: number;
    avg_fare: number;
  };
  quality: {
    avg_rider_rating: number;
    avg_driver_rating: number;
  };
  users: {
    active_riders: number;
    active_drivers: number;
  };
}

export default function Dashboard() {
  const { data: realtimeData, isLoading: realtimeLoading } = useQuery<RealtimeMetrics>({
    queryKey: ['analytics', 'realtime'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/analytics/realtime');
      return response.data.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery<DailyKPIs>({
    queryKey: ['analytics', 'daily'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/analytics/daily');
      return response.data.data;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (realtimeLoading || dailyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="h-5 w-5 animate-pulse" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  const stats = [
    { 
      name: 'Active Trips', 
      value: realtimeData?.trips.active || 0, 
      icon: Car, 
      change: `${realtimeData?.trips.hourly_requests || 0} requests/hr`, 
      positive: true,
      color: 'text-[#7ED957]',
      bgColor: 'bg-[#7ED957]/10'
    },
    { 
      name: 'Online Drivers', 
      value: realtimeData?.drivers.online || 0, 
      icon: Users, 
      change: `${realtimeData?.drivers.utilization_percent || 0}% utilization`, 
      positive: true,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    { 
      name: 'Today\'s Revenue', 
      value: `$${dailyData?.revenue.gross_gmv.toLocaleString() || 0}`, 
      icon: DollarSign, 
      change: `${dailyData?.trips.completed || 0} trips`, 
      positive: true,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10'
    },
    { 
      name: 'Completion Rate', 
      value: `${dailyData?.trips.completion_rate || 0}%`, 
      icon: TrendingUp, 
      change: `${dailyData?.trips.cancelled || 0} cancelled`, 
      positive: (dailyData?.trips.completion_rate || 0) > 90,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
  ];

  const getLiquidityBadge = (status: string) => {
    const badges = {
      'oversupply': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Oversupply' },
      'balanced': { bg: 'bg-[#7ED957]/20', text: 'text-[#7ED957]', label: 'Balanced' },
      'high_demand': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'High Demand' },
      'critical_shortage': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critical Shortage' },
    };
    return badges[status as keyof typeof badges] || badges.balanced;
  };

  const liquidityBadge = getLiquidityBadge(realtimeData?.marketplace.liquidity_status || 'balanced');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Real-time overview of your Hande platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock size={14} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Document Expiry Alerts */}
      <DocumentExpiryAlerts />

      {/* Stats Grid - Render style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className={`text-xs font-medium ${stat.positive ? 'text-[#7ED957]' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-400">{stat.name}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-50">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Marketplace Status - Render style */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h3 className="text-sm font-medium text-slate-50">Marketplace Status</h3>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${liquidityBadge.bg} ${liquidityBadge.text}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liquidityBadge.bg}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${liquidityBadge.text.replace('text-', 'bg-')}`}></span>
            </span>
            {liquidityBadge.label}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3 p-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Searching for Rides</p>
            <p className="text-xl font-semibold text-slate-50">{realtimeData?.trips.searching || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Available Drivers</p>
            <p className="text-xl font-semibold text-slate-50">{realtimeData?.drivers.available || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Hourly GMV</p>
            <p className="text-xl font-semibold text-[#7ED957]">${realtimeData?.marketplace.hourly_gmv.toFixed(2) || 0}</p>
          </div>
        </div>
      </div>

      {/* Today's Performance - Render style */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-800">
            <h3 className="text-sm font-medium text-slate-50">Trip Performance</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-sm text-slate-400">Total Requests</span>
              <span className="text-sm font-medium text-slate-50">{dailyData?.trips.total_requests || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-sm text-slate-400">Completed</span>
              <span className="text-sm font-medium text-[#7ED957]">{dailyData?.trips.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-sm text-slate-400">Cancelled</span>
              <span className="text-sm font-medium text-red-400">{dailyData?.trips.cancelled || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-400">Completion Rate</span>
              <span className={`text-sm font-medium ${(dailyData?.trips.completion_rate || 0) > 90 ? 'text-[#7ED957]' : 'text-amber-400'}`}>
                {dailyData?.trips.completion_rate || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-800">
            <h3 className="text-sm font-medium text-slate-50">Platform Quality</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-sm text-slate-400">Rider Rating</span>
              <span className="text-sm font-medium text-amber-400">⭐ {dailyData?.quality.avg_rider_rating.toFixed(2) || 5.0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-sm text-slate-400">Driver Rating</span>
              <span className="text-sm font-medium text-amber-400">⭐ {dailyData?.quality.avg_driver_rating.toFixed(2) || 5.0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-sm text-slate-400">Active Riders Today</span>
              <span className="text-sm font-medium text-slate-50">{dailyData?.users.active_riders || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-400">Active Drivers Today</span>
              <span className="text-sm font-medium text-slate-50">{dailyData?.users.active_drivers || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
