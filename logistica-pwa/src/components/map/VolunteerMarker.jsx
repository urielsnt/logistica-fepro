import { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

export const useVolunteerMarker = (map, location) => {
  useEffect(() => {
    if (!map.current || !location) return

    const markerElement = document.createElement('div')
    markerElement.className = 'w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg'

    const marker = new mapboxgl.Marker({ element: markerElement })
      .setLngLat([location.lng, location.lat])

    if (!map.current.getLayer('volunteer-marker')) {
      marker.addTo(map.current)
    } else {
      marker.setLngLat([location.lng, location.lat])
    }

    return () => {
      // No remover el marker, actualizar posición
    }
  }, [map, location])
}
