import { BookOpen, Home, Settings, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/learn', icon: BookOpen, label: 'Learning' },
  { to: '/growth', icon: TrendingUp, label: 'Growth' },
  { to: '/settings', icon: Settings, label: 'Settings' },
] as const

/** Mobile bottom navigation bar — Home | Learning | Growth | Settings */
export function BottomNav() {
  return (
    <nav className="mobile-bottom-nav safe-bottom">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition ${
              isActive ? 'text-gold' : 'text-[#888]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`rounded-xl p-2 transition ${
                  isActive ? 'bg-gold/15 shadow-[0_0_12px_rgba(212,175,55,0.3)]' : ''
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
