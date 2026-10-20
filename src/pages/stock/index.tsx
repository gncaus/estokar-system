import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAppStore } from '@/store/appStore'
import { RegisterItemForm } from './RegisterItemForm'
import { SaleCard } from './SaleCard'
import { StockSummary } from './StockSummary'
import { StockTable } from './StockTable'
import { MovementHistoryDialog } from './MovementHistoryDialog'
import { ITEMS_URL, type Item, type Movement } from './shared'

export function Stock() {
  const setField = useAppStore((s) => s.setField)

  // Histórico de movimentações
  const [historyItem, setHistoryItem] = useState<Item | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    axios.get<Item[]>(ITEMS_URL).then((res) => setField('stockList', res.data))
  }, [setField])

  const openHistory = async (item: Item) => {
    setHistoryItem(item)
    setMovements([])
    setHistoryLoading(true)
    try {
      const res = await axios.get<Movement[]>(`${ITEMS_URL}/${item.id}/movements`)
      setMovements(res.data)
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className="flex gap-6">
      {/* Coluna esquerda */}
      <div className="w-72 shrink-0 flex flex-col gap-6">
        <RegisterItemForm />
        <SaleCard />
      </div>

      {/* Painel principal */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <StockSummary />
        <StockTable onOpenHistory={openHistory} />
      </div>

      <MovementHistoryDialog
        item={historyItem}
        movements={movements}
        loading={historyLoading}
        onClose={() => setHistoryItem(null)}
      />
    </div>
  )
}
