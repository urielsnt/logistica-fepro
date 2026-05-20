export const MetricasCards = ({ metricas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
      {/* Tarjeta 1: Alimentos Salvados */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
          🍎
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Total de Alimentos Salvados</p>
          <p className="text-2xl font-bold text-gray-800">
            {metricas.totalAlimentosSalvados} <span className="text-sm font-normal opacity-60">unidades/kg</span>
          </p>
        </div>
      </div>

      {/* Tarjeta 2: Rescates Exitosos */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
          ✅
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Rescates Exitosos</p>
          <p className="text-2xl font-bold text-gray-800">
            {metricas.rescatesExitosos}
          </p>
        </div>
      </div>
    </div>
  )
}
