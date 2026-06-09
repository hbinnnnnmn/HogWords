import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

/** Main app shell with mobile bottom navigation (9:16 optimized) */
export function AppLayout() {
  return (
    <div className="flex h-full min-h-dvh w-full flex-col">
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg pb-[72px]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
