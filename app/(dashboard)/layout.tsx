"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LayoutDashboard, Sparkles, FileText, ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Prompt Advisor", href: "/advisor", icon: Sparkles },
    { name: "Monthly Reports", href: "/report", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#030712] text-zinc-100 overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-850 bg-zinc-950/70 backdrop-blur-md z-30">
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Logo Area */}
          <div className="flex items-center h-16 px-6 border-b border-zinc-900">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Leaf className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <span className="font-semibold text-base tracking-tight text-white">
                Planet<span className="text-emerald-400">Prompt</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400 pl-3.5"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-300"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info Area */}
          <div className="p-4 border-t border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserButton showName appearance={{
                elements: {
                  userButtonOuterIdentifier: {
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  },
                  userButtonBox: "flex-row-reverse"
                }
              }} />
            </div>
            
            <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-900" title="Exit Dashboard">
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
          </div>

        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="flex flex-col flex-1 md:pl-64 overflow-hidden h-full">
        
        <header className="flex items-center justify-between md:hidden h-16 px-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-45">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Leaf className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <span className="font-semibold text-base tracking-tight text-white">
              Planet<span className="text-emerald-400">Prompt</span>
            </span>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-400 hover:text-white p-2 focus:outline-none"
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Drawer backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            
            <nav className="relative flex flex-col w-4/5 max-w-sm h-full bg-[#090d16] border-r border-zinc-800 p-6 z-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-white">PlanetPrompt</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-zinc-450">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400 font-semibold"
                          : "text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-zinc-800 flex items-center gap-3">
                <UserButton showName appearance={{
                  elements: {
                    userButtonOuterIdentifier: {
                      color: "#ffffff",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    },
                    userButtonBox: "flex-row-reverse"
                  }
                }} />
              </div>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6 md:p-10">
          <div className="max-w-6xl mx-auto h-full animate-fade-in">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
