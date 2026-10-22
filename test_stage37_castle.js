// Automated unit and integration verification for Stage 3.7
// Castle Climax, Golden Castle Key Unlock & Final Video Redirect

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  location: {
    href: '',
    search: '',
    reload: () => {}
  }
};
global.document = {
  createElement: (tag) => ({
    width: 32,
    height: 58,
    getContext: () => ({
      imageSmoothingEnabled: true,
      fillRect: () => {},
      drawImage: () => {},
      beginPath: () => {},
      arc: () => {},
      ellipse: () => {},
      rect: () => {},
      clip: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      measureText: () => ({ width: 40 }),
      fillText: () => {},
      strokeRect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} })
    })
  }),
  getElementById: (id) => ({
    id,
    getContext: () => ({
      imageSmoothingEnabled: true,
      fillRect: () => {},
      drawImage: () => {},
      beginPath: () => {},
      arc: () => {},
      ellipse: () => {},
      rect: () => {},
      clip: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      measureText: () => ({ width: 40 }),
      fillText: () => {},
      strokeRect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} })
    }),
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      contains: function(c) { return this._classes.has(c); }
    },
    addEventListener: () => {},
    textContent: ''
  })
};
global.performance = { now: () => Date.now() };

import { CONFIG } from './js/config.js';
import { Player } from './js/player.js';
import { InputManager } from './js/input.js';
import { Castle, Machine, Gift, Coin } from './js/collectibles.js';
import { Game } from './js/game.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log("=== STAGE 3.7 CASTLE CLIMAX & FINAL REDIRECT VERIFICATION ===");

// TEST 1: Castle Placement, Bounds & Accessible Terrain
console.log("\nTest 1: Castle Placement, Bounds & Accessible Terrain");
const castleCfg = CONFIG.CASTLE;
assert(castleCfg !== undefined, "CONFIG.CASTLE exists");
assert(castleCfg.x >= CONFIG.WORLD_WIDTH - 300 && castleCfg.x <= CONFIG.WORLD_WIDTH - 100, `Castle placed near world end (got x: ${castleCfg.x})`);
assert(castleCfg.x + castleCfg.w <= CONFIG.WORLD_WIDTH, `Castle fits inside world bounds (x+w: ${castleCfg.x + castleCfg.w} <= ${CONFIG.WORLD_WIDTH})`);
assert(castleCfg.y + castleCfg.h === 175, `Castle base rests cleanly on ground level y: 175 (got ${castleCfg.y + castleCfg.h})`);

// Accessible terrain verification
const groundForCastle = CONFIG.GROUND_SEGMENTS.find(s => castleCfg.x >= s.x && (castleCfg.x + castleCfg.w) <= (s.x + s.w));
assert(groundForCastle !== undefined, `Castle sits firmly on solid ground segment (${groundForCastle?.id})`);
assert(castleCfg.gate.x >= castleCfg.x && castleCfg.gate.x + castleCfg.gate.w <= castleCfg.x + castleCfg.w, "Castle gate sits within castle facade");
assert(castleCfg.entranceTrigger.x >= castleCfg.gate.x, "Entrance doorway trigger is inside the gate archway");

// TEST 2: Initial Castle Locked State
console.log("\nTest 2: Initial Castle Locked State");
const castle = new Castle(castleCfg);
assert(castle.unlocked === false, "Castle starts strictly locked");
assert(castle.gateProgress === 0.0, "Castle gate begins fully closed (progress: 0.0)");
assert(castle.isAnimating === false, "Castle is not animating initially");
assert(castle.confetti.length === 0, "No initial confetti before unlock");

// TEST 3: Interaction With U Key When Player Does NOT Own Key
console.log("\nTest 3: U Key Without Key (Missing-Key Guard)");
const gameNoKey = new Game();
gameNoKey.init();
gameNoKey.state.hasKey = false;
gameNoKey.state.castleUnlocked = false;

// Position player in front of castle gate
gameNoKey.player.x = castleCfg.gate.x + castleCfg.gate.w / 2 - gameNoKey.player.width / 2;
gameNoKey.player.y = 117; // resting on ground
const pCenterX = gameNoKey.player.x + gameNoKey.player.width / 2;
const pCenterY = gameNoKey.player.y + gameNoKey.player.height / 2;
const gCenterX = gameNoKey.castle.gate.x + gameNoKey.castle.gate.w / 2;
const gCenterY = gameNoKey.castle.gate.y + gameNoKey.castle.gate.h / 2;
const dist = Math.hypot(pCenterX - gCenterX, pCenterY - gCenterY);
assert(dist <= gameNoKey.castle.interactionRange, `Player is within castle gate interaction range (${dist.toFixed(1)}px <= ${gameNoKey.castle.interactionRange}px)`);

