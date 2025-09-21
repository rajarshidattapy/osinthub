export function RepoCard({
  title,
  description,
  tags,
  followers,
  updated,
  caseCount,
  spark,
  avatars,
}: {
  title: string
  description: string
  tags: string[]
  followers: number
  updated: string
  caseCount: number
  spark: number[]
  avatars: string[]
}) {
  return (
    <div className="card p-4 hover:-translate-y-1 transition-transform duration-150">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted mt-1">{description}</p>
        </div>
        <button
          className="rounded-md border border-grid px-2 py-1 text-xs hover:bg-background"
          aria-label="Follow repository"
          title="Follow"
        >
          ★ {followers}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {tags.map((t) => (
          <span key={t} className="text-xs rounded-full border border-grid px-2 py-0.5 text-muted">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3">
        <svg className="h-8 w-full" viewBox="0 0 100 24" aria-hidden>
          <polyline
            fill="none"
            stroke="var(--accent-2)"
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
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-muted">
        <div className="flex -space-x-2">
          {avatars.slice(0, 4).map((a, i) => (
            <div
              key={i}
              className="h-6 w-6 rounded-full bg-surface border border-grid"
              role="img"
              aria-label="Collaborator avatar"
              title="Collaborator"
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span>{caseCount} cases</span>
          <span>Updated {updated}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button className="btn-accent rounded-md px-3 py-1.5 text-sm">Open</button>
        <button className="btn-outline rounded-md px-3 py-1.5 text-sm">Create Case</button>
      </div>
    </div>
  )
}
