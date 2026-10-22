// Automated unit and integration verification for Game Expansion Milestone
// 5000px World, 5 Gameplay Sections, 12 Gifts, 200 Coins, 15 Enemies, 3 Jump Modes, Controls Modal

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
import { Enemy } from './js/enemy.js';
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

console.log("=== GAME EXPANSION MILESTONE VERIFICATION ===");

// TEST 1: World Dimensions & Camera Boundaries
console.log("\nTest 1: World Dimensions & Camera Boundaries");
assert(CONFIG.WORLD_WIDTH === 5000, `World width expanded to 5000px (got ${CONFIG.WORLD_WIDTH})`);
assert(CONFIG.CANVAS_WIDTH === 384 && CONFIG.CANVAS_HEIGHT === 216, "Logical 16:9 pixel resolution preserved (384x216)");
const maxCamX = CONFIG.WORLD_WIDTH - CONFIG.CANVAS_WIDTH;
assert(maxCamX === 4616, `Camera max scroll position is 4616px (got ${maxCamX})`);

// TEST 2: 5 Gameplay Sections & Level Geometry
console.log("\nTest 2: 5 Gameplay Sections & Level Geometry");
assert(CONFIG.GROUND_SEGMENTS.length === 9, `9 ground segments created for 5 sections (got ${CONFIG.GROUND_SEGMENTS.length})`);
assert(CONFIG.PLATFORMS.length >= 18, `Elevated platforms count >= 18 (got ${CONFIG.PLATFORMS.length})`);

// Verify all 8 chasms have stepping-stone bridges
const gaps = [];
for (let i = 0; i < CONFIG.GROUND_SEGMENTS.length - 1; i++) {
  const segA = CONFIG.GROUND_SEGMENTS[i];
  const segB = CONFIG.GROUND_SEGMENTS[i + 1];
  const gapStart = segA.x + segA.w;
  const gapEnd = segB.x;
  gaps.push({ start: gapStart, end: gapEnd, width: gapEnd - gapStart });
}
assert(gaps.length === 8, `Exactly 8 ground gaps configured (got ${gaps.length})`);

for (let i = 0; i < gaps.length; i++) {
  const g = gaps[i];
  const hasBridge = CONFIG.PLATFORMS.some(p => p.x >= g.start - 20 && p.x + p.w <= g.end + 20);
  assert(hasBridge, `Gap #${i + 1} (${g.start}..${g.end}, width ${g.width}px) has a stepping-stone platform bridge`);
}

// TEST 3: Checkpoint Progression
console.log("\nTest 3: Checkpoint Progression");
assert(CONFIG.CHECKPOINTS.length === 6, `6 checkpoints strategically placed across sections (got ${CONFIG.CHECKPOINTS.length})`);
for (let i = 0; i < CONFIG.CHECKPOINTS.length; i++) {
  const cp = CONFIG.CHECKPOINTS[i];
  const onSolidGround = CONFIG.GROUND_SEGMENTS.some(s => cp.x >= s.x && cp.x <= s.x + s.w);
  assert(onSolidGround, `Checkpoint #${i + 1} (${cp.id} at x: ${cp.x}) sits on solid accessible ground`);
}

// TEST 4: Exactly 200 Coins & Distribution (40 Coins per Section)
console.log("\nTest 4: Exactly 200 Coins Economy & Distribution");
assert(CONFIG.COINS.TOTAL_IN_LEVEL === 200, `CONFIG.COINS.TOTAL_IN_LEVEL is 200 (got ${CONFIG.COINS.TOTAL_IN_LEVEL})`);
assert(CONFIG.COIN_LIST.length === 200, `Generated coin list contains exactly 200 coins (got ${CONFIG.COIN_LIST.length})`);
assert(CONFIG.COINS.REQUIRED_FOR_KEY === 40, `Required deposit for Golden Key preserved at exactly 40 coins (got ${CONFIG.COINS.REQUIRED_FOR_KEY})`);

// Verify 40 coins per section
const sectionBounds = [
  { name: "Section 1", minX: 0, maxX: 1045 },
  { name: "Section 2", minX: 1045, maxX: 2000 },
  { name: "Section 3", minX: 2000, maxX: 2980 },
  { name: "Section 4", minX: 2980, maxX: 4100 },
  { name: "Section 5", minX: 4100, maxX: 5000 }
];

