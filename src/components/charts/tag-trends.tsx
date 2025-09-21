"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function TagTrends({
  data,
}: {
  data: { date: string; tag: string; value: number }[]
}) {
  const tags = Array.from(new Set(data.map((d) => d.tag)))
  const byDate: Record<string, any> = {}
  data.forEach((d) => {
    byDate[d.date] ||= { date: d.date }
    byDate[d.date][d.tag] = d.value
  })
  const rows = Object.values(byDate).sort((a: any, b: any) => (a.date > b.date ? 1 : -1))

  const palette = ["#4FD1C5", "#7C5CFF", "#4ADE80", "#FF6B6B"]

  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium mb-3">Tag Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows as any[]} margin={{ left: 8, right: 8 }}>
            <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <Legend />
            {tags.map((t, i) => (
              <Line
                key={t}
                type="monotone"
                dataKey={t}
                stroke={palette[i % palette.length]}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
