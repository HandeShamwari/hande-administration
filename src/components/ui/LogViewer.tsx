import { useState, useEffect, useRef } from 'react';
import { Filter, Download, Pause, Play, Trash2 } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  title?: string;
  onClear?: () => void;
  onExport?: () => void;
}

const levelColors = {
  info: 'text-blue-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  debug: 'text-slate-500',
};

const levelBgColors = {
  info: 'bg-blue-400/10',
  warn: 'bg-amber-400/10',
  error: 'bg-red-400/10',
  debug: 'bg-slate-400/10',
};

export function LogViewer({ logs, title = 'Logs', onClear, onExport }: LogViewerProps) {
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Auto-scroll to bottom when new logs arrive (unless paused)
  useEffect(() => {
    if (!isPaused && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/50">
        <h3 className="text-sm font-medium text-slate-50">{title}</h3>
        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Filter logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-50 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 w-40"
          />

          {/* Level filter */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="appearance-none px-3 py-1 pr-8 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-50 focus:outline-none focus:border-slate-600 cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
            <Filter size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Pause/Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded-md transition-colors ${
              isPaused 
                ? 'bg-amber-400/20 text-amber-400' 
                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-700'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>

          {/* Clear */}
          {onClear && (
            <button
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-md transition-colors"
              title="Clear logs"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Export */}
          {onExport && (
            <button
              onClick={onExport}
              className="p-1.5 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-md transition-colors"
              title="Export logs"
            >
              <Download size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto font-mono text-xs"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            No logs to display
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-3 px-4 py-2 hover:bg-slate-800/30 ${levelBgColors[log.level]}`}
              >
                {/* Timestamp */}
                <span className="text-slate-500 whitespace-nowrap flex-shrink-0">
                  {log.timestamp}
                </span>

                {/* Level badge */}
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${levelColors[log.level]} bg-current/10 flex-shrink-0`}>
                  {log.level}
                </span>

                {/* Source */}
                {log.source && (
                  <span className="text-slate-400 flex-shrink-0">
                    [{log.source}]
                  </span>
                )}

                {/* Message */}
                <span className="text-slate-300 break-all">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - live indicator */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-800/50 text-xs">
        <div className="flex items-center gap-2">
          {!isPaused && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7ED957] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7ED957]"></span>
              </span>
              <span className="text-slate-400">Live</span>
            </>
          )}
          {isPaused && (
            <span className="text-amber-400">Paused</span>
          )}
        </div>
        <span className="text-slate-500">
          {filteredLogs.length} entries
        </span>
      </div>
    </div>
  );
}
