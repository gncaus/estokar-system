import { useEffect, useState } from 'react'
import axios from 'axios'
import { Package, CheckCircle, AlertCircle, Printer, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type Item = {
  id: number
  name: string
  description: string
  quantity: number
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
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análise e situação do estoque</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={16} />
          Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Package size={18} />}
          label="Total de Itens"
          value={loading ? '...' : String(items.length)}
          color="text-blue-400"
        />
        <SummaryCard
          icon={<CheckCircle size={18} />}
          label="Com Descrição"
          value={loading ? '...' : `${comDescricao.length} (${pct}%)`}
          color="text-green-400"
        />
        <SummaryCard
          icon={<AlertCircle size={18} />}
          label="Sem Descrição"
          value={loading ? '...' : String(semDescricao.length)}
          color={semDescricao.length > 0 ? 'text-yellow-400' : 'text-muted-foreground'}
        />
      </div>

      {!loading && items.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completude das descrições</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <div>
            <CardTitle>Todos os Itens</CardTitle>
            <CardDescription>
              {loading ? 'Carregando...' : `${filtered.length} item(ns) encontrado(s)`}
            </CardDescription>
          </div>
          <CardAction>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-48"
            />
          </CardAction>
        </CardHeader>

        {loading ? (
          <p className="px-6 py-8 text-center text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-8 text-center text-muted-foreground">Nenhum item encontrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 text-muted-foreground w-12">#</TableHead>
                <TableHead className="px-6 text-muted-foreground">Nome</TableHead>
                <TableHead className="px-6 text-muted-foreground">Descrição</TableHead>
                <TableHead className="px-6 text-muted-foreground w-32">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, idx) => {
                const completo = !!item.description?.trim()
                return (
                  <TableRow key={item.id}>
                    <TableCell className="px-6 text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="px-6 font-medium">{item.name}</TableCell>
                    <TableCell className="px-6 text-muted-foreground">
                      {item.description?.trim() || (
                        <span className="italic opacity-50">Sem descrição</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6">
                      <Badge
                        variant="outline"
                        className={cn(
                          completo
                            ? 'text-green-400 border-green-400/30 bg-green-400/10'
                            : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
                        )}
                      >
                        {completo ? 'Completo' : 'Incompleto'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {!loading && semDescricao.length > 0 && (
        <Card className="gap-0 py-0 border-yellow-500/30">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle size={16} className="text-yellow-400" />
              Itens sem Descrição
            </CardTitle>
            <CardDescription>Estes itens precisam de atenção</CardDescription>
          </CardHeader>
          <div className="py-1">
            {semDescricao.map((item) => (
              <div
                key={item.id}
                className="px-6 py-3 border-b border-border last:border-0 text-sm flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                {item.name}
              </div>
            ))}
          </div>
        </Card>
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
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className={`flex items-center gap-2 ${color}`}>
          {icon}
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <p className="text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
