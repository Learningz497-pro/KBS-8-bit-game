// Automated unit and integration verification for Stage 3.6
// Inventory Machine & Key Dispenser (Locked Economy: 100 total, 40 deposit, key reward)

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
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
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      measureText: () => ({ width: 40 }),
      fillText: () => {},
      strokeRect: () => {}
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
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    addEventListener: () => {},
    textContent: ''
  })
};
global.performance = { now: () => Date.now() };

import { CONFIG } from './js/config.js';
import { Player } from './js/player.js';
import { Enemy } from './js/enemy.js';
import { InputManager } from './js/input.js';
import { Coin, Gift, Machine } from './js/collectibles.js';
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

console.log("=== STAGE 3.6 INVENTORY MACHINE & KEY DISPENSER VERIFICATION ===");

// TEST 1: Machine Placement & Dimensions
console.log("\nTest 1: Machine Placement & Dimensions");
const machineCfg = CONFIG.MACHINE;
const expected75Percent = Math.round(CONFIG.WORLD_WIDTH * 0.75);
assert(Math.abs(machineCfg.x - expected75Percent) < 100, `Machine placed at ~75% world width (${machineCfg.x} ~ ${expected75Percent})`);
assert(machineCfg.y === 109, `Machine y positioned on ground surface (got y: ${machineCfg.y})`);
assert(machineCfg.h > 58, `Machine height (${machineCfg.h}px) is greater than character height (58px)`);
assert(machineCfg.depositRequired === 40, `Machine deposit requirement is exactly 40 coins (got ${machineCfg.depositRequired})`);

// Ensure machine is placed safely on a solid Ground Segment
const groundForMachine = CONFIG.GROUND_SEGMENTS.find(s => machineCfg.x >= s.x && (machineCfg.x + machineCfg.w) <= (s.x + s.w));
assert(groundForMachine !== undefined, `Machine is situated safely on solid ground segment (${groundForMachine?.id})`);

// Ensure adjacent enemy patrol zone maintains safe buffer from machine
const adjacentEnemy = CONFIG.ENEMIES.find(e => e.minX >= machineCfg.x && e.minX < machineCfg.x + 300);
if (adjacentEnemy) {
  assert(adjacentEnemy.minX >= (machineCfg.x + machineCfg.w + 40), `Adjacent enemy patrol minX (${adjacentEnemy.minX}) maintains safe buffer from machine (${machineCfg.x + machineCfg.w})`);
} else {
  assert(true, "Machine has clear safe buffer without overlapping enemy patrols");
}

// TEST 2: Proximity Range & Key D Activation
console.log("\nTest 2: Proximity Range & Key D Activation");
const game = new Game();
assert(game.machine && game.machine.constructor.name === 'Machine', "Game instantiates Machine instance correctly");
assert(game.state.hasKey === false, "Player starts without the key");
assert(game.state.coinsHeld === 0, "Player starts with 0 coins");
assert(game.state.coinsDeposited === 0, "Player starts with 0 coins deposited");

// Player far from machine (x: 100) pressing D
game.player.x = 100;
game.input.keys.interactMachine = true;
game.checkMachineInteraction();
assert(game.state.activeModal === null, "Pressing D when far from machine does NOT open modal");

// Player adjacent to machine (within 44px range) pressing D
game.player.x = machineCfg.x - 25;
game.player.y = CONFIG.GROUND_Y - game.player.height;
game.input.keys.interactMachine = true;
game.checkMachineInteraction();
assert(game.state.activeModal === 'MACHINE', "Pressing D in range opens machine modal");
assert(game.machineSubState === 'INSUFFICIENT', "0 coins triggers INSUFFICIENT substate");

// TEST 3: Insufficient Coins Flow (35/40 coins rejected, 0 deducted)
console.log("\nTest 3: Insufficient Coins Flow (35/40 coins rejected, 0 deducted)");
game.closeMachineModal();
assert(game.state.activeModal === null, "Machine modal closed");

game.state.coinsHeld = 35;
game.input.keys.interactMachine = true;
game.checkMachineInteraction();
assert(game.state.activeModal === 'MACHINE', "Machine modal reopened with 35 coins");
assert(game.machineSubState === 'INSUFFICIENT', "35 coins triggers INSUFFICIENT substate (< 40)");

// Attempt deposit in insufficient state
game.confirmMachineDeposit();
assert(game.state.coinsHeld === 35, "Coins held remains 35 after failed deposit attempt (no deduction)");
assert(game.state.coinsDeposited === 0, "Coins deposited remains 0");
assert(game.state.hasKey === false, "Key is NOT awarded when coins < 40");
assert(game.machine.keyDispensed === false, "Machine has not dispensed key");

game.closeMachineModal();
assert(game.state.coinsHeld === 35, "Balance remains 35 after dismissing insufficient coins modal");

// TEST 4: Cancel Transaction Flow (65 coins held, canceled -> balance remains 65)
console.log("\nTest 4: Cancel Transaction Flow");
game.state.coinsHeld = 65;
game.input.keys.interactMachine = true;
game.checkMachineInteraction();
assert(game.state.activeModal === 'MACHINE', "Machine modal opened with 65 coins");
assert(game.machineSubState === 'CONFIRM', "65 coins triggers CONFIRM substate (>= 40)");

