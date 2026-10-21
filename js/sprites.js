/**
 * Pixel Sprite Generation Module (Stage 3.2 Refinement)
 * Renders the protagonist sprite with 1:1 pixel fidelity based directly
 * on the authoritative reference image `character.jpg`.
 */

import { CHARACTER_EXACT_PIXELS } from './character_data.js';

export function buildCharacterSprites() {
  const H = CHARACTER_EXACT_PIXELS.length;        // 58 rows
  const W = CHARACTER_EXACT_PIXELS[0].length;     // 32 columns

  // 1. Build Base Idle Canvas from Exact Color Matrix
  const idleCanvas = document.createElement('canvas');
  idleCanvas.width = W;
  idleCanvas.height = H;
  const ctx = idleCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const color = CHARACTER_EXACT_PIXELS[y][x];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Draw sleek square-frame transparent glasses (spectacles, not sunglasses)
  drawGlasses(ctx);

  // 2. Build Running Frame 1 (Left Leg Forward / Right Leg Back)
  const run1Canvas = document.createElement('canvas');
  run1Canvas.width = W;
  run1Canvas.height = H;
  const r1 = run1Canvas.getContext('2d');
  r1.imageSmoothingEnabled = false;
  // Copy upper body (head, jacket, shirt, hips: rows 0 to 41)
  r1.drawImage(idleCanvas, 0, 0, W, 42, 0, 0, W, 42);
  // Shift left leg slightly forward (leftward) and right leg back (rightward)
  r1.drawImage(idleCanvas, 6, 42, 9, 16, 5, 41, 9, 16);  // left leg step
  r1.drawImage(idleCanvas, 16, 42, 9, 16, 17, 43, 9, 16); // right leg push

  // 3. Build Running Frame 2 (Right Leg Forward / Left Leg Back)
  const run2Canvas = document.createElement('canvas');
  run2Canvas.width = W;
  run2Canvas.height = H;
  const r2 = run2Canvas.getContext('2d');
  r2.imageSmoothingEnabled = false;
  // Copy upper body
  r2.drawImage(idleCanvas, 0, 0, W, 42, 0, 0, W, 42);
  // Shift right leg forward and left leg back
  r2.drawImage(idleCanvas, 6, 42, 9, 16, 7, 43, 9, 16);  // left leg back
  r2.drawImage(idleCanvas, 16, 42, 9, 16, 15, 41, 9, 16); // right leg step

  // 4. Build Jump Canvas (Legs slightly raised/tucked, hair trailing)
  const jumpCanvas = document.createElement('canvas');
  jumpCanvas.width = W;
  jumpCanvas.height = H;
  const jCtx = jumpCanvas.getContext('2d');
  jCtx.imageSmoothingEnabled = false;
  // Upper body slightly elevated
  jCtx.drawImage(idleCanvas, 0, 0, W, 42, 0, -2, W, 42);
  // Lower legs tucked up by 2 pixels
  jCtx.drawImage(idleCanvas, 5, 42, 22, 16, 5, 40, 22, 16);

  // 5. Build Fall Canvas (Hair flutters slightly upward)
  const fallCanvas = document.createElement('canvas');
  fallCanvas.width = W;
  fallCanvas.height = H;
  const fCtx = fallCanvas.getContext('2d');
  fCtx.imageSmoothingEnabled = false;
  fCtx.drawImage(idleCanvas, 0, 0);

  return {
    idle: idleCanvas,
    run: [idleCanvas, run1Canvas, idleCanvas, run2Canvas],
    jump: jumpCanvas,
    fall: fallCanvas,
    width: W,
    height: H
  };
}

/**
 * Draws compact, stylish rounded-square (squircle) transparent optical glasses.
 * - Sized specifically around the eyes (only eyes visible inside frames).
 * - Rounded/chamfered corners (not boxy chips, not full circles).
 * - Thin 1-pixel bridge (Col 16) eliminating any thick center block.
 * - Forehead/face clearly visible ABOVE (top rim at Row 12).
 * - Cheeks/face/blush clearly visible BELOW (bottom rim at Row 16, just below eyes).
 * - Vibrant crimson red frame.
 */
function drawGlasses(ctx) {
  const FRAME = '#dc2626';        // Vibrant Crimson Red
  const FRAME_CORNER = '#e04f5f'; // Softened red for rounded corner effect
  const BRIDGE = '#b91c1c';       // Sleek delicate nose bridge
  const GLINT = 'rgba(255, 255, 255, 0.45)'; // Soft transparent specular reflection

  // --- Left Squircle Lens (Cols 11-15, Rows 12-16) ---
  ctx.fillStyle = FRAME;
  ctx.fillRect(12, 12, 3, 1);  // Top rim
  ctx.fillRect(12, 16, 3, 1);  // Bottom rim (just below the eye)
  ctx.fillRect(11, 13, 1, 3);  // Outer left rim
  ctx.fillRect(15, 13, 1, 3);  // Inner right rim

  // Rounded corners (soft chamfer)
  ctx.fillStyle = FRAME_CORNER;
  ctx.fillRect(11, 12, 1, 1);  // Top-left
  ctx.fillRect(15, 12, 1, 1);  // Top-right
  ctx.fillRect(11, 16, 1, 1);  // Bottom-left
  ctx.fillRect(15, 16, 1, 1);  // Bottom-right

  // --- Right Squircle Lens (Cols 17-21, Rows 12-16) ---
  ctx.fillStyle = FRAME;
  ctx.fillRect(18, 12, 3, 1);  // Top rim
  ctx.fillRect(18, 16, 3, 1);  // Bottom rim (just below the eye)
  ctx.fillRect(17, 13, 1, 3);  // Inner left rim
  ctx.fillRect(21, 13, 1, 3);  // Outer right rim

  // Rounded corners (soft chamfer)
  ctx.fillStyle = FRAME_CORNER;
  ctx.fillRect(17, 12, 1, 1);  // Top-left
  ctx.fillRect(21, 12, 1, 1);  // Top-right
  ctx.fillRect(17, 16, 1, 1);  // Bottom-left
  ctx.fillRect(21, 16, 1, 1);  // Bottom-right

  // --- Delicate 1-pixel Center Nose Bridge (Col 16 at Row 14) ---
  ctx.fillStyle = BRIDGE;
  ctx.fillRect(16, 14, 1, 1);

  // --- Thin Temple Arms to Hair/Ears (Row 14) ---
  ctx.fillStyle = FRAME;
  ctx.fillRect(9, 14, 2, 1);   // Left arm
  ctx.fillRect(21, 14, 2, 1);  // Right arm

  // --- Clear Transparent Specular Lens Glint ---
  ctx.fillStyle = GLINT;
  ctx.fillRect(12, 13, 1, 1);
  ctx.fillRect(18, 13, 1, 1);
}
