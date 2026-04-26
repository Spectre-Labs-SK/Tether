# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-22

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** tether
- **Description:** React Native (Expo) universal activity tracker with a Vite web shell — dual codebase in one repo.
- **Architecture split:** `src/native/` is Expo/RN only — excluded from `tsconfig.app.json` via `"exclude": ["src/native"]`. The Vite web build never touches it; the native build needs its own tsconfig/metro config.
- **shimmer_mode flow:** Driven via navigation params `FitnessOnboardingGrid → PushDayOnboarding({ shimmerMode })` → persisted in `workouts.shimmer_mode` on sync. Type: `ShimmerMode` from `src/registry/valkyrie/houses.ts`.
- **useTetherState pattern:** All profile state mutations follow DB-first → then `setProfile(data)`. Never optimistic-update local state before Supabase confirms.
- **staticLevel slider:** Controls `MeshDistortMaterial distort` prop on ShimmerCore. Range 0–100, passed as `staticLevel / 100`. Initial value 40 (matches original hardcoded 0.4).
- **Auth upgrade pattern:** Use `supabase.auth.updateUser({ email, password })` — NOT signOut+signIn — to convert anonymous users. This preserves the UUID and all linked data. The anonymous session's `is_anonymous` flag becomes `false` automatically.
- **is_anonymous detection:** Cast `session.user` as `{ is_anonymous?: boolean }` — the property exists in the Supabase auth JWT but isn't in the TS SDK types. Used in EntryGate and WarRoom to distinguish Ghost vs. registered operatives.
- **userId threading:** `EntryGate.onEnter(mode, userId)` passes userId up to `App`, which stores it and passes to `WarRoom`. WarRoom calls `useTetherState(userId)` independently. This pattern avoids prop-drilling auth state through unrelated components.
- **isUntracked vs isGhost:** `isUntracked = !isLoading && !userId` — total auth failure (Supabase unavailable). `isGhost` in WarRoom = user has anonymous session (`is_anonymous: true`) — upgradeable. These are different conditions requiring different UI responses.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
