// src/components/shell/topbar.tsx
"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useUser } from "@clerk/clerk-react"; // <-- Import the useUser hook

export function Topbar({ title }: { title: string }) {
  const { user } = useUser(); // <-- Get the currently signed-in user object

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-grid">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold text-balance">{title}</h1>
          <span className="text-xs text-muted">Synced 12m ago</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="relative rounded-md border border-grid p-2 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span
              className="absolute right-1 top-1 block h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--danger)" }}
            />
          </button>
          <button
            className="flex items-center gap-2 rounded-md border border-grid px-2 py-1 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-haspopup="menu"
          >
            {/* --- DYNAMIC USER DATA --- */}
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="User avatar" className="h-6 w-6 rounded-full" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-surface border border-grid" aria-hidden />
            )}
            <span className="hidden md:inline text-sm">
              {/* Display user's primary email or username */}
              {user?.primaryEmailAddress?.emailAddress || user?.username || "User"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
        </div>
      </div>
    </header>
  );
}