import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMapInitialization } from './useMapInitialization'
import { useVolunteerLocation } from './useVolunteerLocation'
import { useRouteManagement } from './useRouteManagement'
import { useDonationActions } from './useDonationActions'
import { useRealtimeDonations } from './useRealtimeDonations'
import { getAvailableDonations, getUserDonations } from '../services'
import { supabase } from '../supabase'

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const useMapbox = (user) => {
  const { mapContainer, map } = useMapInitialization()
  const { location: volunteerLocation, error: locationError } = useVolunteerLocation()
  const routeManagement = useRouteManagement(map)
  const donationActions = useDonationActions(user?.id, volunteerLocation, routeManagement)

  const [mapReady, setMapReady] = useState(false)

  const pinesDonaciones = useRef({})
  const pinesComedores = useRef({})
  const marcadorVehiculo = useRef(null)
  const mapLoadedRef = useRef(false)

  // Guardamos referencias mutables para evitar ciclos infinitos de re-renderizado
  const donationActionsRef = useRef(donationActions)
  const volunteerLocationRef = useRef(volunteerLocation)

  useEffect(() => {
    donationActionsRef.current = donationActions
    volunteerLocationRef.current = volunteerLocation
  }, [donationActions, volunteerLocation])

  // Crear botones para el popup
  const crearBotonesAccion = useCallback(
    (donation, businessProfile, actions) => {
      const div = document.createElement('div')

      if (donation.status === 'disponible') {
        const btn = document.createElement('button')
        btn.textContent = 'Aceptar y Trazar Ruta'
        btn.className =
          'w-full bg-emerald-500 text-white p-2 rounded font-bold hover:bg-emerald-600 transition-colors'
        btn.onclick = async () => {
          btn.textContent = 'Trazando ruta...'
          btn.disabled = true
          const result = await actions.acceptDonation(
            donation.id,
            businessProfile.lng,
            businessProfile.lat
          )
          if (result?.success) {
            // Actualizamos el estado localmente y re-dibujamos los botones
            donation.status = 'en_camino'
            const parent = div.parentElement
            if (parent) {
              parent.innerHTML = ''
              parent.appendChild(crearBotonesAccion(donation, businessProfile, actions))
            }
          } else {
            alert(`Error: ${result?.error || 'No se pudo aceptar la donación'}`)
            btn.textContent = 'Aceptar y Trazar Ruta'
            btn.disabled = false
          }
        }
        div.appendChild(btn)
      } else if (donation.status === 'en_camino') {
        const pinBtn = document.createElement('button')
        pinBtn.textContent = 'Llegué al Local (PIN)'
        pinBtn.className =
          'w-full bg-amber-500 text-white p-2 rounded font-bold hover:bg-amber-600 transition-colors mb-2'
        pinBtn.onclick = async () => {
          const pin = prompt('Ingresa el PIN de 4 dígitos:')
          if (pin) {
            pinBtn.textContent = 'Validando...'
            const result = await actions.validateCollection(donation.id, pin)
            if (result?.success) {
              alert(`¡Ruta trazada hacia ${result.centerName} (${result.distance.toFixed(1)} km)!`)
              donation.status = 'recolectado'
              const parent = div.parentElement
              if (parent) {
                parent.innerHTML = ''
                parent.appendChild(crearBotonesAccion(donation, businessProfile, actions))
              }
            } else {
              alert(`Error: ${result?.error || 'No se pudo validar la recolección'}`)
              pinBtn.textContent = 'Llegué al Local (PIN)'
            }
          }
        }
        div.appendChild(pinBtn)

        const cancelBtn = document.createElement('button')
        cancelBtn.textContent = 'Cancelar Rescate'
        cancelBtn.className =
          'w-full bg-red-500 text-white p-2 rounded font-bold hover:bg-red-600 transition-colors'
        cancelBtn.onclick = async () => {
          if (confirm('¿Seguro que deseas cancelar este rescate?')) {
            cancelBtn.textContent = 'Cancelando...'
            const result = await actions.cancelDonation(donation.id)
            if (result?.success) {
              donation.status = 'disponible'
              const parent = div.parentElement
              if (parent) {
                parent.innerHTML = ''
                parent.appendChild(crearBotonesAccion(donation, businessProfile, actions))
              }
            } else {
              alert(`Error: ${result?.error || 'No se pudo cancelar el rescate'}`)
              cancelBtn.textContent = 'Cancelar Rescate'
            }
          }
        }
        div.appendChild(cancelBtn)
      } else if (donation.status === 'recolectado') {
        const msgDiv = document.createElement('div')
        msgDiv.textContent = '¡Alimento Recolectado!'
        msgDiv.className = 'bg-emerald-500 text-white p-2 rounded text-center font-bold text-sm'
        div.appendChild(msgDiv)
      }

      return div
    },
    []
  )

  // Agregar un pin al mapa
  const agregarPinAlMapa = useCallback(
    (donation) => {
      if (!map.current) return

      if (!donation.business_profiles) {
        console.warn(`Donación ${donation.id} bloqueada/ignorada: No hay datos del local. ¡Revisa el RLS en Supabase!`, donation)
        return
      }
      if (pinesDonaciones.current[donation.id]) return

      const businessProfile = donation.business_profiles

      const container = document.createElement('div')
      container.className = 'w-56'

      const html = `
        ${businessProfile.photo_url ? `<img src="${businessProfile.photo_url}" alt="Fachada" class="w-full h-28 object-cover rounded mb-2" />` : `<div class="w-full h-28 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">Sin foto</div>`}
        <h3 class="font-bold text-sm mb-1">🏢 ${businessProfile.business_name}</h3>
        <p class="text-xs text-gray-600 mb-1"><strong>Donación:</strong> ${donation.food_type}</p>
        <p class="text-xs text-gray-600 mb-3"><strong>Cantidad:</strong> ${donation.quantity}</p>
        <div id="donation-actions-${donation.id}"></div>
      `

      container.innerHTML = html

      const actionsContainer = container.querySelector(`#donation-actions-${donation.id}`)
      if (actionsContainer) {
        actionsContainer.appendChild(crearBotonesAccion(donation, businessProfile, donationActionsRef.current))
      }

      // Asegurarnos de que las coordenadas sean números. Mapbox falla silenciosamente si le pasas Strings.
      const lng = parseFloat(businessProfile.lng)
      const lat = parseFloat(businessProfile.lat)
      
      if (isNaN(lng) || isNaN(lat)) {
        console.error(`Error: Coordenadas inválidas para la donación ${donation.id}`);
        return;
      }

      console.log(`📍 Pin VERDE (Comercio) dibujado en: [${lng}, ${lat}]`);

      const marcador = new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25, maxWidth: '220px' }).setDOMContent(container))
        .addTo(map.current)

      pinesDonaciones.current[donation.id] = marcador
    },
    [map, crearBotonesAccion]
  )

  // Remover un pin del mapa
  const removerPinDelMapa = useCallback((donationId) => {
    if (pinesDonaciones.current[donationId]) {
      pinesDonaciones.current[donationId].remove()
      delete pinesDonaciones.current[donationId]
    }
  }, [])

  // Agregar pin de Comedor Comunitario (Centro de acopio)
  const agregarPinComedor = useCallback((center) => {
    if (!map.current) return
    if (pinesComedores.current[center.id]) return

    const lng = parseFloat(center.lng)
    const lat = parseFloat(center.lat)
    
    if (isNaN(lng) || isNaN(lat)) return

    console.log(`📍 Pin MORADO (Comedor) dibujado en: [${lng}, ${lat}]`)

    const container = document.createElement('div')
    container.className = 'w-48 p-2 text-center'
    container.innerHTML = `
      <div class="text-3xl mb-1">🏠</div>
      <h3 class="font-bold text-sm text-purple-700">${center.name}</h3>
      <p class="text-xs text-gray-600 mt-1">${center.address}</p>
      <div class="mt-2 text-[10px] bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold uppercase tracking-wider">Centro de Entrega</div>
    `

    const marcador = new mapboxgl.Marker({ color: '#9333ea' }) // Pin color morado
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(container))
      .addTo(map.current)

    pinesComedores.current[center.id] = marcador
  }, [map])

  // Detectar cuando el mapa está listo
  useEffect(() => {
    if (!map.current || mapLoadedRef.current) return

    const onLoad = () => {
      mapLoadedRef.current = true
      setMapReady(true)
    }

    if (map.current.loaded()) {
      onLoad()
    } else {
      map.current.on('load', onLoad)
    }
  }, [map])

  // Cargar donaciones iniciales
  useEffect(() => {
    if (!mapReady || !user?.id) return

    const loadDonations = async () => {
      try {
        const available = await getAvailableDonations()
        const userDonations = await getUserDonations(user.id)
        const all = [...available, ...userDonations]

        console.log("Rescates descargados de la base de datos:", all)

        const bounds = new mapboxgl.LngLatBounds()
        let hayPines = false

        all.forEach((d) => {
          agregarPinAlMapa(d)
          const lng = parseFloat(d.business_profiles?.lng)
          const lat = parseFloat(d.business_profiles?.lat)
          if (!isNaN(lng) && !isNaN(lat)) {
            bounds.extend([lng, lat])
            hayPines = true
          }
        })

        // UX: Si hay rescates, ajustamos la cámara para que se vean todos en pantalla
        if (hayPines && map.current) {
          map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 })
        }
      } catch (err) {
        console.error('Error loading donations:', err)
      }
    }

    loadDonations()
  }, [mapReady, user?.id, agregarPinAlMapa])

  // Cargar comedores comunitarios al mapa
  useEffect(() => {
    if (!mapReady || !user?.id) return

    const loadCenters = async () => {
      try {
        const { data, error } = await supabase.from('community_centers').select('*')
        if (error) throw error
        
        if (data) {
          console.log("Comedores descargados:", data)
          data.forEach(agregarPinComedor)
        }
      } catch (err) {
        console.error('Error loading community centers:', err)
      }
    }

    loadCenters()
  }, [mapReady, user?.id, agregarPinComedor])

  // Actualizar marcador de voluntario
  useEffect(() => {
    if (!map.current || !volunteerLocation) return

    if (!marcadorVehiculo.current) {
      console.log(`📍 Pin ROJO (Voluntario) dibujado en: [${volunteerLocation.lng}, ${volunteerLocation.lat}]`);
      marcadorVehiculo.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([volunteerLocation.lng, volunteerLocation.lat])
        .addTo(map.current)

      // Solo hacemos zoom directo al voluntario si NO hay donaciones dibujadas
      if (Object.keys(pinesDonaciones.current).length === 0) {
        map.current.flyTo({
          center: [volunteerLocation.lng, volunteerLocation.lat],
          zoom: 14
        })
      }
    } else {
      marcadorVehiculo.current.setLngLat([volunteerLocation.lng, volunteerLocation.lat])
    }

  }, [volunteerLocation, map])

  // Realtime updates
  const handleRealtimeChange = useCallback(
    async (payload) => {
      if (
        payload.eventType === 'INSERT' ||
        (payload.eventType === 'UPDATE' && payload.new.status === 'disponible')
      ) {
        
        // Supabase Realtime no trae los JOINs. Si no viene el perfil, lo buscamos rápido.
        let perfilNegocio = payload.new.business_profiles
        if (!perfilNegocio && payload.new.business_id) {
          const { data } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', payload.new.business_id)
            .single()
          
          if (data) {
            perfilNegocio = data
          } else {
            console.warn(`El perfil del local ${payload.new.business_id} fue bloqueado por Supabase.`)
          }
        }

        const donation = {
          ...payload.new,
          business_profiles: perfilNegocio
        }

        if (pinesDonaciones.current[donation.id]) {
          removerPinDelMapa(donation.id)
        }

        const currentLoc = volunteerLocationRef.current
        if (currentLoc && perfilNegocio?.lat && perfilNegocio?.lng) {
          const dist = calcularDistancia(
            currentLoc.lat,
            currentLoc.lng,
            perfilNegocio.lat,
            perfilNegocio.lng
          )
          if (dist <= 5) {
            alert(
              `¡Nuevo rescate cerca! "${donation.food_type}" en ${perfilNegocio.business_name} a ${dist.toFixed(1)}km`
            )
            if (map.current) {
              map.current.flyTo({
                center: [perfilNegocio.lng, perfilNegocio.lat],
                zoom: 15,
                essential: true
              })
            }
          }
        }

        agregarPinAlMapa(donation)
      }

      if (
        payload.eventType === 'UPDATE' &&
        payload.new.status === 'en_camino' &&
        payload.new.volunteer_id !== user?.id
      ) {
        removerPinDelMapa(payload.new.id)
      }

      if (payload.eventType === 'UPDATE' && payload.new.status === 'recolectado') {
        removerPinDelMapa(payload.new.id)
      }
    },
    [user?.id, agregarPinAlMapa, removerPinDelMapa, map]
  )

  // Estabilizamos el objeto user para evitar desconexiones infinitas de Supabase Realtime
  const stableUser = useMemo(() => user, [user?.id])
  useRealtimeDonations(stableUser, handleRealtimeChange)

  return {
    mapContainer,
    mapReady,
    locationError,
    location: volunteerLocation,
    ...donationActions,
    ...routeManagement
  }
}