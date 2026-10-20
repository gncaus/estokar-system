import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { useAppStore } from '@/store/appStore'
import { ITEMS_URL, type Item } from './shared'

export function RegisterItemForm() {
  const { setField, name, description, stockList } = useAppStore()

  const [initialQuantity, setInitialQuantity] = useState('1')
  const [initialPrice, setInitialPrice] = useState('')

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

  return (
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
  )
}
