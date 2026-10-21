# PROJECT_SPEC.md — Functional Specification

## 1. Project Goal & Target Experience
- **Concept:** A retro 8-bit pixel-art platformer/adventure game created as a personal birthday surprise.
- **Estimated Play Time:** ~8 to 12 minutes of balanced, accessible, and progressive platforming gameplay.
- **Target Audience:** The birthday person (accessible controls, joyful tone, clear progression, satisfying payoff).
- **Target Platform:** Desktop and laptop web browsers only (initial release). Mobile and touchscreen support is removed from the active scope.

---

## 2. Confirmed Requirements

### 2.1 Character Design (Authoritative Reference: `character.jpg`)
- **Visual Reference:** The character design is strictly guided by the user-provided reference image [`character.jpg`](./character.jpg).
- **Key Visual Features:**
  - Long brown hair with volume and back bounce.
  - Large expressive pixel-art eyes framed by stylish red rounded-square (squircle) transparent optical glasses.
  - Open black jacket with white/light lapels.
  - Light inner top.
  - Loose/flared blue denim jeans.
  - Black shoes/boots.
- **Accessories:** No party hat or other unrequested accessories.
- **Animation States:** Idle breathing, running (4 frames), jumping (rising), and landing/falling.
- **Verification Rule:** Never claim an exact visual match until the implemented sprite has been visually verified against `character.jpg`.

### 2.2 Confirmed Keyboard Controls & Jump Modes
- **Left Arrow:** Move left.
- **Right Arrow:** Move right.
- **Space — 3 Jump Input Modes:**
  - **Mode A (Normal Jump):** Single quick Space press initiates standard jump.
  - **Mode B (Hold Space):** Holding Space activates variable-height jump (higher arc up to max hold duration).
  - **Mode C (Double Space):** Second intentional Space press within double-press timing window (320ms) activates an extra-high jump boost. Has a strict single-use guard per jump to prevent unlimited mid-air flight. Resets on landing, stomping enemies, or respawning.
- **E:** Interact with / open a nearby gift box.
- **D:** Interact with the inventory machine and initiate coin deposit.
- **U:** Initiate the castle key-use interaction.
- **Enter:** Confirm "OK" on active dialog / confirmation panels.
- **Escape:** "Cancel" / dismiss active dialog / confirmation panels.
- **M:** Mute / unmute audio (if sound is enabled).
- **H / ? Icon:** Open Controls & Help modal.
- **Control Scheme Rule:** Obsolete movement bindings like `A` and `D` are strictly removed. `D` is exclusively reserved for the inventory machine coin deposit.

### 2.3 Controls Icon & Help Panel
- **Main Screen Icon:** A compact pixel-art `?` button located in the top-right corner of the canvas viewport (DOM element `#btn-controls-icon`).
- **Placement & Layout:** Placed at `top: 10px, right: 12px` (28x28px), with the canvas Key HUD offset left to guarantee zero overlap.
- **Modal Behavior:**
  - Clicking `?` or pressing `H` opens `#controls-modal`.
  - Gameplay pauses immediately; player velocity, coordinates, and timers are frozen.
  - Displays a clean pixel-art table of all keyboard actions.
  - Dismissed via `Close [Esc]` button, `Escape`, `Enter`, or clicking outside.
  - Safely resumes gameplay without input leakage.

### 2.4 World Structure & 5 Gameplay Sections (5000px World)
The level extends to 5000px horizontally with 5 distinct sections of increasing difficulty:
1. **Section 1: The Beginning (x: 0 – 1000px):** Easy introduction. Ground segments 1–2, 1 gap (gap 1), 2 gentle elevated platforms, 2 basic red slimes, 1 gift, 40 coins. Focus on movement and basic jump.
2. **Section 2: The First Challenge (x: 1000 – 2000px):** Easy–Medium. Ground segments 2–4, 2 gaps, 4 elevated platforms requiring timed jumps, 3 slimes, 2 gifts (`gift_2`, `gift_3`), 40 coins.
3. **Section 3: The Lost Gifts (x: 2000 – 3000px):** Medium. Multi-tier platforms, narrow landings, consecutive jumps, 2 gaps, 4 varied enemies (including fast blue and teal slimes), 3 gifts (`gift_4`, `gift_5`, `gift_6`), 40 coins. Cannot be bypassed by holding right arrow alone.
4. **Section 4: The Coin Challenge & Inventory Machine (x: 3000 – 4100px):** Medium–Hard. Longer chasms, 4 high platforms, alternate coin routes, 4 enemies, 3 gifts (`gift_7`, `gift_8`, `gift_9`), 40 coins. Contains the **Inventory Machine** at `x: 3750px` (~75% mark).
5. **Section 5: The Final Journey & Castle Climax (x: 4100 – 5000px):** Hard, but fair. Precision jumps across wide gaps, 5 platforms, 3 purple/magenta elite enemies, 3 final storytelling gifts (`gift_10`, `gift_11`, `gift_12`), 40 coins, culminating at the **Royal Castle** at `x: 4800px`.

