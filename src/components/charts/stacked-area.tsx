"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function StackedIngestArea({
  data,
}: {
  data: { date: string; web: number; social: number; darkweb: number }[]
}) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium mb-3">Ingest Volume (30d)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 8 }}>
            <defs>
              <linearGradient id="gWeb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4FD1C5" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#4FD1C5" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gSocial" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <Legend />
            <Area type="monotone" dataKey="web" stackId="1" stroke="#4FD1C5" fill="url(#gWeb)" />
            <Area type="monotone" dataKey="social" stackId="1" stroke="#7C5CFF" fill="url(#gSocial)" />
            <Area type="monotone" dataKey="darkweb" stackId="1" stroke="#4ADE80" fill="url(#gDark)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
