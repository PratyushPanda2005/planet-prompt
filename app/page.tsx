import Link from "next/link";
import { Leaf, ShieldAlert, Cpu, Sparkles, BarChart3, MessageSquare, FileText, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid-pattern relative flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Ambient decorative glowing backdrops */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              Planet<span className="text-emerald-400">Prompt</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400 font-medium">
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
            <Link href="/advisor" className="hover:text-emerald-400 transition-colors">Prompt Advisor</Link>
            <Link href="/report" className="hover:text-emerald-400 transition-colors">Monthly Reports</Link>
          </nav>

          <Link 
            href="/dashboard" 
            className="flex items-center gap-1.5 px-4 h-9 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Enter Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center gap-20">
        
        {/* Banner + Taglines */}
        <div className="flex flex-col items-center gap-6 text-center max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            AI Sustainability Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-white max-w-2xl">
            Every prompt has <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent glow-text-green">
              a price.
            </span>
          </h1>

          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-xl">
            Every LLM query consumes significant computation, evaporative cooling water, and grid capacity. PlanetPrompt monitors your API footprint in real time and optimizes prompts before they are sent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold rounded-lg transition-all hover:opacity-95 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] text-center"
            >
              Get Started Free
            </Link>
            <Link 
              href="/advisor"
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-zinc-200 font-semibold rounded-lg transition-colors text-center"
            >
              Try Prompt Advisor
            </Link>
          </div>
        </div>

        {/* Footprint Live Mockup Showcase */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
              <Cpu className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-zinc-400 text-sm font-semibold">Carbon Emissions</h3>
              <p className="text-3xl font-bold text-white mt-1">0.3g <span className="text-sm font-normal text-zinc-500">CO₂ / 1k tkn</span></p>
              <p className="text-xs text-zinc-500 mt-2">Driven by GPU processing overhead and power generation mix.</p>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20">
              <Leaf className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-zinc-400 text-sm font-semibold">Water Consumption</h3>
              <p className="text-3xl font-bold text-white mt-1">3.0ml <span className="text-sm font-normal text-zinc-500">H₂O / 1k tkn</span></p>
              <p className="text-xs text-zinc-500 mt-2">Consumed by evaporative cooling loops inside server facilities.</p>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center border border-amber-500/20">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-zinc-400 text-sm font-semibold">Land Occupancy</h3>
              <p className="text-3xl font-bold text-white mt-1">0.5cm² <span className="text-sm font-normal text-zinc-500">Land / 1k tkn</span></p>
              <p className="text-xs text-zinc-500 mt-2">Represents space occupied by solar/wind setups feeding the grid.</p>
            </div>
          </div>

        </div>

        {/* Feature Highlights */}
        <div className="w-full border-t border-zinc-900 pt-16 flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Engineered for Sustainable AI Ops</h2>
            <p className="text-sm text-zinc-500 mt-1">Integrate monitoring and optimization directly into your development lifecycle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Real-time Dashboard</h4>
                <p className="text-sm text-zinc-400 mt-1">Observe running queries, cumulative counts, and visual breakdowns of water, carbon, and land costs.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Prompt Advisor</h4>
                <p className="text-sm text-zinc-400 mt-1">Test your system prompts before deployment. Let Claude suggest leaner, token-saving rewrites automatically.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">AI-Generated Reports</h4>
                <p className="text-sm text-zinc-400 mt-1">Receive simple, 3-sentence narrative summaries compiled from your active logs with tips for next month.</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 PlanetPrompt. Helping build sustainable AI software.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Security</span>
            <span className="hover:text-zinc-400 cursor-pointer">API reference</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
