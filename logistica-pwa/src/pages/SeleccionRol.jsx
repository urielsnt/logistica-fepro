import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function SeleccionRol() {
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const asignarRol = async (rol) => {
    setCargando(rol)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { rol: rol }
      })
      if (error) throw error
      
      // Redirección guiada según el rol
      if (rol === 'comercio') navigate('/completar-perfil')
      else if (rol === 'comedor') navigate('/crear-comedor')
      else navigate('/voluntario')
      
    } catch (error) {
      console.error('Error al asignar rol:', error.message)
      alert('Hubo un error al guardar tu elección.')
    } finally {
      setCargando(false)
    }
  }

  const opciones = [
    {
      id: 'comercio',
      titulo: 'Soy un Comercio',
      descripcion: 'Quiero donar excedentes de comida y reducir el desperdicio.',
      color: 'bg-emerald-500',
      emoji: '🍎'
    },
    {
      id: 'voluntario',
      titulo: 'Soy Voluntario',
      descripcion: 'Quiero ayudar a transportar alimentos a quienes más lo necesitan.',
      color: 'bg-blue-600',
      emoji: '🚲'
    },
    {
      id: 'comedor',
      titulo: 'Soy un Comedor',
      descripcion: 'Represento a un centro que recibe y distribuye alimentos.',
      color: 'bg-purple-600',
      emoji: '🏢'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Bienvenido a Logística Cero</h1>
        <p className="text-gray-600">Para comenzar, elige cómo quieres participar en nuestra red.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {opciones.map((opcion) => (
          <button
            key={opcion.id}
            disabled={!!cargando}
            onClick={() => asignarRol(opcion.id)}
            className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col items-center text-center relative overflow-hidden active:scale-95 disabled:opacity-50"
          >
            <div className={`w-16 h-16 ${opcion.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              {opcion.emoji}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{opcion.titulo}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{opcion.descripcion}</p>
            
            {cargando === opcion.id && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      <p className="mt-12 text-xs text-gray-400 font-medium uppercase tracking-widest">
        Podrás cambiar o ampliar tus funciones más adelante
      </p>
    </div>
  )
}
