import { useState } from 'react'
import axios from 'axios'
import { Plus, ShoppingCart, X, Check, Banknote, CreditCard, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { SearchableSelect } from './SearchableSelect'
import { ITEMS_URL, SALES_URL, formatCurrency, type Item, type PaymentMethod } from './shared'

type SaleRow = {
  key: string
  itemId: number | ''
  quantity: number
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'pix', label: 'PIX', icon: <QrCode size={14} /> },
  { value: 'card', label: 'Cartão', icon: <CreditCard size={14} /> },
  { value: 'cash', label: 'Dinheiro', icon: <Banknote size={14} /> },
]

function newRow(): SaleRow {
  return { key: crypto.randomUUID(), itemId: '', quantity: 1 }
}

export function SaleCard() {
  const { setField, stockList } = useAppStore()
  const items = stockList as Item[]

  const [saleRows, setSaleRows] = useState<SaleRow[]>([newRow()])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [saleError, setSaleError] = useState('')
  const [saleDone, setSaleDone] = useState(false)

  const updateSaleRow = (key: string, patch: Partial<SaleRow>) =>
    setSaleRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const removeSaleRow = (key: string) =>
    setSaleRows((prev) => (prev.length === 1 ? [newRow()] : prev.filter((r) => r.key !== key)))

  const handleConfirmSale = async () => {
    setSaleError('')

    for (const row of saleRows) {
      if (row.itemId === '') { setSaleError('Selecione um produto em todas as linhas.'); return }
      if (row.quantity <= 0) { setSaleError('A quantidade deve ser maior que zero.'); return }
    }
    if (!paymentMethod) { setSaleError('Selecione a forma de pagamento.'); return }

    try {
      await axios.post(SALES_URL, {
        items: saleRows.map((r) => ({ itemId: r.itemId, quantity: r.quantity })),
        paymentMethod,
      })
      const res = await axios.get<Item[]>(ITEMS_URL)
      setField('stockList', res.data)
      setSaleRows([newRow()])
      setPaymentMethod(null)
      setSaleDone(true)
      setTimeout(() => setSaleDone(false), 2500)
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : null
      setSaleError(msg ?? 'Erro ao registrar venda.')
    }
  }

  const saleTotal = saleRows.reduce((sum, row) => {
    const item = items.find((i) => i.id === row.itemId)
    return sum + (item?.price ?? 0) * row.quantity
  }, 0)

  const saleReady =
    saleRows.every((r) => r.itemId !== '' && r.quantity > 0) && paymentMethod !== null

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart size={15} className="text-muted-foreground" />
          Registrar Venda
        </CardTitle>
        <CardDescription>Selecione os produtos vendidos</CardDescription>
      </CardHeader>

      <CardContent className="py-4 flex flex-col gap-2">
        {saleRows.map((row) => {
          const selectedItem = items.find((i) => i.id === row.itemId)
          const overStock = selectedItem !== undefined && row.quantity > selectedItem.quantity

          return (
            <div key={row.key} className="flex items-center gap-1.5">
              <SearchableSelect
                items={items}
                value={row.itemId}
                onChange={(id) => updateSaleRow(row.key, { itemId: id })}
              />
              <input
                type="number"
                min="1"
                value={row.quantity}
                onChange={(e) =>
                  updateSaleRow(row.key, { quantity: parseInt(e.target.value) || 1 })
                }
                className={cn(
                  'w-14 bg-background border rounded-md px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring',
                  overStock ? 'border-red-500' : 'border-border',
                )}
              />
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => removeSaleRow(row.key)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </Button>
            </div>
          )
        })}

        <Button
          size="xs"
          variant="ghost"
          onClick={() => setSaleRows((prev) => [...prev, newRow()])}
          className="self-start gap-1 text-muted-foreground hover:text-foreground mt-1"
        >
          <Plus size={13} />
          Adicionar produto
        </Button>

        {/* Forma de pagamento */}
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {PAYMENT_OPTIONS.map(({ value, label, icon }) => (
            <Button
              key={value}
              size="sm"
              variant={paymentMethod === value ? 'default' : 'outline'}
              onClick={() => setPaymentMethod(value)}
              className="gap-1.5"
            >
              {icon}
              {label}
            </Button>
          ))}
        </div>

        {/* Total */}
        {saleTotal > 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-border text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{formatCurrency(saleTotal)}</span>
          </div>
        )}
      </CardContent>

      {saleError && <p className="px-4 pb-2 text-xs text-red-400">{saleError}</p>}

      <CardContent className="py-0 pb-4 flex items-center gap-2">
        <Button className="flex-1" onClick={handleConfirmSale} disabled={!saleReady}>
          Confirmar Venda
        </Button>
        {saleDone && (
          <span className="flex items-center gap-1 text-xs text-green-400 shrink-0">
            <Check size={13} />
            Registrada
          </span>
        )}
      </CardContent>
    </Card>
  )
}
