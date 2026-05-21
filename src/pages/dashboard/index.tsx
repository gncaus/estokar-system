import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Package, TrendingUp, ShoppingCart, DollarSign,
  AlertTriangle, QrCode, CreditCard, Banknote, Layers,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/lib/utils'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type Item = {
  id: number
  name: string
  description: string
  quantity: number
  price: number
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

const PAYMENT_LABELS: Record<string, string> = { pix: 'PIX', card: 'Cartão', cash: 'Dinheiro' }
const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  pix: <QrCode size={12} />,
  card: <CreditCard size={12} />,
  cash: <Banknote size={12} />,
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

function isLast7Days(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000 <= 7
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const lowStockThreshold = useSettingsStore((s) => s.lowStockThreshold)

  useEffect(() => {
    Promise.all([
      axios.get<Item[]>(`${BASE_URL}/items`),
      axios.get<Sale[]>(`${BASE_URL}/sales`),
    ])
      .then(([itemsRes, salesRes]) => {
        setItems(itemsRes.data)
        setSales(salesRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  // Sales metrics
  const todaySales = sales.filter((s) => isToday(s.createdAt))
  const weekSales  = sales.filter((s) => isLast7Days(s.createdAt))
  const faturamentoHoje = todaySales.reduce((sum, s) => sum + s.total, 0)
  const faturamento7d   = weekSales.reduce((sum, s) => sum + s.total, 0)
  const ticketMedio     = sales.length > 0
    ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length
    : 0

  // Stock metrics
  const totalUnits  = items.reduce((sum, i) => sum + i.quantity, 0)
  const valorEstoque = items.reduce((sum, i) => sum + i.quantity * i.price, 0)
  const semEstoque  = items.filter((i) => i.quantity === 0)
  const baixoEstoque = items.filter((i) => i.quantity > 0 && i.quantity <= lowStockThreshold)

  const recentSales = sales.slice(0, 6)

  const v = (x: string) => (loading ? '...' : x)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
      </div>

      {/* ── Métricas de vendas ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Vendas</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<DollarSign size={16} />}
            label="Faturamento Hoje"
            value={v(formatCurrency(faturamentoHoje))}
            sub={`${todaySales.length} venda(s)`}
            color="text-green-400"
            small
          />
          <MetricCard
            icon={<TrendingUp size={16} />}
            label="Últimos 7 Dias"
            value={v(formatCurrency(faturamento7d))}
            sub={`${weekSales.length} venda(s)`}
            color="text-blue-400"
            small
          />
          <MetricCard
            icon={<ShoppingCart size={16} />}
            label="Total de Vendas"
            value={v(String(sales.length))}
            color="text-purple-400"
          />
          <MetricCard
            icon={<TrendingUp size={16} />}
            label="Ticket Médio"
            value={v(formatCurrency(ticketMedio))}
            color="text-orange-400"
            small
          />
        </div>
      </div>

      {/* ── Métricas de estoque ────────────────────────────────────────── */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Estoque</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Package size={16} />}
            label="Peças Cadastradas"
            value={v(String(items.length))}
            color="text-blue-400"
          />
          <MetricCard
            icon={<Layers size={16} />}
            label="Unidades em Estoque"
            value={v(String(totalUnits))}
            color="text-teal-400"
          />
          <MetricCard
            icon={<DollarSign size={16} />}
            label="Valor em Estoque"
            value={v(formatCurrency(valorEstoque))}
            color="text-green-400"
            small
          />
          <MetricCard
            icon={<AlertTriangle size={16} />}
            label="Sem Estoque"
            value={v(String(semEstoque.length))}
            color={semEstoque.length > 0 ? 'text-red-400' : 'text-muted-foreground'}
            highlight={semEstoque.length > 0}
          />
        </div>
      </div>

      {/* ── Últimas vendas + Alertas ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

        {/* Últimas vendas */}
        <Card className="md:col-span-2 gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Últimas Vendas</CardTitle>
            <CardDescription>6 vendas mais recentes</CardDescription>
          </CardHeader>

          {loading ? (
            <p className="px-6 py-8 text-center text-muted-foreground">Carregando...</p>
          ) : recentSales.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground flex flex-col items-center gap-2">
              <ShoppingCart size={28} className="opacity-30" />
              <span>Nenhuma venda registrada</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 text-muted-foreground w-10">#</TableHead>
                  <TableHead className="px-4 text-muted-foreground">Data</TableHead>
                  <TableHead className="px-4 text-muted-foreground">Itens</TableHead>
                  <TableHead className="px-4 text-muted-foreground">Pagamento</TableHead>
                  <TableHead className="px-6 text-muted-foreground text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="px-6 text-muted-foreground text-sm">{sale.id}</TableCell>
                    <TableCell className="px-4 text-sm whitespace-nowrap">{formatDate(sale.createdAt)}</TableCell>
                    <TableCell className="px-4 text-sm text-muted-foreground max-w-55 truncate">
                      {sale.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant="outline" className="text-xs gap-1 whitespace-nowrap">
                        {PAYMENT_ICONS[sale.paymentMethod]}
                        {PAYMENT_LABELS[sale.paymentMethod]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-right font-semibold text-sm whitespace-nowrap">
                      {formatCurrency(sale.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Alertas de estoque */}
        <div className="flex flex-col gap-4">

          <Card className={cn('gap-0 py-0', semEstoque.length > 0 && 'border-red-500/30')}>
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle
                  size={14}
                  className={semEstoque.length > 0 ? 'text-red-400' : 'text-muted-foreground'}
                />
                Sem Estoque
                {semEstoque.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-red-400 border-red-400/30 bg-red-400/10 ml-auto"
                  >
                    {semEstoque.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            {loading ? (
              <p className="px-4 py-4 text-xs text-muted-foreground">Carregando...</p>
            ) : semEstoque.length === 0 ? (
              <p className="px-4 py-4 text-xs text-muted-foreground">Todos os itens em estoque ✓</p>
            ) : (
              <div className="py-1">
                {semEstoque.map((i) => (
                  <div
                    key={i.id}
                    className="px-4 py-2.5 text-sm border-b border-border last:border-0 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {i.name}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className={cn('gap-0 py-0', baixoEstoque.length > 0 && 'border-yellow-500/30')}>
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle
                  size={14}
                  className={baixoEstoque.length > 0 ? 'text-yellow-400' : 'text-muted-foreground'}
                />
                Estoque Baixo
                {baixoEstoque.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-yellow-400 border-yellow-400/30 bg-yellow-400/10 ml-auto"
                  >
                    {baixoEstoque.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            {loading ? (
              <p className="px-4 py-4 text-xs text-muted-foreground">Carregando...</p>
            ) : baixoEstoque.length === 0 ? (
              <p className="px-4 py-4 text-xs text-muted-foreground">Nenhum item em nível crítico ✓</p>
            ) : (
              <div className="py-1">
                {baixoEstoque.map((i) => (
                  <div
                    key={i.id}
                    className="px-4 py-2.5 text-sm border-b border-border last:border-0 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      <span className="truncate">{i.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs text-yellow-400 border-yellow-400/30 bg-yellow-400/10 shrink-0"
                    >
                      {i.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
  small,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color: string
  small?: boolean
  highlight?: boolean
}) {
  return (
    <Card className={cn(highlight && 'border-red-500/50')}>
      <CardContent className="flex flex-col gap-1.5">
        <div className={cn('flex items-center gap-2', color)}>
          {icon}
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <p className={cn('font-bold leading-tight', small ? 'text-xl' : 'text-3xl')}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}
