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

      if (urlPrompt) {
        await runOptimization(urlPrompt, currentModel);

        if (typeof window !== "undefined") {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    };
    initPage();
  }, []);

  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);

  const [loggingType, setLoggingType] = useState<"original" | "optimized" | null>(null);
  const [logStatus, setLogStatus] = useState("");

  const [runOutput, setRunOutput] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const [runType, setRunType] = useState<"original" | "optimized" | null>(null);
  const [copiedRunOutput, setCopiedRunOutput] = useState(false);

  const copyRunOutput = () => {
    navigator.clipboard.writeText(runOutput);
    setCopiedRunOutput(true);
    setTimeout(() => setCopiedRunOutput(false), 2000);
  };

  const handleRunPrompt = async (type: "original" | "optimized") => {
    if (!result) return;
    const activePrompt = type === "original" ? result.original.text : result.optimized.text;
    try {
      setRunLoading(true);
      setRunType(type);
      setRunOutput("");
      
      // Automatically log to database history
      handleLogToDb(type).catch(err => console.error("Failed to auto-log to db:", err));

      const res = await fetch("/api/run-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText: activePrompt }),
      });
      const data = await res.json();
      if (data.success) {
        setRunOutput(data.output || "");
      } else {
        setRunOutput(`Error: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      setRunOutput(`Failed to run prompt: ${err.message || err}`);
    } finally {
      setRunLoading(false);
      setRunType(null);
    }
  };

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunOutput("");
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
        if (result.alreadyOptimized) {
          setLogStatus("Successfully logged query to dashboard!");
        } else {
          setLogStatus(`Successfully logged ${type} query to dashboard!`);
        }
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
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground flex items-center gap-2">
          Smart Prompt Advisor
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Rewrite system instructions to minimize token usage and environmental overhead.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Prompt Input Form Panel - takes 1 col on lg */}
        <div className="glass-panel p-6 flex flex-col justify-between h-fit rounded-md">
          <form onSubmit={handleOptimize} className="space-y-4">
            <div className="flex items-center gap-1.5 text-accent-cyan text-[10px] font-medium uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Rewrite Engine
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Model Architecture Target</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full text-xs bg-background border border-card-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent-green/50 cursor-pointer font-normal"
              >
                {models.length > 0 ? (
                  models.map((model) => (
                    <option key={model.name} value={model.name} className="bg-background text-foreground">
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
              <label className="block text-xs font-medium text-text-muted mb-1.5">Original Prompt / Context</label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Paste your system instructions or long LLM prompts here..."
                rows={10}
                className="w-full text-xs bg-background border border-card-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent-green/50 resize-none font-mono font-normal"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent-green hover:bg-accent-green/90 text-background font-medium rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
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
            <div className="glass-panel p-10 flex flex-col items-center justify-center text-center h-[430px] border-dashed rounded-md">
              <div className="h-14 w-14 rounded-sm bg-card-bg border border-card-border flex items-center justify-center text-text-muted mb-4 animate-pulse">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <h3 className="text-foreground font-medium text-sm">Waiting for Analysis</h3>
              <p className="text-xs text-text-muted max-w-xs mt-1.5">
                Paste your prompt in the editor card to estimate its environmental footprint and generate a leaner rewrite.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel p-10 flex flex-col items-center justify-center text-center h-[430px] rounded-md">
              <div className="h-10 w-10 border-2 border-accent-green border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-foreground font-medium text-sm">Consulting AI Advisor</h3>
              <p className="text-xs text-text-muted max-w-xs mt-1.5">
                Calculating carbon metrics and trimming redundant phrases...
              </p>
            </div>
          )}

          {result && result.alreadyOptimized ? (
            <div className="glass-panel p-8 flex flex-col items-center justify-center text-center min-h-[430px] h-auto border-accent-green/30 bg-accent-green/5 rounded-md">
              <div className="h-16 w-16 rounded-sm bg-accent-green/25 border border-accent-green/50 flex items-center justify-center text-accent-green mb-6">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-accent-green font-medium text-2xl tracking-tight">Great prompt, already optimized!</h3>
              <p className="text-text-muted max-w-sm mt-3 text-sm">
                Your prompt is already highly efficient and clear. No further optimization is required. You are good to go!
              </p>

              <div className="mt-8 bg-background border border-card-border p-4 rounded-sm flex items-center gap-6 text-left">
                <div>
                  <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Original Token Cost</div>
                  <div className="text-xl font-medium text-foreground">{result.original.tokens}</div>
                </div>
                <div className="w-px h-8 bg-card-border"></div>
                <div>
                  <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Carbon Footprint</div>
                  <div className="text-xl font-medium text-foreground flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-accent-green" />
                    {result.original.footprint.carbonGrams.toFixed(2)}g
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                <button
                  disabled={loggingType !== null}
                  onClick={() => handleLogToDb("original")}
                  className="w-full py-2 bg-accent-green hover:bg-accent-green/90 text-background text-xs font-medium rounded-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Database className="h-3.5 w-3.5" />
                  {loggingType === "original" ? "Logging..." : "Log Prompt to Dashboard"}
                </button>
                <button
                  disabled={runLoading}
                  onClick={() => handleRunPrompt("original")}
                  className="w-full py-2 bg-accent-green hover:bg-accent-green/90 text-background text-xs font-medium rounded-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {runLoading && runType === "original" ? "Running..." : "▶ Run Prompt"}
                </button>
                {logStatus && (
                  <div className={`text-[11px] font-medium ${logStatus.includes("Error") ? "text-red-400" : "text-accent-green"}`}>
                    {logStatus}
                  </div>
                )}
              </div>
            </div>
          ) : result && (
            <>
              {/* Savings Highlight Badge */}
              <div className="glass-panel p-4 bg-accent-green/5 border border-accent-green/20 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-sm bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-accent-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Resource Savings: {result.savings.percent}%</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Reduced tokens by <span className="font-medium text-accent-green">{result.savings.tokens}</span> units.
                    </p>
                  </div>
                </div>

                {result.isMock && (
                  <span className="text-[10px] text-text-muted border border-card-border bg-card-bg px-2 py-0.5 rounded-sm font-normal">
                    Heuristic Fallback Engine
                  </span>
                )}
              </div>

              {/* Side-by-Side Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Original Prompt Card */}
                <div className="glass-panel p-5 flex flex-col justify-between gap-4 bg-card-bg/10 rounded-md">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Original Prompt</span>
                      <button
                        onClick={() => copyToClipboard(result.original.text, "original")}
                        className="text-text-muted hover:text-foreground p-1 rounded-sm hover:bg-background transition-colors cursor-pointer"
                        title="Copy original"
                      >
                        {copiedOriginal ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="bg-background border border-card-border rounded-sm p-3 h-40 overflow-y-auto text-xs font-mono text-text-muted whitespace-pre-wrap font-normal">
                      {result.original.text}
                    </div>
                  </div>

                  {/* Footprint details sub-card */}
                  <div className="border-t border-card-border pt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Footprint Breakdown</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-card-bg/60 p-2 rounded-sm border border-card-border/50">
                        <Cpu className="h-3.5 w-3.5 mx-auto text-text-muted mb-1" />
                        <p className="text-xs font-medium text-foreground">{result.original.footprint.carbonGrams.toFixed(2)}g</p>
                        <p className="text-[9px] text-text-muted">CO₂</p>
                      </div>
                      <div className="bg-card-bg/60 p-2 rounded-sm border border-card-border/50">
                        <Droplet className="h-3.5 w-3.5 mx-auto text-text-muted mb-1" />
                        <p className="text-xs font-medium text-foreground">{result.original.footprint.waterMl.toFixed(1)}ml</p>
                        <p className="text-[9px] text-text-muted">H₂O</p>
                      </div>
                      <div className="bg-card-bg/60 p-2 rounded-sm border border-card-border/50">
                        <Compass className="h-3.5 w-3.5 mx-auto text-text-muted mb-1" />
                        <p className="text-xs font-medium text-foreground">{result.original.footprint.landCm2.toFixed(2)}cm²</p>
                        <p className="text-[9px] text-text-muted">Land</p>
                      </div>
                    </div>

                    <button
                      disabled={loggingType !== null}
                      onClick={() => handleLogToDb("original")}
                      className="w-full mt-1.5 py-1.5 bg-card-bg/50 hover:bg-card-bg text-text-muted hover:text-foreground border border-card-border text-[11px] font-medium rounded-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Database className="h-3.5 w-3.5" />
                      {loggingType === "original" ? "Logging..." : "Log Original (Unoptimised)"}
                    </button>
                    <button
                      disabled={runLoading}
                      onClick={() => handleRunPrompt("original")}
                      className="w-full mt-1.5 py-1.5 bg-card-bg/50 hover:bg-card-bg text-text-muted hover:text-foreground border border-card-border text-[11px] font-medium rounded-sm flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {runLoading && runType === "original" ? "Running..." : "▶ Run Unoptimised"}
                    </button>
                  </div>
                </div>

                {/* Optimized Prompt Card */}
                <div className="glass-panel p-5 flex flex-col justify-between gap-4 border-accent-green/20 bg-accent-green/[0.01] rounded-md">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-accent-green font-medium uppercase tracking-wider">Optimized Suggestions</span>
                      <button
                        onClick={() => copyToClipboard(result.optimized.text, "optimized")}
                        className="text-accent-green hover:text-accent-green/80 p-1 rounded-sm hover:bg-accent-green/10 transition-colors cursor-pointer"
                        title="Copy optimized text"
                      >
                        {copiedOptimized ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="bg-background border border-accent-green/10 rounded-sm p-3 h-40 overflow-y-auto text-xs font-mono text-foreground whitespace-pre-wrap font-normal">
                      {result.optimized.text}
                    </div>
                  </div>

                  {/* Footprint details sub-card */}
                  <div className="border-t border-card-border pt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-medium text-accent-green uppercase tracking-wider">Footprint Breakdown</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-accent-green/5 p-2 rounded-sm border border-accent-green/10">
                        <Cpu className="h-3.5 w-3.5 mx-auto text-accent-green mb-1" />
                        <p className="text-xs font-medium text-foreground">{result.optimized.footprint.carbonGrams.toFixed(2)}g</p>
                        <p className="text-[9px] text-accent-green">CO₂</p>
                      </div>
                      <div className="bg-accent-cyan/5 p-2 rounded-sm border border-accent-cyan/10">
                        <Droplet className="h-3.5 w-3.5 mx-auto text-accent-cyan mb-1" />
                        <p className="text-xs font-medium text-foreground">{result.optimized.footprint.waterMl.toFixed(1)}ml</p>
                        <p className="text-[9px] text-accent-cyan">H₂O</p>
                      </div>
                      <div className="bg-accent-amber/5 p-2 rounded-sm border border-accent-amber/10">
                        <Compass className="h-3.5 w-3.5 mx-auto text-accent-amber mb-1" />
                        <p className="text-xs font-medium text-foreground">{result.optimized.footprint.landCm2.toFixed(2)}cm²</p>
                        <p className="text-[9px] text-accent-amber">Land</p>
                      </div>
                    </div>

                    <button
                      disabled={loggingType !== null}
                      onClick={() => handleLogToDb("optimized")}
                      className="w-full mt-1.5 py-1.5 bg-accent-green hover:bg-accent-green/90 text-background text-[11px] font-medium rounded-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Database className="h-3.5 w-3.5" />
                      {loggingType === "optimized" ? "Logging..." : "Log & Execute Optimized"}
                    </button>
                    <button
                      disabled={runLoading}
                      onClick={() => handleRunPrompt("optimized")}
                      className="w-full mt-1.5 py-1.5 bg-accent-green hover:bg-accent-green/90 text-background text-[11px] font-medium rounded-sm flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {runLoading && runType === "optimized" ? "Running..." : "▶ Run Optimised"}
                    </button>
                  </div>
                </div>

              </div>

              {logStatus && (
                <div className={`text-xs font-medium text-center ${logStatus.includes("Error") ? "text-red-400" : "text-accent-green"}`}>
                  {logStatus}
                </div>
              )}
            </>
          )}

          {(runOutput || runLoading) && (
            <div className="glass-panel p-5 flex flex-col gap-3 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground font-medium uppercase tracking-wider">AI Response</span>
                {runOutput && (
                  <button 
                    onClick={copyRunOutput}
                    className="text-text-muted hover:text-foreground p-1 rounded-sm hover:bg-background transition-colors cursor-pointer"
                    title="Copy response"
                  >
                    {copiedRunOutput ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {runLoading && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <div className="h-4 w-4 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
                  Generating response...
                </div>
              )}

              {runOutput && (
                <div className="bg-background border border-card-border rounded-sm p-4 text-sm text-foreground whitespace-pre-wrap">
                  {runOutput}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
