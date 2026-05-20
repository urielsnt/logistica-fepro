import { useState, useCallback, useMemo } from 'react'
import { updateDonationStatus, validatePickupPin } from '../services/donationService'
import { getNearestCommunityCenter } from '../services/communityService'

export const useDonationActions = (userId, volunteerLocation, routeManagement) => {
  const [actionError, setActionError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const acceptDonation = useCallback(async (donationId, businessLng, businessLat) => {
    if (!volunteerLocation) {
      const msg = 'GPS no disponible'
      setActionError(msg)
      return { success: false, error: msg }
    }

    try {
      setActionLoading('accept')

      await updateDonationStatus(donationId, 'en_camino', userId)
      await routeManagement.setDestination(businessLng, businessLat, volunteerLocation)

      setActionError(null)
      return { success: true }
    } catch (err) {
      const msg = err.message
      setActionError(msg)
      return { success: false, error: msg }
    } finally {
      setActionLoading(null)
    }
  }, [volunteerLocation, routeManagement, userId])

  const cancelDonation = useCallback(async (donationId) => {
    try {
      setActionLoading('cancel')

      await updateDonationStatus(donationId, 'disponible')
      await routeManagement.clearRoute()

      setActionError(null)
      return { success: true }
    } catch (err) {
      const msg = err.message
      setActionError(msg)
      return { success: false, error: msg }
    } finally {
      setActionLoading(null)
    }
  }, [routeManagement])

  const validateCollection = useCallback(async (donationId, pin) => {
    if (!volunteerLocation) {
      const msg = 'Tu ubicación no está disponible'
      setActionError(msg)
      return { success: false, error: msg }
    }

    try {
      setActionLoading('validate')

      const isValid = await validatePickupPin(donationId, pin)

      if (!isValid) {
        const msg = 'PIN incorrecto'
        setActionError(msg)
        return { success: false, error: msg }
      }

      // Encontrar comedor más cercano
      const nearest = await getNearestCommunityCenter(volunteerLocation.lat, volunteerLocation.lng)

      // Actualizar donación como recolectada
      await updateDonationStatus(donationId, 'recolectado', null, nearest.id)

      // Trazar nueva ruta al comedor
      await routeManagement.setDestination(nearest.lng, nearest.lat, volunteerLocation)

      setActionError(null)
      return {
        success: true,
        centerName: nearest.name,
        distance: nearest.distance
      }
    } catch (err) {
      const msg = err.message
      setActionError(msg)
      return { success: false, error: msg }
    } finally {
      setActionLoading(null)
    }
  }, [volunteerLocation, routeManagement])

  return useMemo(() => ({
    acceptDonation,
    cancelDonation,
    validateCollection,
    actionError,
    actionLoading
  }), [acceptDonation, cancelDonation, validateCollection, actionError, actionLoading])
}
