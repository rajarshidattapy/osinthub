// src/app/dashboard/layout.tsx
import  LayoutShell  from "@/components/shell/layout-shell";
import { LayoutProvider, useLayout } from "@/contexts/LayoutContext"; // Import
import React from "react";

// A new component that consumes the context
function DashboardShell({ children }: { children: React.ReactNode }) {
    const { rightRail } = useLayout(); // Get the rightRail from context
    return (
        <LayoutShell title="OSINT Hub" rightRail={rightRail}>
            {children}
        </LayoutShell>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider> {/* Wrap with the provider */}
      <DashboardShell>
        {children}
      </DashboardShell>
    </LayoutProvider>
  );
}