### 2.5 Collectible Coin Economy & Inventory Machine
- **Coins Across Level:** Exactly **200 collectible coins** evenly distributed across all 5 sections (40 coins per section).
- **Economy Rule:** Key requirement is fixed at **exactly 40 coins**.
- **Player Balance:** Upon valid deposit, 40 coins are deducted; player retains 160 coins for the remainder of the adventure.
- **Inventory Machine Entity:**
  - Located at `x: 3750px` (75% mark of 5000px world), resting safely on Ground Segment 7.
  - Visually styled as a retro arcade/vending machine with glowing coin slot and key dispenser.
- **Interaction Flow (Within Range):**
  - Displays `"Press D to Deposit Coins"`.
  - Pressing `D` opens deposit confirmation panel showing coins held vs 40 required.
  - If held < 40: Informs player of deficit.
  - If held >= 40: Allows OK (`Enter`) or Cancel (`Escape`).
  - Upon confirmation: 40 coins deducted, Golden Castle Key dispensed, transaction locked to prevent duplicate deposits.

### 2.6 Multiple Gifts & Storytelling Modal
- **12 Unique Gifts:** 12 gift boxes placed throughout the 5 sections with unique IDs (`gift_1` through `gift_12`).
- **Configurable Content:** All gift titles, coordinates, and messages reside in `CONFIG.GIFTS` in `js/config.js`.
- **Interaction Prompt:** Approaching a gift displays `"Press E to Open Gift"`.
- **Central Viewport Modal:** Opening a gift renders `#gift-modal` in the center of the screen with a decorative ribbon, title, multiline message, and `Okay [Enter]` button.
- **Gameplay Pause:** Time, physics, and enemies pause while reading; resumes cleanly on dismissal.
- **Single Open Guard:** Each gift can be opened only once per run.

### 2.7 Platforming, Gaps & Patrolling Enemies
- **9 Ground Segments & 8 Gaps:** Chasms bridged by stepping-stone platforms to ensure fair traversability using normal or Mode C jumps.
- **19 Elevated Platforms:** Configured with one-way downward pass-through (jump from below, land on top).
- **15 Patrolling Enemies:** Varied colors (red, green, blue, purple, magenta), speeds (24 to 45 px/s), and patrol paths on ground and platforms.
- **Collision Disambiguation:**
  - **Jump-Stomp Defeat:** Landing with downward velocity (`vy > 0`) on an enemy defeats it with a satisfying upward bounce.
  - **Side / Bottom Hit:** Player takes invulnerability flash and soft knockback.
- **6 Checkpoints:** Positioned safely before difficult platforming challenges (`x: 80, 1050, 1920, 2920, 3700, 4220`).

### 2.8 The Final Castle & Two-Stage Entrance Trigger
- **Location:** `x: 4800px` (gate at `x: 4850px`, doorway trigger at `x: 4860px`), resting on Ground Segment 9.
- **Locked State:** Approaching without the Golden Key shows `[U] Castle Locked` notification.
- **Stage 1 — Castle Key Interaction (`U` Key):**
  - Approaching with key shows `[U] Unlock Castle`.
  - Pressing `U` opens confirmation dialog (`#castle-modal`).
  - On OK (`Enter`): Portcullis rises over 0.7s, 50 confetti particles burst, golden interior glows with red carpet. Unlocking does not redirect immediately.
- **Stage 2 — Entering the Castle & Video Redirect:**
  - Player freely walks inside the opened doorway (`x: 4860px`).
  - Entering trigger initiates final sequence:
    - If `CONFIG.BIRTHDAY_VIDEO_URL` is set: Redirects browser.
    - If empty: Opens `#victory-modal` with celebration banner and `Play Again [Enter]`.

---

## 3. Configuration Pattern (`config.js`)

```javascript
export const CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 450,
  WORLD_WIDTH: 5000,
  WORLD_HEIGHT: 450,

  BIRTHDAY_VIDEO_URL: "", 

  PHYSICS: {
    GRAVITY: 820,
    MOVE_SPEED: 140,
    JUMP_IMPULSE: 275,
    VARIABLE_JUMP_HOLD_TIME: 0.18,
    DOUBLE_JUMP_IMPULSE: 255,
    DOUBLE_JUMP_WINDOW: 0.32,
    COYOTE_TIME: 0.12,
    JUMP_BUFFER: 0.12
  },

  COINS: {
    TOTAL_IN_LEVEL: 200,
    REQUIRED_FOR_KEY: 40
  },

  MACHINE: {
    x: 3750,
    y: 309,
    w: 36,
    h: 66
  },

  CASTLE: {
    x: 4800,
    y: 245,
    w: 150,
    h: 130
  },

  GIFTS: [
    /* 12 configurable gifts across sections 1 to 5 */
  ],

  DEBUG_MODE: false
};
```

---

## 4. Current Status & Verification
- **Automated Tests:** 376 automated tests passing across 6 suites (Physics, Platforms/Enemies, Coins/Gifts, Inventory Machine, Castle, and Expansion Milestone).
- **Visual Previews Verified:** Controls help modal, Section 1 start, Section 3 platforms, Section 4 machine, and Section 5 castle climax.

