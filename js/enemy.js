/**
 * Enemy Entity Module (Stage 3.4 Patrolling Enemies)
 * Renders cute 8-bit retro party slimes/critters that patrol designated platform/ground zones,
 * bounce on edges, support jump-stomp defeat, and cause gentle knockback on side collision.
 */

export class Enemy {
  constructor(config) {
    this.id = config.id;
    this.name = config.name || 'Party Slime';
    this.x = config.x;
    this.y = config.y;
    this.w = config.w || 18;
    this.h = config.h || 14;
    this.minX = config.minX;
    this.maxX = config.maxX;
    this.speed = config.speed || 30;
    this.dir = -1; // Start moving left
    this.color = config.color || '#f43f5e';

    this.isDefeated = false;
    this.squishTimer = 0;
    this.isRemoved = false;
    this.animTime = Math.random() * 2;
  }

  update(dt) {
    if (this.isRemoved) return;

    if (this.isDefeated) {
      this.squishTimer -= dt;
      if (this.squishTimer <= 0) {
        this.isRemoved = true;
      }
      return;
    }

    // 1. Horizontal patrol movement
    this.x += this.dir * this.speed * dt;

    // 2. Boundary turnarounds
    if (this.x <= this.minX) {
      this.x = this.minX;
      this.dir = 1;
    } else if (this.x + this.w >= this.maxX) {
      this.x = this.maxX - this.w;
      this.dir = -1;
    }

    // 3. Animation cycle
    this.animTime += dt;
  }

  defeat() {
    if (this.isDefeated) return false;
    this.isDefeated = true;
    this.squishTimer = 0.4; // 400ms squished defeat display
    return true;
  }

  draw(ctx) {
    if (this.isRemoved) return;

    ctx.save();

    const drawX = Math.floor(this.x);
    const drawY = Math.floor(this.y);

    if (this.isDefeated) {
      // Flattened squish on stomp
      const squishAlpha = Math.max(0, this.squishTimer / 0.4);
      ctx.globalAlpha = squishAlpha;

      // Squished puddle
      ctx.fillStyle = this.color;
      ctx.fillRect(drawX - 2, drawY + this.h - 5, this.w + 4, 5);

      // Defeat stars / "poof" particles
      ctx.fillStyle = '#fde047';
      ctx.fillRect(drawX + 2, drawY - 4, 3, 3);
      ctx.fillRect(drawX + this.w - 5, drawY - 6, 3, 3);
      ctx.fillRect(drawX + Math.floor(this.w / 2) - 1, drawY - 8, 3, 3);

      ctx.restore();
      return;
    }

    // Subtle 8-bit wobble bounce
    const wobble = Math.sin(this.animTime * 6) > 0 ? 1 : 0;
    const bodyH = this.h - wobble;
    const bodyY = drawY + wobble;

    // Soft drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(drawX + this.w / 2, drawY + this.h, this.w / 2 + 1, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slime Body: Main Color
    ctx.fillStyle = this.color;
    // Base dome
    ctx.fillRect(drawX + 2, bodyY, this.w - 4, bodyH);
    ctx.fillRect(drawX, bodyY + 3, this.w, bodyH - 3);
    // Rounded top edge
    ctx.fillRect(drawX + 4, bodyY - 1, this.w - 8, 2);

    // Specular Highlight (top-left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(drawX + 3, bodyY + 2, 3, 2);
    ctx.fillRect(drawX + 4, bodyY + 1, 2, 1);

    // Cute 8-bit Eyes
    const eyeOffsetX = this.dir === 1 ? 4 : 1;
    // Left eye white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + eyeOffsetX + 2, bodyY + 4, 3, 4);
    // Right eye white
    ctx.fillRect(drawX + eyeOffsetX + 7, bodyY + 4, 3, 4);

    // Pupils looking in moving direction
    const pupilX = this.dir === 1 ? 1 : 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(drawX + eyeOffsetX + 2 + pupilX, bodyY + 5, 2, 2);
    ctx.fillRect(drawX + eyeOffsetX + 7 + pupilX, bodyY + 5, 2, 2);

    // Rosy Cheeks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(drawX + eyeOffsetX, bodyY + 8, 2, 1);
    ctx.fillRect(drawX + eyeOffsetX + 10, bodyY + 8, 2, 1);

    ctx.restore();
  }
}
