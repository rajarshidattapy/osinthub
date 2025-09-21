import type React from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

export default function LayoutShell({
  title,
  rightRail,
  children,
}: {
  title: string
  rightRail?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        <Topbar title={title} />
        <div className="mx-auto max-w-7xl p-4">
          <div className="grid grid-cols-12 gap-4">
            <section className={rightRail ? "col-span-12 lg:col-span-9" : "col-span-12"}>{children}</section>
            {rightRail && <aside className="hidden lg:block col-span-3">{rightRail}</aside>}
          </div>
        </div>
      </main>
    </div>
  )
}
