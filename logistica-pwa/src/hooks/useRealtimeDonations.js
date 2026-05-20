import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'

export const useRealtimeDonations = (user, onDonationChanged) => {
  const [syncError, setSyncError] = useState(null)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!user) return

    channelRef.current = supabase
      .channel('cambios-donaciones')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        async (payload) => {
          try {
            onDonationChanged?.(payload)
            setSyncError(null)
          } catch (err) {
            setSyncError(err.message)
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user, onDonationChanged])

  return { syncError }
}
