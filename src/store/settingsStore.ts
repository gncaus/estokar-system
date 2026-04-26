import { create } from 'zustand'

interface SettingsState {
  companyName: string
  lowStockThreshold: number
  setSettings: (partial: Partial<Omit<SettingsState, 'setSettings'>>) => void
}

const DEFAULTS = {
  companyName: '',
  lowStockThreshold: 5,
}

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('settings') || '{}') }
  } catch {
    return DEFAULTS
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...loadSettings(),
  setSettings: (partial) =>
    set((state) => {
      const next = { ...state, ...partial }
      localStorage.setItem(
        'settings',
        JSON.stringify({ companyName: next.companyName, lowStockThreshold: next.lowStockThreshold }),
      )
      return next
    }),
}))
