import { useState } from 'react'

export const DonationMarker = ({
  donation,
  businessProfile,
  onAccept,
  onCancel,
  onValidate,
  isLoading
}) => {
  const [pinInput, setPinInput] = useState('')
  const [showPinDialog, setShowPinDialog] = useState(false)

  const handleValidate = async () => {
    if (!pinInput.trim()) return
    const result = await onValidate(donation.id, pinInput)
    if (result?.success) {
      setShowPinDialog(false)
      setPinInput('')
    }
  }

  const handleAccept = async () => {
    await onAccept(donation.id, businessProfile.lng, businessProfile.lat)
  }

  const handleCancel = async () => {
    const confirmed = window.confirm('¿Seguro que deseas cancelar este rescate?')
    if (confirmed) {
      await onCancel(donation.id)
    }
  }

  const renderActions = () => {
    if (donation.status === 'disponible') {
      return (
        <button
          onClick={handleAccept}
          disabled={isLoading === 'accept'}
          className="w-full bg-emerald-500 text-white p-2 rounded font-bold hover:bg-emerald-600 disabled:bg-gray-400 transition-colors"
        >
          {isLoading === 'accept' ? 'Aceptando...' : 'Aceptar y Trazar Ruta'}
        </button>
      )
    }

    if (donation.status === 'en_camino') {
      return (
        <div className="space-y-2">
          <button
            onClick={() => setShowPinDialog(true)}
            disabled={isLoading === 'validate'}
            className="w-full bg-amber-500 text-white p-2 rounded font-bold hover:bg-amber-600 disabled:bg-gray-400 transition-colors"
          >
            {isLoading === 'validate' ? 'Validando...' : 'Llegué al Local (PIN)'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading === 'cancel'}
            className="w-full bg-red-500 text-white p-2 rounded font-bold hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            {isLoading === 'cancel' ? 'Cancelando...' : 'Cancelar Rescate'}
          </button>
        </div>
      )
    }

    if (donation.status === 'recolectado') {
      return (
        <div className="bg-emerald-500 text-white p-2 rounded text-center font-bold text-sm">
          ¡Alimento Recolectado!
        </div>
      )
    }
  }

  return (
    <div className="w-56 p-0">
      {businessProfile?.photo_url ? (
        <img
          src={businessProfile.photo_url}
          alt="Fachada del negocio"
          className="w-full h-28 object-cover rounded mb-2"
        />
      ) : (
        <div className="w-full h-28 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">
          Sin foto
        </div>
      )}

      <h3 className="font-bold text-sm mb-1">🏢 {businessProfile?.business_name}</h3>
      <p className="text-xs text-gray-600 mb-1">
        <strong>Donación:</strong> {donation.food_type}
      </p>
      <p className="text-xs text-gray-600 mb-3">
        <strong>Cantidad:</strong> {donation.quantity}
      </p>

      <div>{renderActions()}</div>

      {showPinDialog && (
        <div className="mt-3 p-2 border border-gray-300 rounded bg-gray-50">
          <p className="text-xs font-semibold mb-2">Ingresa el PIN de 4 dígitos:</p>
          <input
            type="password"
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.slice(0, 4))}
            className="w-full p-2 border rounded text-sm mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
            maxLength="4"
          />
          <div className="flex gap-2">
            <button
              onClick={handleValidate}
              disabled={isLoading === 'validate' || !pinInput}
              className="flex-1 bg-blue-500 text-white text-xs p-2 rounded font-bold hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              Validar
            </button>
            <button
              onClick={() => {
                setShowPinDialog(false)
                setPinInput('')
              }}
              className="flex-1 bg-gray-300 text-gray-700 text-xs p-2 rounded font-bold hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
