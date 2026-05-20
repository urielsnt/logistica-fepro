import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const ProtectedRoute = ({ children, rolPermitido }) => {
  const { user, rol, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-emerald-500 font-bold animate-pulse text-xl">
          Validando acceso...
        </div>
      </div>
    )
  }

  // 1. Si no hay usuario, a login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. Si se requiere un rol específico y el usuario no lo tiene
  if (rolPermitido && rol !== rolPermitido) {
    console.warn(`Acceso denegado: se requiere rol '${rolPermitido}', el usuario tiene '${rol}'`)
    return <Navigate to="/" replace />
  }

  return children
}
