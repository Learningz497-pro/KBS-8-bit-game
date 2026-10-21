// Automated unit and integration verification for Stage 3.5
// Collectible Coins (100 total), Multiple Gifts, and Central 3x3 Modal Dialog

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
import { Coin, Gift } from './js/collectibles.js';
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

console.log("=== STAGE 3.5 COINS & GIFT DIALOG VERIFICATION ===");

// TEST 1: Configured Level Coins
console.log("\nTest 1: Configured Level Coins");
assert(CONFIG.COIN_LIST.length === CONFIG.COINS.TOTAL_IN_LEVEL, `Total coins placed matches CONFIG.COINS.TOTAL_IN_LEVEL (${CONFIG.COIN_LIST.length} == ${CONFIG.COINS.TOTAL_IN_LEVEL})`);
assert(CONFIG.COINS.TOTAL_IN_LEVEL === 200, `CONFIG.COINS.TOTAL_IN_LEVEL is 200 (got ${CONFIG.COINS.TOTAL_IN_LEVEL})`);

// Verify all coins have valid world coordinates and unique IDs
const idSet = new Set();
let allCoordsValid = true;
for (const c of CONFIG.COIN_LIST) {
  idSet.add(c.id);
  if (c.x < 0 || c.x > CONFIG.WORLD_WIDTH || c.y < 0 || c.y > CONFIG.GROUND_Y) {
    allCoordsValid = false;
  }
}
assert(idSet.size === CONFIG.COINS.TOTAL_IN_LEVEL, `All ${CONFIG.COINS.TOTAL_IN_LEVEL} coin IDs are unique`);
assert(allCoordsValid, `All ${CONFIG.COINS.TOTAL_IN_LEVEL} coin coordinates are valid and within world bounds`);

// TEST 2: Coin Collection & Single Increment
console.log("\nTest 2: Coin Collection & Anti-Duplicate Increment");
const game = new Game();
assert(game.state.coinsHeld === 0, "Initial coinsHeld count is 0");

// Place player overlapping only coin 1 (coin 1 at x: 100, coin 2 at x: 120)
// Player at x: 86 spans 90..114, overlapping coin 1 (100..110) but not coin 2 (120..130)
const coin1 = game.coins[0];
game.player.x = 86;
game.player.y = coin1.y;
game.checkCoinCollections();

assert(coin1.collected === true, "Coin 1 marked as collected on overlap");
assert(game.state.coinsHeld === 1, `coinsHeld incremented to 1 (got ${game.state.coinsHeld})`);

// Simulate next frame: player still on top of coin 1
game.checkCoinCollections();
assert(game.state.coinsHeld === 1, "Repeated overlap frame DOES NOT duplicate coin increment");

// Move player to overlap coin 2 (x: 106 spans 110..134, overlapping coin 2 at 120..130)
const coin2 = game.coins[1];
game.player.x = 106;
game.player.y = coin2.y;
game.checkCoinCollections();
assert(coin2.collected === true, "Coin 2 marked as collected on overlap");
assert(game.state.coinsHeld === 2, `Second coin collected successfully (coinsHeld = ${game.state.coinsHeld})`);

// TEST 3: Multiple Gifts Configured Independently
console.log("\nTest 3: Multiple Gifts Configuration");
assert(CONFIG.GIFTS.length >= 3, `Multiple gifts configured (got ${CONFIG.GIFTS.length})`);
const giftIds = new Set(CONFIG.GIFTS.map(g => g.id));
assert(giftIds.size === CONFIG.GIFTS.length, "All gift IDs are unique");
for (const g of CONFIG.GIFTS) {
  assert(g.title && g.message, `Gift ${g.id} has valid title and message`);
  assert(g.x > 0 && g.x < CONFIG.WORLD_WIDTH, `Gift ${g.id} is within level bounds`);
}

// TEST 4: Gift Proximity & Interaction Range
console.log("\nTest 4: Gift Proximity Interaction");
const gift1 = game.gifts[0]; // at x: 350, y: 157
// Place player far away from gift (x: 100)
game.player.x = 100;
game.player.y = 117;
game.input.keys.interactGift = true;
game.checkGiftInteractions();
assert(gift1.opened === false, "Gift DOES NOT open when player is far away");
assert(game.state.activeModal === null, "Modal is NOT opened when far away");

// Move player close to gift (within 30px)
game.player.x = gift1.x + 10;
game.player.y = gift1.y - 20; // Player standing near gift
game.input.keys.interactGift = true;
game.checkGiftInteractions();

assert(gift1.opened === true, "Gift opens when player is within interaction range and presses E");
assert(game.state.activeModal === 'GIFT', "Active modal state set to 'GIFT'");

// TEST 5: Opened Gifts Cannot Be Re-opened
console.log("\nTest 5: Opened Gifts Cannot Be Re-opened");
game.closeGiftModal();
assert(game.state.activeModal === null, "Modal closed successfully");

// Try to open the same gift again
game.input.keys.interactGift = true;
game.checkGiftInteractions();
assert(game.state.activeModal === null, "Already opened gift cannot be reopened");

// TEST 6: Gameplay Pause & Resume During Modal
console.log("\nTest 6: Gameplay Pause and Resume During Modal");
const gift2 = game.gifts[1];
game.player.x = gift2.x;
game.player.y = gift2.y - 30;
game.openGiftModal(gift2);
assert(game.state.activeModal === 'GIFT', "Gift 2 modal opened");

// While modal is open, attempt to move player
const initialPlayerX = game.player.x;
game.input.keys.right = true;
game.update(0.016); // step 1 frame while modal active
assert(game.player.x === initialPlayerX, "Player movement is FROZEN while modal is active");
assert(game.player.vx === 0, "Player vx remains 0 while modal is active");

// While modal is open, verify enemies do not move
const enemy = game.enemies[0];
const initialEnemyX = enemy.x;
game.update(0.016);
assert(enemy.x === initialEnemyX, "Enemy movement is FROZEN while modal is active");

// Dismiss modal
game.closeGiftModal();
assert(game.state.activeModal === null, "Modal closed");

// After closing modal, movement and enemies resume
game.input.keys.right = true;
game.update(0.016);
assert(game.player.vx > 0, "Player movement resumes smoothly after modal is closed");

// Step enemy
enemy.update(0.016);
assert(enemy.x !== initialEnemyX, "Enemy movement resumes smoothly after modal is closed");

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);
if (failed > 0) process.exit(1);
