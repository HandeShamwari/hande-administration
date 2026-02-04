import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { LogViewer } from '../components/ui/LogViewer';
import { Tabs } from '../components/ui/Tabs';
import { Search, Activity, User, Download, Calendar, Filter } from 'lucide-react';

interface AuditLog {
  id: number;
  admin_id: number;
  admin_name: string;
  admin_email: string;
  action: string;
  metadata: any;
  ip_address: string;
  created_at: string;
}

interface ActivityStats {
  total_actions: number;
  actions_by_type: Array<{ action: string; count: number }>;
  active_admins: Array<{ admin_id: number; admin_name: string; action_count: number }>;
  actions_over_time: Array<{ hour: string; count: number }>;
  time_range_hours: number;
}

interface SystemLog {
  type: string;
  entity_id: number;
  description: string;
  primary_user: string;
  secondary_user: string | null;
  status: string;
  timestamp: string;
}

interface ActivityFeed {
  activity_type: string;
  title: string;
  description: string;
  timestamp: string;
}

export default function SystemLogs() {
  const [activeTab, setActiveTab] = useState('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<number>(24);
  const [page, setPage] = useState(1);
  const perPage = 50;

  const tabs = [
    { id: 'audit', label: 'Audit Logs', icon: <Activity size={16} /> },
    { id: 'system', label: 'System Logs', icon: <Filter size={16} /> },
    { id: 'activity', label: 'Live Activity', icon: <Calendar size={16} /> },
  ];

  // Fetch audit logs
  const { data: auditLogs, isLoading: auditLoading } = useQuery<{
    data: AuditLog[];
    pagination: { total: number; per_page: number; current_page: number; last_page: number };
  }>({
    queryKey: ['audit-logs', searchTerm, page],
    queryFn: async () => {
      const response = await apiClient.get('/admin/logs/audit', {
        params: {
          search: searchTerm || undefined,
          page,
          per_page: perPage,
        },
      });
      return response.data;
    },
    enabled: activeTab === 'audit',
  });

  // Fetch activity stats
  const { data: stats } = useQuery<ActivityStats>({
    queryKey: ['activity-stats', timeRange],
    queryFn: async () => {
      const response = await apiClient.get('/admin/logs/stats', {
        params: { hours: timeRange },
      });
      return response.data.data;
    },
  });

  // Fetch system logs
  const { data: systemLogs, isLoading: systemLoading } = useQuery<{
    data: SystemLog[];
    pagination: { total: number; per_page: number; current_page: number; last_page: number };
  }>({
    queryKey: ['system-logs', filterType, page],
    queryFn: async () => {
      const response = await apiClient.get('/admin/logs/system', {
        params: {
          type: filterType !== 'all' ? filterType : undefined,
          page,
          per_page: perPage,
        },
      });
      return response.data;
    },
    enabled: activeTab === 'system',
  });

  // Fetch activity feed
  const { data: activityFeed } = useQuery<ActivityFeed[]>({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/logs/activity-feed', {
        params: { minutes: 15 },
      });
      return response.data.data || [];
    },
    refetchInterval: 10000,
    enabled: activeTab === 'activity',
  });

  // Convert activity feed to LogViewer format
  const activityLogs = (activityFeed || []).map((activity, index) => ({
    id: `activity-${index}`,
    timestamp: new Date(activity.timestamp).toLocaleTimeString(),
    level: activity.activity_type === 'emergency' ? 'error' as const : 'info' as const,
    message: `${activity.title} - ${activity.description}`,
    source: activity.activity_type,
  }));

  const handleExport = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    try {
      const response = await apiClient.get('/admin/logs/export', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
      });

      const data = response.data.data;
      if (data && data.length > 0) {
        const csv = [
          ['ID', 'Admin', 'Email', 'Action', 'IP Address', 'Date'],
          ...data.map((log: AuditLog) => [
            log.id,
            log.admin_name,
            log.admin_email,
            log.action,
            log.ip_address,
            new Date(log.created_at).toLocaleString(),
          ]),
        ]
          .map((row) => row.map((cell: any) => `"${cell}"`).join(','))
          .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">System Logs</h1>
          <p className="mt-1 text-sm text-slate-400">Monitor admin actions and system activity</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[#7ED957] text-slate-900 rounded-md font-medium hover:bg-[#6bc748] transition-colors"
        >
          <Download size={16} />
          Export Logs
        </button>
      </div>

      {/* Stats Overview - Render style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Actions</p>
              <p className="text-2xl font-semibold text-slate-50 mt-1">{stats?.total_actions || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Last {timeRange}h</p>
            </div>
            <div className="p-2 bg-[#7ED957]/10 rounded-lg">
              <Activity className="h-5 w-5 text-[#7ED957]" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Admins</p>
              <p className="text-2xl font-semibold text-slate-50 mt-1">{stats?.active_admins?.length || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Taking actions</p>
            </div>
            <div className="p-2 bg-blue-400/10 rounded-lg">
              <User className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">Top Action</p>
            {stats?.actions_by_type && stats.actions_by_type.length > 0 ? (
              <>
                <p className="text-sm font-medium text-slate-50 truncate">{stats.actions_by_type[0].action}</p>
                <p className="text-xs text-slate-500">{stats.actions_by_type[0].count} times</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No data</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">Time Range</p>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-50 focus:outline-none focus:border-slate-600"
            >
              <option value={1}>Last Hour</option>
              <option value={6}>Last 6 Hours</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs - Render style */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={(tab) => { setActiveTab(tab); setPage(1); }} 
        />

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by action, admin name, or IP..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-50 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
              />
            </div>

            {/* Table */}
            {auditLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ED957]"></div>
              </div>
            ) : auditLogs && auditLogs.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Admin</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">IP Address</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date/Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {auditLogs.data.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-slate-50">{log.admin_name}</div>
                            <div className="text-sm text-slate-500">{log.admin_email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-300">{log.action}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-400">
                            {log.ip_address}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {auditLogs.pagination.last_page > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <span className="text-sm text-slate-400">
                      Page {auditLogs.pagination.current_page} of {auditLogs.pagination.last_page}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-700"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === auditLogs.pagination.last_page}
                        className="px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">No audit logs found</div>
            )}
          </div>
        )}

        {/* System Logs Tab */}
        {activeTab === 'system' && (
          <div className="p-4 space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Filter by Type:</span>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-50 focus:outline-none focus:border-slate-600"
              >
                <option value="all">All Types</option>
                <option value="trips">Trips</option>
                <option value="users">Users</option>
                <option value="payments">Payments</option>
              </select>
            </div>

            {/* System Logs List */}
            {systemLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ED957]"></div>
              </div>
            ) : systemLogs && systemLogs.data.length > 0 ? (
              <div className="space-y-2">
                {systemLogs.data.map((log, index) => (
                  <div key={index} className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-[#7ED957]/20 text-[#7ED957] rounded-full font-medium uppercase">
                            {log.type}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                            {log.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-50">{log.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {log.primary_user}
                          {log.secondary_user && ` → ${log.secondary_user}`}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">No system logs found</div>
            )}
          </div>
        )}

        {/* Activity Feed Tab - Using LogViewer */}
        {activeTab === 'activity' && (
          <div className="h-[600px]">
            <LogViewer
              logs={activityLogs}
              title="Real-Time Activity Feed"
            />
          </div>
        )}
      </div>
    </div>
  );
}
