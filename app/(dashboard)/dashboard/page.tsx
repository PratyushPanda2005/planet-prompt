"use client";

import { useEffect, useState } from "react";
import { 
  Leaf, 
  Cpu, 
  Droplet, 
  Compass, 
  RefreshCw, 
  Database,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

interface QueryLog {
  id: string;
  promptText: string;
  modelUsed: string;
  tokenCount: number;
  carbonGrams: number;
  waterMl: number;
  landCm2: number;
  createdAt: string;
}

interface Stats {
  totalCarbon: number;
  totalWaterLitres: number;
  totalLand: number;
  totalTokens: number;
  queryCount: number;
}

interface ChartDataPoint {
  date: string;
  carbon: number;
  water: number;
  land: number;
  count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentQueries, setRecentQueries] = useState<QueryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [metricTab, setMetricTab] = useState<"carbon" | "water" | "land">("carbon");

  interface ModelOption {
    name: string;
    displayName: string;
  }

  const [models, setModels] = useState<ModelOption[]>([]);

  // Mock Query Quick Log Form State
  const [mockPrompt, setMockPrompt] = useState("");
  const [mockModel, setMockModel] = useState("gpt-4o");
  const [mockTokens, setMockTokens] = useState(450);
  const [loggingQuery, setLoggingQuery] = useState(false);
  const [logMessage, setLogMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setChartData(data.chartData);
        setRecentQueries(data.recentQueries);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      if (data.success && data.models) {
        setModels(data.models);
        if (data.models.length > 0) {
          const names = data.models.map((m: any) => m.name);
          if (!names.includes(mockModel)) {
            setMockModel(data.models[0].name);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching models:", err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    fetchModels();
  }, []);

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockPrompt.trim()) return;

    try {
      setLoggingQuery(true);
      setLogMessage("");
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: mockPrompt,
          modelUsed: mockModel,
          tokenCount: mockTokens,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLogMessage("Query logged successfully!");
        setMockPrompt("");
        // Reload dashboard stats and history
        fetchData();
        setTimeout(() => setLogMessage(""), 3000);
      } else {
        setLogMessage("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      setLogMessage("Failed to log query.");
    } finally {
      setLoggingQuery(false);
    }
  };

  const getMetricDetails = () => {
    switch (metricTab) {
      case "carbon":
        return {
          key: "carbon",
          color: "#10b981",
          label: "Carbon Footprint (g CO₂)",
          gradientId: "carbonGrad",
        };
      case "water":
        return {
          key: "water",
          color: "#06b6d4",
          label: "Water Consumption (L)",
          gradientId: "waterGrad",
        };
      case "land":
        return {
          key: "land",
          color: "#f59e0b",
          label: "Land Footprint (cm²)",
          gradientId: "landGrad",
        };
    }
  };

  const currentMetric = getMetricDetails();

  // Helper to format query text
  const truncateText = (text: string, length = 45) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  // Helper to color code models
  const getModelBadgeStyles = (model: string) => {
    const m = model.toLowerCase();
    if (m.includes("claude")) {
      return "bg-amber-500/10 text-amber-450 border border-amber-550/20";
    } else if (m.includes("gpt-4")) {
      return "bg-emerald-500/10 text-emerald-450 border border-emerald-550/20";
    } else if (m.includes("gpt-3")) {
      return "bg-cyan-500/10 text-cyan-450 border border-cyan-550/20";
    }
    return "bg-indigo-500/10 text-indigo-450 border border-indigo-550/20";
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col gap-8 h-full">
        {/* Title Bar Shimmer */}
        <div className="h-10 w-64 bg-zinc-900 rounded-lg shimmer" />
        
        {/* Card Grid Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-zinc-900 rounded-2xl shimmer" />
          <div className="h-32 bg-zinc-900 rounded-2xl shimmer" />
          <div className="h-32 bg-zinc-900 rounded-2xl shimmer" />
        </div>
        
        {/* Chart Shimmer */}
        <div className="h-80 bg-zinc-900 rounded-2xl shimmer" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Title section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            AI Footprint Analytics
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time resource impact of your developer workspaces.</p>
        </div>

        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white transition-colors text-zinc-300 text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carbon Card */}
          <div className="glass-panel p-6 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-555 font-bold uppercase tracking-wider">Carbon Footprint</span>
              <span className="text-3xl font-extrabold text-white">{stats.totalCarbon} <span className="text-sm font-normal text-emerald-450">g CO₂e</span></span>
              <span className="text-xs text-zinc-500">Total emissions from token runtime</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-emerald-400" />
            </div>
          </div>

          {/* Water Card */}
          <div className="glass-panel p-6 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-555 font-bold uppercase tracking-wider">Water Consumption</span>
              <span className="text-3xl font-extrabold text-white">{stats.totalWaterLitres} <span className="text-sm font-normal text-cyan-455">Litres</span></span>
              <span className="text-xs text-zinc-500">Cooling tower evaporation metrics</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Droplet className="h-6 w-6 text-cyan-400" />
            </div>
          </div>

          {/* Land Card */}
          <div className="glass-panel p-6 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-555 font-bold uppercase tracking-wider">Land Occupancy</span>
              <span className="text-3xl font-extrabold text-white">{stats.totalLand} <span className="text-sm font-normal text-amber-455">cm²</span></span>
              <span className="text-xs text-zinc-500">Solar/wind grid surface footprint</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Compass className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>
      )}

      {/* Grid of Chart + Quick Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart Component - takes 2 cols on lg */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col gap-4 min-h-[360px]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Footprint Timeline</h2>
              <p className="text-xs text-zinc-500">Daily resource compilation for the last 30 days.</p>
            </div>
            
            {/* Metric Selector Tabs */}
            <div className="flex bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800 text-xs font-semibold">
              <button 
                onClick={() => setMetricTab("carbon")}
                className={`px-3 py-1 rounded-md transition-colors ${metricTab === "carbon" ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:text-white"}`}
              >
                Carbon
              </button>
              <button 
                onClick={() => setMetricTab("water")}
                className={`px-3 py-1 rounded-md transition-colors ${metricTab === "water" ? "bg-cyan-500 text-zinc-950" : "text-zinc-400 hover:text-white"}`}
              >
                Water
              </button>
              <button 
                onClick={() => setMetricTab("land")}
                className={`px-3 py-1 rounded-md transition-colors ${metricTab === "land" ? "bg-amber-500 text-zinc-950" : "text-zinc-400 hover:text-white"}`}
              >
                Land
              </button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[240px]">
            {isMounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id={currentMetric.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => {
                      const dateObj = new Date(str);
                      return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#090d16", 
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                    }}
                    labelFormatter={(str) => new Date(str).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={currentMetric.key} 
                    stroke={currentMetric.color} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#${currentMetric.gradientId})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-550">
                Loading visual timeline charts...
              </div>
            )}
          </div>
        </div>

        {/* Quick Simulator - takes 1 col on lg */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="h-4 w-4" />
              Developer Workbench
            </div>
            <h2 className="text-base font-bold text-white">Log API Call</h2>
            <p className="text-xs text-zinc-500 mt-1">Simulate an LLM query log to test your environmental dashboard metrics in real time.</p>

            <form onSubmit={handleQuickLog} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">System Prompt / Input Text</label>
                <textarea
                  value={mockPrompt}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMockPrompt(val);
                    // Automatically estimate token count (approx. 4 characters per token)
                    setMockTokens(Math.max(5, Math.ceil(val.length / 4)));
                  }}
                  placeholder="Ask something green..."
                  rows={2}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500/50 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Model Name</label>
                  <select
                    value={mockModel}
                    onChange={(e) => setMockModel(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {models.length > 0 ? (
                      models.map((model) => (
                        <option key={model.name} value={model.name} className="bg-zinc-950 text-white">
                          {model.displayName}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="llama-3-70b">Llama 3 70b</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Token Estimate</label>
                  <input
                    type="number"
                    value={mockTokens}
                    onChange={(e) => setMockTokens(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingQuery}
                className="w-full mt-2 py-2 bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loggingQuery ? "Logging..." : "Log Simulated Query"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {logMessage && (
            <div className={`text-xs mt-3 font-medium text-center ${logMessage.includes("Error") ? "text-red-400" : "text-emerald-400"}`}>
              {logMessage}
            </div>
          )}
        </div>

      </div>

      {/* Recent Queries Table */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Recent Query Logs</h2>
          <p className="text-xs text-zinc-500">Detail metrics per API query execution runtime.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-semibold h-9 uppercase tracking-wider">
                <th className="pb-2 pl-4">Prompt Input</th>
                <th className="pb-2">Model</th>
                <th className="pb-2 text-right">Tokens</th>
                <th className="pb-2 text-right">CO₂ (g)</th>
                <th className="pb-2 text-right">Water (ml)</th>
                <th className="pb-2 text-right">Land (cm²)</th>
                <th className="pb-2 text-right pr-4">Logged At</th>
              </tr>
            </thead>
            <tbody>
              {recentQueries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-zinc-550">
                    No queries logged this period. Use the Quick Log panel or the Advisor page to populate.
                  </td>
                </tr>
              ) : (
                recentQueries.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-b border-zinc-900/60 hover:bg-zinc-950/45 text-zinc-300 transition-colors h-11"
                  >
                    <td className="pl-4 font-mono font-medium max-w-xs truncate text-zinc-200" title={log.promptText}>
                      {truncateText(log.promptText)}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getModelBadgeStyles(log.modelUsed)}`}>
                        {log.modelUsed}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-zinc-400">{log.tokenCount}</td>
                    <td className="text-right font-medium text-emerald-400">{log.carbonGrams.toFixed(2)}g</td>
                    <td className="text-right font-medium text-cyan-400">{log.waterMl.toFixed(1)}ml</td>
                    <td className="text-right font-medium text-amber-400">{log.landCm2.toFixed(2)}cm²</td>
                    <td className="text-right text-zinc-500 pr-4">
                      {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
