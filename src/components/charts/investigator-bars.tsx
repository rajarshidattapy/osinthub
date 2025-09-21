"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function InvestigatorBars({
  data,
}: {
  data: { id: string; name: string; avatar: string; closedCount: number; avgTimeDays: number }[]
}) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium mb-3">Investigator Performance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 8 }}>
            <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <Bar dataKey="closedCount" fill="#4FD1C5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
