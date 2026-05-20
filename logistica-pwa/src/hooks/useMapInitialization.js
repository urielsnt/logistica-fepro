import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

export const useMapInitialization = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.2062, 19.0414],
      zoom: 13
    })
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  return { mapContainer, map }
}
