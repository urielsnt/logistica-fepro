import { supabase } from '../supabase'

export const getAvailableDonations = async () => {
  const { data, error } = await supabase
    .from('donations')
    .select('*, business_profiles(business_name, lat, lng, photo_url)')
    .eq('status', 'disponible')

  if (error) throw error
  return data || []
}

export const getUserDonations = async (userId) => {
  const { data, error } = await supabase
    .from('donations')
    .select('*, business_profiles(business_name, lat, lng, photo_url)')
    .eq('volunteer_id', userId)
    .in('status', ['en_camino', 'recolectado'])

  if (error) throw error
  return data || []
}

export const updateDonationStatus = async (donationId, status, volunteerId = null, centerId = null) => {
  const update = { status }

  if (volunteerId !== null) update.volunteer_id = volunteerId
  if (centerId !== null) update.destination_center_id = centerId

  const { error } = await supabase
    .from('donations')
    .update(update)
    .eq('id', donationId)

  if (error) throw error
}

export const validatePickupPin = async (donationId, pin) => {
  const { data, error } = await supabase
    .from('donations')
    .select('pickup_pin')
    .eq('id', donationId)
    .single()

  if (error) throw error
  return data?.pickup_pin === pin
}

export const getDonationWithPinAndLocation = async (donationId) => {
  const { data, error } = await supabase
    .from('donations')
    .select('id, pickup_pin, business_profiles(lat, lng, business_name)')
    .eq('id', donationId)
    .single()

  if (error) throw error
  return data
}

export const createDonation = async (donationData) => {
  const { error, data } = await supabase
    .from('donations')
    .insert(donationData)
    .select()
    .single()

  return { data, error }
}

export const getBusinessHistory = async (businessId) => {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getBusinessMetrics = async (businessId) => {
  const { data, error } = await supabase
    .from('donations')
    .select('quantity')
    .eq('business_id', businessId)
    .in('status', ['recolectado', 'entregado'])

  if (error) throw error

  let totalAlimentosSalvados = 0
  const rescatesExitosos = data.length

  data.forEach(donacion => {
    // Extraer el primer número encontrado en el string 'quantity' (ej: '15 piezas' -> 15)
    const match = donacion.quantity.match(/\d+/)
    if (match) {
      totalAlimentosSalvados += parseFloat(match[0])
    }
  })

  return {
    totalAlimentosSalvados,
    rescatesExitosos
  }
}
