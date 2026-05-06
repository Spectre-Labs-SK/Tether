# Tech Stack

**Last mapped:** 2026-05-05

## Runtime & Language

- **TypeScript** ~5.9.2 (package.json spec; DEPENDENCIES.md notes ~6.0.2 installed) — primary language across web and native pipelines
- **JavaScript (ESM)** — `"type": "module"` in `package.json`; `metro.config.cjs` uses `.cjs` extension to satisfy Metro's CJS requirement
- **Target:** ES2023 (`tsconfig.app.json` `target: "es2023"`)
- **Module system:** `esnext` modules, `bundler` moduleResolution (web); Metro CJS (native)
- **Node.js** — dev tooling host (no version pin; `.nvmrc` not present)
- **Deno** — runtime for Supabase Edge Functions (`supabase/functions/*/index.ts`), imports from `https://deno.land/std@0.208.0`

## Core Frameworks

| Framework | Version | Pipeline | Purpose |
|-----------|---------|----------|---------|
| React | 19.2.0 | Web + Native | UI framework |
| React Native | 0.83.6 | Native (Metro/EAS) | Mobile UI primitives |
| Expo | ^55.0.17 | Native | React Native toolchain, EAS build |
| Vite | ^8.0.9 | Web (dev sandbox) | Dev server + production bundler |
| Three.js | ^0.184.0 | Web | 3D engine for ShimmerCore canvas |

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.104.1 | Database client, auth, real-time — central data layer |
| `@react-three/fiber` | ^9.6.0 | React renderer for Three.js (ShimmerCore canvas) |
| `@react-three/drei` | ^10.7.7 | Three.js helpers — Float, MeshDistortMaterial |
| `three` | ^0.184.0 | 3D engine (peer dep for fiber/drei) |
| `@types/three` | ^0.184.0 | TypeScript types for Three.js |
| `zustand` | ^5.0.12 | State store — used exclusively for R3F/useFrame bridge (`src/stores/patternStore.ts`) |
| `@react-navigation/native` | ^7.0.0 | Native screen navigation |
| `@react-navigation/native-stack` | ^7.0.0 | Stack navigator for native |
| `nativewind` | ^4.2.3 | Tailwind utilities for React Native |
| `tailwindcss` | 3.4.1 | CSS utility framework (web: v4 via plugin; native: v3 via nativewind) |
| `@tailwindcss/vite` | ^4.2.2 | Tailwind v4 Vite plugin — required in `vite.config.ts` |
| `lucide-react` | ^1.8.0 | Icon set (Shield, Sparkles, Brain, Zap) |
| `expo-gl` | ~55.0.13 | OpenGL for native 3D |
| `expo-haptics` | ~55.0.14 | Device haptic feedback |
| `expo-dev-client` | ~55.0.32 | Custom dev client for EAS development builds |
| `react-native-safe-area-context` | ^5.0.0 | Safe area insets |
| `react-native-screens` | ^4.0.0 | Native screen stack optimization |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^8.0.9 | Web build tool and dev server |
| `@vitejs/plugin-react` | ^6.0.1 | Vite React fast refresh |
| `typescript` | ~5.9.2 | Type checker |
| `eslint` | ^9.39.4 | Linter |
| `@eslint/js` | ^9.39.4 | ESLint JS flat config base |
| `typescript-eslint` | ^8.58.2 | TypeScript ESLint integration |
| `eslint-plugin-react-hooks` | ^7.1.1 | Hooks linting rules |
| `eslint-plugin-react-refresh` | ^0.5.2 | Fast refresh lint rules |
| `globals` | ^17.5.0 | Global variable definitions for ESLint |
| `@types/react` | ^19.2.14 | React TypeScript types |
| `@types/react-dom` | ^19.2.3 | ReactDOM TypeScript types |
| `@types/node` | ^24.12.2 | Node.js TypeScript types |

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node manifest; scripts, deps, `"type":"module"` |
| `tsconfig.app.json` | Web-only tsconfig; includes `src/`, excludes `src/native/`; verbatimModuleSyntax, noUnusedLocals |
| `vite.config.ts` | Vite config; React plugin, Tailwind v4 plugin, EXPO_PUBLIC_ env var injection |
| `babel.config.cjs` | Expo/Metro Babel config; preset `babel-preset-expo` |
| `metro.config.cjs` | Metro bundler config; CJS format (required by `"type":"module"`); uses `expo/metro-config` defaults |
| `app.json` | Expo app config; name `tether`, slug `tether`, EAS projectId, android package `com.spectrelabs.tether` |
| `eslint.config.js` | ESLint flat config; TS + React Hooks + React Refresh rules |
| `patches/expo-modules-core+55.0.24.patch` | Adds `-lc++_shared` to Android CMake linker flags; applied via `postinstall` |

## TypeScript Compiler Constraints

All enforced in `tsconfig.app.json`:
- `verbatimModuleSyntax: true` — type-only imports must use `import type`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `erasableSyntaxOnly: true`
- `noFallthroughCasesInSwitch: true`
- `noEmit: true` — type-check only; Vite handles emit

## Build & Deploy

### Web (Dev Sandbox — Vite)

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build

# Accurate type-check (avoids tsbuildinfo false negatives):
npx tsc --project tsconfig.app.json --noEmit
```

- Entry: `src/App.tsx`
- Tailwind: v4 inline utilities via `@tailwindcss/vite` plugin
- Output: Vite dist (web-only, dev sandbox — not the shipping product)

### Native (Expo / EAS — The Actual Product)

```bash
npx expo start                                         # Metro bundler
npx expo run:android                                   # Local debug build
eas build --platform android --profile development     # EAS debug APK
eas build --platform android --profile preview         # EAS release APK
npm install                                            # patch-package auto-applies on postinstall
```

- Entry: `index.js` → `src/native/NativeApp.tsx`
- Styling: `StyleSheet.create()` + file-top `COLORS` constants
- Platform targets: Android, iOS (declared in `app.json`)
- EAS project: `79507357-e5e4-4f48-97ea-ba01a6f4ac65`
- Android package: `com.spectrelabs.tether`

### Supabase Edge Functions (Deno)

- Runtime: Deno (invoked via Supabase hosted infrastructure)
- Functions: `supabase/functions/calculate-1rm/index.ts`, `supabase/functions/sync-workout/index.ts`
- Deploy: Supabase CLI (`supabase functions deploy`)

---

*Stack analysis: 2026-05-05*
