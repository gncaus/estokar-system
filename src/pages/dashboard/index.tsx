export function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cards de métricas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total de Itens</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Valor Total</h3>
          <p className="text-3xl font-bold mt-2">R$ 0,00</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Itens em Baixa</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">0</p>
        </div>
      </div>
    </div>
  );
}