import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/appStore'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/lib/utils'
import type { Item } from './shared'

export function StockSummary() {
  const items = useAppStore((s) => s.stockList) as Item[]
  const lowStockThreshold = useSettingsStore((s) => s.lowStockThreshold)

  const totalUnits = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0)
  const outOfStock = items.filter((i) => (i.quantity ?? 0) === 0)
  const lowStock = items.filter(
    (i) => (i.quantity ?? 0) > 0 && (i.quantity ?? 0) <= lowStockThreshold,
  )

  return (
    <>
      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Peças</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total em estoque</p>
            <p className="text-2xl font-bold">{totalUnits}</p>
          </CardContent>
        </Card>
        <Card className={cn(outOfStock.length > 0 ? 'border-red-500/50' : '')}>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Sem estoque</p>
            <p className={cn('text-2xl font-bold', outOfStock.length > 0 ? 'text-red-400' : '')}>
              {outOfStock.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {outOfStock.length > 0 && (
        <Alert className="border-red-500/30 bg-red-500/10 text-red-400 [&>svg]:text-red-400">
          <AlertTriangle />
          <AlertDescription>
            <strong>Sem estoque:</strong> {outOfStock.map((i) => i.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}
      {lowStock.length > 0 && (
        <Alert className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 [&>svg]:text-yellow-400">
          <AlertTriangle />
          <AlertDescription>
            <strong>Estoque baixo:</strong>{' '}
            {lowStock.map((i) => `${i.name} (${i.quantity})`).join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