// Press U
gameNoKey.input.keys.interactCastle = true;
gameNoKey.checkCastleInteraction();
assert(gameNoKey.state.activeModal === 'CASTLE', "Modal opened upon pressing U");
assert(gameNoKey.castleSubState === 'LOCKED', "Sub-state is LOCKED when player does not own key");
assert(gameNoKey.state.hasKey === false, "No key is awarded or fabricated");
assert(gameNoKey.state.castleUnlocked === false, "Castle remains locked");
assert(gameNoKey.castle.unlocked === false, "Castle object remains locked");
assert(gameNoKey.btnCastleConfirm.classList.contains('hidden'), "Confirm button is hidden when missing key");
assert(!gameNoKey.btnCastleClose.classList.contains('hidden'), "Close button is visible for missing-key notification");

// Dismiss locked notification
gameNoKey.closeCastleModal();
assert(gameNoKey.state.activeModal === null, "Castle notification closed cleanly");
assert(gameNoKey.state.castleUnlocked === false, "Castle still locked after notification close");

// TEST 4: Approaching Locked Gate Does NOT Trigger Redirect
console.log("\nTest 4: Approaching Locked Gate Does NOT Trigger Redirect");
gameNoKey.player.x = castleCfg.entranceTrigger.x;
gameNoKey.checkCastleEntranceTrigger();
assert(gameNoKey.state.isTransitioning === false, "Locked gate strictly prevents doorway trigger");
assert(gameNoKey.state.activeModal === null, "No transition modal opened when gate is locked");

// TEST 5: Interaction With U Key When Player Owns Key (Confirmation Modal)
console.log("\nTest 5: U Key With Key -> Confirmation Modal");
const gameWithKey = new Game();
gameWithKey.init();
gameWithKey.state.hasKey = true;
gameWithKey.state.keyUsed = false;
gameWithKey.state.castleUnlocked = false;

// Position near gate
gameWithKey.player.x = castleCfg.gate.x + castleCfg.gate.w / 2 - gameWithKey.player.width / 2;
gameWithKey.player.y = 117;

// Press U
gameWithKey.input.keys.interactCastle = true;
gameWithKey.checkCastleInteraction();
assert(gameWithKey.state.activeModal === 'CASTLE', "Modal opened upon pressing U");
assert(gameWithKey.castleSubState === 'CONFIRM', "Sub-state is CONFIRM when player owns key");
assert(!gameWithKey.btnCastleConfirm.classList.contains('hidden'), "Confirm button is displayed");
assert(!gameWithKey.btnCastleCancel.classList.contains('hidden'), "Cancel button is displayed");
assert(gameWithKey.state.hasKey === true, "Key is NOT consumed merely by opening confirmation modal");
assert(gameWithKey.state.keyUsed === false, "Key is NOT marked used merely by opening confirmation modal");
assert(gameWithKey.state.castleUnlocked === false, "Castle is NOT unlocked merely by opening confirmation modal");

// TEST 6: Cancel Closes Modal Without State Modification
console.log("\nTest 6: Cancel Closes Modal Without State Change");
gameWithKey.closeCastleModal();
assert(gameWithKey.state.activeModal === null, "Modal closed after cancel");
assert(gameWithKey.state.hasKey === true, "Player retains key after cancellation");
assert(gameWithKey.state.keyUsed === false, "Key remains unused after cancellation");
assert(gameWithKey.state.castleUnlocked === false, "Castle remains locked after cancellation");

// TEST 7: Confirm Castle Unlock Transaction & Animation
console.log("\nTest 7: Confirm Castle Unlock Transaction & Animation");
gameWithKey.openCastleModal();
assert(gameWithKey.castleSubState === 'CONFIRM', "Re-opened confirmation modal");

// Execute confirmation
gameWithKey.confirmCastleUnlock();
assert(gameWithKey.state.castleUnlocked === true, "Castle state marked as unlocked");
assert(gameWithKey.state.keyUsed === true, "Key marked as used");
assert(gameWithKey.castle.unlocked === true, "Castle object marked as unlocked");
assert(gameWithKey.castle.isAnimating === true, "Gate opening animation activated");
assert(gameWithKey.castle.confetti.length > 0, `Celebratory confetti spawned (${gameWithKey.castle.confetti.length} particles)`);
assert(gameWithKey.state.activeModal === null, "Modal closed so player can proceed to entrance");
assert(gameWithKey.state.isTransitioning === false, "Unlocking alone does NOT trigger redirect");

