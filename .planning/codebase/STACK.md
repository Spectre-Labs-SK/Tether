# Tech Stack

**Last Mapped:** 2026-04-25

## Languages

- **TypeScript** ~6.0.2 — strict-ish config (noUnusedLocals, noUnusedParameters, erasableSyntaxOnly)
- Target: ES2023 / DOM (web build); ESNext modules

## Frameworks

- **React** 19.2.5 — functional components, hooks-only, no class components
- **React Native** (referenced via `src/native/` imports) — NOT part of the Vite build; no Expo SDK installed

## Key Libraries

| Package | Version | Role |
|---|---|---|
| @react-three/fiber | ^9.6.0 | React renderer for Three.js |
| @react-three/drei | ^10.7.7 | Three.js helpers (Float, MeshDistortMaterial) |
| three | ^0.184.0 | 3D engine |
| @supabase/supabase-js | ^2.104.0 | BaaS client (auth, database, edge functions) |
| lucide-react | ^1.8.0 | Icons (installed but not yet used in any component) |
| tailwindcss (via @tailwindcss/vite) | ^4.2.2 | CSS utility framework, v4 Vite plugin |

## Build Tooling

- **Vite** ^8.0.9 — dev server + bundler
- **@vitejs/plugin-react** ^6.0.1 — JSX transform
- **@tailwindcss/vite** ^4.2.2 — Tailwind v4 plugin (replaces postcss setup)
- Build command: `tsc -b && vite build`
- Dev server: `vite` (port auto-assigned)

## Linting

- **ESLint** ^9.39.4 with flat config (`eslint.config.js`)
- **typescript-eslint** ^8.58.2
- **eslint-plugin-react-hooks** ^7.1.1
- **eslint-plugin-react-refresh** ^0.5.2

## Runtime

- **Browser** — primary target (Vite SPA)
- **React Native / Expo** — intended secondary target; `src/native/` screens exist but Expo SDK is NOT installed and `src/native` is excluded from tsconfig compilation

## Package Manager

- **npm** (`package-lock.json` present)
