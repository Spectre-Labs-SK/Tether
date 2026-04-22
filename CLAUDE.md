# TETHER — CLAUDE.md (Context Injector)

**Spectre Labs | Shimmer Framework | v0.0.0**

---

## WHAT WE ARE BUILDING

Tether is a **React 19 + Three.js** web app built around the "Shimmer Framework" — a dual-mode (MILITARY / ETHER) 3D interface shell. Currently it is the UI foundation for Spectre Labs' broader platform, which will include:

- A character/equipment system ("Valkyrie" — "The Queen" persona with gated PRIME-rarity gear)
- A mode-switching aesthetic engine (Military dark-slate vs. Ethereal deep-purple)
- Future features: idea tracking, build journaling, and character progression

The app is in early "Resurrection Phase" — the skeleton is built, the design language is locked, the data models are stubbed.

---

## CURRENT STATE (as of 2026-04-20)

**Screen 1 — THE BUNKER (calibration gate):**
- Mono/terminal aesthetic, emerald green on black
- Static-level range slider (captured, not yet wired to anything)
- "Initialize_Survive_Protocol" button → gates entry to the War Room

**Screen 2 — THE WAR ROOM:**
- Full-screen Three.js Canvas behind a 2D HUD overlay
- `ShimmerCore`: floating distorted metallic sphere (`MeshDistortMaterial`, `Float`)
- Color shifts with mode: `#1e293b` (MILITARY) / `#6d28d9` (ETHER)
- "Initiate Shift" button toggles modes
- Suspense null-fallback prevents 3D crash

---

## TECH STACK

| Layer | Tech | Version |
|---|---|---|
| UI | React | 19.2.5 |
| Language | TypeScript | ~6.0.2 |
| 3D | Three.js | 0.184.0 |
| 3D React | @react-three/fiber | 9.6.0 |
| 3D Helpers | @react-three/drei | 10.7.7 |
| Styling | TailwindCSS (Vite plugin) | 4.2.2 |
| Icons | lucide-react | 1.8.0 |
| Build | Vite | 8.0.9 |

---

## FILE MAP

```
src/
  App.tsx                  — All UI logic; ShimmerCore 3D component inline
  index.css                — Tailwind import + body reset + .noise-overlay
  App.css                  — Vestigial Vite template styles (unused)
  main.tsx                 — React root mount
  registry/
    valkyrie/
      manifest.ts          — VALKYRIE_MANIFEST data (stubbed, not yet imported)
AGENT.md                   — Agent role & master file protocols
CLAUDE.md                  — This file (Context Injector)
```

---

## KEY STATE (App.tsx)

```ts
mode: 'MILITARY' | 'ETHER'       // aesthetic mode
isCalibrated: boolean             // gate between Bunker and War Room
staticLevel: number               // 0-100, slider value, currently unused
```

---

## VALKYRIE MANIFEST (registry/valkyrie/manifest.ts)

```ts
VALKYRIE_MANIFEST = {
  id: 'v-prime-01', codename: 'VALKYRIE', title: 'The Queen',
  gear: {
    helmets:  [ { Shimmer Crown, PRIME, queenOnly }, { Shadow Visor, ELITE } ],
    wings:    [ { Ethereal Flight-Span, PRIME, queenOnly }, { Carbon Thruster, COMMON } ]
  }
}
```
Not yet wired into any UI — ready for integration.

---

## SHIMMER FRAMEWORK RULES

- **MILITARY mode:** `#1e293b` slate, industrial/tactical aesthetic
- **ETHER mode:** `#6d28d9` purple, mystical/ethereal aesthetic
- Both modes share the same ShimmerCore geometry — only material color changes
- Future: Metaball Shader logic to differentiate modes more deeply

---

## INFRASTRUCTURE (added 2026-04-20)

```
supabase/
  migrations/
    01_initial_schema.sql    — profiles + life_sectors tables, RLS, updated_at triggers

src/lib/
  supabase.ts                — Supabase client + Profile/LifeSectors types
  agentLog.ts                — [Agent_Architect] / [Agent_Valkyrie] console log format

src/hooks/
  useTetherState.ts          — State machine: crisis_mode → onboarding_pending + 'minimalist' UIConfig
                               Also handles random handle generation (minimal friction for SOS users)

src/components/
  EntryGate.tsx              — 50/50 split: Chill Mode (left) / SOS Mode (right)
                               SOS button: "I DON'T KNOW I'M JUST LOSING IT" → triggerCrisisMode()
```

**REQUIRES before running:**
- `npm install @supabase/supabase-js` (not yet installed — awaiting approval)
- `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Wire EntryGate into App.tsx:**
```tsx
import EntryGate from './components/EntryGate';
// Replace Bunker screen or add before it:
<EntryGate onEnter={(mode) => { /* route to chill or sos experience */ }} />
```

---

## KNOWN GAPS / NEXT BUILD TARGETS

1. **(From Audit)** Implement a user-accessible "kill switch" for the SOS/anonymous mode to fully comply with the Feu Follet Charter.
2. `staticLevel` slider is captured but does nothing — wire to `distort` prop on `MeshDistortMaterial`.
3. `lucide-react` icons (Shield, Sparkles, Brain, Zap) imported but never rendered.
4. `App.css` is vestigial — safe to delete.
5. `DEPENDENCIES.docx` doesn't exist yet (referenced in AGENT.md).
6. ShimmerCore is inline in `App.tsx` — extract as complexity grows.
7. Supabase Auth flow not yet configured — `EntryGate` uses `supabase.auth.getUser()` with graceful fallback.

---

## DEV COMMANDS

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```
