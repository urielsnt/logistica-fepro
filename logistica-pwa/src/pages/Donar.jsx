import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBusinessMetrics, getBusinessHistory, createDonation } from '../services'
import { MetricasCards, TablaHistorial, FormularioDonacion } from '../components/dashboard'

export default function Donar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [metricas, setMetricas] = useState({ totalAlimentosSalvados: 0, rescatesExitosos: 0 })
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [publicando, setPublicando] = useState(false)

  const cargarDatos = useCallback(async () => {
    if (!user?.id) return
    try {
      // GUARDIA INTERNO: Verificar si el perfil existe
      const { data: perfil, error: errorPerfil } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (errorPerfil || !perfil) {
        console.warn("Perfil de comercio no encontrado, redirigiendo a completar-perfil")
        navigate('/completar-perfil', { replace: true })
        return
      }

      const [m, h] = await Promise.all([
        getBusinessMetrics(user.id),
        getBusinessHistory(user.id)
      ])
      setMetricas(m)
      setHistorial(h)
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error)
    } finally {
      setCargando(false)
    }
  }, [user?.id, navigate])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const manejarPublicacion = async (tipoComida, cantidad) => {
    setPublicando(true)
    const pinGenerado = Math.floor(1000 + Math.random() * 9000).toString()

    try {
      const { error } = await createDonation({
        food_type: tipoComida,
        quantity: cantidad,
        status: 'disponible',
        business_id: user.id,
        pickup_pin: pinGenerado
      })

      if (error) throw error

      // Recargar datos para mostrar la nueva donación en el historial
      await cargarDatos()
      
      return { success: true, pin: pinGenerado }
    } catch (error) {
      console.error("Error al publicar:", error)
      return { success: false, error: error.message }
    } finally {
      setPublicando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-emerald-500 font-bold animate-pulse text-xl">
          Cargando Dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Métricas */}
        <MetricasCards metricas={metricas} />

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario (1/3) */}
          <div className="lg:col-span-1">
            <FormularioDonacion onPublicar={manejarPublicacion} publicando={publicando} />
          </div>

          {/* Columna Derecha: Historial (2/3) */}
          <div className="lg:col-span-2">
            <TablaHistorial historial={historial} />
          </div>
        </div>
      </div>
    </div>
  )
}
