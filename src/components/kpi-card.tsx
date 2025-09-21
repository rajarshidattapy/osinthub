import { cn } from "@/lib/utils"

export function KpiCard({
  label,
  value,
  delta,
  deltaPositive,
  spark,
}: {
  label: string
  value: string
  delta: string
  deltaPositive?: boolean
  spark?: number[]
}) {
  return (
    <div className="card p-4 hover:-translate-y-1 transition-transform duration-150">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span
          className={cn(
            "text-xs rounded px-1.5 py-0.5",
            deltaPositive
              ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
              : "bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
          )}
        >
          {delta}
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {spark && spark.length > 0 && (
        <svg className="mt-3 h-8 w-full" viewBox="0 0 100 24" aria-hidden>
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            points={spark
              .map((v, i) => {
                const max = Math.max(...spark)
                const x = (i / (spark.length - 1)) * 100
                const y = 24 - (v / (max || 1)) * 24
                return `${x},${y}`
              })
              .join(" ")}
            opacity="0.9"
          />
        </svg>
      )}
    </div>
  )
}
