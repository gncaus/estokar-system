import { useEffect, useState } from 'react'
import axios from 'axios'
import { Package, CheckCircle, AlertCircle, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Item = {
  id: number
  name: string
  description: string
}

export function Reports() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    axios
      .get<Item[]>('http://localhost:3001/items')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }, [])

  const comDescricao = items.filter((i) => i.description?.trim())
  const semDescricao = items.filter((i) => !i.description?.trim())
  const pct = items.length > 0 ? Math.round((comDescricao.length / items.length) * 100) : 0

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análise e situação do estoque</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={16} className="mr-2" />
          Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Package size={20} />}
          label="Total de Itens"
          value={loading ? '...' : String(items.length)}
          color="text-blue-400"
        />
        <SummaryCard
          icon={<CheckCircle size={20} />}
          label="Com Descrição"
          value={loading ? '...' : `${comDescricao.length} (${pct}%)`}
          color="text-green-400"
        />
        <SummaryCard
          icon={<AlertCircle size={20} />}
          label="Sem Descrição"
          value={loading ? '...' : String(semDescricao.length)}
          color={semDescricao.length > 0 ? 'text-yellow-400' : 'text-muted-foreground'}
        />
      </div>

      {!loading && items.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Completude das descrições</span>
            <span className="text-foreground font-medium">{pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-foreground">Todos os Itens</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? 'Carregando...' : `${filtered.length} item(ns) encontrado(s)`}
            </p>
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-48"
          />
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground">
            Nenhum item encontrado
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-6 py-3 w-12">#</th>
                <th className="text-left px-6 py-3">Nome</th>
                <th className="text-left px-6 py-3">Descrição</th>
                <th className="text-left px-6 py-3 w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const completo = !!item.description?.trim()
                return (
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
                    <td className="px-6 py-3">
                      {completo ? (
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                          Completo
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                          Incompleto
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && semDescricao.length > 0 && (
        <div className="bg-card border border-yellow-500/30 rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-400" />
              Itens sem Descrição
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Estes itens precisam de atenção</p>
          </div>
          <ul>
            {semDescricao.map((item) => (
              <li
                key={item.id}
                className="px-6 py-3 border-t border-border text-foreground text-sm flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        {icon}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-4xl font-bold text-foreground">{value}</p>
    </div>
  )
}
