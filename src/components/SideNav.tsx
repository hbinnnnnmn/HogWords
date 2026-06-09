import { BookOpen, Home, Settings, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/home', icon: Home, label: '홈' },
  { to: '/learn', icon: BookOpen, label: '학습' },
  { to: '/growth', icon: TrendingUp, label: '성장' },
  { to: '/settings', icon: Settings, label: '설정' },
] as const

export function SideNav() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#0a0818]/95 backdrop-blur-md">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="font-display text-xl text-gold text-glow-gold">HogWords</p>
        <p className="mt-1 text-xs text-[#AAAAAA]">Master English like a Wizard</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold/15 text-gold'
                  : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gold shadow-[0_0_8px_#D4AF37]" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <p className="px-5 py-4 text-[10px] text-[#666]">PC 웹 · 로컬 저장</p>
    </aside>
  )
}
