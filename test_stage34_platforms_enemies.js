// Automated unit and physics verification for Stage 3.4
// Platforms, Gaps, Checkpoints, Patrolling Enemies, Stomp Detection & Side Damage

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
      scale: () => {}
    })
  })
};

import { CONFIG } from './js/config.js';
import { Player } from './js/player.js';
import { Enemy } from './js/enemy.js';
import { InputManager } from './js/input.js';

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

console.log("=== STAGE 3.4 PLATFORMS, GAPS & ENEMY VERIFICATION ===");

const input = new InputManager();
const levelData = {
  groundSegments: CONFIG.GROUND_SEGMENTS,
  platforms: CONFIG.PLATFORMS,
  checkpoints: CONFIG.CHECKPOINTS
};

// TEST 1: Landing on Elevated Platform from Above
console.log("\nTest 1: Landing on Elevated Platform from Above");
const plat = CONFIG.PLATFORMS[0]; // { x: 260, y: 135, w: 70, h: 10 }
// Position player 2px above platform, falling downward
const player = new Player(plat.x + 10, plat.y - 58 - 2); // 75px
player.vy = 150; // Falling downward
player.grounded = false;

// Step 1 frame: feet cross plat.y (135) and land
player.update(0.016, input, false, levelData);
assert(player.grounded === true, "Player landed safely on elevated platform");
assert(player.y === plat.y - player.height, `Player Y matches platform surface (got ${player.y} == ${plat.y - player.height})`);
assert(player.vy === 0, "Vertical velocity reset to 0 upon platform landing");
assert(player.currentPlatform === plat, "Player references active platform");

// TEST 2: Jumping Through Platform from Below (One-Way Platform)
console.log("\nTest 2: Jumping Through Platform from Below");
// Position player under platform but above ground: feet at 155 (above ground 175)
player.x = plat.x + 10;
player.y = 155 - player.height; // y = 97
player.vy = -200; // Ascending upward
player.grounded = false;

// Step 1 frame: player moves upward right through platform without collision
player.update(0.016, input, false, levelData);
assert(player.grounded === false, "Player does not land when ascending through platform from below");
assert(player.vy < 0, `Player continues upward ascension (vy = ${player.vy.toFixed(2)})`);

// TEST 3: Stepping Off Platform & Gravity
console.log("\nTest 3: Walking Off Elevated Platform");
// Place player stationary on platform
player.y = plat.y - player.height;
player.vy = 0;
player.grounded = true;
// Move player off right edge of platform
player.x = plat.x + plat.w + 10;
player.update(0.016, input, false, levelData);
assert(player.grounded === false, "Player becomes airborne after walking off platform edge");

// Next frame in air applies gravity
player.update(0.016, input, false, levelData);
assert(player.vy > 0, `Gravity pulls airborne player downward (vy = ${player.vy.toFixed(2)})`);

// TEST 4: Ground Gaps (Falling into a Gap)
console.log("\nTest 4: Falling into Ground Gap");
// Gap 1 is between ground_1 and ground_2
const gap1Mid = Math.floor((CONFIG.GROUND_SEGMENTS[0].x + CONFIG.GROUND_SEGMENTS[0].w + CONFIG.GROUND_SEGMENTS[1].x) / 2);
player.x = gap1Mid; // In middle of Gap 1
player.y = CONFIG.GROUND_Y - 20; // Just above ground level
player.vy = 80; // Falling into the gap
player.grounded = false;

// Step across GROUND_Y: because x is in the gap, player must NOT land at GROUND_Y!
player.update(0.016, input, false, levelData);
assert(player.y + player.height > CONFIG.GROUND_Y, "Player falls into gap instead of landing on invisible ground");
assert(player.grounded === false, "Player is not grounded inside gap");

// TEST 5: Forgiving Checkpoint Recovery After Falling
console.log("\nTest 5: Forgiving Checkpoint Recovery from Pit");
player.lastCheckpoint = { x: 60, y: 117 };
player.y = CONFIG.CANVAS_HEIGHT + 25; // Fallen below screen
player.update(0.016, input, false, levelData);

assert(player.x === 60, `Player respawned at safe checkpoint X (got ${player.x})`);
assert(player.y === 117, `Player respawned at safe checkpoint Y (got ${player.y})`);
assert(player.grounded === true, "Player is grounded at checkpoint");
assert(player.vx === 0 && player.vy === 0, "Player velocities reset at checkpoint");
assert(player.invulnerableTimer > 0, "Player granted temporary invulnerability grace period upon respawn");

