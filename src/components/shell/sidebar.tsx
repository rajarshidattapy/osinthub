// src/components/shell/sidebar.tsx
"use client"; // Keep this, as it's a client component with state

import { Link, useLocation, useNavigate } from "react-router-dom"; // <-- CORRECTED IMPORTS
import { cn } from "@/lib/utils";
import { Home, FolderGit2, Files, GitPullRequest, Layers3, Search } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home }, 
  { to: "/repositories", label: "Repositories", icon: FolderGit2 },
  { to: "/merge-requests", label: "Merge Requests", icon: GitPullRequest },
  { to: "/activity", label: "Activity", icon: Layers3 },
];

export function Sidebar() {
  const location = useLocation(); // <-- CORRECTED HOOK
  const pathname = location.pathname; // Get the current path
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-surface border-r border-grid h-screen sticky top-0 transition-all duration-200 ease-out",
        collapsed ? "w-[84px]" : "w-[280px]",
      )}
      aria-label="Primary"
    >
      <div className="flex items-center justify-between p-4">
        {/* CORRECTED: Use `to` prop for the Link */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md" style={{ backgroundColor: "var(--accent)" }} />
          {!collapsed && <span className="font-semibold text-fg">OSINT Hub</span>}
        </Link>
        <button
          className="rounded-md p-2 text-muted hover:bg-app focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="sr-only">Toggle sidebar</span>
          {/* Using a cleaner Chevron icon for toggle */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}>
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <div className="px-3">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-black outline-none focus:border-[#00FFFF]/50 focus:ring-2 focus:ring-[#00FFFF]/20 focus:shadow-lg focus:shadow-[#00FFFF]/10 transition-all duration-300 hover:border-gray-600/50"
            placeholder="Search everything..."
            aria-label="Global search"
          />
        </div>
      </div>

      <nav className="px-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            // CORRECTED: Use `to` prop and check for active state
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 group relative overflow-hidden",
                active 
                  ? "bg-gradient-to-r from-[#00FFFF]/20 to-[#00FFFF]/15 text-white shadow-lg shadow-[#00FFFF]/10 border border-[#00FFFF]/30" 
                  : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-[#00FFFF]/20 hover:to-[#00FFFF]/10 hover:shadow-md hover:border hover:border-[#00FFFF]/30",
              )}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#00FFFF]/10 to-[#00FFFF]/5 rounded-xl" />
              )}
              <Icon className={cn("h-5 w-5 relative z-10", active ? "text-[#00FFFF]" : "group-hover:text-[#00FFFF]")} />
              <span className={cn(collapsed && "sr-only", "relative z-10 font-medium")}>{item.label}</span>
              {active && (
                <div className="absolute right-2 w-2 h-2 bg-[#00FFFF] rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <button
          onClick={() => {
            // Navigate to repositories page first
            navigate('/repositories');
            // Then dispatch the event to open the modal immediately
            window.dispatchEvent(new CustomEvent('open-create-repository'));
          }}
          className="w-full bg-[#00FFFF] hover:bg-[#00FFFF]/90 text-black rounded-xl py-3 px-4 font-semibold shadow-lg shadow-[#00FFFF]/25 hover:shadow-[#00FFFF]/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-[#00FFFF]/30 hover:border-[#00FFFF]/50"
          aria-label="New Case"
        >

          <div className="flex items-center justify-center gap-2">
            <Files className={cn("h-5 w-5", collapsed ? "mx-auto" : "")} />
            {!collapsed && <span>New Case</span>}
          </div>
        </button>
      </div>
    </aside>
  );
}