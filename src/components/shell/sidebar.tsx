// src/components/shell/sidebar.tsx
"use client"; // Keep this, as it's a client component with state

import { Link, useLocation } from "react-router-dom"; // <-- CORRECTED IMPORTS
import { cn } from "@/lib/utils";
import { Home, FolderGit2, Files, GitPullRequest, Layers3, Settings, Search } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home }, 
  { to: "/", label: "Landing", icon: Layers3 },
  { to: "/repositories", label: "Repositories", icon: FolderGit2 },
  { to: "/case-files", label: "Case Files", icon: Files },
  { to: "/merge-requests", label: "Merge Requests", icon: GitPullRequest },
  { to: "/activity", label: "Activity", icon: Layers3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation(); // <-- CORRECTED HOOK
  const pathname = location.pathname; // Get the current path

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
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            className="w-full bg-app border border-grid rounded-md pl-9 pr-3 py-2 text-sm text-fg placeholder:text-muted outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="Global search"
            aria-label="Global search"
          />
        </div>
      </div>

      <nav className="px-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            // CORRECTED: Use `to` prop and check for active state
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 my-1 transition-colors",
                active ? "bg-app text-fg" : "text-muted hover:text-fg hover:bg-app",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className={cn(collapsed && "sr-only")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3">
        <button className="w-full btn-accent rounded-md py-2 text-sm font-medium shadow-sm" aria-label="New Case">
          {collapsed ? <Files className="mx-auto h-4 w-4" /> : 'New Case'}
        </button>
      </div>
    </aside>
  );
}