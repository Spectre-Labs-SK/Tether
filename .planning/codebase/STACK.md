# Technology Stack

**Analysis Date:** 2026-04-22

## Languages

**Primary:**
- TypeScript ~6.0.2 - All source files (web and native layers)

**Secondary:**
- SQL (PostgreSQL dialect) - Supabase migrations in `supabase/migrations/`
- TypeScript on Deno - Supabase Edge Functions in `supabase/functions/`

## Runtime

**Environment:**
- Browser (web shell): Vite dev server + bundled output
- Deno (Edge Functions): `deno.land/std@0.208.0` — Supabase Edge Function runtime
- React Native / Expo (native layer): `src/native/` — not compiled by Vite; requires separate Metro/Expo build config

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core (Web Shell):**
- React 19.2.5 - UI component model (`src/App.tsx`, `src/components/`)
- React DOM 19.2.3 - Web renderer

**Core (Native Layer — `src/native/`):**
- React Native - Mobile UI primitives (`View`, `Text`, `TouchableOpacity`, `Vibration`)
- `react-native-safe-area-context` - Safe area insets (`SafeAreaView`)
- `@react-navigation/native` + `@react-navigation/native-stack` - Screen navigation

**3D / Graphics:**
- Three.js 0.184.0 - 3D rendering engine (`src/App.tsx` ShimmerCore)
- `@react-three/fiber` 9.6.0 - React renderer for Three.js (`Canvas` component)
- `@react-three/drei` 10.7.7 - Three.js helpers (`MeshDistortMaterial`, `Float`)

**Styling:**
- Tailwind CSS v4 (via `@tailwindcss/vite` 4.2.2) - Utility classes; configured as Vite plugin in `vite.config.ts`

**Icons:**
- `lucide-react` 1.8.0 - Icon library (imported but not yet rendered as of current state)

**Build/Dev:**
- Vite 8.0.9 - Dev server and bundler; config at `vite.config.ts`
- `@vitejs/plugin-react` 6.0.1 - React Fast Refresh + JSX transform

**Testing:**
- Not configured — no test runner detected

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.104.0 - Backend client; all DB reads/writes and auth flow route through `src/lib/supabase.ts`
- `react` 19.2.5 - Core UI framework; uses concurrent features (Suspense in `src/App.tsx`)
- `three` / `@react-three/fiber` / `@react-three/drei` - ShimmerCore 3D visual, central to aesthetic; `MeshDistortMaterial` controlled by `staticLevel` prop

**Infrastructure:**
- `@types/three` 0.184.0 - Three.js type definitions (dev)
- `typescript-eslint` 8.58.2 - TypeScript-aware linting
- `eslint-plugin-react-hooks` 7.1.1 - Hooks rules enforcement
- `eslint-plugin-react-refresh` 0.5.2 - Fast Refresh lint rules

## Configuration

**TypeScript:**
- `tsconfig.json` - Project references root (no compiler options directly)
- `tsconfig.app.json` - Web/Vite build; target ES2023, `jsx: react-jsx`, `noEmit: true`; **explicitly excludes `src/native/`**
- `tsconfig.node.json` - Vite config compilation; includes `vite.config.ts` only

**Build:**
- `vite.config.ts` - Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`. No custom aliases or proxy rules.
- Build command: `tsc -b && vite build`

**Linting:**
- `eslint.config.js` - Flat config; applies to `**/*.{ts,tsx}`; extends `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`

**Environment:**
- Variables injected via `.env.local` (not committed)
- Required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (accessed via `import.meta.env` in `src/lib/supabase.ts`)
- Edge Functions use `Deno.env.get('SUPABASE_URL')` and `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` (set by Supabase platform automatically)

## Platform Requirements

**Development:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version`)
- npm
- `.env.local` with valid Supabase project credentials

**Production (Web):**
- Static hosting (Vite build output in `dist/`)
- Supabase project for backend

**Production (Native):**
- Expo/Metro build pipeline (not yet configured in repo — `src/native/` code exists but no `app.json`, `metro.config.js`, or Expo config detected)

---

*Stack analysis: 2026-04-22*
