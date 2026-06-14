"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LayoutDashboard, Sparkles, FileText, ArrowLeft, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Synchronise theme with document.documentElement
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Prompt Advisor", href: "/advisor", icon: Sparkles },
    { name: "Monthly Reports", href: "/report", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans" data-theme={theme}>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-card-border bg-sidebar-bg/70 backdrop-blur-md z-30">
        <div className="flex flex-col flex-1 min-h-0">

          {/* Logo Area */}
          <div className="flex items-center h-16 px-6 border-b border-card-border">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="h-8 w-8 rounded-sm bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
                <Leaf className="h-4.5 w-4.5 text-accent-green" />
              </div>
              <span className="font-medium text-base tracking-tight text-foreground">
                Planet<span className="text-accent-green font-medium">Prompt</span>
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
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 group ${isActive
                    ? "bg-accent-green/10 text-accent-green border-l-2 border-accent-green pl-3.5"
                    : "text-text-muted hover:bg-card-bg hover:text-foreground"
                    }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-accent-green" : "text-text-muted group-hover:text-foreground"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info Area */}
          <div className="p-4 border-t border-card-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserButton showName appearance={{
                elements: {
                  userButtonOuterIdentifier: {
                    color: "var(--foreground)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  },
                  userButtonBox: "flex-row-reverse"
                }
              }} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-text-muted hover:text-foreground transition-colors p-2 rounded-sm bg-card-bg border border-card-border cursor-pointer flex items-center justify-center"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              <Link href="/" className="text-text-muted hover:text-foreground transition-colors p-2 rounded-sm bg-card-bg border border-card-border flex items-center justify-center" title="Exit Dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="flex flex-col flex-1 md:pl-64 overflow-hidden h-full">

        <header className="flex items-center justify-between md:hidden h-16 px-6 border-b border-card-border bg-sidebar-bg/80 backdrop-blur-md z-45">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
              <Leaf className="h-4.5 w-4.5 text-accent-green" />
            </div>
            <span className="font-medium text-base tracking-tight text-foreground">
              Planet<span className="text-accent-green font-medium">Prompt</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-text-muted hover:text-foreground transition-colors p-2 rounded-sm bg-card-bg border border-card-border cursor-pointer flex items-center justify-center"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-muted hover:text-foreground p-2 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Drawer backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />

            <nav className="relative flex flex-col w-4/5 max-w-sm h-full bg-sidebar-bg border-r border-card-border p-6 z-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-accent-green" />
                  <span className="font-medium text-foreground">PlanetPrompt</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-text-muted">
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${isActive
                        ? "bg-accent-green/15 text-accent-green"
                        : "text-text-muted hover:bg-card-bg hover:text-foreground"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-card-border flex items-center gap-3">
                <UserButton showName appearance={{
                  elements: {
                    userButtonOuterIdentifier: {
                      color: "var(--foreground)",
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
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6 md:p-10 bg-background">
          <div className="max-w-6xl mx-auto h-full animate-fade-in">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