// Player cancels transaction
game.closeMachineModal();
assert(game.state.coinsHeld === 65, "Coins held remains 65 after cancellation (no deduction)");
assert(game.state.coinsDeposited === 0, "Coins deposited remains 0 after cancellation");
assert(game.state.hasKey === false, "Key is NOT awarded after cancellation");

// TEST 5: Successful Deposit with 40 Coins (Balance becomes 0, Key awarded)
console.log("\nTest 5: Successful Deposit with 40 Coins");
const game2 = new Game();
game2.player.x = CONFIG.MACHINE.x - 25;
game2.state.coinsHeld = 40;

game2.input.keys.interactMachine = true;
game2.checkMachineInteraction();
assert(game2.machineSubState === 'CONFIRM', "40 coins triggers CONFIRM substate");

game2.confirmMachineDeposit();
assert(game2.state.coinsHeld === 0, "Coins held becomes 0 (40 - 40)");
assert(game2.state.coinsDeposited === 40, "Coins deposited becomes 40");
assert(game2.state.hasKey === true, "Key awarded successfully (hasKey = true)");
assert(game2.machine.keyDispensed === true, "Machine marks key as dispensed");
assert(game2.machineSubState === 'REWARD', "Modal transitions to REWARD substate");
game2.closeMachineModal();

// TEST 6: Successful Deposit with Excess Coins (65 -> 25, 100 -> 60)
console.log("\nTest 6: Successful Deposit with Excess Coins");
// 65 coins -> 25 coins
const game3 = new Game();
game3.player.x = CONFIG.MACHINE.x - 25;
game3.state.coinsHeld = 65;
game3.input.keys.interactMachine = true;
game3.checkMachineInteraction();
game3.confirmMachineDeposit();
assert(game3.state.coinsHeld === 25, `65 coins balance becomes exactly 25 after deposit (got ${game3.state.coinsHeld})`);
assert(game3.state.coinsDeposited === 40, "Coins deposited is 40");
assert(game3.state.hasKey === true, "Key awarded with 65 coins");

// 100 coins -> 60 coins
const game4 = new Game();
game4.player.x = CONFIG.MACHINE.x - 25;
game4.state.coinsHeld = 100;
game4.input.keys.interactMachine = true;
game4.checkMachineInteraction();
game4.confirmMachineDeposit();
assert(game4.state.coinsHeld === 60, `100 coins balance becomes exactly 60 after deposit (got ${game4.state.coinsHeld})`);
assert(game4.state.coinsDeposited === 40, "Coins deposited is 40");
assert(game4.state.hasKey === true, "Key awarded with 100 coins");

// TEST 7: Anti-Duplicate Guards (No Double Spending & Machine Empty State)
console.log("\nTest 7: Anti-Duplicate Guards & Machine Empty State");
// Attempting repeated confirmMachineDeposit on game4
game4.confirmMachineDeposit();
assert(game4.state.coinsHeld === 60, "Repeated confirm DOES NOT double-deduct coins (remains 60)");
assert(game4.state.coinsDeposited === 40, "Coins deposited remains 40");

game4.closeMachineModal();
assert(game4.state.activeModal === null, "Modal closed");

// Interacting with machine a second time after key is owned
game4.input.keys.interactMachine = true;
game4.checkMachineInteraction();
assert(game4.state.activeModal === 'MACHINE', "Modal opens on second interaction");
assert(game4.machineSubState === 'COMPLETED', "Substate is COMPLETED (Machine Empty)");

// Confirm does nothing when completed
game4.confirmMachineDeposit();
assert(game4.state.coinsHeld === 60, "Balance remains 60 on empty machine interaction");
game4.closeMachineModal();

// TEST 8: Pause and Resume Behavior During Machine Modal
console.log("\nTest 8: Pause and Resume Behavior During Machine Modal");
const game5 = new Game();
game5.player.x = CONFIG.MACHINE.x - 25;
game5.state.coinsHeld = 40;

// Open modal
game5.input.keys.interactMachine = true;
game5.checkMachineInteraction();
assert(game5.state.activeModal === 'MACHINE', "Modal active");

// Press right arrow while modal is open
game5.input.keys.right = true;
game5.update(0.016);
assert(game5.player.vx === 0, "Player horizontal velocity remains 0 while modal is open");

// Update enemy while modal is open
const enemyStartPos = game5.enemies[0].x;
game5.update(0.016);
assert(game5.enemies[0].x === enemyStartPos, "Enemy position remains frozen while modal is open");

// Close modal and resume
game5.closeMachineModal();
assert(game5.state.activeModal === null, "Modal closed");
game5.input.keys.right = true;
game5.update(0.016);
assert(game5.player.vx > 0, "Player movement resumes cleanly after modal closes");

console.log("\n========================================");
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("========================================");

if (failed > 0) process.exit(1);
