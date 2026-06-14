import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  Activity,
  ArrowRight,
  Play,
  Leaf,
  ChevronRight,
  TrendingDown,
  Globe,
  Quote
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-zinc-900 selection:bg-emerald-800/10 selection:text-emerald-800 font-sans">

      {/* Top Header / Navigation */}
      <header className="border-b border-zinc-200/60 backdrop-blur-md bg-[#FAFBF9]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="PlanetPrompt Logo" className="h-10 w-10 object-contain" />
            <span className="font-normal text-xl tracking-tight text-[#1B3B2B]">
              PlanetPrompt
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#1B3B2B]/75 font-normal">
            <a href="#about" className="hover:text-[#1B3B2B] transition-colors">About</a>
            <a href="#solution" className="hover:text-[#1B3B2B] transition-colors">Tools</a>
            <a href="#process" className="hover:text-[#1B3B2B] transition-colors">Process</a>
            <a href="#testimonials" className="hover:text-[#1B3B2B] transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-4">
            {userId ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-5 h-11 bg-[#1B3B2B] hover:bg-[#132E20] text-[#D2E4DC] rounded-sm text-xs font-normal transition-all"
              >
                Enter Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="flex items-center gap-1.5 px-5 h-11 bg-[#1B3B2B] hover:bg-[#132E20] text-[#D2E4DC] rounded-sm text-xs font-normal transition-all"
              >
                Get Started
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col">

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center">
          <div className="flex flex-col items-center gap-6 max-w-4xl">

            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-[#E8F0EC] border border-[#D2E4DC] text-xs font-normal text-[#1B3B2B] uppercase tracking-wider">
              <img src="/logo.png" alt="PlanetPrompt Logo" className="h-4 w-4 object-contain" />
              AI Environmental Footprint Advisor
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.1] text-[#1b3b2b] max-w-3xl">
              Optimize Your AI Footprint <br />
              With <span className=" text-[#2E7D32]">Green</span> Prompts
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-xl text-[#1B3B2B]/70 leading-relaxed max-w-2xl mt-2 font-medium">
              Quantify LLM electricity consumption, carbon intensity, and water usage in real-time. Compress your prompts to reduce costs and environmental impact.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
              <Link
                href={userId ? "/dashboard" : "/sign-up"}
                className="px-8 py-4 bg-[#1B3B2B] hover:bg-[#132E20] text-[#D2E4DC] font-normal rounded-sm transition-all text-center text-sm"
              >
                Get Started
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-[#E8F0EC] hover:bg-[#D2E4DC] text-[#1B3B2B] border border-[#D2E4DC] font-normal rounded-sm transition-all text-center text-sm flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-[#1B3B2B]" />
                Interactive Playground
              </Link>
            </div>
          </div>

          {/* Full-width Rooftop Solar Image */}
          <div className="w-full mt-16 rounded-md overflow-hidden shadow-2xl border border-zinc-200 group relative">
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop"
              alt="PlanetPrompt Cloud Infrastructure Environmental Analytics Global Network"
              className="w-full h-[320px] md:h-[500px] lg:h-[600px] object-cover transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>

          {/* Logos Cloud */}
          <div className="w-full mt-16 border-b border-zinc-200/80 pb-16">
            <p className="text-xs uppercase tracking-widest font-normal text-[#1B3B2B]/40 mb-8">
              Empowering Sustainable AI Development at Scale
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-35 filter grayscale font-normal">
              <span className="text-lg tracking-wider text-[#1B3B2B]">SONY</span>
              <span className="text-xl tracking-tight text-[#1B3B2B]">Adobe</span>
              <span className="text-lg text-[#1B3B2B]">XIAOMI</span>
              <span className="text-xl text-[#1B3B2B]">Spotify</span>
              <span className="text-lg text-[#1B3B2B]">Microsoft</span>
              <span className="text-xl text-[#1B3B2B]">DAIKIN</span>
              <span className="text-xl text-[#1B3B2B]">TOYOTA</span>
              <span className="text-lg text-[#1B3B2B]">Unilever</span>
              <span className="text-lg text-[#1B3B2B]">Nestlé</span>
              <span className="text-xl text-[#1B3B2B]">intel</span>
              <span className="text-lg text-[#1B3B2B]">SIEMENS</span>
              <span className="text-lg text-[#1B3B2B]">SAMSUNG</span>
            </div>
          </div>
        </section>

        {/* About & Interactive Diagram Section */}
        <section id="about" className="py-20 bg-white border-y border-zinc-200/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Column Content */}
            <div className="flex flex-col gap-6 text-left">
              <span className="text-xs font-normal text-[#2E7D32] uppercase tracking-widest">About PlanetPrompt</span>
              <h2 className="text-3xl md:text-5xl font-normal tracking-tight leading-tight text-[#1B3B2B]">
                Making AI Infrastructure Sustainable, Efficient, and Environmentally Transparent.
              </h2>
              <p className="text-zinc-650 leading-relaxed font-normal">
                Every Large Language Model query requires substantial compute power, resulting in hidden carbon emissions and massive water cooling footprints. PlanetPrompt measures the exact energy demand of your model selections and provides AI-driven prompt optimization to compress tokens and shrink your digital footprint. We make green AI simple and cost-effective.
              </p>
              <div>
                <Link
                  href={userId ? "/dashboard" : "/sign-up"}
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#1B3B2B] hover:bg-[#132E20] text-[#D2E4DC] rounded-sm text-xs font-normal transition-all"
                >
                  Get Started
                  <ChevronRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            </div>

            {/* Right Column Diagram Graphic */}
            <div className="bg-[#FAFBF9] border border-zinc-200/80 rounded-md p-8 relative flex flex-col items-center justify-center min-h-[440px] shadow-sm">
              <div className="absolute top-4 left-4 bg-[#E8F0EC] border border-[#D2E4DC] px-3 py-1 rounded-sm text-[10px] font-normal text-[#1B3B2B]">
                Footprint Calculation Model
              </div>

              {/* Central Solar Panel Image */}
              <div className="relative z-10 w-2/3 transform hover:scale-102 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
                  alt="High efficiency data visualization and analytical graphics console"
                  className="w-full h-auto rounded-sm shadow-lg border border-zinc-200"
                />
              </div>

              {/* Explanatory Annotations */}
              <div className="w-full flex flex-col gap-6 mt-8 md:mt-10">
                <div className="flex items-start gap-3 border-b border-zinc-200/60 pb-3">
                  <div className="h-6 w-6 rounded-sm bg-[#E8F0EC] flex items-center justify-center text-xs font-normal text-[#1B3B2B] shrink-0">1</div>
                  <div>
                    <h4 className="text-xs font-normal text-[#1B3B2B]">Token Footprint Calculation</h4>
                    <p className="text-[11px] text-[#1B3B2B]/60 mt-0.5">Analyzes token lengths of inputs and outputs to estimate computing resource workloads.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-zinc-200/60 pb-3">
                  <div className="h-6 w-6 rounded-sm bg-[#E8F0EC] flex items-center justify-center text-xs font-normal text-[#1B3B2B] shrink-0">2</div>
                  <div>
                    <h4 className="text-xs font-normal text-[#1B3B2B]">Model Coefficient Mapping</h4>
                    <p className="text-[11px] text-[#1B3B2B]/60 mt-0.5">Applies model-specific parameters to convert compute workloads to energy usage (mWh).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-sm bg-[#E8F0EC] flex items-center justify-center text-xs font-normal text-[#1B3B2B] shrink-0">3</div>
                  <div>
                    <h4 className="text-xs font-normal text-[#1B3B2B]">Carbon & Water Coefficients</h4>
                    <p className="text-[11px] text-[#1B3B2B]/60 mt-0.5">Calculates carbon dioxide equivalents (mg CO2e) and server water cooling metrics (ml) based on live datasets.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Benefits Section with pale green highlights */}
        <section className="py-20 bg-[#FAFBF9]">
          <div className="max-w-7xl mx-auto px-6 text-center flex flex-col gap-12">

            <div className="max-w-xl mx-auto">
              <span className="text-xs font-normal text-[#2E7D32] uppercase tracking-widest">Why PlanetPrompt</span>
              <h2 className="text-3xl md:text-4xl font-normal text-[#1B3B2B] tracking-tight mt-2">
                Engineered for Sustainability, Cost Reduction, and Resource Transparency.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Card 1 */}
              <div className="bg-[#E8F0EC] border border-[#D2E4DC]/80 p-8 rounded-md flex flex-col justify-between items-start text-left min-h-[220px] shadow-sm">
                <div className="h-12 w-12 rounded-sm bg-white flex items-center justify-center shadow-sm">
                  <TrendingDown className="h-6 w-6 text-[#2E7D32]" />
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-normal text-[#1B3B2B]">API Cost Reductions</h3>
                  <p className="text-xs text-[#1B3B2B]/70 mt-2 font-normal">Optimize prompts to trim input tokens by up to 40% while preserving intent, directly lowering your API billing.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#E8F0EC] border border-[#D2E4DC]/80 p-8 rounded-md flex flex-col justify-between items-start text-left min-h-[220px] shadow-sm">
                <div className="h-12 w-12 rounded-sm bg-white flex items-center justify-center shadow-sm">
                  <Globe className="h-6 w-6 text-[#2E7D32]" />
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-normal text-[#1B3B2B]">Shrink Carbon Footprint</h3>
                  <p className="text-xs text-[#1B3B2B]/70 mt-2 font-normal">Offset carbon emissions and water cooling usage per LLM call, enabling verifiable ESG metrics for stakeholders.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#E8F0EC] border border-[#D2E4DC]/80 p-8 rounded-md flex flex-col justify-between items-start text-left min-h-[220px] shadow-sm">
                <div className="h-12 w-12 rounded-sm bg-white flex items-center justify-center shadow-sm">
                  <Activity className="h-6 w-6 text-[#2E7D32]" />
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-normal text-[#1B3B2B]">Model Performance Benchmarks</h3>
                  <p className="text-xs text-[#1B3B2B]/70 mt-2 font-normal">Evaluate model performance vs energy metrics, helping you run the most efficient model for your workload.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Solutions Grid Section */}
        <section id="solution" className="py-20 bg-white border-t border-zinc-200/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
              <div>
                <span className="text-xs font-normal text-[#2E7D32] uppercase tracking-widest">Developer Suite</span>
                <h2 className="text-3xl md:text-5xl font-normal text-[#1B3B2B] tracking-tight mt-2 leading-[1.15]">
                  Carbon Tracking Tools Built <br />
                  For High-Scale LLM Operations.
                </h2>
              </div>
              <p className="text-zinc-500 font-normal text-sm lg:max-w-md pb-1">
                Our developer suite fits directly into your current prompt pipelines, providing metrics, compression advice, and ESG compliance out of the box.
              </p>
            </div>

            {/* Grid Layout mirroring screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

              {/* Developer Playground - Left 7 columns */}
              <div className="lg:col-span-7 bg-[#FAFBF9] border border-zinc-200/80 rounded-md overflow-hidden shadow-sm flex flex-col md:flex-row group">
                <div className="md:w-1/2 overflow-hidden h-72 md:h-auto">
                  <img
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"
                    alt="Developer playground with code and data structures"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-between gap-6">
                  <div>
                    <span className="text-[10px] uppercase font-normal text-[#2E7D32] tracking-wider">Simulate & Test</span>
                    <h3 className="text-2xl font-normal text-[#1B3B2B] mt-1.5">Developer Playground</h3>
                    <p className="text-xs text-zinc-550 mt-3 font-normal">A live environment to run prompts, view simulated logs, evaluate token usage, and measure your prompt&apos;s carbon and water footprint immediately.</p>
                  </div>

                  <div className="border-t border-zinc-200/60 pt-4 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-[11px] font-normal">
                      <span className="text-zinc-400">Supported Models</span>
                      <span className="text-[#1B3B2B] font-normal">GPT-4o, Claude, Llama 3 70b</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-normal">
                      <span className="text-zinc-400">Playroom Mode</span>
                      <span className="text-[#1B3B2B] font-normal">Interactive prompt simulation</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-normal">
                      <span className="text-zinc-400">Metric Logs</span>
                      <span className="text-[#1B3B2B] font-normal">Real-time CO2e & cooling water</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-normal">
                      <span className="text-zinc-400">Latency Estimate</span>
                      <span className="text-[#1B3B2B] font-normal">Compute overhead calculations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col Container - Right 5 columns */}
              <div className="lg:col-span-5 flex flex-col gap-6">

                {/* AI Optimization Advisor - Dark Green Card */}
                <div className="bg-[#1B3B2B] border border-[#132E20] rounded-md p-8 text-[#D2E4DC] flex flex-col justify-between gap-6">
                  <div>
                    <span className="text-[10px] uppercase font-normal text-[#D2E4DC]/60 tracking-wider">Compress & Refine</span>
                    <h3 className="text-2xl font-normal text-white mt-1.5">AI Optimization Advisor</h3>
                    <p className="text-xs text-[#D2E4DC]/80 mt-3">Smart semantic analysis recommendations to compress and restructure templates, saving API costs and environmental intensity.</p>
                  </div>

                  <div className="border-t border-[#D2E4DC]/15 pt-4 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-[11px] font-normal">
                      <span className="text-[#D2E4DC]/50">Compression</span>
                      <span className="text-white font-normal">Up to 40% token reduction</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-normal">
                      <span className="text-[#D2E4DC]/50">Intent Retention</span>
                      <span className="text-white font-normal">Preserves prompt semantics</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-normal">
                      <span className="text-[#D2E4DC]/50">Target Models</span>
                      <span className="text-white font-normal">Dynamic green-tier routing</span>
                    </div>
                  </div>
                </div>

                {/* ESG & Audit Reports - Tall/Square Image/Grid Card */}
                <div className="bg-black border border-zinc-900 rounded-md overflow-hidden relative group min-h-[180px] flex-1 flex flex-col justify-between p-8">
                  <div className="absolute inset-0 opacity-40 group-hover:scale-102 transition-transform duration-500 pointer-events-none">
                    <img
                      src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop"
                      alt="Modern analytics charts representing ESG and audit parameters"
                      className="w-full h-full object-cover filter grayscale brightness-50"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/60 pointer-events-none" />

                  <div className="relative z-10">
                    <span className="text-[10px] uppercase font-normal text-[#D2E4DC]/60 tracking-wider">Compliance & Auditing</span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-normal text-white">Historical Reporting</h3>
                    <p className="text-[11px] text-zinc-400 mt-1.5 font-normal">Generate and export monthly carbon footprint audits and ESG reports to show compliance.</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Process Timeline Section */}
        <section id="process" className="py-20 bg-[#FAFBF9] border-t border-zinc-200/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col gap-16">

            <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
              <span className="text-xs font-normal text-[#2E7D32] uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl md:text-4xl font-normal text-[#1B3B2B] tracking-tight leading-tight">
                Clear Steps to Optimize & Monitor Your AI Workloads.
              </h2>
            </div>

            {/* Step Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">

              {/* Step 1 */}
              <div className="bg-white border border-zinc-200/60 p-6 rounded-md flex flex-col gap-4 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-sm bg-[#E8F0EC] flex items-center justify-center text-xs font-normal text-[#1B3B2B]">
                  01
                </div>
                <div>
                  <h4 className="font-normal text-[#1B3B2B]">Simulate & Analyze</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 font-normal">Run test prompts in our Playground to get instant token analysis and carbon estimates.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-zinc-200/60 p-6 rounded-md flex flex-col gap-4 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-sm bg-[#E8F0EC] flex items-center justify-center text-xs font-normal text-[#1B3B2B]">
                  02
                </div>
                <div>
                  <h4 className="font-normal text-[#1B3B2B]">Compress & Improve</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 font-normal">Receive recommendations from our AI Advisor to structure prompts for maximum efficiency.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-zinc-200/60 p-6 rounded-md flex flex-col gap-4 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-sm bg-[#E8F0EC] flex items-center justify-center text-xs font-normal text-[#1B3B2B]">
                  03
                </div>
                <div>
                  <h4 className="font-normal text-[#1B3B2B]">Log Production API</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 font-normal">Connect our endpoints to automatically capture carbon and water footprint logs from your live apps.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-zinc-200/60 p-6 rounded-md flex flex-col gap-4 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-sm bg-[#E8F0EC] flex items-center justify-center text-xs font-normal text-[#1B3B2B]">
                  04
                </div>
                <div>
                  <h4 className="font-normal text-[#1B3B2B]">Audit & Share</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 font-normal">Generate monthly ESG footprint reports and verify compliance metrics with green certification badges.</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white border-y border-zinc-200/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">

            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-normal text-[#2E7D32] uppercase tracking-widest">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-normal text-[#1B3B2B] tracking-tight mt-2">
                Trusted by Engineering Teams & Sustainability Leaders
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Testimonial 1 */}
              <div className="bg-[#FAFBF9] border border-zinc-200/80 p-8 rounded-md flex flex-col justify-between gap-8 shadow-sm">
                <div className="flex flex-col gap-4">
                  <Quote className="h-8 w-8 text-[#2E7D32]/25 shrink-0" />
                  <p className="text-zinc-700 font-normal text-sm md:text-base leading-relaxed">
                    &ldquo;We optimized our LLM pipelines and saved over 1.2 tons of carbon emissions in under 3 months. PlanetPrompt&apos;s real-time calculations made ESG reporting incredibly easy.&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-zinc-200/60">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
                    alt="Sarah Jenkins, VP of Engineering at GreenTech Solutions"
                    className="h-12 w-12 rounded-sm object-cover border border-zinc-200"
                  />
                  <div>
                    <h4 className="text-sm font-normal text-[#1B3B2B]">Sarah Jenkins</h4>
                    <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-wider mt-0.5">VP of Engineering at GreenTech Solutions</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-[#FAFBF9] border border-zinc-200/80 p-8 rounded-md flex flex-col justify-between gap-8 shadow-sm">
                <div className="flex flex-col gap-4">
                  <Quote className="h-8 w-8 text-[#2E7D32]/25 shrink-0" />
                  <p className="text-zinc-700 font-normal text-sm md:text-base leading-relaxed">
                    &ldquo;Prompt optimization is a double win. We reduced our API billing by 35% while hitting our environmental impact reduction goals. It&apos;s a must-have for modern AI teams.&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-zinc-200/60">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                    alt="David Chen, Lead AI Architect at EcoSphere Data"
                    className="h-12 w-12 rounded-sm object-cover border border-zinc-200"
                  />
                  <div>
                    <h4 className="text-sm font-normal text-[#1B3B2B]">David Chen</h4>
                    <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-wider mt-0.5">Lead AI Architect at EcoSphere Data</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#FAFBF9] border-t border-zinc-200/60 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#1B3B2B]/60 font-normal">
          <p>© 2026 PlanetPrompt. Tracking and optimizing the environmental footprint of artificial intelligence.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#1B3B2B] cursor-pointer">Security Policy</span>
            <span className="hover:text-[#1B3B2B] cursor-pointer">API References</span>
            <span className="hover:text-[#1B3B2B] cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
