import { Routes, Route, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Donar from './pages/Donar'
import Voluntario from './pages/Voluntario'
import Login from './pages/Login'
import CompletarPerfil from './pages/CompletarPerfil'
import CrearComedor from './pages/CrearComedor'
import PanelComedor from './pages/PanelComedor'
import SeleccionRol from './pages/SeleccionRol'
import { ProtectedRoute, Header } from './components/layout'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const ProtectedLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
  </>
)

const OnboardingGuard = ({ children }) => {
  const { user, rol, cargando } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!cargando && user && !rol && location.pathname !== '/seleccion-rol') {
      navigate('/seleccion-rol', { replace: true })
    }
  }, [user, rol, cargando, navigate, location])

  return children
}

function App() {
  return (
    <OnboardingGuard>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seleccion-rol" element={<SeleccionRol />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedLayout />}>
        {/* Comercio */}
        <Route path="/donar" element={
          <ProtectedRoute rolPermitido="comercio">
            <Donar />
          </ProtectedRoute>
        } />
        <Route path="/completar-perfil" element={
          <ProtectedRoute>
            <CompletarPerfil />
          </ProtectedRoute>
        } />

        {/* Voluntario */}
        <Route path="/voluntario" element={
          <ProtectedRoute rolPermitido="voluntario">
            <Voluntario />
          </ProtectedRoute>
        } />

        {/* Comedor */}
        <Route path="/crear-comedor" element={
          <ProtectedRoute>
            <CrearComedor />
          </ProtectedRoute>
        } />
        <Route path="/panel-comedor" element={
          <ProtectedRoute rolPermitido="comedor">
            <PanelComedor />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  </OnboardingGuard>
  )
}

export default App