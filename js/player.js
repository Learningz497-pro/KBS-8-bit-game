/**
 * Player Entity Module (Stage 3.3 Physics & Animation)
 * Implements:
 * - Left/Right running with acceleration, friction, and max speed
 * - Gravity, vertical velocity, and ground collision
 * - Coyote time (100ms) and Jump buffering (100ms)
 * - Variable jump height (short hop on tap, full jump on hold)
 * - Animation states (idle, run, jump, fall) synchronized with movement
 * - World boundary clamping
 */

import { buildCharacterSprites } from './sprites.js?v=3';
import { CONFIG } from './config.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left
    this.grounded = true;

    // Sprite frames generated from `character.jpg`
    this.sprites = buildCharacterSprites();
    this.width = this.sprites.width;   // 32px
    this.height = this.sprites.height; // 58px

    // Timers for tight, forgiving platforming feel
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isJumping = false;
    this.justLanded = false;
    this.hasDoubleJumped = false;
    this.doubleJumpWindowTimer = 0;

    // Checkpoint & recovery state
    this.lastCheckpoint = { x: 60, y: CONFIG.GROUND_Y - 58 };
    this.invulnerableTimer = 0;
    this.currentPlatform = null;

    // Animation state
    this.state = 'idle'; // idle | run | jump | fall
    this.animTime = 0;
    this.animFrame = 0;
  }

  update(dt, input, isBlocked = false, levelData = null) {
    const P = CONFIG.PHYSICS;
    const groundY = CONFIG.GROUND_Y;
    const groundSegments = levelData?.groundSegments || CONFIG.GROUND_SEGMENTS || [{ id: 'all', x: 0, w: CONFIG.WORLD_WIDTH }];
    const platforms = levelData?.platforms || CONFIG.PLATFORMS || [];
    const checkpoints = levelData?.checkpoints || CONFIG.CHECKPOINTS || [];

    // 1. Process Input & Horizontal Acceleration
    let moveDir = 0;
    if (!isBlocked && input) {
      if (input.keys.left && !input.keys.right) moveDir = -1;
      if (input.keys.right && !input.keys.left) moveDir = 1;
    }

    if (moveDir !== 0) {
      // Accelerate towards moveDir * MOVE_SPEED
      this.vx += moveDir * P.ACCELERATION * dt;
      if (Math.abs(this.vx) > P.MOVE_SPEED) {
        this.vx = moveDir * P.MOVE_SPEED;
      }
      this.facing = moveDir;
    } else {
      // Decelerate / Apply friction
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - P.FRICTION * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + P.FRICTION * dt);
      }
    }

    // 2. Coyote Time, Jump Buffering & Double Jump Timers
    if (this.grounded) {
      this.coyoteTimer = P.COYOTE_TIME;
      this.hasDoubleJumped = false;
      this.doubleJumpWindowTimer = 0;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
      if (this.doubleJumpWindowTimer > 0) {
        this.doubleJumpWindowTimer = Math.max(0, this.doubleJumpWindowTimer - dt);
      }
    }

    // Process jump press event
    const jumpPressed = !isBlocked && input && input.consumeJumpPress();
    if (jumpPressed) {
      this.jumpBufferTimer = P.JUMP_BUFFER;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // 3A. First Jump (Mode A/B: Buffered Jump + Coyote Time)
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vy = -P.JUMP_IMPULSE;
      this.grounded = false;
      this.isJumping = true;
      this.hasDoubleJumped = false;
      this.doubleJumpWindowTimer = P.DOUBLE_JUMP_WINDOW || 0.32;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.currentPlatform = null;
    }
    // 3B. Mode C: Double Space Press (Extra-High Jump with strict 1-use guard)
    else if (jumpPressed && !this.grounded && !this.hasDoubleJumped && (this.doubleJumpWindowTimer > 0 || this.vy < 80)) {
      this.vy = -P.DOUBLE_JUMP_IMPULSE;
      this.hasDoubleJumped = true;
      this.isJumping = true;
      this.jumpBufferTimer = 0;
      this.doubleJumpWindowTimer = 0;
    }

    // Variable jump height: release Space to cut jump short cleanly (Mode A short hop vs Mode B full jump hold)
    if (!isBlocked && input && !input.keys.jump && this.isJumping && this.vy < -60) {
      this.vy = Math.max(this.vy * 0.5, -60);
      this.isJumping = false;
    }

    // 4. Apply Gravity
    if (!this.grounded) {
      this.vy += P.GRAVITY * dt;
      // Clamp terminal fall velocity
      if (this.vy > 400) this.vy = 400;
    }

    // Store pre-movement vertical position for precise platform crossing detection
    const prevFeetY = this.y + this.height;

    // 5. Apply Movement to Coordinates
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 6. Collision Resolution (One-way Platforms & Ground Segments with Gaps)
    const feetY = this.y + this.height;
    const feetLeft = this.x + 6;
    const feetRight = this.x + this.width - 6;
    const wasGrounded = this.grounded;
    let landed = false;

    // 6A. Check Elevated Platforms (One-way: only when descending)
    if (this.vy >= 0) {
      for (const plat of platforms) {
        const isHorizOverlap = feetRight > plat.x && feetLeft < plat.x + plat.w;
        // Check if feet were above the platform surface before and are now at/below it
        if (isHorizOverlap && prevFeetY <= plat.y + 6 && feetY >= plat.y) {
          this.y = plat.y - this.height;
          this.vy = 0;
          this.grounded = true;
          this.isJumping = false;
          this.currentPlatform = plat;
          landed = true;
          break;
        }
      }
    }

    // 6B. Check Ground Segments (if not landed on platform)
    if (!landed) {
      const isOverGround = groundSegments.some(seg => feetRight > seg.x && feetLeft < seg.x + seg.w);
      if (isOverGround && feetY >= groundY) {
        this.y = groundY - this.height;
        this.vy = 0;
        this.grounded = true;
        this.isJumping = false;
        this.currentPlatform = null;
        landed = true;
      }
    }

    // 6C. Apply Ground State
    if (landed) {
      if (!wasGrounded) {
        this.justLanded = true;
      } else {
        this.justLanded = false;
      }

      // Update checkpoint when grounded on safe ground segments
      for (const cp of checkpoints) {
        if (this.x >= cp.x - 30 && cp.x > this.lastCheckpoint.x) {
          this.lastCheckpoint = cp;
        }
      }
    } else {
      this.grounded = false;
      this.justLanded = false;
      this.currentPlatform = null;
    }

    // 6D. Gap Fall Detection & Forgiving Checkpoint Recovery
    if (this.y > CONFIG.CANVAS_HEIGHT + 20) {
      this.respawnAtCheckpoint();
    }

    // 7. World Boundary Clamping
    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    } else if (this.x > CONFIG.WORLD_WIDTH - this.width) {
      this.x = CONFIG.WORLD_WIDTH - this.width;
      this.vx = 0;
    }

    // 8. Invulnerability Countdown
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }

    // 9. Animation State Machine (with hysteresis at jump apex)
    if (!this.grounded) {
      if (this.vy < -25) {
        this.state = 'jump';
      } else if (this.vy > 25) {
        this.state = 'fall';
      }
    } else if (Math.abs(this.vx) > 6) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }

    // Update running frame animation
    if (this.state === 'run') {
      this.animTime += dt;
      const frameDuration = Math.max(0.08, 0.14 - (Math.abs(this.vx) / P.MOVE_SPEED) * 0.05);
      if (this.animTime > frameDuration) {
        this.animTime = 0;
        this.animFrame = (this.animFrame + 1) % this.sprites.run.length;
      }
    } else {
      this.animTime = 0;
      this.animFrame = 0;
    }
  }

  bounce() {
    this.vy = -CONFIG.PHYSICS.JUMP_IMPULSE * 0.78;
    this.grounded = false;
    this.isJumping = true;
    this.hasDoubleJumped = false;
    this.doubleJumpWindowTimer = 0;
  }

  takeDamage(fromX) {
    if (this.invulnerableTimer > 0) return false;
    this.invulnerableTimer = 1.2; // 1.2 seconds invulnerability
    this.vx = this.x < fromX ? -110 : 110;
    this.vy = -140; // Soft bounce back
    this.grounded = false;
    return true;
  }

  respawnAtCheckpoint() {
    this.x = this.lastCheckpoint.x;
    this.y = this.lastCheckpoint.y;
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;
    this.isJumping = false;
    this.hasDoubleJumped = false;
    this.doubleJumpWindowTimer = 0;
    this.invulnerableTimer = 1.0; // 1s safe grace period upon respawn
    this.state = 'idle';
  }

  draw(ctx) {
    ctx.save();

    // Invulnerability visual flicker
    if (this.invulnerableTimer > 0) {
      const isVisible = Math.floor(this.invulnerableTimer * 16) % 2 === 0;
      if (!isVisible) {
        ctx.globalAlpha = 0.35;
      }
    }

    // Soft drop shadow beneath feet
    const currentSurfaceY = this.currentPlatform ? this.currentPlatform.y : CONFIG.GROUND_Y;
    const distFromSurface = Math.max(0, currentSurfaceY - (this.y + this.height));
    if (distFromSurface < 80) {
      const shadowAlpha = Math.max(0.06, 0.28 - (distFromSurface / 80) * 0.22);
      const shadowScale = Math.max(0.4, 1 - (distFromSurface / 80) * 0.5);

      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        Math.floor(this.x + this.width / 2),
        Math.floor(currentSurfaceY - 1),
        Math.floor((this.width * 0.45) * shadowScale),
        Math.floor(3 * shadowScale),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Horizontal orientation (facing left vs right)
    if (this.facing === -1) {
      ctx.translate(Math.floor(this.x + this.width), Math.floor(this.y));
      ctx.scale(-1, 1);
    } else {
      ctx.translate(Math.floor(this.x), Math.floor(this.y));
    }

    // Select sprite frame
    let frameCanvas = this.sprites.idle;
    if (this.state === 'run') {
      frameCanvas = this.sprites.run[this.animFrame];
    } else if (this.state === 'jump') {
      frameCanvas = this.sprites.jump;
    } else if (this.state === 'fall') {
      frameCanvas = this.sprites.fall;
    }

    ctx.drawImage(frameCanvas, 0, 0);
    ctx.restore();
  }
}
