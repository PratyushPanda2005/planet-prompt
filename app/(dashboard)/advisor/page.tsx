"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Cpu, 
  Droplet, 
  Compass, 
  ChevronRight, 
  Zap, 
  ArrowLeftRight,
  Database
} from "lucide-react";

interface PromptMetric {
  tokens: number;
  footprint: {
    carbonGrams: number;
    waterMl: number;
    landCm2: number;
  };
}

interface OptimizeResponse {
  success: boolean;
  isMock: boolean;
  alreadyOptimized?: boolean;
  original: {
    text: string;
  } & PromptMetric;
  optimized: {
    text: string;
  } & PromptMetric;
  savings: {
    tokens: number;
    percent: number;
  };
}

export default function AdvisorPage() {
  interface ModelOption {
    name: string;
    displayName: string;
  }

  const [models, setModels] = useState<ModelOption[]>([]);
  const [promptInput, setPromptInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-3-5-sonnet");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeResponse | null>(null);

  const runOptimization = async (prompt: string, model: string) => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setResult(null);
      setLogStatus("");
      
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: prompt,
          modelUsed: model,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      let currentModel = selectedModel;
      
      // Parse URL params first
      let urlPrompt = "";
      let urlModel = "";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        urlPrompt = params.get("prompt") || "";
        urlModel = params.get("model") || "";
        if (urlPrompt) {
          setPromptInput(urlPrompt);
        }
        if (urlModel) {
          setSelectedModel(urlModel);
          currentModel = urlModel;
        }
      }

      // Fetch models
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (data.success && data.models) {
          setModels(data.models);
          if (data.models.length > 0) {
            const names = data.models.map((m: any) => m.name);
            if (!names.includes(currentModel)) {
              currentModel = data.models[0].name;
              setSelectedModel(currentModel);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching models:", err);
      }

      // Run optimization if URL prompt exists
      if (urlPrompt) {
        await runOptimization(urlPrompt, currentModel);
        
        // Clean URL
        if (typeof window !== "undefined") {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    };
    initPage();
  }, []);
  
  // Copy action states
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);

  // Db logging action states
  const [loggingType, setLoggingType] = useState<"original" | "optimized" | null>(null);
  const [logStatus, setLogStatus] = useState("");

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    await runOptimization(promptInput, selectedModel);
  };

  const copyToClipboard = (text: string, type: "original" | "optimized") => {
    navigator.clipboard.writeText(text);
    if (type === "original") {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedOptimized(true);
      setTimeout(() => setCopiedOptimized(false), 2000);
    }
  };

  const handleLogToDb = async (type: "original" | "optimized") => {
    if (!result) return;
    const activeResult = type === "original" ? result.original : result.optimized;

    try {
      setLoggingType(type);
      setLogStatus("");
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: activeResult.text,
          modelUsed: selectedModel,
          tokenCount: activeResult.tokens,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLogStatus(`Successfully logged ${type} query to dashboard!`);
      } else {
        setLogStatus("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      setLogStatus("Failed to save query log.");
    } finally {
      setLoggingType(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Smart Prompt Advisor
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Rewrite system instructions to minimize token usage and environmental overhead.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Prompt Input Form Panel - takes 1 col on lg */}
        <div className="glass-panel p-6 flex flex-col justify-between h-fit">
          <form onSubmit={handleOptimize} className="space-y-4">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Rewrite Engine
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Model Architecture Target</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
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
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (default)</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="llama-3-70b">Llama 3 70b</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Original Prompt / Context</label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Paste your system instructions or long LLM prompts here..."
                rows={10}
                className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  Optimizing Prompt...
                </>
              ) : (
                <>
                  Analyze & Optimize
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Advisor Comparison Result Panel - takes 2 cols on lg */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {!result && !loading && (
            <div className="glass-panel p-10 flex flex-col items-center justify-center text-center h-[430px] border-dashed">
              <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 mb-4 animate-pulse">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <h3 className="text-zinc-300 font-bold text-sm">Waiting for Analysis</h3>
              <p className="text-xs text-zinc-550 max-w-xs mt-1.5">
                Paste your prompt in the editor card to estimate its environmental footprint and generate a leaner rewrite.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel p-10 flex flex-col items-center justify-center text-center h-[430px]">
              <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-zinc-300 font-bold text-sm">Consulting AI Advisor</h3>
              <p className="text-xs text-zinc-550 max-w-xs mt-1.5">
                Calculating carbon metrics and trimming redundant phrases...
              </p>
            </div>
          )}

          {result && result.alreadyOptimized ? (
            <div className="glass-panel p-10 flex flex-col items-center justify-center text-center h-[430px] border-emerald-500/30 bg-emerald-500/5">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-emerald-400 font-extrabold text-2xl tracking-tight">Great prompt, already optimized!</h3>
              <p className="text-zinc-400 max-w-sm mt-3 text-sm">
                Your prompt is already highly efficient and clear. No further optimization is required. You are good to go!
              </p>
              
              <div className="mt-8 bg-zinc-950/50 border border-emerald-950/20 p-4 rounded-xl flex items-center gap-6 text-left">
                <div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Original Token Cost</div>
                  <div className="text-xl font-bold text-zinc-200">{result.original.tokens}</div>
                </div>
                <div className="w-px h-8 bg-zinc-800"></div>
                <div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Carbon Footprint</div>
                  <div className="text-xl font-bold text-zinc-200 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    {result.original.footprint.carbonGrams.toFixed(2)}g
                  </div>
                </div>
              </div>
            </div>
          ) : result && (
            <>
              {/* Savings Highlight Badge */}
              <div className="glass-panel p-4 bg-emerald-500/5 border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Resource Savings: {result.savings.percent}%</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Reduced tokens by <span className="font-semibold text-emerald-400">{result.savings.tokens}</span> units.
                    </p>
                  </div>
                </div>

                {result.isMock && (
                  <span className="text-[10px] text-zinc-550 border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded-full font-semibold">
                    Heuristic Fallback Engine
                  </span>
                )}
              </div>

              {/* Side-by-Side Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Original Prompt Card */}
                <div className="glass-panel p-5 flex flex-col justify-between gap-4 bg-zinc-950/20">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Original Prompt</span>
                      <button 
                        onClick={() => copyToClipboard(result.original.text, "original")}
                        className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-900 transition-colors"
                        title="Copy original"
                      >
                        {copiedOriginal ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-3 h-40 overflow-y-auto text-xs font-mono text-zinc-400 whitespace-pre-wrap">
                      {result.original.text}
                    </div>
                  </div>

                  {/* Footprint details sub-card */}
                  <div className="border-t border-zinc-900 pt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Footprint Breakdown</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-850/50">
                        <Cpu className="h-3.5 w-3.5 mx-auto text-zinc-500 mb-1" />
                        <p className="text-xs font-bold text-zinc-300">{result.original.footprint.carbonGrams.toFixed(2)}g</p>
                        <p className="text-[9px] text-zinc-500">CO₂</p>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-850/50">
                        <Droplet className="h-3.5 w-3.5 mx-auto text-zinc-500 mb-1" />
                        <p className="text-xs font-bold text-zinc-300">{result.original.footprint.waterMl.toFixed(1)}ml</p>
                        <p className="text-[9px] text-zinc-500">H₂O</p>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-850/50">
                        <Compass className="h-3.5 w-3.5 mx-auto text-zinc-500 mb-1" />
                        <p className="text-xs font-bold text-zinc-300">{result.original.footprint.landCm2.toFixed(2)}cm²</p>
                        <p className="text-[9px] text-zinc-500">Land</p>
                      </div>
                    </div>
                    
                    <button
                      disabled={loggingType !== null}
                      onClick={() => handleLogToDb("original")}
                      className="w-full mt-1.5 py-1.5 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-800 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Database className="h-3.5 w-3.5" />
                      {loggingType === "original" ? "Logging..." : "Log Original (Unoptimised)"}
                    </button>
                  </div>
                </div>

                {/* Optimized Prompt Card */}
                <div className="glass-panel p-5 flex flex-col justify-between gap-4 border-emerald-500/20 bg-emerald-500/[0.01]">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Optimized Suggestions</span>
                      <button 
                        onClick={() => copyToClipboard(result.optimized.text, "optimized")}
                        className="text-emerald-450 hover:text-emerald-300 p-1 rounded hover:bg-emerald-950/20 transition-colors"
                        title="Copy optimized text"
                      >
                        {copiedOptimized ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-emerald-400" />}
                      </button>
                    </div>
                    <div className="bg-zinc-950/50 border border-emerald-950/10 rounded-lg p-3 h-40 overflow-y-auto text-xs font-mono text-zinc-200 whitespace-pre-wrap">
                      {result.optimized.text}
                    </div>
                  </div>

                  {/* Footprint details sub-card */}
                  <div className="border-t border-zinc-900 pt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Footprint Breakdown</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-emerald-950/5 p-2 rounded-lg border border-emerald-500/10">
                        <Cpu className="h-3.5 w-3.5 mx-auto text-emerald-400 mb-1" />
                        <p className="text-xs font-bold text-white">{result.optimized.footprint.carbonGrams.toFixed(2)}g</p>
                        <p className="text-[9px] text-emerald-450">CO₂</p>
                      </div>
                      <div className="bg-cyan-950/5 p-2 rounded-lg border border-cyan-500/10">
                        <Droplet className="h-3.5 w-3.5 mx-auto text-cyan-400 mb-1" />
                        <p className="text-xs font-bold text-white">{result.optimized.footprint.waterMl.toFixed(1)}ml</p>
                        <p className="text-[9px] text-cyan-450">H₂O</p>
                      </div>
                      <div className="bg-amber-950/5 p-2 rounded-lg border border-amber-500/10">
                        <Compass className="h-3.5 w-3.5 mx-auto text-amber-400 mb-1" />
                        <p className="text-xs font-bold text-white">{result.optimized.footprint.landCm2.toFixed(2)}cm²</p>
                        <p className="text-[9px] text-amber-450">Land</p>
                      </div>
                    </div>

                    <button
                      disabled={loggingType !== null}
                      onClick={() => handleLogToDb("optimized")}
                      className="w-full mt-1.5 py-1.5 bg-emerald-500 hover:bg-emerald-450 text-zinc-950 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                    >
                      <Database className="h-3.5 w-3.5" />
                      {loggingType === "optimized" ? "Logging..." : "Log & Execute Optimized"}
                    </button>
                  </div>
                </div>

              </div>

              {logStatus && (
                <div className={`text-xs font-semibold text-center ${logStatus.includes("Error") ? "text-red-400" : "text-emerald-405 animate-pulse"}`}>
                  {logStatus}
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
