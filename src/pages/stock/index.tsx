import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Plus, Trash2, ShoppingCart, Package, AlertTriangle,
  X, Check, ChevronsUpDown, Banknote, CreditCard, QrCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { useAppStore } from '@/store/appStore'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/lib/utils'

const BASE_URL = 'http://localhost:3001'
const ITEMS_URL = `${BASE_URL}/items`
const SALES_URL = `${BASE_URL}/sales`

type Item = {
  id: number
  name: string
  description: string
  quantity: number
  price: number
}

type PaymentMethod = 'pix' | 'card' | 'cash'

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function Stock() {
  const { setField, name, description, stockList } = useAppStore()
  const lowStockThreshold = useSettingsStore((s) => s.lowStockThreshold)

  // Form de cadastro
  const [initialQuantity, setInitialQuantity] = useState('1')
  const [initialPrice, setInitialPrice] = useState('')

  // Tabela
  const [entryValues, setEntryValues] = useState<Record<number, string>>({})
  const [search, setSearch] = useState('')

  // Venda
  const [saleRows, setSaleRows] = useState<SaleRow[]>([newRow()])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [saleError, setSaleError] = useState('')
  const [saleDone, setSaleDone] = useState(false)

  useEffect(() => {
    axios.get<Item[]>(ITEMS_URL).then((res) => setField('stockList', res.data))
  }, [])

  const handleRegister = async () => {
    if (!name.trim()) return
    const qty = Math.max(0, parseInt(initialQuantity) || 0)
    const price = Math.max(0, parseFloat(initialPrice.replace(',', '.')) || 0)
    const res = await axios.post<Item>(ITEMS_URL, { name, description, quantity: qty, price })
    setField('stockList', [...stockList, res.data])
    setField('name', '')
    setField('description', '')
    setInitialQuantity('1')
    setInitialPrice('')
  }

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

  const items = stockList as Item[]
  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase()),
  )

  const totalUnits = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0)
  const outOfStock = items.filter((i) => (i.quantity ?? 0) === 0)
  const lowStock = items.filter(
    (i) => (i.quantity ?? 0) > 0 && (i.quantity ?? 0) <= lowStockThreshold,
  )

  const saleTotal = saleRows.reduce((sum, row) => {
    const item = items.find((i) => i.id === row.itemId)
    return sum + (item?.price ?? 0) * row.quantity
  }, 0)

  const saleReady =
    saleRows.every((r) => r.itemId !== '' && r.quantity > 0) && paymentMethod !== null

  return (
    <div className="flex gap-6">
      {/* Coluna esquerda */}
      <div className="w-72 shrink-0 flex flex-col gap-6">

        {/* Formulário de cadastro */}
        <Card>
          <CardContent>
            <FieldSet>
              <FieldLegend>Cadastrar peça</FieldLegend>
              <FieldDescription className="text-muted-foreground -mt-4">
                Adicionar nova peça ao estoque
              </FieldDescription>
              <Field>
                <FieldLabel htmlFor="name">Nome da peça</FieldLabel>
                <Input
                  id="name"
                  placeholder="Ex: Parafuso M6"
                  value={name}
                  onChange={(e) => setField('name', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <Input
                  id="description"
                  placeholder="Ex: Aço inox, 12mm"
                  value={description}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="price">Preço de venda (R$)</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qty">Quantidade inicial</FieldLabel>
                <Input
                  id="qty"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={initialQuantity}
                  onChange={(e) => setInitialQuantity(e.target.value)}
                />
              </Field>
              <Button className="w-full" onClick={handleRegister} disabled={!name.trim()}>
                Cadastrar
              </Button>
            </FieldSet>
          </CardContent>
        </Card>

        {/* Card de vendas */}
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
      </div>

      {/* Painel principal */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

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

        {/* Tabela */}
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
      </div>
    </div>
  )
}

function SearchableSelect({
  items,
  value,
  onChange,
}: {
  items: Item[]
  value: number | ''
  onChange: (id: number | '') => void
}) {
  const [open, setOpen] = useState(false)
  const selected = items.find((i) => i.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="flex-1 min-w-0 justify-between font-normal px-2"
        >
          <span className="truncate text-sm">
            {selected ? (
              <>{selected.name} <span className="text-muted-foreground">({selected.quantity})</span></>
            ) : (
              <span className="text-muted-foreground">Produto...</span>
            )}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-40 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Buscar produto..." />
          <CommandList>
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  disabled={item.quantity === 0}
                  onSelect={() => { onChange(item.id); setOpen(false) }}
                >
                  <Check
                    className={cn('size-4 shrink-0', value === item.id ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.quantity}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
