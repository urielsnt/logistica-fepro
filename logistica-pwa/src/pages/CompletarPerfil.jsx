import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function CompletarPerfil() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [nombreDueno, setNombreDueno] = useState('')
  const [foto, setFoto] = useState(null)
  const [coordenadas, setCoordenadas] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [obteniendoGPS, setObteniendoGPS] = useState(false)

  const obtenerGPS = () => {
    setObteniendoGPS(true)
    setMensaje("Buscando tu local en el mapa...")
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setMensaje("Ubicación del negocio guardada.")
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

  const guardarPerfil = async (e) => {
    e.preventDefault()
    if (!coordenadas || !foto || !nombreNegocio || !nombreDueno) {
      setMensaje("Por favor llena todos los datos, sube una foto y obtén tu ubicación.")
      return
    }
    setCargando(true)
    setMensaje("Subiendo foto y guardando perfil...")

    try {

      const fileExt = foto.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('business-photos')
        .upload(fileName, foto)
      
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('business-photos')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('business_profiles')
        .insert({
          id: user.id,
          business_name: nombreNegocio,
          owner_name: nombreDueno,
          lat: coordenadas.lat,
          lng: coordenadas.lng,
          photo_url: publicUrlData.publicUrl
        })

      if (dbError) throw dbError

      setMensaje("¡Perfil de negocio creado con éxito!")
      setTimeout(() => navigate('/'), 2000)

    } catch (error) {
      setMensaje("Error al guardar: " + error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex flex-col items-center p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2">Registra tu Negocio</h2>
      <p className="text-gray-500 mb-6 text-center text-sm">
        Completa tu perfil una sola vez para donar más rápido y obtener estadísticas.
      </p>

      <form onSubmit={guardarPerfil} className="flex flex-col gap-4 w-full">
        <input 
          type="text" 
          placeholder="Nombre de la panadería/local" 
          value={nombreNegocio}
          onChange={(e) => setNombreNegocio(e.target.value)}
          className="border p-3 rounded-lg"
        />
        <input 
          type="text" 
          placeholder="Tu nombre (Dueño/Encargado)" 
          value={nombreDueno}
          onChange={(e) => setNombreDueno(e.target.value)}
          className="border p-3 rounded-lg"
        />

        <div className="border p-3 rounded-lg bg-gray-50">
          <label className="block text-sm text-gray-600 mb-1 font-medium">Foto de la fachada:</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="w-full text-sm"
          />
        </div>

        <button 
          type="button" 
          onClick={obtenerGPS}
          disabled={obteniendoGPS}
          className={`p-3 rounded-lg font-medium transition-colors disabled:opacity-60 ${coordenadas ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
        >
          {obteniendoGPS ? 'Ubicando...' : coordenadas ? 'Ubicación capturada' : 'Obtener ubicación de este local'}
        </button>

        <button 
          type="submit" 
          disabled={cargando}
          className="bg-emerald-500 text-white p-3 rounded-lg font-bold mt-4 disabled:bg-gray-400"
        >
          {cargando ? 'Guardando...' : 'Finalizar Registro'}
        </button>
      </form>

      {mensaje && <p className="mt-4 text-sm font-semibold text-center">{mensaje}</p>}
    </div>
  )
}