for (const sec of sectionBounds) {
  const coinsInSec = CONFIG.COIN_LIST.filter(c => c.x >= sec.minX && c.x < sec.maxX);
  assert(coinsInSec.length === 40, `${sec.name} (${sec.minX}..${sec.maxX}px) contains exactly 40 coins (got ${coinsInSec.length})`);
}

// TEST 5: 12 Independently Configurable Gifts
console.log("\nTest 5: 12 Independently Configurable Gifts");
assert(CONFIG.GIFTS.length === 12, `Exactly 12 gifts configured (got ${CONFIG.GIFTS.length})`);
const giftIds = new Set();
for (const g of CONFIG.GIFTS) {
  assert(!giftIds.has(g.id), `Gift ID ${g.id} is unique`);
  giftIds.add(g.id);
  assert(g.title && g.title.length > 0, `Gift ${g.id} has a valid title: "${g.title}"`);
  assert(g.message && g.message.length > 0, `Gift ${g.id} has a valid message`);
  assert(g.x > 0 && g.x < CONFIG.WORLD_WIDTH, `Gift ${g.id} is inside world bounds (x: ${g.x})`);
}

// TEST 6: 15 Enemies with Platform & Ground Patrols
console.log("\nTest 6: 15 Patrolling Enemies");
assert(CONFIG.ENEMIES.length === 15, `Exactly 15 enemies configured (got ${CONFIG.ENEMIES.length})`);
for (const e of CONFIG.ENEMIES) {
  assert(e.minX < e.maxX, `Enemy ${e.id} (${e.name}) has valid patrol bounds (${e.minX} < ${e.maxX})`);
  assert(e.speed >= 15 && e.speed <= 40, `Enemy ${e.id} speed is balanced (${e.speed}px/s)`);
}

// TEST 7: Controls Icon & Modal System
console.log("\nTest 7: Controls Icon & Modal System");
const game = new Game();
game.init();

assert(game.btnControlsIcon !== null, "Controls icon button element exists");
assert(game.controlsModal !== null, "Controls modal panel element exists");

// Open controls modal via API
game.openControlsModal();
assert(game.state.activeModal === 'CONTROLS', "Opening controls modal sets activeModal to 'CONTROLS'");
assert(!game.controlsModal.classList.contains('hidden'), "Controls modal is visible");
assert(game.state.isPaused === false, "Base paused flag unchanged");

// While controls modal is open: player movement is blocked
game.input.keys.right = true;
game.update(0.016);
assert(game.player.vx === 0, "Player horizontal movement is blocked while controls modal is open");

// Close controls modal via API
game.closeControlsModal();
assert(game.state.activeModal === null, "Closing controls modal resets activeModal to null");
assert(game.controlsModal.classList.contains('hidden'), "Controls modal is hidden");

// Open controls modal via H key input toggle
game.input.keys.toggleControls = true;
game.update(0.016);
assert(game.state.activeModal === 'CONTROLS', "H key input toggles controls modal open");
game.closeControlsModal();

// TEST 8: 3 Jump Modes (Mode A, B, C)
console.log("\nTest 8: 3 Jump Modes");
const player = new Player(100, CONFIG.GROUND_Y - 58);
const input = new InputManager();

// Mode A: Normal Jump (Tap Space -> Cut Jump Early)
input.reset();
input.keys.jumpPressed = true;
input.keys.jump = true;
player.update(0.016, input);
assert(player.isJumping === true, "Jump initiated");
assert(player.vy < -200, `Impulse applied (-P.JUMP_IMPULSE = ${player.vy.toFixed(1)})`);

// Release Space early while ascending -> Mode A short hop cut
input.keys.jump = false;
player.update(0.016, input);
assert(player.vy >= -140, `Mode A: Releasing Space cuts upward velocity short (vy: ${player.vy.toFixed(1)})`);

// Land player
for (let i = 0; i < 50; i++) player.update(0.016, input);
assert(player.grounded === true, "Player grounded");

// Mode B: Hold Jump (Full normal apex)
input.reset();
input.keys.jumpPressed = true;
input.keys.jump = true;
player.update(0.016, input);
const normalApexVy = player.vy;

