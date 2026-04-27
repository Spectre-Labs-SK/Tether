# DEPENDENCIES — Supply Chain

**Spectre Labs | Tether | Pillar 3**
**Last updated: 2026-04-26**

---

## Runtime Dependencies

| Package | Version (installed) | Purpose |
|---|---|---|
| `react` | ^19.2.5 | UI framework |
| `react-dom` | ^19.2.5 | DOM renderer |
| `@react-three/fiber` | ^9.6.0 | Three.js React renderer (ShimmerCore canvas) |
| `@react-three/drei` | ^10.7.7 | Three.js helpers — Float, MeshDistortMaterial |
| `three` | ^0.184.0 | 3D engine (peer dep for fiber/drei) |
| `@types/three` | ^0.184.0 | TypeScript types for Three.js |
| `@supabase/supabase-js` | ^2.104.1 | Database, auth, and real-time (profiles, workouts, joint_ops) |
| `lucide-react` | ^1.8.0 | Icon set (Shield, Sparkles, Brain, Zap — pending render) |
| `@tailwindcss/vite` | ^4.2.2 | Tailwind CSS v4 via Vite plugin |

## Dev Dependencies

| Package | Version (installed) | Purpose |
|---|---|---|
| `vite` | ^8.0.9 | Build tool and dev server |
| `typescript` | ~6.0.2 | Type checker |
| `@vitejs/plugin-react` | ^6.0.1 | Vite + React fast refresh |
| `@types/react` | ^19.2.14 | React TypeScript types |
| `@types/react-dom` | ^19.2.3 | ReactDOM TypeScript types |
| `@types/node` | ^24.12.2 | Node.js TypeScript types |
| `eslint` | ^9.39.4 | Linter |
| `@eslint/js` | ^9.39.4 | ESLint JS config |
| `eslint-plugin-react-hooks` | ^7.1.1 | Hooks lint rules |
| `eslint-plugin-react-refresh` | ^0.5.2 | Fast refresh lint rules |
| `typescript-eslint` | ^8.58.2 | TypeScript ESLint integration |
| `globals` | ^17.5.0 | Global variable definitions for ESLint |

---

## Changelog

| Date | Change | From → To |
|---|---|---|
| 2026-04-20 | Added Supabase client | — → `@supabase/supabase-js ^2.104.1` |
| 2026-04-23 | Initial package inventory | — (bootstrapped from Vite React TS template) |

---

## Environment Variables Required

| Variable | File | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` | Supabase project URL (from Project Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | Supabase anon/public key |
