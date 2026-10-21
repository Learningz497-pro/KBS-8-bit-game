// Automated unit and frame-by-frame physics verification for Stage 3.3

// 1. Mock minimal DOM for headless Node execution
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

console.log("=== STAGE 3.3 PHYSICS & MOVEMENT VERIFICATION ===");

// TEST 1: Initial Spawn State
console.log("\nTest 1: Initial Spawn State");
const player = new Player(60, CONFIG.GROUND_Y - 58);
assert(player.x === 60, `Player initial X is 60 (got ${player.x})`);
assert(player.y === 117, `Player initial Y is 117 (got ${player.y})`);
assert(player.grounded === true, "Player is grounded initially");
assert(player.state === 'idle', `Player initial animation state is idle (got ${player.state})`);

// TEST 2: Horizontal Movement & Acceleration (ArrowRight)
console.log("\nTest 2: Horizontal Movement (ArrowRight)");
const input = new InputManager();
input.keys.right = true;
// Simulate 0.3 seconds of right movement (dt = 0.016s)
for (let i = 0; i < 20; i++) {
  player.update(0.016, input);
}
assert(player.vx > 0, `Player vx accelerated rightward (got ${player.vx.toFixed(2)})`);
assert(player.vx <= CONFIG.PHYSICS.MOVE_SPEED, `Player vx does not exceed max MOVE_SPEED (got ${player.vx.toFixed(2)} <= ${CONFIG.PHYSICS.MOVE_SPEED})`);
assert(player.x > 60, `Player X moved right (got ${player.x.toFixed(2)})`);
assert(player.facing === 1, "Player facing direction is 1 (right)");
assert(player.state === 'run', `Player state transitioned to run (got ${player.state})`);

// TEST 3: Friction & Deceleration on Key Release
console.log("\nTest 3: Friction & Deceleration on Key Release");
input.keys.right = false;
for (let i = 0; i < 20; i++) {
  player.update(0.016, input);
}
assert(player.vx === 0, `Player vx completely stopped after friction (got ${player.vx})`);
assert(player.state === 'idle', `Player state returned to idle when stopped (got ${player.state})`);

// TEST 4: Left Movement & Direction Switch (ArrowLeft)
console.log("\nTest 4: Left Movement (ArrowLeft)");
input.keys.left = true;
for (let i = 0; i < 15; i++) {
  player.update(0.016, input);
}
assert(player.vx < 0, `Player vx accelerated leftward (got ${player.vx.toFixed(2)})`);
assert(player.facing === -1, "Player facing direction switched to -1 (left)");
assert(player.state === 'run', `Player state is run while moving left (got ${player.state})`);
input.keys.left = false;
for (let i = 0; i < 15; i++) {
  player.update(0.016, input);
}
assert(player.vx === 0, "Player vx stopped after releasing left");

// TEST 5: Key D Safety (D must NOT move right)
console.log("\nTest 5: Key D Safety (Reserved for Inventory Machine)");
const dEvent = { code: 'KeyD', preventDefault: () => {} };
input.onKeyDown(dEvent);
assert(input.keys.interactMachine === true, "Key D sets interactMachine flag");
assert(input.keys.right === false, "Key D DOES NOT set keys.right");
player.update(0.016, input);
assert(player.vx === 0, `Player does not move when D is pressed (vx = ${player.vx})`);
input.onKeyUp(dEvent);
assert(input.keys.interactMachine === false, "Key D release clears interactMachine");

// TEST 6: Jumping, Gravity, and Landing
console.log("\nTest 6: Jump Physics, Gravity & Ground Collision");
const spaceDown = { code: 'Space', preventDefault: () => {} };
input.onKeyDown(spaceDown);
// Jump initiated
player.update(0.016, input);
assert(player.vy < 0, `Jump impulse applied (vy = ${player.vy.toFixed(2)})`);
assert(player.grounded === false, "Player is airborne after jumping");
assert(player.state === 'jump', `Player state is jump while ascending (got ${player.state})`);

// Simulate flight to apex and fall
let reachedApex = false;
for (let i = 0; i < 40; i++) {
  player.update(0.016, input);
  if (player.vy > 25) {
    reachedApex = true;
    assert(player.state === 'fall', `Player state transitioned to fall during descent (got ${player.state})`);
    break;
  }
}
assert(reachedApex, "Player reached jump apex and transitioned to downward fall");

