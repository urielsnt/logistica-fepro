import { supabase } from '../supabase'

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const getNearestCommunityCenter = async (lat, lng) => {
  const { data: centers, error } = await supabase
    .from('community_centers')
    .select('id, name, lat, lng')

  if (error || !centers?.length) throw new Error('No community centers found')

  let nearest = null
  let minDistance = Infinity

  centers.forEach((centro) => {
    if (centro.lat == null || centro.lng == null) return

    const dist = calcularDistancia(lat, lng, centro.lat, centro.lng)
    if (dist < minDistance) {
      minDistance = dist
      nearest = { ...centro, distance: dist }
    }
  })

  if (!nearest) throw new Error('No valid community centers found')
  return nearest
}

export const getAllCommunityCenters = async () => {
  const { data, error } = await supabase
    .from('community_centers')
    .select('id, name, lat, lng')

  if (error) throw error
  return data || []
}
