"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Cpu, 
  Droplet, 
  Compass, 
  RefreshCw, 
  Calendar,
  Sparkles,
  Car,
  Smartphone,
  GlassWater
} from "lucide-react";

interface Report {
  id: string;
  month: string;
  totalCarbon: number;
  totalWater: number;
  totalLand: number;
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
  };
  report: Report | null;
}

export default function ReportPage() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Fetch active report billing months dynamically from the database
  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const res = await fetch("/api/report/months");
        const data = await res.json();
        if (data.success && data.months && data.months.length > 0) {
          setAvailableMonths(data.months);
          setSelectedMonth(data.months[0]);
        } else {
          // Fallback to static last 6 months list if DB endpoint has no values or fails
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
        console.error("Error fetching available months:", err);
      }
    };
    fetchMonths();
  }, []);

  const fetchReport = async (month: string, forceRegenerate = false) => {
    if (!month) return;
    try {
      setLoading(true);
      const url = `/api/report?month=${month}${forceRegenerate ? "&regenerate=true" : ""}`;
      const res = await fetch(url);
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      fetchReport(selectedMonth);
    }
  }, [selectedMonth]);

  const handleRegenerate = () => {
    setRegenerating(true);
    fetchReport(selectedMonth, true);
  };

  // Human readable month name
  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Calculate equivalent comparisons
  const getCarbonComparison = (grams: number) => {
    // 1 km in electric car ≈ 120 grams of CO2, or 1 hour of light bulb ≈ 60 grams, etc.
    const carMeters = Math.round((grams / 120) * 1000);
    const bulbHours = Math.round(grams / 9.0); // 9W LED bulb is ~10g CO2 per hour in mixed grid
    const phoneCharges = Math.round(grams / 8.3); // 1 smartphone charge is ~8.3g CO2
    return { carMeters, bulbHours, phoneCharges };
  };

  const getWaterComparison = (ml: number) => {
    // 1 water bottle (500ml)
    const bottles = Number((ml / 500).toFixed(1));
    return { bottles };
  };

  if (loading && !data) {
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
        
        {/* Report block Shimmer */}
        <div className="h-64 bg-card-bg border border-card-border rounded-sm shimmer" />
      </div>
    );
  }

  const comparison = data && !data.empty ? getCarbonComparison(data.stats.totalCarbon) : null;
  const waterComparison = data && !data.empty ? getWaterComparison(data.stats.totalWater) : null;

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground flex items-center gap-2">
            Monthly Impact Reports
          </h1>
          <p className="text-sm text-text-muted mt-1">Compiled resource narratives and environmental benchmarks.</p>
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

      {data?.empty ? (
        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center h-[380px] border-dashed">
          <div className="h-14 w-14 rounded-full bg-card-bg border border-card-border flex items-center justify-center text-text-muted mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-foreground font-semibold text-sm">No Data Recorded for {formatMonthName(selectedMonth)}</h3>
          <p className="text-xs text-text-muted max-w-sm mt-1.5">
            You haven&apos;t logged any API workload queries during this calendar period. Log some mock data on the dashboard or run the prompt advisor to generate reports.
          </p>
        </div>
      ) : (
        data && (
          <>
            {/* Monthly Aggregates cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Carbon */}
              <div className="glass-panel p-6 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Carbon Emissions</span>
                  <span className="text-3xl font-semibold text-foreground">
                    {data.stats.totalCarbon} <span className="text-sm font-normal text-accent-green">g CO₂e</span>
                  </span>
                  <span className="text-xs text-text-muted">{data.stats.queryCount} total logged queries</span>
                </div>
                <div className="h-12 w-12 rounded-sm bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-accent-green" />
                </div>
              </div>

              {/* Water */}
              <div className="glass-panel p-6 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Water Consumption</span>
                  <span className="text-3xl font-semibold text-foreground">
                    {data.stats.totalWaterLitres} <span className="text-sm font-normal text-accent-cyan">Litres</span>
                  </span>
                  <span className="text-xs text-text-muted">{Number((data.stats.totalWater).toFixed(0))} ml raw volume</span>
                </div>
                <div className="h-12 w-12 rounded-sm bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
                  <Droplet className="h-6 w-6 text-accent-cyan" />
                </div>
              </div>

              {/* Land */}
              <div className="glass-panel p-6 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Land Occupancy</span>
                  <span className="text-3xl font-semibold text-foreground">
                    {data.stats.totalLand} <span className="text-sm font-normal text-accent-amber">cm²</span>
                  </span>
                  <span className="text-xs text-text-muted">Surface area impact from grid sources</span>
                </div>
                <div className="h-12 w-12 rounded-sm bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center">
                  <Compass className="h-6 w-6 text-accent-amber" />
                </div>
              </div>
            </div>

            {/* AI Narrative Section */}
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
                  disabled={regenerating || loading}
                  className="flex items-center gap-1.5 bg-card-bg border border-card-border hover:bg-card-bg/85 hover:text-foreground rounded-sm text-xs font-semibold text-text-muted cursor-pointer disabled:opacity-50 transition-colors px-3 py-1"
                >
                  <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
                  {regenerating ? "Regenerating..." : "Regenerate Analysis"}
                </button>
              </div>

              {regenerating ? (
                <div className="py-6 flex flex-col gap-2 animate-pulse">
                  <div className="h-4 bg-card-bg rounded w-full" />
                  <div className="h-4 bg-card-bg rounded w-5/6" />
                  <div className="h-4 bg-card-bg rounded w-4/5" />
                </div>
              ) : (
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  {data.report?.aiNarrative}
                </p>
              )}
            </div>

            {/* Comparison Benchmarks block */}
            {comparison && waterComparison && (
              <div className="glass-panel p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Impact Equivalence Benchmarks</h3>
                  <p className="text-xs text-text-muted">Visualizing what your model calculations equal in everyday physical actions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Car Driving */}
                  <div className="bg-card-bg/40 border border-card-border/50 p-4 rounded-sm flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-sm bg-card-bg border border-card-border flex items-center justify-center">
                      <Car className="h-5 w-5 text-accent-green" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Electric Vehicle</h4>
                      <p className="text-xl font-semibold text-foreground mt-1">{comparison.carMeters} <span className="text-xs font-normal text-text-muted">meters</span></p>
                      <p className="text-[11px] text-text-muted mt-1">Driving distance in a Tesla Model 3 matching your query CO₂ emissions.</p>
                    </div>
                  </div>

                  {/* Smartphone charges */}
                  <div className="bg-card-bg/40 border border-card-border/50 p-4 rounded-sm flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-sm bg-card-bg border border-card-border flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-accent-cyan" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Smartphone Charges</h4>
                      <p className="text-xl font-semibold text-foreground mt-1">{comparison.phoneCharges} <span className="text-xs font-normal text-text-muted">cycles</span></p>
                      <p className="text-[11px] text-text-muted mt-1">Equivalent to standard lithium-ion cell recharge sequences.</p>
                    </div>
                  </div>

                  {/* Water bottles */}
                  <div className="bg-card-bg/40 border border-card-border/50 p-4 rounded-sm flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-sm bg-card-bg border border-card-border flex items-center justify-center">
                      <GlassWater className="h-5 w-5 text-accent-amber" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Bottled Water</h4>
                      <p className="text-xl font-semibold text-foreground mt-1">{waterComparison.bottles} <span className="text-xs font-normal text-text-muted">bottles</span></p>
                      <p className="text-[11px] text-text-muted mt-1">Number of standard 500ml drinking bottles needed to cool server cabinets.</p>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