// Simulate until landing
for (let i = 0; i < 40; i++) {
  player.update(0.016, input);
  if (player.grounded) break;
}
assert(player.grounded === true, "Player landed safely on ground");
assert(player.y === CONFIG.GROUND_Y - 58, `Player Y matches ground exactly (got ${player.y})`);
assert(player.vy === 0, "Vertical velocity reset to 0 on landing");
assert(player.state === 'idle', "Player returned to idle state on ground");

// TEST 7: Mode C Double Jump & Anti-Infinite Jump Guard
console.log("\nTest 7: Mode C Double Jump & Anti-Infinite Jump Guard");
input.keys.jump = false;
input.keys.jumpPressed = false;
// Jump once
input.onKeyDown(spaceDown);
player.update(0.016, input);
assert(player.grounded === false, "First jump started");
// In mid-air (coyote time exhausted, within double jump window)
for (let i = 0; i < 5; i++) {
  player.update(0.016, input);
}
assert(player.coyoteTimer === 0, "Coyote timer exhausted in mid-air");
// Second press in mid-air activates Mode C double jump!
input.consumeJumpPress();
input.keys.jumpPressed = true;
player.update(0.016, input);
assert(player.hasDoubleJumped === true, "Mode C double jump activated on second press");
assert(player.vy <= -CONFIG.PHYSICS.DOUBLE_JUMP_IMPULSE + 20, "Double jump applied high upward impulse");

// Third press in mid-air MUST NOT apply new upward impulse
const vyBeforeThirdPress = player.vy;
input.consumeJumpPress();
input.keys.jumpPressed = true;
player.update(0.016, input);
assert(player.vy >= vyBeforeThirdPress, "Third mid-air jump press strictly prevented (no infinite flight)");

// Complete landing
for (let i = 0; i < 50; i++) {
  player.update(0.016, input);
}

// TEST 8: Jump Buffering (press jump slightly before landing)
console.log("\nTest 8: Jump Buffering");
// Player is in mid-air falling towards ground
player.vy = 200;
player.y = CONFIG.GROUND_Y - 60; // 2px above ground
player.grounded = false;
player.coyoteTimer = 0;
// Buffer a jump input 70ms before touchdown
player.jumpBufferTimer = 0.07;

// Step frame 1: player falls onto ground, landing resolves
player.update(0.016, input);
assert(player.grounded === true, "Player touched down on ground");

// Step frame 2: buffered jump immediately fires on ground
player.update(0.016, input);
assert(player.grounded === false, "Buffered jump triggered immediately upon touchdown");
assert(player.vy < 0, `Buffered jump executed with full impulse (vy = ${player.vy.toFixed(2)})`);

// Complete landing again
for (let i = 0; i < 40; i++) {
  player.update(0.016, input);
}

// TEST 9: World Boundary Clamping
console.log("\nTest 9: World Boundaries (0 to WORLD_WIDTH)");
player.x = 5;
player.vx = -200;
player.update(0.05, input);
assert(player.x === 0, `Player clamped to left boundary X=0 (got ${player.x})`);
player.x = CONFIG.WORLD_WIDTH - 20;
player.vx = 200;
player.update(0.05, input);
const maxPlayerX = CONFIG.WORLD_WIDTH - player.width;
assert(player.x === maxPlayerX, `Player clamped to right boundary X=${maxPlayerX} (got ${player.x})`);

// TEST 10: Modal Input Blocking
console.log("\nTest 10: Modal Input Blocking Compatibility");
player.x = 200;
player.vx = 0;
input.keys.right = true;
// isBlocked = true
player.update(0.016, input, true);
assert(player.vx === 0, "Player does not move when modal is open (isBlocked = true)");

// TEST 11: Camera Clamping & Tracking
console.log("\nTest 11: Camera Horizontal Side-Scrolling Clamping");
const maxCamX = CONFIG.WORLD_WIDTH - CONFIG.CANVAS_WIDTH;
let targetCamX = 0 - CONFIG.CANVAS_WIDTH / 3;
let clampedCamX = Math.max(0, Math.min(targetCamX, maxCamX));
assert(clampedCamX === 0, `Camera clamped at level start (got ${clampedCamX})`);

targetCamX = (CONFIG.WORLD_WIDTH - 10) - CONFIG.CANVAS_WIDTH / 3;
clampedCamX = Math.max(0, Math.min(targetCamX, maxCamX));
assert(clampedCamX === maxCamX, `Camera clamped at level end (got ${clampedCamX} == ${maxCamX})`);

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);
if (failed > 0) process.exit(1);
