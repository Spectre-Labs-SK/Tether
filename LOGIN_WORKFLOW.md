# SPECTRE LABS: HANDLE REGISTRATION & LOGIN WORKFLOW

**DOMAIN:** Identity & Auth
**AUTHOR:** TETHER_ARCHITECT
**STATUS:** PLANNED FOR TONIGHT

---

## 1. THE CURRENT STATE (GHOST PROTOCOL)
Currently, `EntryGate.tsx` and `useTetherState.ts` execute a **Zero-Friction Anonymous Auth**. 
When a user hits the app, they are instantly logged in via `supabase.auth.signInAnonymously()` and assigned a random, anonymous handle (e.g., `ghost-hawk-123`). 

**The Vulnerability:** If the user switches devices or clears their browser data, their identity and logs are obliterated. The system flags this as `isUntracked` (The Bitch-Weight Guard).

## 2. THE OBJECTIVE
We need to build a pipeline that seamlessly upgrades a "Ghost" (anonymous user) into a "Tracked Operative" (registered user) without losing their existing session data, while also providing a backdoor for returning operatives.

---

## 3. THE WORKFLOW PLAN (TONIGHT'S EXECUTION)

### PHASE A: THE UPGRADE PATH (Ghost -> Registered)
This flow converts an active anonymous session into a permanent identity.

1. **The Call to Action:** In `Chill Mode` (the War Room), if `isUntracked` is `true`, surface a persistent UI element: `"SECURE IDENTITY [WARNING: DATA VOLATILE]"`.
2. **The Credential Link:** User taps the warning and is prompted for an Email and Password (or Magic Link).
3. **The Supabase Link:** 
   - We call `supabase.auth.updateUser({ email, password })`. 
   - This takes the *existing* anonymous UUID and binds it to the new credentials. The user's row in the `profiles` table and all their joint ops/history remain intact.
4. **The Confirmation:** Profile table updates `is_registered` to `true`. Valkyrie logs: `"Identity secured. Welcome to the permanent network."`

### PHASE B: THE RECOVERY PATH (Returning Operative)
This flow is for users installing the app on a new device.

1. **The Gate Change:** Modify `EntryGate.tsx`. Next to the "Chill Mode" and "SOS Mode" buttons, add a subtle, terminal-style footer link: `"EXISTING OPERATIVE? [RESTORE SESSION]"`.
2. **The Login Matrix:** 
   - Opens a minimalist email/password input.
   - Calls `supabase.auth.signInWithPassword()`.
3. **The Resolution:** 
   - Auth resolves. `useTetherState.ts` automatically fetches their real profile. 
   - Bypasses the anonymous handle generation.
   - Routes directly to `Chill Mode`.

### PHASE C: THE KILL SWITCH (Sign Out)
Currently, `handleReset()` exists in the SOS menu. We need a proper "Sign Out" button in the Chill Mode settings that:
1. Calls `supabase.auth.signOut()`.
2. Flushes local state.
3. Kicks the user back to the raw `EntryGate.tsx`.

---

## 4. REQUIRED FILES TO TOUCH
- `src/components/EntryGate.tsx` (Add Recovery link and forms)
- `src/components/WarRoom.tsx` (Add "Secure Identity" prompt for `isUntracked` users)
- `src/lib/supabase.ts` (Add auth helper functions for upgrading/logging in)

## 5. ARCHITECTURAL GUARDRAILS
- **Do NOT wipe the `userId` during the upgrade.** Supabase's `updateUser` allows you to add an email to an anonymous user without generating a new UUID. This is critical to prevent orphaned data.
- Maintain the Spectre Labs aesthetic. Login forms should not look like standard web forms; they should look like terminal prompts or encrypted key exchanges.

