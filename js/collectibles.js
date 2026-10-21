/**
 * Collectibles & Interactive Objects Module (Stage 3.5 Coins & Gifts)
 * Implements:
 * - Collectible Gold Coins (exactly 100 in level, 8-bit spin & sparkle)
 * - Multiple Gift Boxes with unique IDs, multiline messages, and [E] interaction prompts
 */

export class Coin {
  constructor(config) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.w = config.w || 10;
    this.h = config.h || 10;
    this.collected = false;
  }

  collect() {
    if (this.collected) return false;
    this.collected = true;
    return true;
  }

  draw(ctx, animTime = 0) {
    if (this.collected) return;

    ctx.save();

    // Subtle floating bob
    const bob = Math.sin((animTime + this.x * 0.03) * 5) * 1.5;
    const cx = Math.floor(this.x + this.w / 2);
    const cy = Math.floor(this.y + this.h / 2 + bob);

    // 8-bit rotating coin illusion using horizontal scale
    const phase = (animTime + this.x * 0.04) * 4;
    const scaleX = Math.max(0.25, Math.abs(Math.cos(phase)));
    const coinW = Math.max(3, Math.floor(this.w * scaleX));
    const coinH = this.h;

    const left = cx - Math.floor(coinW / 2);
    const top = cy - Math.floor(coinH / 2);

    // Soft ground shadow beneath coin
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, this.y + this.h + 4, 4, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer Dark Amber Rim
    ctx.fillStyle = '#b45309';
    ctx.fillRect(left, top, coinW, coinH);

    // Inner Shiny Gold
    ctx.fillStyle = '#facc15';
    ctx.fillRect(left + 1, top + 1, Math.max(1, coinW - 2), coinH - 2);

    // Specular Highlight Glint
    if (coinW >= 6) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(left + 2, top + 2, 1, 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(left + 2, top + 4, Math.max(1, coinW - 4), 2);
    }

    ctx.restore();
  }
}

