# Product

## Register

product

## Users

Active individuals using the app during or immediately before physical training sessions. Context is high-stress, low-attention — they have one hand free, limited time, and zero patience for setup friction. Primary task on any given screen is to start a session or log a set. Crisis/SOS users are in genuine distress and need zero cognitive load.

## Product Purpose

Tether is a React Native activity tracker for Iron (strength), Road (running/C25K), Mat (yoga/mobility), and Hub (standing desk) domains. The product exists to eliminate session-start friction — 3 taps to active from a cold launch. Built by Spectre Labs. Secondary layer: real-time biometric feedback via a Three.js signal-driven visual (ShimmerCore) that responds to app state. Success looks like a session started within 10 seconds of opening the app.

## Brand Personality

Spectre Labs. Industrial, disciplined, tactical. Three words: dark, uncompromising, earned. No decoration that doesn't carry meaning. Every element is there because it works, not because it looks good. The app communicates with the user like a mission briefing: terse, direct, high-stakes.

## Anti-references

No SaaS patterns. No rounded cards (no `border-radius: 8px` roundness or card shadows). No Inter font or system-default sans-serif. No gradients for decoration. No Tailwind UI / ShadCN aesthetics. No onboarding tours or friendly empty states. No color-coded progress bars with confetti. No Material Design. Nothing that says "wellness app" or "fitness startup".

## Design Principles

1. **Terminal-first**: Every screen reads like a command-line output. Monospace type, uppercase labels, sparse layout.
2. **Two-mode discipline**: All visual decisions trace back to MILITARY (slate #1e293b) or ETHER (purple #6d28d9). Never introduce a third mode or off-brand accent without intent.
3. **Crisis path is sacred**: The SOS/emergency flow gets zero friction. No confirmation dialogs, no loading states, no error messages that block. The crisis button works even when everything else breaks.
4. **Earn every pixel**: If an element doesn't change behavior or communicate status, it doesn't exist. No decorative dividers, placeholder art, or filler copy.
5. **The screen is a briefing**: Text is uppercase, tracked out, minimal. No sentence-case body copy, no friendly headlines. Communicate like a mission debrief, not a welcome message.

## Accessibility & Inclusion

WCAG AA minimum for contrast. Crisis/SOS path must be operable with one hand under stress. No animations that can't be reduced. No font size below 10sp in production screens.
