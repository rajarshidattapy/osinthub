import { useState } from "react"
import { Upload, GitMerge, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"

type Item = {
  id: string
  type: "upload" | "merge" | "assign"
  actor: string
  when: string
  text: string
}

const ICONS: Record<Item["type"], any> = {
  upload: Upload,
  merge: GitMerge,
  assign: UserPlus,
}

export function ActivityTimeline({ items }: { items: Item[] }) {
  const [page, setPage] = useState(0)
  const pageSize = 5

  const start = page * pageSize
  const end = start + pageSize
  const visibleItems = items.slice(start, end)

  const hasPrev = page > 0
  const hasNext = end < items.length

  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium mb-3">Recent Activity</h3>

      {/* Timeline container with horizontal transition */}
      <div className="overflow-hidden relative">
        <ul
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {Array.from({ length: Math.ceil(items.length / pageSize) }).map((_, idx) => (
            <li key={idx} className="w-full shrink-0">
              <ul className="space-y-3">
                {items.slice(idx * pageSize, idx * pageSize + pageSize).map((it) => {
                  const Icon = ICONS[it.type]
                  return (
                    <li key={it.id} className="flex items-start gap-3">
                      <Icon className="h-4 w-4 text-accent-2 mt-1" aria-hidden />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="text-accent-2">{it.actor}</span>{" "}
                          <span className="text-muted">{it.text}</span>
                        </p>
                        <p className="text-xs text-muted">{it.when}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!hasPrev}
          className="p-2 rounded-full bg-muted text-foreground disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-xs text-muted">
          Page {page + 1} of {Math.ceil(items.length / pageSize)}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext}
          className="p-2 rounded-full bg-muted text-foreground disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
