# Beginner Tether Bootcamp

This is the ground-up path from `hello world` to building a real Tether feature.

Rule: do the exercises in order. Do not skip ahead. Each one teaches one new idea.

## How We Work

1. You write the code yourself.
2. You send me your code.
3. I grade it out of 10.
4. If it fails, I explain exactly why and give you the next attempt.
5. When you pass, we move to the next exercise.

## Goal

Build toward a beginner-safe version of Tether's SOS breathing flow and gate logic.

Real repo references:

- `src/App.tsx`
- `src/components/BunkerGate.tsx`

We are not starting there. We are earning our way there.

---

## Stage 0: Terminal + Running Code

### Exercise 0.1

Create a file named `hello.js` and type:

```javascript
console.log("hello world");
```

Run it with:

```powershell
node hello.js
```

### What this teaches

- A file can contain code
- `console.log()` prints text
- `node` runs JavaScript

### Pass condition

The terminal prints:

```text
hello world
```

---

## Stage 1: Variables

### Exercise 1.1

Create `intro.js`.

Store:

- your name
- your age
- a project name

Then print one sentence using those values.

Target pattern:

```text
My name is X, I am Y, and I am building Z.
```

### What this teaches

- `const`
- strings
- numbers
- combining values into output

### Pass condition

You use variables instead of typing the whole sentence directly inside `console.log`.

---

## Stage 2: Decisions

### Exercise 2.1

Create `mode-check.js`.

Make a variable called `appMode`.

If `appMode` is `"gate"`, print:

```text
Show Bunker Gate
```

If `appMode` is `"sos"`, print:

```text
Show SOS Screen
```

Otherwise print:

```text
Show War Room
```

### Why this matters

This is the same decision shape used in `src/App.tsx`.

---

## Stage 3: Arrays and Loops

### Exercise 3.1

Create `breathing-phases.js`.

Make an array containing:

- `"INHALE"`
- `"HOLD"`
- `"EXHALE"`
- `"HOLD"`

Loop through the array and print each phase.

### Stretch

Print the phase number too.

Example:

```text
Phase 1: INHALE
Phase 2: HOLD
Phase 3: EXHALE
Phase 4: HOLD
```

### Why this matters

The SOS screen in `src/App.tsx` cycles through breathing phases.

---

## Stage 4: Objects

### Exercise 4.1

Create `phase-data.js`.

Instead of plain strings, make an array of objects like:

```javascript
{ label: "INHALE", seconds: 4, color: "green" }
```

Print each object's label and seconds.

Example:

```text
INHALE lasts 4 seconds
```

### Why this matters

Tether stores breathing phase data as objects, not just loose text.

---

## Stage 5: Functions

### Exercise 5.1

Create a function called `formatTime`.

Input:

- total seconds

Output:

- a string in `mm:ss` format

Examples:

- `formatTime(0)` -> `00:00`
- `formatTime(5)` -> `00:05`
- `formatTime(65)` -> `01:05`

### Why this matters

`src/App.tsx` already uses this exact kind of helper in the SOS flow.

---

## Stage 6: Mini Tether in Plain JavaScript

### Exercise 6.1

Create `mini-sos.js`.

Requirements:

- Store the breathing phases in an array of objects
- Track a `sessionSeconds` variable
- Create a `formatTime` function
- Print:
  - current phase label
  - current phase length
  - current session time

You do not need buttons yet. Hardcode the values first.

### Example output

```text
Current phase: INHALE
Phase length: 4
Session time: 00:12
```

### Why this matters

This is the logic skeleton of the real SOS screen before React gets involved.

---

## Stage 7: First React Component

### Exercise 7.1

After you pass Stage 6, build a React component called `MiniSOSShell`.

Requirements:

- returns JSX
- shows a title
- shows the current breathing phase
- shows session time
- uses variables inside JSX with `{ }`

This is your bridge from JavaScript into the real app.

---

## Stage 8: First Real Project Slice

### Exercise 8.1

Rebuild a simplified version of the `appMode` routing from `src/App.tsx`.

Requirements:

- one variable called `appMode`
- render one message for `"gate"`
- render one message for `"sos"`
- render one message for `"chill"`

If you pass this, you are officially reading real Tether control flow instead of random tutorial code.

---

## Grading Rubric

### 10/10

- Correct output
- Correct syntax
- Clean variable names
- No copy-paste cheating from the answer

### 7/10

- Mostly works
- One or two syntax or logic mistakes

### 4/10

- Idea is visible
- Code structure is confused or broken

### 1/10

- Not runnable
- Missing the main concept of the exercise

---

## Your First Assignment

Do only this now:

1. Create `hello.js`
2. Type `console.log("hello world");`
3. Run `node hello.js`
4. Send me:
   - the code
   - the terminal output

When you send that, I will grade it and give you Exercise 1.1.
