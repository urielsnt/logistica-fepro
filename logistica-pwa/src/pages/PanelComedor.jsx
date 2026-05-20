import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function PanelComedor() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [comedor, setComedor] = useState(null)
  const [rescatesEnCamino, setRescatesEnCamino] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  
  useEffect(() => {
    const cargarDatosComedor = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('community_centers')
          .select('*')
          .eq('manager_id', user.id)
          .single()

        if (error || !data) {
          console.warn("Perfil de comedor no encontrado, redirigiendo a crear-comedor")
          navigate('/crear-comedor', { replace: true })
          return
        }

        setComedor(data)
        
        if (data) {
          await cargarRescatesEntrantes(data.id)
          escucharRescatesTiempoReal(data.id)
        }
      } catch (err) {
        console.error("Error cargando comedor:", err.message)
      } finally {
        setCargando(false)
      }
    }

    cargarDatosComedor()
  }, [user, navigate])

  const cargarRescatesEntrantes = async (comedorId) => {
    const { data, error } = await supabase
      .from('donations')
      .select('*, business_profiles(business_name)')
      .eq('destination_center_id', comedorId)
      .eq('status', 'recolectado')

    if (!error && data) {
      setRescatesEnCamino(data)
    }
  }

  const escucharRescatesTiempoReal = (comedorId) => {
    supabase
      .channel(`comedor-${comedorId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'donations', filter: `destination_center_id=eq.${comedorId}` },
        async (payload) => {
          console.log("Cambio detectado en el comedor!", payload)

          if (payload.new.status === 'recolectado') {
            const { data: negocio } = await supabase
              .from('business_profiles')
              .select('business_name')
              .eq('id', payload.new.business_id)
              .single()

            const nuevoRescate = {
              ...payload.new,
              business_profiles: negocio || { business_name: 'Comercio Local' }
            }

            setRescatesEnCamino((prev) => {
              if (prev.some(r => r.id === nuevoRescate.id)) return prev
              return [nuevoRescate, ...prev]
            })

            setMensaje("¡Atención! Un voluntario acaba de recolectar un alimento y viene hacia acá.")
          }

          if (payload.new.status === 'entregado' || payload.new.status === 'disponible') {
            setRescatesEnCamino((prev) => prev.filter(r => r.id !== payload.new.id))
          }
        }
      )
      .subscribe()
  }

  const resolverEntrega = async (donacionId, nuevoEstado) => {
    setMensaje("Actualizando estatus...")
    
    const { error } = await supabase
      .from('donations')
      .update({ status: nuevoEstado })
      .eq('id', donacionId)

    if (error) {
      setMensaje("Error al actualizar la entrega.")
    } else {
      setRescatesEnCamino((prev) => prev.filter(r => r.id !== donacionId))
    }
    
    setTimeout(() => setMensaje(''), 4000)
  }

  if (cargando) return <div className="p-6 text-center text-gray-500 animate-pulse">Cargando panel de administración...</div>

  if (!comedor) {
    return (
      <div className="p-6 text-center max-w-md mx-auto mt-10 border rounded-xl shadow-sm bg-white">
        <h2 className="text-xl font-bold text-red-500 mb-2">Acceso Restringido</h2>
        <p className="text-gray-500 text-sm">Tu cuenta no está vinculada como administrador de ningún Comedor Comunitario.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {mensaje && (
        <div className="mb-4 p-4 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100 text-center animate-bounce">
          {mensaje}
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        Envíos en camino de última milla ({rescatesEnCamino.length})
      </h2>

      {rescatesEnCamino.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center text-gray-400 bg-gray-50">
          <p className="text-lg font-medium">No hay rescates dirigiéndose hacia acá en este momento.</p>
          <p className="text-xs mt-1 text-gray-400">Las alertas en tiempo real aparecerán aquí automáticamente en cuanto un voluntario use su PIN.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rescatesEnCamino.map((rescate) => (
            <div key={rescate.id} className="border rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between border-l-4 border-l-purple-500">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {rescate.food_type}
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-md uppercase">
                    Por Entregar
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1"><b>Cantidad:</b> {rescate.quantity}</p>
                <p className="text-sm text-gray-600 mb-4"><b>Origen:</b> {rescate.business_profiles?.business_name || 'Comercio Local'}</p>
              </div>

              <div className="flex gap-2 border-t pt-3 mt-2">
                <button
                  onClick={() => resolverEntrega(rescate.id, 'entregado')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
                >
                  ✓ Todo OK / Recibido
                </button>
                <button
                  onClick={() => resolverEntrega(rescate.id, 'cancelado')}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 px-3 rounded-lg text-sm transition-colors"
                >
                  Reportar Faltante
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}