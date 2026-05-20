export const TablaHistorial = ({ historial }) => {
  const getStatusBadge = (status) => {
    const styles = {
      disponible: 'bg-emerald-100 text-emerald-700',
      en_camino: 'bg-blue-100 text-blue-700',
      recolectado: 'bg-purple-100 text-purple-700',
      entregado: 'bg-gray-100 text-gray-700'
    }
    return `px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100'}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          📦 Historial de Donaciones
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="px-4 py-3 border-b border-gray-50">Alimento</th>
              <th className="px-4 py-3 border-b border-gray-50 text-center">Cant.</th>
              <th className="px-4 py-3 border-b border-gray-50">Estado</th>
              <th className="px-4 py-3 border-b border-gray-50">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {historial.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-400 text-sm italic">
                  Aún no tienes publicaciones registradas.
                </td>
              </tr>
            ) : (
              historial.map((donacion) => (
                <tr key={donacion.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">
                    {donacion.food_type}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-center">
                    {donacion.quantity}
                  </td>
                  <td className="px-4 py-4">
                    <span className={getStatusBadge(donacion.status)}>
                      {donacion.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {new Date(donacion.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
