import { Upload, GitMerge, UserPlus } from "lucide-react"

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
  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
      <ul className="space-y-3">
        {items.map((it) => {
          const Icon = ICONS[it.type]
          return (
            <li key={it.id} className="flex items-start gap-3">
              <Icon className="h-4 w-4 text-accent-2 mt-1" aria-hidden />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-accent-2">{it.actor}</span> <span className="text-muted">{it.text}</span>
                </p>
                <p className="text-xs text-muted">{it.when}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
