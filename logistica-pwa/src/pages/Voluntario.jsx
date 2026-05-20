import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMapbox } from '../hooks'

// IMPORTANTE: CSS de Mapbox requerido para que los pines (Markers) y Popups sean visibles
import 'mapbox-gl/dist/mapbox-gl.css'

export default function Voluntario() {
  const { user } = useAuth()
  const { mapContainer, mapReady, locationError, location } = useMapbox(user)

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] w-full relative">
      {/* Estado de ubicación */}
      {!location && !locationError && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-md animate-pulse">
          <p className="font-bold">📍 Obteniendo tu ubicación...</p>
          <p className="text-sm">Asegúrate de haber dado permiso de ubicación al navegador</p>
        </div>
      )}

      {/* Errores de ubicación */}
      {locationError && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
          <p className="font-bold">Error de ubicación:</p>
          <p className="text-sm">{locationError}</p>
        </div>
      )}

      {/* Contenedor del mapa de Mapbox */}
      <div ref={mapContainer} className="flex-1 w-full bg-gray-100" />

      {/* Indicador de carga del mapa */}
      {!mapReady && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-50/80">
          <div className="animate-pulse text-emerald-600 font-bold text-xl">Iniciando Mapbox...</div>
        </div>
      )}
    </div>
  )
}