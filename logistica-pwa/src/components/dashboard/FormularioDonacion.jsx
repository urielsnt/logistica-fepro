import { useState } from 'react'

export const FormularioDonacion = ({ onPublicar, publicando }) => {
  const [tipoComida, setTipoComida] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [mensaje, setMensaje] = useState('')

  const manejarEnvio = async (e) => {
    e.preventDefault()
    if (!tipoComida || !cantidad) {
      setMensaje("Por favor llena ambos campos.")
      return
    }

    setMensaje("Publicando...")
    const result = await onPublicar(tipoComida, cantidad)
    
    if (result.success) {
      setMensaje(`¡Publicado! PIN: ${result.pin}`)
      setTipoComida('')
      setCantidad('')
      setTimeout(() => setMensaje(''), 5000)
    } else {
      setMensaje("Error: " + result.error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
        🍎 Publicar Rescate
      </h3>
      <p className="text-gray-400 text-xs mb-6 font-medium">
        Tus excedentes pueden alimentar a alguien hoy.
      </p>

      <form onSubmit={manejarEnvio} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">¿Qué vas a donar?</label>
          <input 
            type="text" 
            placeholder="Ej. Pan dulce, Guisado..." 
            value={tipoComida}
            onChange={(e) => setTipoComida(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
            disabled={publicando}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cantidad aprox.</label>
          <input 
            type="text" 
            placeholder="Ej. 15 piezas, 2 kilos..." 
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
            disabled={publicando}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={publicando}
          className="w-full bg-emerald-500 text-white p-4 rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:bg-gray-200 shadow-md shadow-emerald-100"
        >
          {publicando ? 'Enviando...' : 'Publicar Ahora'}
        </button>
      </form>

      {mensaje && (
        <div className={`mt-4 p-3 rounded-lg text-xs text-center font-bold ${mensaje.includes('¡Publicado!') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {mensaje}
        </div>
      )}
    </div>
  )
}
