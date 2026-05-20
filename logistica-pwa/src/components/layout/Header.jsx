import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../supabase'
import { useAuth } from '../../context/AuthContext'

export const Header = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const getTitulo = () => {
    const titulos = {
      '/donar': 'Dashboard de Comercio',
      '/voluntario': 'Mapa de Rescates',
      '/panel-comedor': 'Panel de Comedor',
      '/completar-perfil': 'Registro de Local',
      '/crear-comedor': 'Registro de Comedor'
    }
    return titulos[location.pathname] || 'Logística Cero'
  }

  if (!user) return null

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
          L
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900 leading-none">{getTitulo()}</h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">FEPRO 2026</p>
        </div>
      </div>

      <button 
        onClick={cerrarSesion}
        className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        <span>Cerrar Sesión</span>
        <span>🚪</span>
      </button>
    </header>
  )
}
