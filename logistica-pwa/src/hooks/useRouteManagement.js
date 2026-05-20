import { useState, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'

export const useRouteManagement = (map) => {
  const destinationRef = useRef(null)
  const [isRouteActive, setIsRouteActive] = useState(false)
  const [routeError, setRouteError] = useState(null)

  const clearRoute = useCallback(() => {
    if (!map.current) return

    if (map.current.getLayer('ruta')) {
      map.current.removeLayer('ruta')
    }
    if (map.current.getSource('ruta')) {
      map.current.removeSource('ruta')
    }

    destinationRef.current = null
    setIsRouteActive(false)
  }, [map])

  const traceRoute = useCallback(async (origin, destination) => {
    if (!origin || !destination || !map.current) {
      setRouteError('Origen o destino no disponibles')
      return false
    }

    try {
      const { lng: oLng, lat: oLat } = origin
      const [dLng, dLat] = destination

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${oLng},${oLat};${dLng},${dLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      )
      const data = await response.json()

      if (!data.routes?.[0]?.geometry) {
        throw new Error('No route found')
      }

      const ruta = data.routes[0].geometry

      if (map.current.getSource('ruta')) {
        map.current.getSource('ruta').setData(ruta)
      } else {
        map.current.addLayer({
          id: 'ruta',
          type: 'line',
          source: { type: 'geojson', data: ruta },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.8 }
        })
      }

      setIsRouteActive(true)
      setRouteError(null)
      return true
    } catch (err) {
      setRouteError(err.message)
      setIsRouteActive(false)
      return false
    }
  }, [map])

  const setDestination = useCallback(async (lng, lat, origin) => {
    if (!origin) {
      setRouteError('Tu ubicación no está disponible')
      return false
    }

    destinationRef.current = [lng, lat]
    return await traceRoute(origin, [lng, lat])
  }, [traceRoute])

  return {
    setDestination,
    clearRoute,
    isRouteActive,
    routeError,
    traceRoute
  }
}