export class Gift {
  constructor(config) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.w = config.w || 18;
    this.h = config.h || 18;
    this.title = config.title;
    this.message = config.message;
    this.opened = config.opened || false;
  }

  open() {
    if (this.opened) return false;
    this.opened = true;
    return true;
  }

  draw(ctx, animTime = 0, isPlayerNear = false) {
    ctx.save();

    const gx = Math.floor(this.x);
    const gy = Math.floor(this.y);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(gx + this.w / 2, gy + this.h, this.w / 2 + 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!this.opened) {
      // --- UNOPENED GIFT BOX ---
      // Box body: Vibrant Magenta/Pink
      ctx.fillStyle = '#db2777'; // Darker pink border/shadow
      ctx.fillRect(gx, gy + 4, this.w, this.h - 4);
      ctx.fillStyle = '#ec4899'; // Bright pink front
      ctx.fillRect(gx + 1, gy + 5, this.w - 2, this.h - 6);

      // Box lid
      ctx.fillStyle = '#be185d';
      ctx.fillRect(gx - 1, gy + 2, this.w + 2, 4);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(gx, gy + 2, this.w, 2);

      // Golden Ribbon - Vertical Stripe
      const midX = gx + Math.floor(this.w / 2) - 1;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(midX - 1, gy + 2, 4, this.h - 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(midX, gy + 2, 2, this.h - 2);

      // Golden Ribbon - Horizontal Stripe
      const midY = gy + Math.floor(this.h / 2) + 1;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(gx, midY - 1, this.w, 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(gx, midY, this.w, 2);

      // Golden Ribbon Bow on Top
      ctx.fillStyle = '#fde047';
      // Left loop
      ctx.fillRect(midX - 3, gy - 2, 3, 4);
      // Right loop
      ctx.fillRect(midX + 2, gy - 2, 3, 4);
      // Center knot
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(midX - 1, gy - 1, 4, 3);

      // If player is within interaction range: draw floating hint bubble
      if (isPlayerNear) {
        const floatY = gy - 16 + Math.sin(animTime * 6) * 2;
        this.drawPromptBubble(ctx, gx + this.w / 2, floatY, "[E] Open Gift");
      }
    } else {
      // --- OPENED GIFT BOX ---
      // Box base
      ctx.fillStyle = '#be185d';
      ctx.fillRect(gx, gy + 6, this.w, this.h - 6);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(gx + 1, gy + 7, this.w - 2, this.h - 8);

      // Opened interior glow
      ctx.fillStyle = '#fde047';
      ctx.fillRect(gx + 3, gy + 5, this.w - 6, 3);

      // Lid resting to the side
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(gx + this.w, gy + 10, 5, 8);
      ctx.fillStyle = '#be185d';
      ctx.fillRect(gx + this.w + 1, gy + 11, 3, 6);

      // Rising celebratory sparkles
      const sparklePhase = animTime * 3;
      const s1Y = gy - 4 - (sparklePhase % 12);
      const s2Y = gy - 2 - ((sparklePhase + 6) % 12);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(gx + 4, s1Y, 2, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(gx + 12, s2Y, 2, 2);
    }

    ctx.restore();
  }

  drawPromptBubble(ctx, centerX, y, text) {
    ctx.font = '6px "Press Start 2P", monospace';
    const textWidth = ctx.measureText(text).width;
    const bubbleW = textWidth + 10;
    const bubbleH = 13;
    const bx = Math.floor(centerX - bubbleW / 2);
    const by = Math.floor(y);

    // Bubble Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(bx, by, bubbleW, bubbleH);

    // Golden Border
    ctx.strokeStyle = '#f6d854';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bubbleW, bubbleH);

    // Downward arrow pointer
    ctx.fillStyle = '#f6d854';
    ctx.beginPath();
    ctx.moveTo(centerX - 3, by + bubbleH);
    ctx.lineTo(centerX + 3, by + bubbleH);
    ctx.lineTo(centerX, by + bubbleH + 3);
    ctx.closePath();
    ctx.fill();

    // Prompt Text
    ctx.fillStyle = '#ffde59';
    ctx.fillText(text, bx + 5, by + 9);
  }
}

export class Machine {
  constructor(config) {
    this.id = config.id || 'inventory_machine';
    this.x = config.x;
    this.y = config.y;
    this.w = config.w || 36;
    this.h = config.h || 66;
    this.interactionRange = config.interactionRange || 44;
    this.depositCost = config.depositRequired || 40;
    this.keyDispensed = false;
    this.dispenseAnimTimer = 0;
  }

  dispenseKey() {
    this.keyDispensed = true;
    this.dispenseAnimTimer = 2.5; // 2.5s celebratory dispense sparkle
  }

  update(dt) {
    if (this.dispenseAnimTimer > 0) {
      this.dispenseAnimTimer = Math.max(0, this.dispenseAnimTimer - dt);
    }
  }

  draw(ctx, animTime = 0, isPlayerNear = false, coinsHeld = 0) {
    ctx.save();

    const mx = Math.floor(this.x);
    const my = Math.floor(this.y);

    // 1. Soft Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(mx + this.w / 2, my + this.h + 1, this.w / 2 + 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Machine Outer Cabinet (Deep Retro Indigo Arcade Body)
    ctx.fillStyle = '#0f172a'; // Deep border outline
    ctx.fillRect(mx - 1, my - 1, this.w + 2, this.h + 2);

    ctx.fillStyle = '#1e1b4b'; // Main dark arcade cabinet body
    ctx.fillRect(mx, my, this.w, this.h);

    // Side Bevel Highlight (Left)
    ctx.fillStyle = '#312e81';
    ctx.fillRect(mx + 1, my + 1, 2, this.h - 2);

    // Side Bevel Shadow (Right)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(mx + this.w - 3, my + 1, 2, this.h - 2);

    // 3. Top Illuminated Marquee Header
    ctx.fillStyle = '#b45309'; // Brass/gold marquee rim
    ctx.fillRect(mx + 2, my + 3, this.w - 4, 13);
    ctx.fillStyle = '#020617'; // Dark marquee background
    ctx.fillRect(mx + 3, my + 4, this.w - 6, 11);

    // Animated Marquee Lights (Alternate flashing bulbs)
    const bulbColorA = Math.floor(animTime * 4) % 2 === 0 ? '#facc15' : '#ef4444';
    const bulbColorB = Math.floor(animTime * 4) % 2 === 0 ? '#38bdf8' : '#facc15';

    ctx.fillStyle = bulbColorA;
    ctx.fillRect(mx + 4, my + 5, 2, 2);
    ctx.fillRect(mx + this.w - 6, my + 5, 2, 2);

    ctx.fillStyle = bulbColorB;
    ctx.fillRect(mx + 4, my + 12, 2, 2);
    ctx.fillRect(mx + this.w - 6, my + 12, 2, 2);

    // Marquee Center Graphic: Golden Key Icon
    ctx.fillStyle = '#fde047';
    ctx.fillRect(mx + 13, my + 8, 4, 3);
    ctx.fillRect(mx + 17, my + 9, 6, 1);
    ctx.fillRect(mx + 20, my + 10, 1, 2);
    ctx.fillRect(mx + 22, my + 10, 1, 2);

    // 4. Digital Phosphor CRT Screen
    ctx.fillStyle = '#09090b'; // Screen Bezel
    ctx.fillRect(mx + 3, my + 18, this.w - 6, 14);

    if (this.keyDispensed) {
      // Screen: UNLOCKED in Cyan
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(mx + 4, my + 19, this.w - 8, 12);
      ctx.fillStyle = '#34d399';
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText('OPEN', mx + 8, my + 28);
    } else {
      // Screen: 40🪙 in Glowing Amber
      ctx.fillStyle = '#451a03';
      ctx.fillRect(mx + 4, my + 19, this.w - 8, 12);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText('40¢', mx + 11, my + 28);
    }

    // 5. Coin Deposit Slot Area
    ctx.fillStyle = '#334155'; // Metallic panel
    ctx.fillRect(mx + 3, my + 34, this.w - 6, 10);
    ctx.fillStyle = '#475569';
    ctx.fillRect(mx + 4, my + 35, this.w - 8, 8);

    // Coin slot bevel
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(mx + 15, my + 37, 6, 4);
    ctx.fillStyle = '#000000'; // Black slot opening
    ctx.fillRect(mx + 17, my + 38, 2, 2);

    // Blinking Coin LED indicator
    const ledColor = this.keyDispensed
      ? '#10b981' // Green when completed
      : (coinsHeld >= 40 ? '#22c55e' : '#f43f5e'); // Green if eligible, Red if insufficient
    ctx.fillStyle = ledColor;
    ctx.fillRect(mx + 25, my + 38, 2, 2);

    // 6. Dispenser Hatch / Key Compartment (Bottom glass window)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(mx + 4, my + 46, this.w - 8, 14);

    ctx.fillStyle = '#0369a1'; // Deep glass reflection
    ctx.fillRect(mx + 5, my + 47, this.w - 10, 12);

    // Inside Dispenser Hatch
    if (this.keyDispensed) {
      // Key has been dispensed! Draw golden key resting in tray
      const keyGlint = Math.floor(animTime * 6) % 2 === 0 ? '#ffffff' : '#fde047';
      ctx.fillStyle = '#d97706';
      ctx.fillRect(mx + 11, my + 52, 6, 5);
      ctx.fillStyle = keyGlint;
      ctx.fillRect(mx + 12, my + 53, 4, 3);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(mx + 13, my + 54, 2, 1); // Key bow hole

      // Shaft and bit
      ctx.fillStyle = keyGlint;
      ctx.fillRect(mx + 17, my + 54, 7, 2);
      ctx.fillRect(mx + 21, my + 56, 2, 2);

      // Celebratory sparkles while animating
      if (this.dispenseAnimTimer > 0) {
        const spark = Math.sin(animTime * 12) * 3;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mx + 14 + spark, my + 48, 2, 2);
        ctx.fillRect(mx + 22 - spark, my + 49, 2, 2);
      }
    } else {
      // Un-dispensed key waiting inside behind glass
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.fillRect(mx + 12, my + 52, 12, 4);
    }

    // 7. Base Footings
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(mx + 2, my + 62, 7, 4);
    ctx.fillRect(mx + this.w - 9, my + 62, 7, 4);

    // 8. Proximity Interaction Bubble Prompt
    if (isPlayerNear) {
      const floatY = my - 16 + Math.sin(animTime * 6) * 2;
      const promptText = this.keyDispensed ? "[D] Key Dispensed" : "[D] Deposit Coins";
      this.drawPromptBubble(ctx, mx + this.w / 2, floatY, promptText);
    }

    ctx.restore();
  }

  drawPromptBubble(ctx, centerX, y, text) {
    ctx.font = '6px "Press Start 2P", monospace';
    const textWidth = ctx.measureText(text).width;
    const bubbleW = textWidth + 10;
    const bubbleH = 13;
    const bx = Math.floor(centerX - bubbleW / 2);
    const by = Math.floor(y);

    // Bubble Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(bx, by, bubbleW, bubbleH);

    // Golden Border
    ctx.strokeStyle = '#f6d854';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bubbleW, bubbleH);

    // Downward arrow pointer
    ctx.fillStyle = '#f6d854';
    ctx.beginPath();
    ctx.moveTo(centerX - 3, by + bubbleH);
    ctx.lineTo(centerX + 3, by + bubbleH);
    ctx.lineTo(centerX, by + bubbleH + 3);
    ctx.closePath();
    ctx.fill();

    // Prompt Text
    ctx.fillStyle = '#ffde59';
    ctx.fillText(text, bx + 5, by + 9);
  }
}

