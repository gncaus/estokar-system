# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript compile + Vite production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

There are no tests configured in this project.

## Architecture

This is a React 19 + TypeScript inventory management system (stock control). The backend runs separately at `http://localhost:3001` and is not in this repository.

**Routing** — React Router v7 in [src/App.tsx](src/App.tsx). Routes use `MainLayout` (sidebar + `<Outlet>`) as a wrapper. `/` redirects to `/dashboard`. Pages live in `src/pages/<page>/index.tsx`.

**State** — Zustand store in [src/store/appStore.ts](src/store/appStore.ts). Holds `name`, `description`, and `stockList` (persisted to localStorage). Uses a generic `setField` setter.

**API** — Axios calls in page components directly (no service layer). Base: `http://localhost:3001/items`. Item shape: `{ id, name, description }`.

**UI** — shadcn/ui (new-york style) on top of Radix UI + Tailwind CSS v4. Component variants via `class-variance-authority`; class merging via `cn()` from [src/lib/utils.ts](src/lib/utils.ts). Icons from `lucide-react`. Path alias `@` → `src/`.

**Theme** — OKLCH color tokens defined as CSS custom properties in [src/index.css](src/index.css). Dark mode via `.dark` class. Font: Roboto.

## Current State

- **Dashboard** ([src/pages/dashboard/index.tsx](src/pages/dashboard/index.tsx)) — metric cards are hardcoded; not yet connected to the store or API.
- **Stock** ([src/pages/stock/index.tsx](src/pages/stock/index.tsx)) — full CRUD (list, create, delete) working against the backend.
- **Reports / Settings** — sidebar links exist but pages are not yet implemented.

## UI Language

All UI labels are in Portuguese (e.g., *Cadastrar peça*, *Estoque*, *Relatórios*, *Configurações*).
