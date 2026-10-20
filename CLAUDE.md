# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
The workspace-level `../CLAUDE.md` holds the API contract, architecture and cross-repo rules — it takes priority over this file.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript compile + Vite production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

There are no tests configured in this project.

## Notes

- **Backend URL** — every page defines `BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'`. Set `VITE_API_URL` in `.env` (see `.env.example`) or in Vercel.
- **Pages** — `dashboard`, `stock` (CRUD, entries, sales, movement history — split into `RegisterItemForm`, `SaleCard`, `SearchableSelect`, `StockSummary`, `StockTable`, `MovementHistoryDialog`, with shared types in `shared.ts`), `reports` (Estoque/Vendas tabs), `settings` (company name, low-stock threshold).
- **Stores** — `appStore.ts` (`stockList` etc.), `settingsStore.ts` (persisted to `localStorage`).
- **Lint** — `react-refresh/only-export-components` is disabled for `src/components/ui/**` because shadcn files export variants alongside components.
- **Theme** — OKLCH tokens in [src/index.css](src/index.css), dark mode, Roboto font.
- **UI language** — Portuguese labels; code in English.
