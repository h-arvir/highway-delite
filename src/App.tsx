import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { useAuth } from './contexts/AuthContext'
import AuthPage from './pages/Auth'
import HomePage from './pages/Home'

function App() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}

export default App
