import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, ShoppingCart, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { useAppStore } from '@/store/appStore'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/lib/utils'

const API_URL = 'http://localhost:3001/items'

type Item = {
  id: number
  name: string
  description: string
  quantity: number
}

export function Stock() {
  const { setField, name, description, stockList } = useAppStore()
  const lowStockThreshold = useSettingsStore((s) => s.lowStockThreshold)
  const [initialQuantity, setInitialQuantity] = useState('1')
  const [entryValues, setEntryValues] = useState<Record<number, string>>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    axios.get<Item[]>(API_URL).then((res) => setField('stockList', res.data))
  }, [])

  const handleRegister = async () => {
    if (!name.trim()) return
    const qty = Math.max(0, parseInt(initialQuantity) || 0)
    const res = await axios.post<Item>(API_URL, { name, description, quantity: qty })
    setField('stockList', [...stockList, res.data])
    setField('name', '')
    setField('description', '')
    setInitialQuantity('1')
  }

  const updateQuantity = async (item: Item, newQty: number) => {
    const res = await axios.patch<Item>(`${API_URL}/${item.id}`, {
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
    await axios.delete(`${API_URL}/${id}`)
    setField('stockList', stockList.filter((i) => i.id !== id))
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

  return (
    <div className="flex gap-6">
      {/* Formulário de cadastro */}
      <FieldGroup className="w-72 shrink-0 bg-card border border-border p-6 rounded-lg self-start">
        <FieldSet>
          <FieldLegend>Cadastrar peça</FieldLegend>
          <FieldDescription className="text-muted-foreground">
            Adicionar nova peça ao estoque
          </FieldDescription>
          <Field className="mt-4">
            <FieldLabel htmlFor="name">Nome da peça</FieldLabel>
            <Input
              id="name"
              placeholder="Ex: Parafuso M6"
              value={name}
              onChange={(e) => setField('name', e.target.value)}
            />
          </Field>
          <Field className="mt-4">
            <FieldLabel htmlFor="description">Descrição</FieldLabel>
            <Input
              id="description"
              placeholder="Ex: Aço inox, 12mm"
              value={description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </Field>
          <Field className="mt-4">
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
          <Button
            variant="default"
            className="w-full mt-2"
            onClick={handleRegister}
            disabled={!name.trim()}
          >
            Cadastrar
          </Button>
        </FieldSet>
      </FieldGroup>

      {/* Painel principal */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Peças</p>
            <p className="text-2xl font-bold text-foreground mt-1">{items.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total em estoque</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalUnits}</p>
          </div>
          <div
            className={cn(
              'bg-card border rounded-lg p-4',
              outOfStock.length > 0 ? 'border-red-500/50' : 'border-border',
            )}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Sem estoque</p>
            <p
              className={cn(
                'text-2xl font-bold mt-1',
                outOfStock.length > 0 ? 'text-red-400' : 'text-foreground',
              )}
            >
              {outOfStock.length}
            </p>
          </div>
        </div>

        {/* Alertas */}
        {outOfStock.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              <strong>Sem estoque:</strong> {outOfStock.map((i) => i.name).join(', ')}
            </span>
          </div>
        )}
        {lowStock.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-sm text-yellow-400 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              <strong>Estoque baixo:</strong>{' '}
              {lowStock.map((i) => `${i.name} (${i.quantity})`).join(', ')}
            </span>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
            <h2 className="font-semibold text-foreground">Peças em Estoque</h2>
            <input
              type="text"
              placeholder="Buscar peça..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-48"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Package size={32} className="opacity-30" />
              <span>
                {items.length === 0
                  ? 'Nenhuma peça cadastrada ainda'
                  : 'Nenhuma peça encontrada'}
              </span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Peça</th>
                  <th className="text-center px-4 py-3">Estoque</th>
                  <th className="text-left px-4 py-3">Entrada</th>
                  <th className="text-right px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const qty = item.quantity ?? 0
                  const badgeClass =
                    qty === 0
                      ? 'text-red-400 bg-red-400/10'
                      : qty <= lowStockThreshold
                        ? 'text-yellow-400 bg-yellow-400/10'
                        : 'text-green-400 bg-green-400/10'

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-border hover:bg-accent/20 transition-colors"
                    >
                      {/* Nome + descrição */}
                      <td className="px-6 py-3">
                        <p className="font-medium text-foreground">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>

                      {/* Badge de quantidade */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            'text-sm font-semibold px-2.5 py-0.5 rounded-full',
                            badgeClass,
                          )}
                        >
                          {qty}
                        </span>
                      </td>

                      {/* Entrada de estoque */}
                      <td className="px-4 py-3">
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
                            disabled={
                              !entryValues[item.id] || parseInt(entryValues[item.id]) <= 0
                            }
                            title="Confirmar entrada"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item, qty - 1)}
                            disabled={qty === 0}
                            title="Registrar venda (-1 unidade)"
                            className="gap-1.5"
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
