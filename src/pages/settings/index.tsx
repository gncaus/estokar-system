import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
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
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Preferências gerais do sistema</p>
      </div>

      {/* Sistema */}
      <section className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Sistema</h2>
        </div>
        <div className="px-6 py-5 space-y-5">
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
        </div>
      </section>

      {/* Estoque */}
      <section className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Estoque</h2>
        </div>
        <div className="px-6 py-5 space-y-5">
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
        </div>
      </section>

      {/* Sobre */}
      <section className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Sobre</h2>
        </div>
        <div className="px-6 py-5 space-y-2 text-sm">
          <Row label="Sistema" value="Estokar" />
          <Row label="Versão" value="1.0.0" />
          <Row label="Backend" value="http://localhost:3001" />
        </div>
      </section>

      {/* Salvar */}
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
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  )
}
