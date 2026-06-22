import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  timestamp: string;
  user_id: string;
  username: string;
  full_name: string;
  message: string;
  status: string;
  menu_action: string;
}

interface StatsData {
  total: number;
  by_status: Record<string, number>;
  fetched_at: string;
}

interface LogsData {
  total: number;
  logs: LogEntry[];
  fetched_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  "🔴 EMERGENCY": {
    label: "EMERGENCY",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  "🟡 Needs Review": {
    label: "Needs Review",
    bg: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  "🟢 FAQ Resolved": {
    label: "FAQ Resolved",
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  "🔵 In Queue": {
    label: "In Queue",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

const ROW_STATUS: Record<string, string> = {
  "🔴 EMERGENCY": "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500",
  "🟡 Needs Review": "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400",
  "🟢 FAQ Resolved": "bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500",
  "🔵 In Queue": "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-400",
};

const STAT_CARDS = [
  { key: "🔴 EMERGENCY", label: "Emergency", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "🚨" },
  { key: "🟡 Needs Review", label: "Needs Review", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", icon: "🔍" },
  { key: "🟢 FAQ Resolved", label: "FAQ Resolved", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: "✅" },
  { key: "🔵 In Queue", label: "In Queue", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: "📋" },
];

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-gray-500">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "200");

      const [logsRes, statsRes] = await Promise.all([
        fetch(`/api/triage/logs?${params}`),
        fetch(`/api/triage/stats`),
      ]);

      if (!logsRes.ok || !statsRes.ok) throw new Error("API error");

      const logsData: LogsData = await logsRes.json();
      const statsData: StatsData = await statsRes.json();

      setLogs(logsData.logs);
      setStats(statsData);
      setError(null);
      setLastRefresh(new Date());
    } catch (e) {
      setError("Failed to load data. Make sure the bot is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-sidebar shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center text-lg">🏦</div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">SmartCard Triage Admin</h1>
              <p className="text-sidebar-foreground/60 text-xs">Support Operations Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-sidebar-foreground/50 text-xs hidden sm:block">
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sidebar-primary text-white text-xs font-medium rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              <span className={refreshing ? "animate-spin" : ""}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-gray-900">{stats?.total ?? "—"}</div>
            <div className="text-sm text-gray-500 mt-0.5">Total Interactions</div>
          </div>
          {STAT_CARDS.map(({ key, label, color, bg, border, icon }) => (
            <div
              key={key}
              className={`rounded-xl border ${border} ${bg} shadow-sm p-4 cursor-pointer transition-opacity ${statusFilter === key ? "ring-2 ring-offset-1 ring-blue-400" : "hover:opacity-90"}`}
              onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
            >
              <div className={`text-2xl font-bold ${color}`}>
                {stats?.by_status[key] ?? 0}
              </div>
              <div className={`text-sm font-medium ${color} mt-0.5`}>
                <span className="mr-1">{icon}</span>{label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="search"
                placeholder="Search by User ID, username, or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 min-w-[160px]"
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              {(search || statusFilter) && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setStatusFilter(""); }}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Triage Log {logs.length > 0 && <span className="text-gray-400 font-normal">({logs.length} entries)</span>}
            </span>
            <span className="text-xs text-gray-400">Auto-refreshes every 30s</span>
          </div>

          {error && (
            <div className="p-6 text-center">
              <div className="text-red-500 text-sm font-medium">{error}</div>
              <button onClick={() => fetchData(true)} className="mt-2 text-xs text-blue-600 hover:underline">
                Retry
              </button>
            </div>
          )}

          {loading && !error && (
            <div className="p-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-sm text-gray-400">Loading triage data…</p>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-gray-500 text-sm">No entries found.</p>
              <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters.</p>
            </div>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Timestamp</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Message / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((row, i) => (
                    <tr key={i} className={`transition-colors ${ROW_STATUS[row.status] ?? "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {row.timestamp}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{row.full_name || "—"}</div>
                        <div className="text-xs text-gray-400">
                          @{row.username}
                          {row.user_id && <span className="ml-1 text-gray-300">· {row.user_id}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {row.menu_action ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            🎯 {row.menu_action}
                          </span>
                        ) : (
                          <span className="text-gray-700">{truncate(row.message, 80)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
