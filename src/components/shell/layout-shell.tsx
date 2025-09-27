import type React from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { useLayout } from '@/contexts/LayoutContext'

export default function LayoutShell({
  title: _titleProp,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  const { title, rightRail } = useLayout();
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        <Topbar title={title || _titleProp || 'OSINT Hub'} />
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
