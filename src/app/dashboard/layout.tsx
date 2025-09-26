// src/app/dashboard/layout.tsx
import  LayoutShell  from "@/components/shell/layout-shell";
import { LayoutProvider, useLayout } from "@/contexts/LayoutContext"; // Import
import React from "react";

function DashboardShell({ children }: { children: React.ReactNode }) {
    const { rightRail } = useLayout(); 
    return (
        <LayoutShell title="OSINT Hub" rightRail={rightRail}>
            {children}
        </LayoutShell>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </LayoutProvider>
  );
}