export class Castle {
  constructor(config) {
    this.id = config.id || 'birthday_castle';
    this.x = config.x || 2220;
    this.y = config.y || 45;
    this.w = config.w || 150;
    this.h = config.h || 130;
    this.gate = config.gate || { x: this.x + 50, y: this.y + 70, w: 50, h: 60 };
    this.entranceTrigger = config.entranceTrigger || { x: this.x + 60, y: this.y + 70, w: 30, h: 60 };
    this.interactionRange = config.interactionRange || 50;

    this.unlocked = false;
    this.gateProgress = 0.0; // 0 = closed, 1.0 = fully open
    this.isAnimating = false;
    this.confetti = [];
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.isAnimating = true;

    // Burst of celebratory birthday confetti particles
    const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#4ade80', '#ffffff'];
    for (let i = 0; i < 50; i++) {
      this.confetti.push({
        x: this.gate.x + this.gate.w / 2 + (Math.random() - 0.5) * 24,
        y: this.gate.y + this.gate.h / 2,
        vx: (Math.random() - 0.5) * 140,
        vy: -70 - Math.random() * 110,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() > 0.5 ? 3 : 2,
        alpha: 1.0
      });
    }
  }

  update(dt) {
    if (this.isAnimating) {
      this.gateProgress = Math.min(1.0, this.gateProgress + dt * 1.5);
      if (this.gateProgress >= 1.0) {
        this.isAnimating = false;
      }
    }

    // Update confetti particles
    for (const p of this.confetti) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt; // gravity
      p.alpha = Math.max(0, p.alpha - dt * 0.45);
    }
    this.confetti = this.confetti.filter(p => p.alpha > 0);
  }

  draw(ctx, animTime = 0, isPlayerNear = false, hasKey = false) {
    ctx.save();

    const cx = Math.floor(this.x);
    const cy = Math.floor(this.y);
    const groundY = cy + this.h; // 175

    // 1. Soft Castle Shadow Base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx + this.w / 2, groundY + 1, this.w / 2 + 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Central Stone Keep & Wall (between the two towers)
    ctx.fillStyle = '#1e293b'; // Outer dark outline
    ctx.fillRect(cx + 30, cy + 28, this.w - 60, this.h - 28);

    ctx.fillStyle = '#334155'; // Main castle wall stone
    ctx.fillRect(cx + 32, cy + 30, this.w - 64, this.h - 30);

    // Decorative horizontal stone cornice
    ctx.fillStyle = '#475569';
    ctx.fillRect(cx + 32, cy + 30, this.w - 64, 4);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx + 32, cy + 34, this.w - 64, 1);

    // Wall Crenelations / Battlements
    for (let bx = cx + 36; bx < cx + this.w - 44; bx += 14) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx, cy + 20, 8, 10);
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx + 1, cy + 21, 6, 8);
    }

    // Stone brick detail texture across the main wall
    ctx.fillStyle = '#1e293b';
    for (let r = cy + 42; r < cy + 100; r += 14) {
      const offset = ((r / 14) % 2) * 12;
      for (let c = cx + 38 + offset; c < cx + this.w - 42; c += 24) {
        ctx.fillRect(c, r, 12, 1);
        ctx.fillRect(c + 12, r, 1, 6);
      }
    }

    // 3. Central Archway Gate
    const gx = Math.floor(this.gate.x);
    const gy = Math.floor(this.gate.y);
    const gw = this.gate.w;
    const gh = this.gate.h;

    // Stone Archway Frame
    ctx.fillStyle = '#0f172a'; // Deep border
    ctx.fillRect(gx - 3, gy - 4, gw + 6, gh + 4);

    ctx.fillStyle = '#475569'; // Arch masonry ring
    ctx.fillRect(gx - 2, gy - 3, gw + 4, gh + 3);

    // Archway Keystone on top
    ctx.fillStyle = '#f59e0b'; // Gold trimmed keystone
    ctx.fillRect(gx + Math.floor(gw / 2) - 3, gy - 6, 6, 5);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(gx + Math.floor(gw / 2) - 2, gy - 5, 4, 3);

    // Doorway Interior Void / Warm Celebration Light
    if (this.gateProgress > 0) {
      // Unlocked & Opening: Warm magical glow radiating from inside
      const glowGrad = ctx.createLinearGradient(gx, gy, gx, gy + gh);
      glowGrad.addColorStop(0, '#fef08a');
      glowGrad.addColorStop(0.5, '#f59e0b');
      glowGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(gx, gy, gw, gh);

      // Red carpet entrance runner
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(gx + 12, gy + gh - 4, gw - 24, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(gx + 11, gy + gh - 4, 1, 4);
      ctx.fillRect(gx + gw - 12, gy + gh - 4, 1, 4);

      // Sparkling interior particles
      const sparkY = gy + gh - 15 - (Math.floor(animTime * 18) % (gh - 18));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(gx + Math.floor(gw / 2) - 1, sparkY, 2, 2);
    } else {
      // Locked: Dark mystical hallway behind closed gate
      ctx.fillStyle = '#020617';
      ctx.fillRect(gx, gy, gw, gh);
    }

    // 4. Moving Portcullis / Heavy Wooden Castle Doors
    const liftY = Math.floor(this.gateProgress * (gh - 4));
    if (liftY < gh) {
      ctx.save();
      // Clip to archway opening so raised gate conceals inside upper wall
      ctx.beginPath();
      ctx.rect(gx, gy, gw, gh);
      ctx.clip();

      const doorY = gy - liftY;

      // Heavy Dark Oak Door Planks
      ctx.fillStyle = '#27170a';
      ctx.fillRect(gx, doorY, gw, gh);

      // Planks vertical lines
      ctx.fillStyle = '#170c04';
      for (let px = gx + 6; px < gx + gw; px += 6) {
        ctx.fillRect(px, doorY, 1, gh);
      }

      // Wrought-iron horizontal cross-bars
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(gx, doorY + 12, gw, 4);
      ctx.fillRect(gx, doorY + gh - 18, gw, 4);
      ctx.fillStyle = '#334155';
      ctx.fillRect(gx, doorY + 13, gw, 2);
      ctx.fillRect(gx, doorY + gh - 17, gw, 2);

      // Iron Rivets on cross-bars
      ctx.fillStyle = '#94a3b8';
      for (let rx = gx + 4; rx < gx + gw; rx += 8) {
        ctx.fillRect(rx, doorY + 13, 2, 2);
        ctx.fillRect(rx, doorY + gh - 17, 2, 2);
      }

      // Large Golden Padlock & Keyhole Emblem (Only shown when locked)
      if (!this.unlocked) {
        const lockX = gx + Math.floor(gw / 2) - 5;
        const lockY = doorY + Math.floor(gh / 2) - 7;

        // Padlock shackle (silver arch)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(lockX + 2, lockY - 4, 6, 5);
        ctx.fillStyle = '#27170a';
        ctx.fillRect(lockX + 3, lockY - 2, 4, 3);

        // Golden Padlock body
        ctx.fillStyle = '#b45309';
        ctx.fillRect(lockX, lockY, 10, 10);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(lockX + 1, lockY + 1, 8, 8);

        // Keyhole
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(lockX + 5, lockY + 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(lockX + 4.5, lockY + 4, 1, 3);
      }

      ctx.restore();
    }

    // 5. Left Guard Tower (x: cx, w: 32, h: 125)
    this.drawTower(ctx, cx, cy + 5, 32, this.h - 5, '#ec4899', '#fde047', animTime);

    // 6. Right Guard Tower (x: cx + w - 32, w: 32, h: 125)
    this.drawTower(ctx, cx + this.w - 32, cy + 5, 32, this.h - 5, '#38bdf8', '#a855f7', animTime + 1.2);

    // 7. Decorative Crown & Festive Pennants above gate
    // Festive Pennants strung across towers
    this.drawCastleBunting(ctx, cx + 32, cy + 28, this.w - 64);

    // Birthday Crown Plaque above gate
    const crownX = gx + Math.floor(gw / 2) - 8;
    const crownY = gy - 16;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(crownX - 1, crownY - 1, 18, 9);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(crownX, crownY, 16, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(crownX + 2, crownY + 1, 2, 2);
    ctx.fillRect(crownX + 7, crownY + 1, 2, 2);
    ctx.fillRect(crownX + 12, crownY + 1, 2, 2);

    // 8. Confetti Particles (when unlocked)
    for (const p of this.confetti) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1.0;

    // 9. Floating Proximity Prompt
    if (isPlayerNear) {
      const floatY = gy - 18 + Math.sin(animTime * 6) * 2;
      let promptText = "";
      if (!this.unlocked) {
        promptText = hasKey ? "[U] Unlock Castle" : "[U] Castle Locked";
      } else {
        promptText = "[→] Enter Castle";
      }
      this.drawPromptBubble(ctx, gx + gw / 2, floatY, promptText);
    }

    ctx.restore();
  }

  drawTower(ctx, tx, ty, tw, th, flagColorA, flagColorB, animTime) {
    // Tower Main Stone Pillar
    ctx.fillStyle = '#1e293b'; // Outer outline
    ctx.fillRect(tx - 1, ty - 1, tw + 2, th + 2);

    ctx.fillStyle = '#334155'; // Main slate stone
    ctx.fillRect(tx, ty, tw, th);

    // Left highlight / Right shadow
    ctx.fillStyle = '#475569';
    ctx.fillRect(tx + 1, ty + 1, 3, th - 1);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tx + tw - 4, ty + 1, 3, th - 1);

    // Tower Battlements (top parapet)
    for (let bx = tx; bx < tx + tw; bx += 10) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx, ty - 8, 7, 8);
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx + 1, ty - 7, 5, 7);
    }

    // Conical Roof Turret Cap
    ctx.fillStyle = '#1e1b4b'; // Deep navy cap
    ctx.beginPath();
    ctx.moveTo(tx - 3, ty - 8);
    ctx.lineTo(tx + tw / 2, ty - 26);
    ctx.lineTo(tx + tw + 3, ty - 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = flagColorB; // Inner colorful roof slope
    ctx.beginPath();
    ctx.moveTo(tx - 1, ty - 9);
    ctx.lineTo(tx + tw / 2, ty - 24);
    ctx.lineTo(tx + tw + 1, ty - 9);
    ctx.closePath();
    ctx.fill();

    // Golden Flagpole on apex
    const poleX = tx + Math.floor(tw / 2);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(poleX, ty - 38, 2, 14);

    // Animated Fluttering Pennant
    const wave = Math.sin(animTime * 6) * 3;
    ctx.fillStyle = flagColorA;
    ctx.beginPath();
    ctx.moveTo(poleX + 2, ty - 38);
    ctx.lineTo(poleX + 16 + wave, ty - 34);
    ctx.lineTo(poleX + 2, ty - 30);
    ctx.closePath();
    ctx.fill();

    // Arched stained-glass window in tower
    const winX = tx + Math.floor(tw / 2) - 4;
    const winY = ty + 36;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(winX - 1, winY - 1, 10, 16);
    ctx.fillStyle = '#fde047'; // Warm candle glow
    ctx.fillRect(winX, winY, 8, 14);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(winX + 2, winY + 2, 4, 10);
  }

  drawCastleBunting(ctx, startX, y, length) {
    const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#4ade80'];
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, y);

    for (let x = startX; x < startX + length; x += 14) {
      const dropY = y + Math.sin((x - startX) * 0.14) * 3;
      ctx.lineTo(x, dropY);
      // Hanging triangle flag
      const color = colors[Math.floor(x / 14) % colors.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - 5, dropY);
      ctx.lineTo(x, dropY + 6);
      ctx.lineTo(x + 5, dropY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();
  }

  drawPromptBubble(ctx, centerX, y, text) {
    ctx.font = '6px "Press Start 2P", monospace';
    const textWidth = ctx.measureText(text).width;
    const bubbleW = textWidth + 10;
    const bubbleH = 13;
    const bx = Math.floor(centerX - bubbleW / 2);
    const by = Math.floor(y);

    // Bubble Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(bx, by, bubbleW, bubbleH);

    // Golden Border
    ctx.strokeStyle = '#f6d854';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bubbleW, bubbleH);

    // Downward arrow pointer
    ctx.fillStyle = '#f6d854';
    ctx.beginPath();
    ctx.moveTo(centerX - 3, by + bubbleH);
    ctx.lineTo(centerX + 3, by + bubbleH);
    ctx.lineTo(centerX, by + bubbleH + 3);
    ctx.closePath();
    ctx.fill();

    // Prompt Text
    ctx.fillStyle = '#ffde59';
    ctx.fillText(text, bx + 5, by + 9);
  }
}


