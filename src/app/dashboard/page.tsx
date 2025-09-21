// src/app/dashboard/page.tsx (Corrected)
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { authenticatedFetch } from '@/lib/api';

// Import the content components, but NOT LayoutShell
import { KpiCard } from "@/components/kpi-card";
import { ActivityTimeline } from "@/components/activity-timeline";
import { StackedIngestArea } from "@/components/charts/stacked-area";
import { InvestigatorBars } from "@/components/charts/investigator-bars";
import { useLayout } from '@/contexts/LayoutContext'; // Import useLayout

export default function DashboardHomePage() {
  const { getToken, isLoaded } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setRightRail } = useLayout(); // Get the setter function

  useEffect(() => {
    if (!isLoaded) return;

    const getDashboardData = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await authenticatedFetch('http://localhost:8000/api/dashboard/stats', token);
        setDashboardData(data);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Could not load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    getDashboardData();
  }, [isLoaded, getToken]);

const filtersRail = React.useMemo(() => (
  <div className="card p-4">
    <h3 className="text-sm font-medium mb-3">Filters</h3>
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted">Timeframe</label>
        <select className="mt-1 w-full bg-background border border-grid rounded-md px-2 py-2 text-sm">
          <option>Last 30 days</option>
          <option>Last 14 days</option>
          <option>Last 7 days</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted">Source</label>
        <div className="mt-1 flex gap-2">
          <button className="btn-outline rounded-md px-2 py-1 text-xs">Web</button>
          <button className="btn-outline rounded-md px-2 py-1 text-xs">Social</button>
          <button className="btn-outline rounded-md px-2 py-1 text-xs">Darkweb</button>
        </div>
      </div>
    </div>
  </div>
), []);

useEffect(() => {
  setRightRail(filtersRail);
  // Clean up when the component unmounts
  return () => setRightRail(null);
}, [setRightRail, filtersRail]);

// The page should NOT return the LayoutShell. It only returns its specific content.
if (isLoading || !isLoaded) {
  return <p className="p-6 text-gray-400">Loading Dashboard...</p>;
}

if (error || !dashboardData) {
  return (
    <div className="p-6 text-center">
      <h3 className="text-lg font-semibold text-red-400">Error Loading Data</h3>
      <p className="text-gray-400 mt-2">{error}</p>
    </div>
  );
}
// This is the content that will be passed as `children` to the LayoutShell in DashboardLayout
return (
  <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Map over KPI data */}
        {[
          { label: "Ingested Items (24h)", ...dashboardData.kpis.ingestedItems, spark: dashboardData.repoSparks[0].sparkline },
          { label: "Active Cases", ...dashboardData.kpis.activeCases, spark: dashboardData.repoSparks[1].sparkline },
          { label: "Open Merge Requests", ...dashboardData.kpis.openMergeRequests, spark: dashboardData.repoSparks[2].sparkline },
          { label: "Avg. Lead Time", ...dashboardData.kpis.avgLeadTime, spark: dashboardData.repoSparks[3].sparkline },
          { label: "Investigator Efficiency", ...dashboardData.kpis.investigatorEfficiency, spark: dashboardData.repoSparks[4].sparkline },
        ].map((kpi) => (
          <div key={kpi.label} className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3">
            <KpiCard 
              label={kpi.label} 
              value={String(kpi.value)} 
              delta={kpi.delta} 
              deltaPositive={kpi.positive}
              spark={kpi.spark} 
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <ActivityTimeline items={dashboardData.activity} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <StackedIngestArea data={dashboardData.ingestVolume} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <InvestigatorBars data={dashboardData.investigatorPerf} />
        </div>
      </div>
    </div>
  );
}