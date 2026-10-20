import { useState } from 'react'
import axios from 'axios'
import { Plus, Trash2, ShoppingCart, Package, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/store/appStore'
import { useSettingsStore } from '@/store/settingsStore'
import { ITEMS_URL, formatCurrency, type Item } from './shared'

export function StockTable({ onOpenHistory }: { onOpenHistory: (item: Item) => void }) {
  const { setField, stockList } = useAppStore()
  const lowStockThreshold = useSettingsStore((s) => s.lowStockThreshold)
  const items = stockList as Item[]

  const [entryValues, setEntryValues] = useState<Record<number, string>>({})
  const [search, setSearch] = useState('')

  const updateQuantity = async (item: Item, newQty: number) => {
    const res = await axios.patch<Item>(`${ITEMS_URL}/${item.id}`, {
      quantity: Math.max(0, newQty),
    })
    setField('stockList', stockList.map((i) => (i.id === item.id ? res.data : i)))
  }

  const handleEntry = async (item: Item) => {
    const add = parseInt(entryValues[item.id] ?? '0')
    if (!add || add <= 0) return
    await updateQuantity(item, item.quantity + add)
    setEntryValues((prev) => ({ ...prev, [item.id]: '' }))
  }

  const handleDelete = async (id: number) => {
    await axios.delete(`${ITEMS_URL}/${id}`)
    setField('stockList', stockList.filter((i) => i.id !== id))
  }

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>Peças em Estoque</CardTitle>
        <CardAction>
          <input
            type="text"
            placeholder="Buscar peça..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-48"
          />
        </CardAction>
      </CardHeader>

      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
          <Package size={32} className="opacity-30" />
          <span>
            {items.length === 0 ? 'Nenhuma peça cadastrada ainda' : 'Nenhuma peça encontrada'}
          </span>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 text-muted-foreground">Peça</TableHead>
              <TableHead className="px-4 text-muted-foreground text-right">Preço</TableHead>
              <TableHead className="px-4 text-muted-foreground text-center w-24">Estoque</TableHead>
              <TableHead className="px-4 text-muted-foreground">Entrada</TableHead>
              <TableHead className="px-6 text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const qty = item.quantity ?? 0
              const badgeClass =
                qty === 0
                  ? 'text-red-400 border-red-400/30 bg-red-400/10'
                  : qty <= lowStockThreshold
                    ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                    : 'text-green-400 border-green-400/30 bg-green-400/10'

              return (
                <TableRow key={item.id}>
                  <TableCell className="px-6">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                  </TableCell>

                  <TableCell className="px-4 text-right">
                    <span className="text-sm font-medium">
                      {item.price > 0 ? formatCurrency(item.price) : (
                        <span className="text-muted-foreground italic text-xs">—</span>
                      )}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 text-center">
                    <Badge variant="outline" className={badgeClass}>
                      {qty}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        value={entryValues[item.id] ?? ''}
                        onChange={(e) =>
                          setEntryValues((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleEntry(item)}
                        className="w-16 bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => handleEntry(item)}
                        disabled={!entryValues[item.id] || parseInt(entryValues[item.id]) <= 0}
                        title="Confirmar entrada"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="px-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item, qty - 1)}
                        disabled={qty === 0}
                        title="Registrar venda (-1 unidade)"
                      >
                        <ShoppingCart size={14} />
                        Venda
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => onOpenHistory(item)}
                        title="Ver histórico de movimentações"
                      >
                        <History size={14} />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        title="Excluir peça do catálogo"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
