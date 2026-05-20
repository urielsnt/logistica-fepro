import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, rol } = useAuth()
  const navigate = useNavigate()

  // PANTALLA 1: USUARIO NO LOGUEADO (Landing Page)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full p-6 bg-gray-50/30 min-h-screen">
        <div className="max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-8 shadow-xl shadow-emerald-500/20">
            L
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Logística Cero</h1>
          <p className="text-gray-500 mb-12 text-lg leading-relaxed">
            Conectamos excedentes de comida con comedores comunitarios en tiempo real. **Únete a la red de rescate.**
          </p>
          <Link
            to="/login"
            className="inline-block bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-gray-800 shadow-2xl w-full transition-all transform hover:scale-[1.02] active:scale-95 text-lg"
          >
            Comenzar Ahora
          </Link>
          <p className="mt-8 text-sm text-gray-400 font-medium">FEPRO 2026 • Innovación Social</p>
        </div>
      </div>
    )
  }

  // PANTALLA 2: DASHBOARD SELECTOR (Acceso Directo al Panel)
  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-6 bg-gray-50/30 min-h-[calc(100vh-65px)]">
      <div className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 max-w-sm w-full">
        <div className="mb-8">
          <span className="text-4xl mb-4 block">👋</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola de nuevo!
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            Todo listo para continuar con tus actividades.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {rol === 'comercio' && (
            <Link
              to="/donar"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center gap-1 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform">Ir a mi Panel de Comercio</span>
              <span className="text-xs font-normal opacity-80 italic">Publicar alimento sobrante</span>
            </Link>
          )}

          {rol === 'comedor' && (
            <Link
              to="/panel-comedor"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-5 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20 flex flex-col items-center justify-center gap-1 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform">Ir a mi Panel de Comedor</span>
              <span className="text-xs font-normal opacity-80 italic">Gestionar recepciones</span>
            </Link>
          )}

          {rol === 'voluntario' && (
            <Link
              to="/voluntario"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center gap-1 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform">Ir a Mapa de Rescate</span>
              <span className="text-xs font-normal opacity-80 italic">Ver mapa y recolectar</span>
            </Link>
          )}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-50">
          <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">
            Logística Cero v1.0
          </p>
        </div>
      </div>
    </div>
  )
}