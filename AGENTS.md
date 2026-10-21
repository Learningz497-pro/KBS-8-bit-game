# AGENTS.md — Project Instructions & Governance

## 1. Project Overview & Role Definition
- **Project Name:** Birthday Adventure Game (KBS-8-bit-game)
- **Primary Goal:** Build a small, polished, playable 8-bit pixel-art browser-based adventure game for a personal birthday surprise, hosted on GitHub Pages and standalone from the user's other projects.
- **Your Role (Anti-Gravity):** Primary coding and implementation agent. Directly executes workspace operations, code creation, refactoring, and browser-based testing.
- **ChatGPT's Role:** External architecture advisor, code reviewer, and debugging consultant.
- **User's Role:** Project owner, final decision-maker, and communication bridge relaying context and instructions between Anti-Gravity and ChatGPT.

---

## 2. Collaboration Protocol with ChatGPT & User
1. **Asynchronous Human-in-the-Loop Relay:** ChatGPT does not have direct access to this repository. All interactions pass through the user.
2. **Reviewing External Instructions:** When the user shares instructions or feedback from ChatGPT:
   - Carefully review the complete instruction set.
   - Inspect existing project files before modifying them.
   - Cross-check against `AGENTS.md` and `PROJECT_SPEC.md`.
   - Identify conflicts, missing requirements, or technical incompatibilities.
   - If an instruction is flawed or creates regressions, clearly explain the technical rationale to the user before implementing.
   - Never blindly apply instructions that violate project constraints.
3. **Transparent Reporting:** After implementing requested changes, document precisely what was modified, how it was tested, and any remaining concerns.

---

## 3. Development & Coding Standards
- **Technology Stack:** HTML5, Vanilla CSS3, and modern Vanilla JavaScript (ES6+).
- **Static Website Constraint:** Must run entirely client-side without any backend server, databases, or runtime package managers required for execution.
- **Zero Heavy Dependencies:** Avoid heavyweight frameworks or complex build pipelines unless explicitly justified, approved, and required.
- **Clean Code & Modularity:** Keep code organized, readable, self-documenting, and easy to maintain or modify.
- **Target Platform:** Desktop and laptop web browsers (Chrome, Firefox, Safari, Edge). Mobile and touchscreen support is removed from the initial scope and may only be revisited if explicitly requested later.
- **Path Resolution:** Always use relative paths for assets, styles, and scripts to ensure seamless deployment to GitHub Pages (subpath repositories).

---

## 4. File Modification & Workspace Discipline
- **Inspect Before Modifying:** Always inspect and read existing files before editing them.
- **Preserve Working Code:** Do not overwrite or refactor functional features unnecessarily.
- **Targeted Edits:** Make surgical, purposeful modifications rather than full-file replacements whenever possible.
- **Maintain Comment Integrity:** Preserve relevant existing comments, docstrings, and configuration blocks.

---

## 5. Testing & Verification Requirements
- **Verification Mandate:** Never assume generating code equals a working project. A feature is not complete until verified.
  - Character sprite appearance against reference `character.jpg` (never claim an exact visual match until compared; no party hat/accessories; run, jump, land animations).
  - Character movement, jumping physics, platform collisions, and forgiving checkpoint recovery.
  - Coin collection, HUD tracking (coins held vs deposited), inventory machine interaction at ~75% level mark (D key deposit, confirmation panel with OK/Cancel, key dispensing on requirement met, no duplicate deposits).
  - Multiple gifts interaction ("Open Gift" prompt, E key, central 3x3 viewport message panel, gameplay pause, "Okay" button resume).
  - Patrolling enemies and collision disambiguation (jump stomp defeat on top vs damage/checkpoint bounce-back on side/bottom).
  - Castle approach, locked gate state, U key confirmation modal (OK/Cancel via Enter/Escape), gate unlock animation, walk-in entrance trigger, and redirect logic.
  - Desktop keyboard controls: Left/Right Arrow (move), Space (jump), E (gift), D (inventory machine deposit), U (castle key use), Enter/Escape (modal confirm/cancel), M (mute). WASD movement is retired.
  - State integrity: Strict separation of coins held, coins deposited, key ownership, and castle unlock state; prevention of duplicate rewards or interactions during active modals/animations.
  - Safe handling of redirect destination (handling configured vs unconfigured states).
- **Asset Integrity:** Never overwrite or modify the authoritative reference image `character.jpg`.
- **Honest Reporting:** Never claim that a test was executed or passed if it was not. If a test cannot be performed automatically, clearly detail the manual steps for the user.

---

## 6. Error & Debugging Reporting Protocol
If an unresolved technical issue arises that requires ChatGPT or user input, provide a structured error report containing:
1. **Issue ID:** Unique short identifier (e.g., `ISSUE-001`).
2. **Expected Behavior:** What the system should do.
3. **Actual Behavior:** What actually happened.
4. **Exact Error Messages:** Console logs or runtime exceptions.
5. **File Paths & Line Numbers:** Precise locations implicated.
6. **Minimal Code Excerpt:** Focused snippet showing the problematic area.
7. **Reproduction Steps:** Step-by-step instructions to recreate the issue.
8. **Troubleshooting Performed:** What was already tried and the outcome of each attempt.
9. **Suspected Root Cause:** Working hypothesis.
10. **Assistance Needed:** Specific design or code decision requested.

---

## 7. User Approval & Safety Boundaries
Always obtain explicit user confirmation before:
- Deleting substantial existing work or replacing key modules.
- Introducing external libraries, paid services, or complex toolchains.
- Making major changes to agreed gameplay, visual art direction, or architecture.
- Publishing code publicly or deploying to live production environments.
- Modifying security-sensitive configurations.
*Never ask for or store passwords, personal tokens, or secrets.*

---

## 8. Context Management & Session Continuity
- At the start of every session, consult `AGENTS.md`, `PROJECT_SPEC.md`, and `IMPLEMENTATION_STATUS.md`.
- Keep documentation up to date as tasks progress or decisions are formalized.
- Distinguish verified facts from assumptions and unresolved questions.
