import { create } from 'zustand'

interface AppState {
  name: string
  description: string
  stockList: Array<{ id: number; name: string; description: string; quantity: number }>
  setField: <K extends keyof Omit<AppState, 'setField'>>(
    field: K,
    value: AppState[K]
  ) => void;
}

export const useAppStore = create<AppState>((set) => ({
  name: '',
  description: '',
  stockList: JSON.parse(localStorage.getItem('stockList') || '[]'),
  setField: (field, value) => 
    set((state) => ({ ...state, [field]: value })),
}))