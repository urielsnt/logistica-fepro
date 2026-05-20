import { useEffect, useState, useRef } from 'react'

export const useVolunteerLocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocalización no disponible en este navegador')
      return
    }

    setIsTracking(true)
    console.log('Iniciando geolocalización...')

    // Usar watchPosition directamente (es más confiable que getCurrentPosition)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const locData = {
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
          accuracy: pos.coords.accuracy
        }
        console.log('✓ Ubicación obtenida:', locData)
        setLocation(locData)
        setError(null)
      },
      (err) => {
        const msg = `Error de geolocalización: ${err.message}`
        console.error('watchPosition error:', msg, err.code)
        setError(msg)
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setIsTracking(false)
    }
  }, [])

  return { location, error, isTracking }
}
