import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

/** Redirects unauthenticated users to login and incomplete profiles to Sorting Hat */
export function ProtectedRoute({ requireProfile = true }: { requireProfile?: boolean }) {
  const hydrated = useAppStore((s) => s.hydrated)
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const profileComplete = useAppStore((s) => s.profileComplete)

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-gold">
        <div
          className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold"
          style={{ animation: 'spin-gold 1s linear infinite' }}
        />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireProfile && !profileComplete) return <Navigate to="/sorting-hat" replace />

  return <Outlet />
}
