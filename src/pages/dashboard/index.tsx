import { useEffect, useState } from 'react'
import axios from 'axios'
import { Package, Tag, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Item = {
  id: number
  name: string
  description: string
  quantity: number
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get<Item[]>('http://localhost:3001/items')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }, [])

  const totalItems = items.length
  const semDescricao = items.filter((i) => !i.description?.trim()).length
  const ultimoCadastro = items.at(-1)?.name ?? '—'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do controle de estoque</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Package size={18} />}
          label="Total de Itens"
          value={loading ? '...' : String(totalItems)}
          color="text-blue-400"
        />
        <MetricCard
          icon={<Tag size={18} />}
          label="Sem Descrição"
          value={loading ? '...' : String(semDescricao)}
          color="text-yellow-400"
        />
        <MetricCard
          icon={<Clock size={18} />}
          label="Último Cadastro"
          value={loading ? '...' : ultimoCadastro}
          color="text-green-400"
          small
        />
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Itens Cadastrados</CardTitle>
          <CardDescription>Todos os itens registrados no sistema</CardDescription>
        </CardHeader>

        {loading ? (
          <p className="px-6 py-8 text-center text-muted-foreground">Carregando...</p>
        ) : items.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <AlertCircle size={32} className="opacity-40" />
            <span>Nenhum item cadastrado ainda</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 text-muted-foreground w-12">#</TableHead>
                <TableHead className="px-6 text-muted-foreground">Nome</TableHead>
                <TableHead className="px-6 text-muted-foreground">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="px-6 text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="px-6 font-medium">{item.name}</TableCell>
                  <TableCell className="px-6 text-muted-foreground">
                    {item.description?.trim() || (
                      <span className="italic opacity-50">Sem descrição</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  color,
  small,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  small?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className={`flex items-center gap-2 ${color}`}>
          {icon}
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <p className={`font-bold ${small ? 'text-xl truncate' : 'text-4xl'}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