// Keep holding Space
for (let i = 0; i < 5; i++) {
  player.update(0.016, input);
}
// vy continues naturally under gravity without cut
assert(player.vy > normalApexVy, "Mode B: Holding Space lets character achieve full natural jump arc");

// Land player
for (let i = 0; i < 50; i++) player.update(0.016, input);
assert(player.grounded === true, "Player grounded");

// Mode C: Double Space Press (Extra-High Jump)
input.reset();
input.keys.jumpPressed = true;
input.keys.jump = true;
player.update(0.016, input); // First jump
assert(player.hasDoubleJumped === false, "First jump: hasDoubleJumped is false");

// Ascend slightly (within double jump window)
for (let i = 0; i < 4; i++) player.update(0.016, input);
assert(player.doubleJumpWindowTimer > 0, `Double jump window timer is active (${player.doubleJumpWindowTimer.toFixed(2)}s)`);

// Second intentional Space press in mid-air
input.consumeJumpPress();
input.keys.jumpPressed = true;
player.update(0.016, input);
assert(player.hasDoubleJumped === true, "Mode C: Double Space triggers high jump boost!");
assert(player.vy <= -CONFIG.PHYSICS.DOUBLE_JUMP_IMPULSE + 20, `Mode C applied high jump impulse (${player.vy.toFixed(1)})`);

// Third Space press in mid-air MUST NOT trigger infinite jump
const vyBeforeThird = player.vy;
input.consumeJumpPress();
input.keys.jumpPressed = true;
player.update(0.016, input);
assert(player.vy >= vyBeforeThird, "Third mid-air press strictly rejected by hasDoubleJumped guard");

// Land player
for (let i = 0; i < 50; i++) player.update(0.016, input);
assert(player.grounded === true, "Player landed safely");
assert(player.hasDoubleJumped === false, "hasDoubleJumped reset to false upon landing");

// TEST 9: Inventory Machine Placement & 40-Coin Transaction
console.log("\nTest 9: Inventory Machine at 75% World Mark & Transaction");
assert(CONFIG.MACHINE.x === 3750, `Inventory machine placed at 75% of 5000px world = 3750px (got ${CONFIG.MACHINE.x})`);
const gameMach = new Game();
gameMach.player.x = CONFIG.MACHINE.x - 25;
gameMach.state.coinsHeld = 40;
gameMach.input.keys.interactMachine = true;
gameMach.checkMachineInteraction();
assert(gameMach.state.activeModal === 'MACHINE', "Machine modal opens on D key");
assert(gameMach.machineSubState === 'CONFIRM', "40 coins triggers CONFIRM substate");
gameMach.confirmMachineDeposit();
assert(gameMach.state.coinsHeld === 0, "Coins held becomes 0 (40 - 40)");
assert(gameMach.state.coinsDeposited === 40, "Coins deposited becomes 40");
assert(gameMach.state.hasKey === true, "Golden Castle Key awarded");
gameMach.closeMachineModal();

// TEST 10: Castle Climax at World End
console.log("\nTest 10: Castle Climax at World End (4800px)");
assert(CONFIG.CASTLE.x === 4800, `Castle placed at 4800px near world end (got ${CONFIG.CASTLE.x})`);
const gameCastle = new Game();
gameCastle.state.hasKey = true;
gameCastle.player.x = CONFIG.CASTLE.gate.x;
gameCastle.openCastleModal();
assert(gameCastle.state.activeModal === 'CASTLE', "Castle modal opens with key");
gameCastle.confirmCastleUnlock();
assert(gameCastle.state.castleUnlocked === true, "Castle unlocks on confirmation");
assert(gameCastle.state.keyUsed === true, "Key marked as used");

// Walk into doorway trigger
gameCastle.player.x = CONFIG.CASTLE.entranceTrigger.x + 5;
gameCastle.player.y = 117;
gameCastle.checkCastleEntranceTrigger();
assert(gameCastle.state.isTransitioning === true, "Doorway walk-in triggers transition");
assert(gameCastle.state.activeModal === null, "No popup modal shown on empty URL");

console.log(`\n========================================`);
console.log(`Expansion Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
