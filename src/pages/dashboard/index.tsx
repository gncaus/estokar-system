import { useEffect, useState } from 'react'
import axios from 'axios'
import { Package, Tag, Clock, AlertCircle } from 'lucide-react'

type Item = {
  id: number
  name: string
  description: string
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get<Item[]>('http://localhost:3001/items')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }, [])

  const totalItems = items.length
  const semDescricao = items.filter((i) => !i.description?.trim()).length
  const ultimoCadastro = items.at(-1)?.name ?? '—'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do controle de estoque</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Package size={20} />}
          label="Total de Itens"
          value={loading ? '...' : String(totalItems)}
          color="text-blue-400"
        />
        <MetricCard
          icon={<Tag size={20} />}
          label="Sem Descrição"
          value={loading ? '...' : String(semDescricao)}
          color="text-yellow-400"
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Último Cadastro"
          value={loading ? '...' : ultimoCadastro}
          color="text-green-400"
          small
        />
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Itens Cadastrados</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Todos os itens registrados no sistema
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-muted-foreground">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <AlertCircle size={32} className="opacity-40" />
            <span>Nenhum item cadastrado ainda</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-6 py-3">#</th>
                <th className="text-left px-6 py-3">Nome</th>
                <th className="text-left px-6 py-3">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-t border-border hover:bg-accent/30 transition-colors"
                >
                  <td className="px-6 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-6 py-3 font-medium text-foreground">{item.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {item.description?.trim() || (
                      <span className="italic opacity-50">Sem descrição</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  color,
  small,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  small?: boolean
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        {icon}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={`font-bold text-foreground ${small ? 'text-xl truncate' : 'text-4xl'}`}>
        {value}
      </p>
    </div>
  )
}
