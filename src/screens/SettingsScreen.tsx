import { LogOut, Shield } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminPasswordModal } from '../components/AdminPasswordModal'
import { GlassCard } from '../components/GlassCard'
import { HouseBadge } from '../components/HouseBadge'
import { PageContainer } from '../components/PageContainer'
import { useAppStore } from '../store/useAppStore'

export function SettingsScreen() {
  const navigate = useNavigate()
  const [adminOpen, setAdminOpen] = useState(false)
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <PageContainer>
      <h1 className="font-display text-3xl text-gold">Settings</h1>
      <p className="mt-2 text-sm text-[#AAAAAA]">HogWords v1.0 · Mobile Web</p>

      {user && (
        <GlassCard className="mt-6 p-5">
          <p className="text-sm text-[#aaa]">Wizard Profile</p>
          <p className="mt-1 text-lg font-medium">{user.name}</p>
          <p className="text-sm text-[#888]">{user.email}</p>
          <div className="mt-3">
            <HouseBadge house={user.house} />
          </div>
          <p className="mt-3 text-xs text-[#666]">🪄 {user.wandType}</p>
        </GlassCard>
      )}

      <GlassCard className="mt-4 max-w-lg p-2">
        <button
          type="button"
          onClick={() => setAdminOpen(true)}
          className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition hover:bg-white/5"
        >
          <div className="rounded-xl bg-gold/15 p-3">
            <Shield className="text-gold" size={24} />
          </div>
          <div>
            <p className="font-medium">Admin Mode</p>
            <p className="text-sm text-[#AAAAAA]">CRUD vocabulary · passcode protected</p>
          </div>
        </button>
      </GlassCard>

      <button
        type="button"
        onClick={handleLogout}
        className="btn-primary mt-6 flex w-full max-w-lg items-center justify-center gap-2 border border-white/10 bg-white/5 text-[#ccc]"
      >
        <LogOut size={18} />
        Log Out
      </button>

      <p className="mt-8 text-xs text-[#666]">
        Data is stored locally in your browser (localStorage mock database).
      </p>

      <AdminPasswordModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        onSuccess={() => {
          setAdminOpen(false)
          navigate('/admin')
        }}
      />
    </PageContainer>
  )
}
