import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettingsStore } from '@/store/settingsStore'

export function Settings() {
  const { companyName, lowStockThreshold, setSettings } = useSettingsStore()

  const [draft, setDraft] = useState({ companyName, lowStockThreshold })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const threshold = Math.max(1, parseInt(String(draft.lowStockThreshold)) || 5)
    setSettings({ ...draft, lowStockThreshold: threshold })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const changed =
    draft.companyName !== companyName || draft.lowStockThreshold !== lowStockThreshold

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Preferências gerais do sistema</p>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Sistema</CardTitle>
        </CardHeader>
        <CardContent className="py-6 space-y-5">
          <Field>
            <FieldLabel htmlFor="companyName">Nome da empresa</FieldLabel>
            <FieldDescription className="text-muted-foreground">
              Exibido no topo da barra lateral
            </FieldDescription>
            <Input
              id="companyName"
              placeholder="Ex: Oficina do João"
              value={draft.companyName}
              onChange={(e) => setDraft((d) => ({ ...d, companyName: e.target.value }))}
              className="mt-1.5"
            />
          </Field>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Estoque</CardTitle>
        </CardHeader>
        <CardContent className="py-6 space-y-5">
          <Field>
            <FieldLabel htmlFor="threshold">Limiar de estoque baixo</FieldLabel>
            <FieldDescription className="text-muted-foreground">
              Peças com quantidade igual ou abaixo deste valor recebem o alerta amarelo
            </FieldDescription>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                id="threshold"
                type="number"
                min="1"
                className="w-24"
                value={draft.lowStockThreshold}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, lowStockThreshold: parseInt(e.target.value) || 1 }))
                }
              />
              <span className="text-sm text-muted-foreground">unidades</span>
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="text-sm space-y-0">
            <Row label="Sistema" value="Estokar" />
            <Row label="Versão" value="1.0.0" />
            <Row label="Backend" value="http://localhost:3001" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={!changed && !saved}>
          Salvar alterações
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-400">
            <Check size={15} />
            Salvo com sucesso
          </span>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