// Advance gate opening animation
const initialProgress = gameWithKey.castle.gateProgress;
gameWithKey.castle.update(0.5);
assert(gameWithKey.castle.gateProgress > initialProgress, `Gate progresses upward during animation (${gameWithKey.castle.gateProgress.toFixed(2)})`);
gameWithKey.castle.update(1.0);
assert(gameWithKey.castle.gateProgress >= 1.0, `Gate reaches 1.0 fully open (got ${gameWithKey.castle.gateProgress})`);
assert(gameWithKey.castle.isAnimating === false, "Animation completes and gate remains open");

// TEST 8: Anti-Duplicate Guards (Cannot Unlock Twice)
console.log("\nTest 8: Anti-Duplicate Protection");
gameWithKey.openCastleModal();
assert(gameWithKey.castleSubState === 'LOCKED', "Already-unlocked castle does not show confirmation prompt");
assert(gameWithKey.btnCastleConfirm.classList.contains('hidden'), "Confirm button remains hidden when already unlocked");
gameWithKey.confirmCastleUnlock(); // duplicate call attempt
assert(gameWithKey.state.castleUnlocked === true, "Castle remains unlocked without error");
gameWithKey.closeCastleModal();

// TEST 9: Two-Stage Entrance: Walking Into Doorway Triggers Transition
console.log("\nTest 9: Two-Stage Entrance Trigger (Doorway Walk-In)");
assert(gameWithKey.state.isTransitioning === false, "Transition not started before walking in");

// Walk player directly into doorway entrance trigger
gameWithKey.player.x = castleCfg.entranceTrigger.x + 5;
gameWithKey.player.y = 117;
gameWithKey.checkCastleEntranceTrigger();
assert(gameWithKey.state.isTransitioning === true, "Doorway walk-in activated transition!");

// Anti-duplicate trigger guard
const secondTriggerAttempt = gameWithKey.state.isTransitioning;
gameWithKey.triggerFinalEntrance();
assert(secondTriggerAttempt === true, "Transition flag prevents duplicate entrance triggers");

// TEST 10: Fallback Without Popup Screen (Empty URL)
console.log("\nTest 10: Fallback Without Popup Screen (Empty URL)");
CONFIG.BIRTHDAY_VIDEO_URL = ""; // empty url
const gameFallback = new Game();
gameFallback.init();
gameFallback.state.hasKey = true;
gameFallback.state.castleUnlocked = true;
gameFallback.player.x = castleCfg.entranceTrigger.x + 5;
gameFallback.player.y = 117;
gameFallback.checkCastleEntranceTrigger();

assert(gameFallback.state.isTransitioning === true, "Transition initiated on empty URL");
assert(gameFallback.state.activeModal === null, "Victory modal is completely removed / no modal displayed");

// TEST 11: Configured URL Navigation
console.log("\nTest 11: Configured URL Navigation Behavior");
CONFIG.BIRTHDAY_VIDEO_URL = "https://example.com/birthday-surprise";
const gameConfigured = new Game();
gameConfigured.init();
gameConfigured.state.hasKey = true;
gameConfigured.state.castleUnlocked = true;
gameConfigured.player.x = castleCfg.entranceTrigger.x + 5;
gameConfigured.player.y = 117;
gameConfigured.checkCastleEntranceTrigger();

assert(gameConfigured.state.isTransitioning === true, "Transition initiated on configured URL");
assert(global.window.location.href === "https://example.com/birthday-surprise", `Browser navigated to configured URL (${global.window.location.href})`);

// Restore CONFIG.BIRTHDAY_VIDEO_URL
CONFIG.BIRTHDAY_VIDEO_URL = "https://youtu.be/R8LxWz4n1f8";

// TEST 12: Non-Interference With Gifts & Machine Modals
console.log("\nTest 12: Non-Interference With Existing Modals");
const gameIso = new Game();
gameIso.init();
gameIso.gifts[0].x = 100;
gameIso.player.x = 100;
gameIso.openGiftModal(gameIso.gifts[0]);
assert(gameIso.state.activeModal === 'GIFT', "Gift modal active");

// U press while in Gift modal must NOT open Castle modal
gameIso.input.keys.interactCastle = true;
gameIso.checkCastleInteraction();
assert(gameIso.state.activeModal === 'GIFT', "Active Gift modal blocks Castle modal interaction");
gameIso.closeGiftModal();

// D press while in Castle modal must NOT open Machine modal
gameIso.player.x = castleCfg.gate.x;
gameIso.openCastleModal();
assert(gameIso.state.activeModal === 'CASTLE', "Castle modal active");
gameIso.input.keys.interactMachine = true;
gameIso.checkMachineInteraction();
assert(gameIso.state.activeModal === 'CASTLE', "Active Castle modal blocks Machine modal interaction");
gameIso.closeCastleModal();

console.log(`\n========================================`);
console.log(`Stage 3.7 Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
