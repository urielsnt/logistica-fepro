import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function CrearComedor() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [coordenadas, setCoordenadas] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [obteniendoGPS, setObteniendoGPS] = useState(false)

  const obtenerGPS = () => {
    setObteniendoGPS(true)
    setMensaje("Buscando el comedor en el mapa...")
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setMensaje("Ubicación del comedor guardada. Los voluntarios serán guiados hacia aquí.")
          setObteniendoGPS(false)
        },
        (err) => {
          setMensaje("Error: Necesitas dar permisos de ubicación.")
          setObteniendoGPS(false)
        }
      )
    } else {
      setMensaje("Error: Tu navegador no soporta geolocalización.")
      setObteniendoGPS(false)
    }
  }

  const guardarComedor = async (e) => {
    e.preventDefault()
    if (!coordenadas || !nombre || !direccion) {
      setMensaje("Por favor llena el nombre, dirección y obtén la ubicación GPS.")
      return
    }
    setCargando(true)
    setMensaje("Guardando registro del comedor...")

    try {
      const { error: dbError } = await supabase
        .from('community_centers')
        .insert({
          manager_id: user.id,
          name: nombre,
          address: direccion,
          lat: coordenadas.lat,
          lng: coordenadas.lng
        })

      if (dbError) throw dbError

      setMensaje("¡Comedor registrado con éxito!")
      setTimeout(() => navigate('/panel-comedor'), 1500)
    } catch (error) {
      setMensaje("Error al guardar: " + error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex flex-col items-center p-6 w-full max-w-md mx-auto">
      <div className="w-full mb-4">
        <Link to="/" className="text-sm text-gray-500 font-medium hover:text-gray-800">← Volver al inicio</Link>
      </div>
      <h2 className="text-2xl font-bold mb-2 text-purple-700">Registrar Comedor</h2>
      <p className="text-gray-500 mb-6 text-center text-sm">
        Al registrar tu comedor comunitario, te conviertes en un punto de entrega para los alimentos rescatados.
      </p>

      <form onSubmit={guardarComedor} className="flex flex-col gap-4 w-full">
        <input type="text" placeholder="Nombre del Comedor Comunitario" value={nombre} onChange={(e) => setNombre(e.target.value)} className="border p-3 rounded-lg" />
        <input type="text" placeholder="Dirección completa" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="border p-3 rounded-lg" />

        <button type="button" onClick={obtenerGPS} disabled={obteniendoGPS} className={`p-3 rounded-lg font-medium transition-colors disabled:opacity-60 ${coordenadas ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
          {obteniendoGPS ? 'Ubicando...' : coordenadas ? 'GPS capturado correctamente' : 'Fijar ubicación para los voluntarios'}
        </button>

        <button type="submit" disabled={cargando} className="bg-purple-600 text-white p-3 rounded-lg font-bold mt-4 disabled:bg-gray-400 shadow-md">
          {cargando ? 'Guardando...' : 'Comenzar a recibir rescates'}
        </button>
      </form>

      {mensaje && <p className="mt-4 text-sm font-semibold text-center">{mensaje}</p>}
    </div>
  )
}