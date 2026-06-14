"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { 
  Cpu, 
  Droplet, 
  Compass, 
  RefreshCw, 
  Calendar,
  Sparkles,
  FileText,
  Users
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

interface MemberUsage {
  userId: string;
  name: string;
  email: string;
  totalCarbon: number;
  totalWater: number;
  totalWaterLitres: number;
  totalLand: number;
  queryCount: number;
}

interface Report {
  id: string;
  month: string;
  totalCarbon: number;
  totalWater: number;
  totalLand: number;
  memberCount: number;
  aiNarrative: string;
}

interface ReportResponse {
  success: boolean;
  month: string;
  empty: boolean;
  stats: {
    totalCarbon: number;
    totalWater: number;
    totalWaterLitres: number;
    totalLand: number;
    queryCount: number;
    memberCount: number;
  };
  report: Report | null;
}

export default function OrgDashboardPage() {
  const router = useRouter();
  const { isLoaded, orgId, orgRole } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [members, setMembers] = useState<MemberUsage[]>([]);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  const [statsLoading, setStatsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [metricTab, setMetricTab] = useState<"carbon" | "water" | "land">("carbon");

  // Redirect if not loaded or not org admin
  useEffect(() => {
    if (isLoaded) {
      if (!orgId || orgRole !== "org:admin") {
        router.replace("/dashboard");
      }
    }
  }, [isLoaded, orgId, orgRole, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch("/api/org/stats");
      const resData = await res.json();
      if (resData.success) {
        setStats(resData.stats);
        setChartData(resData.chartData);
      }
    } catch (err) {
      console.error("Error fetching org stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const res = await fetch("/api/org/members");
      const resData = await res.json();
      if (resData.success) {
        setMembers(resData.members);
      }
    } catch (err) {
      console.error("Error fetching org members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchMonths = async () => {
    try {
      const res = await fetch("/api/org/months");
      const resData = await res.json();
      if (resData.success && resData.months && resData.months.length > 0) {
        setAvailableMonths(resData.months);
        setSelectedMonth(resData.months[0]);
      } else {
        // Fallback to static last 6 months
        const months: string[] = [];
        const date = new Date();
        for (let i = 0; i < 6; i++) {
          const year = date.getFullYear();
          const monthStr = String(date.getMonth() + 1).padStart(2, "0");
          months.push(`${year}-${monthStr}`);
          date.setMonth(date.getMonth() - 1);
        }
        setAvailableMonths(months);
        setSelectedMonth(months[0]);
      }
    } catch (err) {
      console.error("Error fetching org months:", err);
    }
  };

  const fetchReport = async (month: string, forceRegenerate = false) => {
    if (!month) return;
    try {
      setReportLoading(true);
      const url = `/api/org/report?month=${month}${forceRegenerate ? "&regenerate=true" : ""}`;
      const res = await fetch(url);
      const resData = await res.json();
      if (resData.success) {
        setReportData(resData);
      }
    } catch (err) {
      console.error("Error fetching org report:", err);
    } finally {
      setReportLoading(false);
      setRegenerating(false);
    }
  };

  // Load baseline statistics and list of months
  useEffect(() => {
    if (orgId && orgRole === "org:admin") {
      fetchStats();
      fetchMembers();
      fetchMonths();
    }
  }, [orgId, orgRole]);

  // Load monthly report details when selected month switches
  useEffect(() => {
    if (orgId && orgRole === "org:admin" && selectedMonth) {
      fetchReport(selectedMonth);
    }
  }, [orgId, orgRole, selectedMonth]);

  const handleRegenerate = () => {
    setRegenerating(true);
    fetchReport(selectedMonth, true);
  };

  const handleRefreshAll = () => {
    fetchStats();
    fetchMembers();
    if (selectedMonth) {
      fetchReport(selectedMonth);
    }
  };

  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getMetricDetails = () => {
    switch (metricTab) {
      case "carbon":
        return {
          key: "carbon",
          color: "#10b981",
          label: "Carbon Footprint (g CO₂)",
          gradientId: "carbonGradOrg",
        };
      case "water":
        return {
          key: "water",
          color: "#06b6d4",
          label: "Water Consumption (L)",
          gradientId: "waterGradOrg",
        };
      case "land":
        return {
          key: "land",
          color: "#f59e0b",
          label: "Land Footprint (cm²)",
          gradientId: "landGradOrg",
        };
    }
  };

  const currentMetric = getMetricDetails();
  if (!isLoaded || !orgId || orgRole !== "org:admin") {
    return (
      <div className="flex flex-col gap-8 h-full justify-center items-center py-20 text-text-muted text-xs">
        <div className="h-8 w-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin mb-3" />
        Redirecting to dashboard...
      </div>
    );
  }

  // Loading placeholder until initial stats load
  if (statsLoading && !stats) {
    return (
      <div className="flex flex-col gap-8 h-full">
        {/* Title Bar Shimmer */}
        <div className="h-10 w-64 bg-card-bg border border-card-border rounded-sm shimmer" />
        
        {/* Card Grid Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-card-bg border border-card-border rounded-sm shimmer" />
          <div className="h-32 bg-card-bg border border-card-border rounded-sm shimmer" />
          <div className="h-32 bg-card-bg border border-card-border rounded-sm shimmer" />
        </div>
        
        {/* Chart Shimmer */}
        <div className="h-80 bg-card-bg border border-card-border rounded-sm shimmer" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Title block */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-accent-green" />
            Organization Sustainability Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Cumulative footprint and leaderboards for organization workspaces.
          </p>
        </div>

        <button 
          onClick={handleRefreshAll}
          disabled={statsLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-card-border bg-card-bg/60 hover:bg-card-bg hover:text-foreground transition-colors text-text-muted text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${statsLoading ? "animate-spin" : ""}`} />
          {statsLoading ? "Refreshing..." : "Refresh Org Data"}
        </button>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carbon Card */}
          <div className="glass-panel p-6 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Carbon Footprint</span>
              <span className="text-3xl font-semibold text-foreground">
                {stats.totalCarbon} <span className="text-sm font-normal text-accent-green">g CO₂e</span>
              </span>
              <span className="text-xs text-text-muted">Cumulative organization emissions</span>
            </div>
            <div className="h-12 w-12 rounded-sm bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-accent-green" />
            </div>
          </div>

          {/* Water Card */}
          <div className="glass-panel p-6 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Water Consumption</span>
              <span className="text-3xl font-semibold text-foreground">
                {stats.totalWaterLitres} <span className="text-sm font-normal text-accent-cyan">Litres</span>
              </span>
              <span className="text-xs text-text-muted">Cooling tower evaporation metrics</span>
            </div>
            <div className="h-12 w-12 rounded-sm bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Droplet className="h-6 w-6 text-accent-cyan" />
            </div>
          </div>

          {/* Land Card */}
          <div className="glass-panel p-6 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Land Occupancy</span>
              <span className="text-3xl font-semibold text-foreground">
                {stats.totalLand} <span className="text-sm font-normal text-accent-amber">cm²</span>
              </span>
              <span className="text-xs text-text-muted">Grid hardware infrastructure footprint</span>
            </div>
            <div className="h-12 w-12 rounded-sm bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center">
              <Compass className="h-6 w-6 text-accent-amber" />
            </div>
          </div>
        </div>
      )}

      {/* Chart Panel */}
      <div className="glass-panel p-6 flex flex-col gap-4 min-h-[360px]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Organization Footprint Timeline</h2>
            <p className="text-xs text-text-muted">Daily resource compilation for the last 30 days.</p>
          </div>
          
          {/* Metric Selector Tabs */}
          <div className="flex bg-card-bg/85 p-0.5 rounded-sm border border-card-border text-xs font-semibold">
            <button 
              onClick={() => setMetricTab("carbon")}
              className={`px-3 py-1 rounded-sm transition-colors cursor-pointer ${metricTab === "carbon" ? "bg-accent-green text-[#FAFBF9]" : "text-text-muted hover:text-foreground"}`}
            >
              Carbon
            </button>
            <button 
              onClick={() => setMetricTab("water")}
              className={`px-3 py-1 rounded-sm transition-colors cursor-pointer ${metricTab === "water" ? "bg-accent-cyan text-[#FAFBF9]" : "text-text-muted hover:text-foreground"}`}
            >
              Water
            </button>
            <button 
              onClick={() => setMetricTab("land")}
              className={`px-3 py-1 rounded-sm transition-colors cursor-pointer ${metricTab === "land" ? "bg-accent-amber text-[#FAFBF9]" : "text-text-muted hover:text-foreground"}`}
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
                    backgroundColor: "var(--card-bg)", 
                    borderColor: "var(--card-border)",
                    borderRadius: "4px",
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
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#${currentMetric.gradientId})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted min-h-[260px]">
              No organization query logs found to compile timeline charts.
            </div>
          )}
        </div>
      </div>

      {/* AI Narrative Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Monthly AI Narrative Analyses</h2>
            <p className="text-xs text-text-muted">Review monthly summaries and benchmarks for organization performance.</p>
          </div>

          {/* Month Picker dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-card-border bg-card-bg/60 text-text-muted text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5 text-text-muted" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-foreground focus:outline-none cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m} className="bg-background text-foreground">
                    {formatMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {reportLoading && !reportData ? (
          <div className="glass-panel p-6 h-[120px] shimmer" />
        ) : reportData?.empty ? (
          <div className="glass-panel p-10 flex flex-col items-center justify-center text-center h-[160px] border-dashed">
            <div className="h-8 w-8 rounded-full bg-card-bg border border-card-border flex items-center justify-center text-text-muted mb-2">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="text-foreground font-semibold text-xs">No Data Logged in {formatMonthName(selectedMonth)}</h3>
          </div>
        ) : (
          reportData && (
            <div className="glass-panel p-6 flex flex-col gap-4 border-accent-green/20 bg-accent-green/[0.01]">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-sm bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                    <Sparkles className="h-4 w-4 text-accent-green" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">AI-Generated Sustainability Summary</h3>
                </div>

                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || reportLoading}
                  className="flex items-center gap-1.5 px-3 py-1 bg-card-bg border border-card-border hover:bg-card-bg/85 hover:text-foreground rounded-sm text-xs font-semibold text-text-muted cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
                  {regenerating ? "Regenerating..." : "Regenerate Analysis"}
                </button>
              </div>

              {regenerating ? (
                <div className="py-4 flex flex-col gap-2 animate-pulse">
                  <div className="h-4 bg-card-bg rounded w-full" />
                  <div className="h-4 bg-card-bg rounded w-5/6" />
                </div>
              ) : (
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  {reportData.report?.aiNarrative}
                </p>
              )}
            </div>
          )
        )}
      </div>

      {/* Member Leaderboard Table */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Member Leaderboard</h2>
          <p className="text-xs text-text-muted">Environmental footprint breakdown per active organization member.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-semibold h-9 uppercase tracking-wider">
                <th className="pb-2 pl-4">Member Name / Email</th>
                <th className="pb-2 text-right">Queries</th>
                <th className="pb-2 text-right">CO₂ (g)</th>
                <th className="pb-2 text-right">Water (L)</th>
                <th className="pb-2 text-right pr-4">Land (cm²)</th>
              </tr>
            </thead>
            <tbody>
              {membersLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-text-muted animate-pulse">
                    Loading member leaderboard data...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-text-muted">
                    No active members have logged queries in this organization yet.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr 
                    key={member.userId} 
                    className="border-b border-card-border/60 hover:bg-card-bg/40 text-text-muted hover:text-foreground transition-colors h-11"
                  >
                    <td className="pl-4">
                      <div className="font-semibold text-foreground">{member.name || "Unknown User"}</div>
                      <div className="text-[10px] text-text-muted">{member.email}</div>
                    </td>
                    <td className="text-right font-semibold text-text-muted">{member.queryCount}</td>
                    <td className="text-right font-medium text-accent-green">{member.totalCarbon}g</td>
                    <td className="text-right font-medium text-accent-cyan">{member.totalWaterLitres}L</td>
                    <td className="text-right font-medium text-accent-amber pr-4">{member.totalLand}cm²</td>
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
