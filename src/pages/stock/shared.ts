const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const ITEMS_URL = `${BASE_URL}/items`
export const SALES_URL = `${BASE_URL}/sales`

export type Item = {
  id: number
  name: string
  description: string
  quantity: number
  price: number
}

export type PaymentMethod = 'pix' | 'card' | 'cash'

export type Movement = {
  id: number
  itemId: number
  type: 'entrada' | 'saida' | 'ajuste'
  quantity: number
  reason: string
  balanceAfter: number
  createdAt: string
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
