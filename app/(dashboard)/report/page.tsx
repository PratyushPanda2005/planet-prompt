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
        <div className="h-10 w-64 bg-zinc-900 rounded-lg shimmer" />
        
        {/* Card Grid Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-zinc-900 rounded-2xl shimmer" />
          <div className="h-32 bg-zinc-900 rounded-2xl shimmer" />
          <div className="h-32 bg-zinc-900 rounded-2xl shimmer" />
        </div>
        
        {/* Report block Shimmer */}
        <div className="h-64 bg-zinc-900 rounded-2xl shimmer" />
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Monthly Impact Reports
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Compiled resource narratives and environmental benchmarks.</p>
        </div>

        {/* Month Picker dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-350 text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-zinc-950 text-white">
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {data?.empty ? (
        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center h-[380px] border-dashed">
          <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-zinc-300 font-bold text-sm">No Data Recorded for {formatMonthName(selectedMonth)}</h3>
          <p className="text-xs text-zinc-550 max-w-sm mt-1.5">
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
                  <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">Carbon Emissions</span>
                  <span className="text-3xl font-extrabold text-white">
                    {data.stats.totalCarbon} <span className="text-sm font-normal text-emerald-450">g CO₂e</span>
                  </span>
                  <span className="text-xs text-zinc-500">{data.stats.queryCount} total logged queries</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-emerald-400" />
                </div>
              </div>

              {/* Water */}
              <div className="glass-panel p-6 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">Water Consumption</span>
                  <span className="text-3xl font-extrabold text-white">
                    {data.stats.totalWaterLitres} <span className="text-sm font-normal text-cyan-455">Litres</span>
                  </span>
                  <span className="text-xs text-zinc-500">{Number((data.stats.totalWater).toFixed(0))} ml raw volume</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Droplet className="h-6 w-6 text-cyan-400" />
                </div>
              </div>

              {/* Land */}
              <div className="glass-panel p-6 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">Land Occupancy</span>
                  <span className="text-3xl font-extrabold text-white">
                    {data.stats.totalLand} <span className="text-sm font-normal text-amber-455">cm²</span>
                  </span>
                  <span className="text-xs text-zinc-500">Surface area impact from grid sources</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Compass className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </div>

            {/* AI Narrative Section */}
            <div className="glass-panel p-6 flex flex-col gap-4 border-emerald-500/15 bg-emerald-500/[0.01]">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                    <Sparkles className="h-4 w-4 text-emerald-450" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">AI-Generated Sustainability Summary</h3>
                </div>

                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loading}
                  className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-lg text-xs font-semibold text-zinc-400 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
                  {regenerating ? "Regenerating..." : "Regenerate Analysis"}
                </button>
              </div>

              {regenerating ? (
                <div className="py-6 flex flex-col gap-2 animate-pulse">
                  <div className="h-4 bg-zinc-900 rounded w-full" />
                  <div className="h-4 bg-zinc-900 rounded w-5/6" />
                  <div className="h-4 bg-zinc-900 rounded w-4/5" />
                </div>
              ) : (
                <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                  {data.report?.aiNarrative}
                </p>
              )}
            </div>

            {/* Comparison Benchmarks block */}
            {comparison && waterComparison && (
              <div className="glass-panel p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-white">Impact Equivalence Benchmarks</h3>
                  <p className="text-xs text-zinc-500">Visualizing what your model calculations equal in everyday physical actions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Car Driving */}
                  <div className="bg-zinc-900/40 border border-zinc-850/50 p-4 rounded-xl flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Car className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Electric Vehicle</h4>
                      <p className="text-xl font-extrabold text-white mt-1">{comparison.carMeters} <span className="text-xs font-semibold text-zinc-550">meters</span></p>
                      <p className="text-[11px] text-zinc-500 mt-1">Driving distance in a Tesla Model 3 matching your query CO₂ emissions.</p>
                    </div>
                  </div>

                  {/* Smartphone charges */}
                  <div className="bg-zinc-900/40 border border-zinc-850/50 p-4 rounded-xl flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Smartphone Charges</h4>
                      <p className="text-xl font-extrabold text-white mt-1">{comparison.phoneCharges} <span className="text-xs font-semibold text-zinc-550">cycles</span></p>
                      <p className="text-[11px] text-zinc-500 mt-1">Equivalent to standard lithium-ion cell recharge sequences.</p>
                    </div>
                  </div>

                  {/* Water bottles */}
                  <div className="bg-zinc-900/40 border border-zinc-850/50 p-4 rounded-xl flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <GlassWater className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bottled Water</h4>
                      <p className="text-xl font-extrabold text-white mt-1">{waterComparison.bottles} <span className="text-xs font-semibold text-zinc-550">bottles</span></p>
                      <p className="text-[11px] text-zinc-500 mt-1">Number of standard 500ml drinking bottles needed to cool server cabinets.</p>
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