// TEST 6: Checkpoint Advancement
console.log("\nTest 6: Checkpoint Advancement");
const cp2 = CONFIG.CHECKPOINTS[1];
player.x = cp2.x + 20; // Past checkpoint 2
player.y = CONFIG.GROUND_Y - player.height;
player.grounded = true;
player.update(0.016, input, false, levelData);
assert(player.lastCheckpoint.x === cp2.x, `Checkpoint advanced to CP 2 (got ${player.lastCheckpoint.x})`);

// TEST 7: Enemy Patrol Boundaries & Direction Reversal
console.log("\nTest 7: Enemy Patrol Boundaries & Reversal");
const enemyCfg = CONFIG.ENEMIES[0]; // x: 640, minX: 570, maxX: 850, speed: 28
const enemy = new Enemy(enemyCfg);
assert(enemy.dir === -1, "Enemy initially patrols left");

// Place enemy at left boundary
enemy.x = enemy.minX - 1;
enemy.update(0.016);
assert(enemy.dir === 1, "Enemy reverses to right (+1) at minX boundary");
assert(enemy.x === enemy.minX, `Enemy clamped to minX (got ${enemy.x})`);

// Place enemy at right boundary
enemy.x = enemy.maxX;
enemy.update(0.016);
assert(enemy.dir === -1, "Enemy reverses to left (-1) at maxX boundary");
assert(enemy.x === enemy.maxX - enemy.w, `Enemy clamped to maxX - width (got ${enemy.x})`);

// TEST 8: Jump-Stomp Defeat Detection & Bounce
console.log("\nTest 8: Jump-Stomp Defeat Detection");
const stompEnemy = new Enemy({ id: 'test_enemy', x: 200, y: 161, w: 18, h: 14, minX: 150, maxX: 250, speed: 30 });
// Position player directly above enemy, falling downward
player.x = stompEnemy.x;
player.y = stompEnemy.y - player.height + 4; // Feet at top edge of enemy
player.vy = 180; // Falling downward
player.invulnerableTimer = 0;

// Simulate collision check as in Game.checkEnemyCollisions()
const pFeet = player.y + player.height;
const eTop = stompEnemy.y;
const isStomp = player.vy > 0 && pFeet <= eTop + 10;
assert(isStomp === true, "Stomp condition recognized (descending onto enemy top)");

if (isStomp) {
  const stomped = stompEnemy.defeat();
  player.bounce();
  assert(stomped === true, "Enemy defeat() executed successfully");
  assert(stompEnemy.isDefeated === true, "Enemy state is marked defeated");
  assert(player.vy < 0, `Player bounced upward with impulse (vy = ${player.vy.toFixed(2)})`);
}

// Stomp defeat cannot occur twice on same enemy
const secondStomp = stompEnemy.defeat();
assert(secondStomp === false, "Defeated enemy cannot be defeated again");

// TEST 9: Side Collision (Not a Stomp) -> Damage & Knockback
console.log("\nTest 9: Side Collision (Damage Knockback & Invulnerability)");
const sideEnemy = new Enemy({ id: 'side_enemy', x: 300, y: 161, w: 18, h: 14, minX: 250, maxX: 350, speed: 30 });
player.x = sideEnemy.x - 12; // Player hitting left side of enemy
player.y = sideEnemy.y; // Body level with enemy
player.vy = 0; // Not descending
player.invulnerableTimer = 0;

const pFeetSide = player.y + player.height;
const isSideStomp = player.vy > 0 && pFeetSide <= sideEnemy.y + 10;
assert(isSideStomp === false, "Side collision is NOT classified as a stomp");

// Apply damage
const damaged = player.takeDamage(sideEnemy.x + sideEnemy.w / 2);
assert(damaged === true, "Player takes damage from side collision");
assert(player.invulnerableTimer > 0, "Player enters temporary invulnerability");
assert(player.vx < 0, `Player knocked back away from enemy (vx = ${player.vx})`);
assert(player.vy < 0, `Player soft-bounced upward (vy = ${player.vy})`);
assert(sideEnemy.isDefeated === false, "Enemy is NOT defeated by side collision");

// TEST 10: Invulnerability Guard (No Repeated Damage)
console.log("\nTest 10: Invulnerability Guard");
const secondDamage = player.takeDamage(sideEnemy.x + sideEnemy.w / 2);
assert(secondDamage === false, "Player ignores repeated damage while invulnerable");

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);
if (failed > 0) process.exit(1);
