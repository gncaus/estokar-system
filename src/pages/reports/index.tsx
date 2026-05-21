import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Package, CheckCircle, AlertCircle, Printer,
  ShoppingCart, DollarSign, TrendingUp, QrCode, CreditCard, Banknote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type Item = {
  id: number
  name: string
  description: string
  quantity: number
}

type SaleItem = {
  itemId: number
  name: string
  quantity: number
  unitPrice: number
}

type Sale = {
  id: number
  items: SaleItem[]
  paymentMethod: 'pix' | 'card' | 'cash'
  total: number
  createdAt: string
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  card: 'Cartão',
  cash: 'Dinheiro',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function Reports() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [sales, setSales] = useState<Sale[]>([])
  const [salesLoading, setSalesLoading] = useState(true)

  useEffect(() => {
    axios
      .get<Item[]>(`${BASE_URL}/items`)
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))

    axios
      .get<Sale[]>(`${BASE_URL}/sales`)
      .then((res) => setSales(res.data))
      .finally(() => setSalesLoading(false))
  }, [])

  const comDescricao = items.filter((i) => i.description?.trim())
  const semDescricao = items.filter((i) => !i.description?.trim())
  const pct = items.length > 0 ? Math.round((comDescricao.length / items.length) * 100) : 0

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase()),
  )

  const totalVendas = sales.length
  const faturamento = sales.reduce((sum, s) => sum + s.total, 0)
  const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0

  const byPayment = (['pix', 'card', 'cash'] as const).map((method) => {
    const group = sales.filter((s) => s.paymentMethod === method)
    return {
      method,
      count: group.length,
      total: group.reduce((sum, s) => sum + s.total, 0),
    }
  })

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="estoque">
        <TabsList>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
        </TabsList>

        {/* ── Estoque ─────────────────────────────────────────────────── */}
        <TabsContent value="estoque" className="space-y-6 mt-4">
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
                  {loading ? 'Carregando...' : `${filteredItems.length} item(ns) encontrado(s)`}
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
            ) : filteredItems.length === 0 ? (
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
                  {filteredItems.map((item, idx) => {
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
        </TabsContent>

        {/* ── Vendas ──────────────────────────────────────────────────── */}
        <TabsContent value="vendas" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              icon={<ShoppingCart size={18} />}
              label="Total de Vendas"
              value={salesLoading ? '...' : String(totalVendas)}
              color="text-blue-400"
            />
            <SummaryCard
              icon={<DollarSign size={18} />}
              label="Faturamento Total"
              value={salesLoading ? '...' : formatCurrency(faturamento)}
              color="text-green-400"
            />
            <SummaryCard
              icon={<TrendingUp size={18} />}
              label="Ticket Médio"
              value={salesLoading ? '...' : formatCurrency(ticketMedio)}
              color="text-purple-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {byPayment.map(({ method, count, total }) => (
              <Card key={method}>
                <CardContent className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    {method === 'pix' && <QrCode size={13} />}
                    {method === 'card' && <CreditCard size={13} />}
                    {method === 'cash' && <Banknote size={13} />}
                    {PAYMENT_LABELS[method]}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(total)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>
                {salesLoading ? 'Carregando...' : `${sales.length} venda(s) registrada(s)`}
              </CardDescription>
            </CardHeader>

            {salesLoading ? (
              <p className="px-6 py-8 text-center text-muted-foreground">Carregando...</p>
            ) : sales.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                <ShoppingCart size={32} className="opacity-30" />
                <span>Nenhuma venda registrada ainda</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6 text-muted-foreground w-12">#</TableHead>
                    <TableHead className="px-6 text-muted-foreground">Data/Hora</TableHead>
                    <TableHead className="px-6 text-muted-foreground">Itens vendidos</TableHead>
                    <TableHead className="px-6 text-muted-foreground">Pagamento</TableHead>
                    <TableHead className="px-6 text-muted-foreground text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="px-6 text-muted-foreground">{sale.id}</TableCell>
                      <TableCell className="px-6 text-sm">{formatDate(sale.createdAt)}</TableCell>
                      <TableCell className="px-6">
                        <div className="flex flex-col gap-0.5">
                          {sale.items.map((si, idx) => (
                            <span key={idx} className="text-sm">
                              {si.quantity}× {si.name}
                              <span className="text-muted-foreground ml-1 text-xs">
                                ({formatCurrency(si.unitPrice)} un.)
                              </span>
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge variant="outline" className="text-xs">
                          {PAYMENT_LABELS[sale.paymentMethod]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 text-right font-semibold">
                        {formatCurrency(sale.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
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
