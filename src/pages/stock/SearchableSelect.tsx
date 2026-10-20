import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import type { Item } from './shared'

export function SearchableSelect({
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
