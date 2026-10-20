import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Item, Movement } from './shared'

export function MovementHistoryDialog({
  item,
  movements,
  loading,
  onClose,
}: {
  item: Item | null
  movements: Movement[]
  loading: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={item !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico — {item?.name}</DialogTitle>
          <DialogDescription>Movimentações registradas para esta peça</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : movements.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma movimentação registrada</p>
        ) : (
          <div className="overflow-y-auto flex flex-col gap-2 pr-1">
            {movements.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-3 rounded-md border border-border p-3 text-sm"
              >
                <span
                  className={cn(
                    'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium border',
                    m.type === 'entrada'
                      ? 'text-green-400 border-green-400/30 bg-green-400/10'
                      : m.type === 'saida'
                        ? 'text-red-400 border-red-400/30 bg-red-400/10'
                        : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
                  )}
                >
                  {m.type === 'entrada' ? 'Entrada' : m.type === 'saida' ? 'Saída' : 'Ajuste'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.reason}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Intl.DateTimeFormat('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    }).format(new Date(m.createdAt))}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      'font-semibold',
                      m.quantity > 0 ? 'text-green-400' : 'text-red-400',
                    )}
                  >
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">saldo: {m.balanceAfter}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
