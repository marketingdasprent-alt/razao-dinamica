import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { ToastProvider } from '@/hooks/useToast'
import { LeadSheetProvider } from '@/hooks/useLeadSheet'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Leads from '@/pages/Leads'
import Chats from '@/pages/Chats'

function PrivateArea() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-sand text-navy/50 text-sm">A carregar…</div>
  }
  if (!session) {
    return <Login />
  }
  return (
    <LeadSheetProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </LeadSheetProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <PrivateArea />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
