// src/app/dashboard/page.tsx (Corrected)
"use client";

import React, { useState, useEffect, useRef } from 'react';

interface DashboardSpark { sparkline: number[] }
interface KPI { value: number | string; delta: string; positive: boolean }
interface ActivityItem { id: string; type: string; actor: string; when: string; text: string }
interface IngestVolumePoint { date: string; web: number; social: number; darkweb: number }
interface InvestigatorPerf { name: string; closedCount: number }
interface RawActivity { id: string; type: string; actor: string; when: string; text: string }
interface DashboardData {
  kpis: {
    ingestedItems: KPI;
    activeCases: KPI;
    openMergeRequests: KPI;
    avgLeadTime: KPI;
    investigatorEfficiency: KPI;
  };
  activity: ActivityItem[];
  ingestVolume: IngestVolumePoint[];
  investigatorPerf: InvestigatorPerf[];
  repoSparks: DashboardSpark[];
}
import { useAuth } from '@clerk/clerk-react';
import { authenticatedFetch } from '@/lib/api';

import { KpiCard } from "@/components/kpi-card";
import { ActivityTimeline } from "@/components/activity-timeline";
import { StackedIngestArea } from "@/components/charts/stacked-area";
import { InvestigatorBars } from "@/components/charts/investigator-bars";
import { useLayout } from '@/contexts/LayoutContext'; 

export default function DashboardHomePage() {
  const { getToken, isLoaded } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [investigatorBars, setInvestigatorBars] = useState<{ id: string; name: string; avatar: string; closedCount: number; avgTimeDays: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setRightRail } = useLayout(); 
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isLoaded || inFlight.current) return;

    const getDashboardData = async () => {
      inFlight.current = true;
      let attempts = 0;
      const maxAttempts = 2; // one retry on transient issues
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        while (attempts < maxAttempts) {
          try {
            const raw = await authenticatedFetch('http://localhost:8000/api/dashboard/stats', token);
            // Normalize activity types & investigator performance shape
            const normalized: DashboardData = {
              ...raw,
              activity: (raw.activity as RawActivity[]).map((a) => ({
                id: a.id,
                type: (['upload','merge','assign'].includes(a.type) ? a.type : 'upload') as 'upload'|'merge'|'assign',
                actor: a.actor,
                when: a.when,
                text: a.text,
              })),
            };
            setDashboardData(normalized);
            const perf = raw.investigatorPerf as InvestigatorPerf[];
            setInvestigatorBars(perf.map(p => ({
              id: p.name.toLowerCase().replace(/[^a-z0-9]/g,'-'),
              name: p.name,
              avatar: '/assets/person2.webp',
              closedCount: p.closedCount,
              avgTimeDays: Math.max(1, Math.round(30 / Math.max(1,p.closedCount)))
            })));
            setError(null);
            break;
          } catch (inner: unknown) {
            const msg = (inner as Error)?.message || '';
            if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
              // Unauthorized – break (token might be invalid)
              setError('Session expired or unauthorized. Please sign out and back in.');
              break;
            }
            attempts += 1;
            if (attempts >= maxAttempts) {
              setError((inner as Error).message || 'Failed to load dashboard data.');
            } else {
              await new Promise(r => setTimeout(r, 600));
            }
          }
        }
      } finally {
        setIsLoading(false);
        inFlight.current = false;
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

if (error) {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="inline-block px-4 py-2 rounded-md bg-red-900/30 border border-red-800">
        <h3 className="text-lg font-semibold text-red-300">Dashboard Unavailable</h3>
        <p className="text-red-400 mt-1 text-sm max-w-md mx-auto">{error}</p>
      </div>
      <button
        onClick={() => { setIsLoading(true); setError(null); setDashboardData(null); inFlight.current = false; }}
        className="btn-outline text-sm"
      >Retry</button>
    </div>
  );
}
if (!dashboardData) return null;
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
          <ActivityTimeline items={dashboardData.activity as unknown as { id:string; type:'upload'|'merge'|'assign'; actor:string; when:string; text:string }[]} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <StackedIngestArea data={dashboardData.ingestVolume} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <InvestigatorBars data={investigatorBars} />
        </div>
      </div>
    </div>
  );
}