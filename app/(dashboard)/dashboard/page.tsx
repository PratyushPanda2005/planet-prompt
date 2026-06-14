"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Leaf, 
  Cpu, 
  Droplet, 
  Compass, 
  RefreshCw, 
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
  const router = useRouter();
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
          color: "var(--accent-green)",
          label: "Carbon Footprint (g CO₂)",
        };
      case "water":
        return {
          key: "water",
          color: "var(--accent-cyan)",
          label: "Water Consumption (L)",
        };
      case "land":
        return {
          key: "land",
          color: "var(--accent-amber)",
          label: "Land Footprint (cm²)",
        };
    }
  };

  const currentMetric = getMetricDetails();

  const truncateText = (text: string, length = 45) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  const getModelBadgeStyles = (model: string) => {
    const m = model.toLowerCase();
    if (m.includes("claude")) {
      return "bg-accent-amber/10 text-accent-amber border border-accent-amber/20";
    } else if (m.includes("gpt-4")) {
      return "bg-accent-green/10 text-accent-green border border-accent-green/20";
    } else if (m.includes("gpt-3")) {
      return "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20";
    }
    return "bg-accent-green/10 text-accent-green border border-accent-green/20";
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col gap-8 h-full">
        {/* Title Bar Shimmer */}
        <div className="h-10 w-64 bg-card-bg rounded-md shimmer" />
        
        {/* Card Grid Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-card-bg rounded-md shimmer" />
          <div className="h-32 bg-card-bg rounded-md shimmer" />
          <div className="h-32 bg-card-bg rounded-md shimmer" />
        </div>
        
        {/* Chart Shimmer */}
        <div className="h-80 bg-card-bg rounded-md shimmer" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Title section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground flex items-center gap-2">
            AI Footprint Analytics
          </h1>
          <p className="text-xs text-text-muted mt-1">Real-time resource impact of your developer workspaces.</p>
        </div>

        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-card-border bg-card-bg/60 hover:bg-card-bg hover:text-foreground transition-colors text-text-muted text-xs font-medium cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carbon Card */}
          <div className="glass-panel p-6 flex items-center justify-between rounded-md">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Carbon Footprint</span>
              <span className="text-3xl font-medium text-foreground">{stats.totalCarbon} <span className="text-xs font-normal text-accent-green">g CO₂e</span></span>
              <span className="text-xs text-text-muted">Total emissions from token runtime</span>
            </div>
            <div className="h-12 w-12 rounded-sm bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-accent-green" />
            </div>
          </div>

          {/* Water Card */}
          <div className="glass-panel p-6 flex items-center justify-between rounded-md">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Water Consumption</span>
              <span className="text-3xl font-medium text-foreground">{stats.totalWaterLitres} <span className="text-xs font-normal text-accent-cyan">Litres</span></span>
              <span className="text-xs text-text-muted">Cooling tower evaporation metrics</span>
            </div>
            <div className="h-12 w-12 rounded-sm bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Droplet className="h-6 w-6 text-accent-cyan" />
            </div>
          </div>

          {/* Land Card */}
          <div className="glass-panel p-6 flex items-center justify-between rounded-md">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Land Occupancy</span>
              <span className="text-3xl font-medium text-foreground">{stats.totalLand} <span className="text-xs font-normal text-accent-amber">cm²</span></span>
              <span className="text-xs text-text-muted">Solar/wind grid surface footprint</span>
            </div>
            <div className="h-12 w-12 rounded-sm bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center">
              <Compass className="h-6 w-6 text-accent-amber" />
            </div>
          </div>
        </div>
      )}

      {/* Grid of Chart + Quick Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart Component - takes 2 cols on lg */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col gap-4 min-h-[360px] rounded-md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-medium text-foreground">Footprint Timeline</h2>
              <p className="text-xs text-text-muted">Daily resource compilation for the last 30 days.</p>
            </div>
            
            {/* Metric Selector Tabs */}
            <div className="flex bg-card-bg border border-card-border p-0.5 rounded-sm text-xs font-medium">
              <button 
                onClick={() => setMetricTab("carbon")}
                className={`px-3 py-1 rounded-sm transition-colors cursor-pointer ${metricTab === "carbon" ? "bg-accent-green text-background" : "text-text-muted hover:text-foreground"}`}
              >
                Carbon
              </button>
              <button 
                onClick={() => setMetricTab("water")}
                className={`px-3 py-1 rounded-sm transition-colors cursor-pointer ${metricTab === "water" ? "bg-accent-cyan text-background" : "text-text-muted hover:text-foreground"}`}
              >
                Water
              </button>
              <button 
                onClick={() => setMetricTab("land")}
                className={`px-3 py-1 rounded-sm transition-colors cursor-pointer ${metricTab === "land" ? "bg-accent-amber text-background" : "text-text-muted hover:text-foreground"}`}
              >
                Land
              </button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[240px]">
            {isMounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-muted)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => {
                      const dateObj = new Date(str);
                      return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--sidebar-bg)", 
                      borderColor: "var(--card-border)",
                      borderRadius: "0.125rem",
                      color: "var(--foreground)",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)"
                    }}
                    labelFormatter={(str) => new Date(str).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={currentMetric.key} 
                    stroke={currentMetric.color} 
                    strokeWidth={1.5}
                    fillOpacity={0.02} 
                    fill={currentMetric.color}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                Loading visual timeline charts...
              </div>
            )}
          </div>
        </div>

        {/* Quick Simulator - takes 1 col on lg */}
        <div className="glass-panel p-6 flex flex-col justify-between rounded-md">
          <div>
            <div className="flex items-center gap-1.5 text-accent-green text-[10px] font-medium uppercase tracking-wider mb-2">
              <Zap className="h-4 w-4" />
              Developer Workbench
            </div>
            <h2 className="text-base font-medium text-foreground">Log API Call</h2>
            <p className="text-xs text-text-muted mt-1">Simulate an LLM query log to test your environmental dashboard metrics in real time.</p>

            <form onSubmit={handleQuickLog} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">System Prompt / Input Text</label>
                <textarea
                  value={mockPrompt}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMockPrompt(val);
                    setMockTokens(Math.max(5, Math.ceil(val.length / 4)));
                  }}
                  placeholder="Ask something green..."
                  rows={2}
                  className="w-full text-xs bg-background border border-card-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent-green/50 resize-none font-normal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Model Name</label>
                  <select
                    value={mockModel}
                    onChange={(e) => setMockModel(e.target.value)}
                    className="w-full text-xs bg-background border border-card-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent-green/50 font-normal cursor-pointer"
                  >
                    {models.length > 0 ? (
                      models.map((model) => (
                        <option key={model.name} value={model.name} className="bg-background text-foreground">
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
                  <label className="block text-xs font-medium text-text-muted mb-1">Token Estimate</label>
                  <input
                    type="number"
                    value={mockTokens}
                    onChange={(e) => setMockTokens(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full text-xs bg-background border border-card-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent-green/50 font-normal"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={loggingQuery}
                  className="flex-1 py-2 bg-card-bg hover:bg-card-bg/80 hover:text-foreground border border-card-border text-foreground text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loggingQuery ? "Logging..." : "Log Query"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!mockPrompt.trim()) return;
                    router.push(`/advisor?prompt=${encodeURIComponent(mockPrompt)}&model=${encodeURIComponent(mockModel)}`);
                  }}
                  disabled={!mockPrompt.trim()}
                  className="flex-1 py-2 bg-accent-green hover:bg-accent-green/90 text-background text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Optimize Prompt
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>

          {logMessage && (
            <div className={`text-xs mt-3 font-medium text-center ${logMessage.includes("Error") ? "text-red-400" : "text-accent-green"}`}>
              {logMessage}
            </div>
          )}
        </div>

      </div>

      {/* Recent Queries Table */}
      <div className="glass-panel p-6 flex flex-col gap-4 rounded-md">
        <div>
          <h2 className="text-base font-medium text-foreground">Recent Query Logs</h2>
          <p className="text-xs text-text-muted">Detail metrics per API query execution runtime.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-medium h-9 uppercase tracking-wider">
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
                  <td colSpan={7} className="text-center py-6 text-text-muted">
                    No queries logged this period. Use the Quick Log panel or the Advisor page to populate.
                  </td>
                </tr>
              ) : (
                recentQueries.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-b border-card-border/60 hover:bg-card-bg/30 text-foreground transition-colors h-11"
                  >
                    <td className="pl-4 font-mono font-normal max-w-xs truncate text-foreground/90" title={log.promptText}>
                      {truncateText(log.promptText)}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-medium ${getModelBadgeStyles(log.modelUsed)}`}>
                        {log.modelUsed}
                      </span>
                    </td>
                    <td className="text-right font-normal text-foreground/80">{log.tokenCount}</td>
                    <td className="text-right font-normal text-accent-green">{log.carbonGrams.toFixed(2)}g</td>
                    <td className="text-right font-normal text-accent-cyan">{log.waterMl.toFixed(1)}ml</td>
                    <td className="text-right font-normal text-accent-amber">{log.landCm2.toFixed(2)}cm²</td>
                    <td className="text-right text-text-muted pr-4">
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
