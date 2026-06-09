import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminScreen } from './screens/AdminScreen'
import { CompletionScreen } from './screens/CompletionScreen'
import { ExamScreen } from './screens/ExamScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LearnScreen } from './screens/LearnScreen'
import { LoginScreen } from './screens/LoginScreen'
import { MiniGameScreen } from './screens/MiniGameScreen'
import { MyGrowthScreen } from './screens/MyGrowthScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SignUpScreen } from './screens/SignUpScreen'
import { SortingHatScreen } from './screens/SortingHatScreen'
import { SplashScreen } from './screens/SplashScreen'
import { VocabularyScreen } from './screens/VocabularyScreen'
import { useAppStore } from './store/useAppStore'

function AppRoutes() {
  const hydrate = useAppStore((s) => s.hydrate)
  const hydrated = useAppStore((s) => s.hydrated)
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const profileComplete = useAppStore((s) => s.profileComplete)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) {
    return (
      <div className="mobile-shell flex min-h-dvh items-center justify-center bg-bg">
        <div
          className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold"
          style={{ animation: 'spin-gold 1s linear infinite' }}
        />
      </div>
    )
  }

  return (
    <div className="mobile-shell flex h-full min-h-dvh w-full flex-col bg-bg">
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={profileComplete ? '/home' : '/sorting-hat'} replace /> : <LoginScreen />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to={profileComplete ? '/home' : '/sorting-hat'} replace /> : <SignUpScreen />} />
        <Route path="/sorting-hat" element={isAuthenticated ? <SortingHatScreen /> : <Navigate to="/login" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/study" element={<VocabularyScreen />} />
          <Route path="/exam" element={<ExamScreen />} />
          <Route path="/complete" element={<CompletionScreen />} />
          <Route path="/duel" element={<MiniGameScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/learn" element={<LearnScreen />} />
            <Route path="/growth" element={<MyGrowthScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
