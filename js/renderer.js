/**
 * Canvas 2D Renderer Module (Stage 3.5 Coins & Gift Dialog System)
 * Renders the 8-bit game world with crisp pixel-art scaling,
 * parallax background, ground terrain with jumpable gaps, elevated platforms,
 * collectible gold coins, interactive gift boxes with [E] prompts,
 * patrolling party enemies, player character sprite, and HUD.
 */

import { CONFIG } from './config.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Cloud coordinates for peaceful parallax
    this.clouds = [
      { x: 30, y: 25, w: 42, h: 14, speed: 4 },
      { x: 160, y: 45, w: 34, h: 12, speed: 6 },
      { x: 280, y: 20, w: 50, h: 16, speed: 5 }
    ];
  }

  // Clear and render entire scene
  render(gameState, player, cameraX = 0, enemies = [], coins = [], gifts = [], machine = null, castle = null, animTime = 0) {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // 1. Draw Sky Background
    this.drawSky(ctx);

    // 2. Draw Distant Parallax Hills & Clouds
    this.drawBackground(ctx, cameraX);

    // 3. Save context for camera translation
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);

    // 4. Draw Ground & Scenery with Gaps
    this.drawLevelTerrain(ctx, cameraX);

    // 5. Draw Elevated Platforms
    this.drawPlatforms(ctx);

    // 6. Draw Collectible Coins
    this.drawCoins(ctx, coins, animTime);

    // 7. Draw Interactive Gift Boxes & Prompts
    this.drawGifts(ctx, gifts, player, animTime);

    // 8. Draw Inventory Machine Key Dispenser
    if (machine) {
      this.drawMachine(ctx, machine, player, animTime, gameState ? gameState.coinsHeld : 0);
    }

    // 9. Draw Grand Castle Climax & Gate
    if (castle) {
      this.drawCastle(ctx, castle, player, animTime, gameState ? gameState.hasKey : false);
    }

    // 10. Draw Patrolling Enemies
    if (enemies && enemies.length > 0) {
      for (const enemy of enemies) {
        enemy.draw(ctx);
      }
    }

    // 9. Draw Player Character
    if (player) {
      player.draw(ctx);
    }

    ctx.restore();

    // 10. Draw HUD Overlay (fixed in screen space)
    this.drawHUD(ctx, gameState);
  }

  drawSky(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    grad.addColorStop(0, '#5890ff'); // Bright sky blue
    grad.addColorStop(0.65, '#99c2ff'); // Soft pastel blue
    grad.addColorStop(1, '#fde3a7'); // Warm sunset horizon
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  }

  drawBackground(ctx, cameraX) {
    // Soft animated clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (const c of this.clouds) {
      const rx = (c.x - cameraX * 0.1) % (CONFIG.CANVAS_WIDTH + 80) - 40;
      this.drawPixelCloud(ctx, rx, c.y, c.w, c.h);
    }

    // Distant soft purple/blue hills (slow parallax)
    ctx.fillStyle = '#6e7fbd';
    this.drawHills(ctx, cameraX * 0.15, 145, 18, 90);

    // Closer lush green hills
    ctx.fillStyle = '#5c9e42';
    this.drawHills(ctx, cameraX * 0.35, 160, 26, 75);
  }

  drawPixelCloud(ctx, x, y, w, h) {
    ctx.fillRect(x + 4, y, w - 8, h);
    ctx.fillRect(x, y + 3, w, h - 5);
    ctx.fillRect(x + 8, y - 3, w - 16, 4);
  }

  drawHills(ctx, offsetX, baseY, height, waveLength) {
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.CANVAS_HEIGHT);
    for (let x = 0; x <= CONFIG.CANVAS_WIDTH; x += 12) {
      const hillY = baseY - Math.sin((x + offsetX) / waveLength) * height;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  drawLevelTerrain(ctx, cameraX) {
    const groundY = CONFIG.GROUND_Y;
    const segments = CONFIG.GROUND_SEGMENTS || [{ id: 'all', x: 0, w: CONFIG.WORLD_WIDTH }];

    // Render each solid ground segment with cliff edges
    for (const seg of segments) {
      // Grass Top Line
      ctx.fillStyle = '#4ade80'; // Bright 8-bit grass
      ctx.fillRect(seg.x, groundY, seg.w, 4);

      // Dirt Layer
      ctx.fillStyle = '#854d0e'; // Rich earth brown
      ctx.fillRect(seg.x, groundY + 4, seg.w, 20);

      // Deep Stone Layer
      ctx.fillStyle = '#5c330a'; // Deep underground stone
      ctx.fillRect(seg.x, groundY + 24, seg.w, CONFIG.CANVAS_HEIGHT - groundY);

      // Pixel grass tufts on surface
      ctx.fillStyle = '#22c55e';
      for (let x = seg.x; x < seg.x + seg.w; x += 16) {
        ctx.fillRect(x + 4, groundY + 3, 2, 3);
      }

      // Dark edge cliffs on left and right sides of gap
      ctx.fillStyle = '#2d1804';
      ctx.fillRect(seg.x, groundY, 3, CONFIG.CANVAS_HEIGHT - groundY);
      ctx.fillRect(seg.x + seg.w - 3, groundY, 3, CONFIG.CANVAS_HEIGHT - groundY);
    }

    // Decorative retro wild flowers along the path (only on solid ground)
    this.drawFlowers(ctx, groundY, segments);

    // Celebratory bunting across multiple sections
    this.drawPartyBunting(ctx, 40, 50, 400);
    this.drawPartyBunting(ctx, 550, 50, 480);
    this.drawPartyBunting(ctx, 1150, 50, 520);
    this.drawPartyBunting(ctx, 1800, 50, 500);

    // Decorative retro balloons along the path
    this.drawBalloonCluster(ctx, 280, groundY - 45);
    this.drawBalloonCluster(ctx, 750, groundY - 50);
    this.drawBalloonCluster(ctx, 1400, groundY - 45);
    this.drawBalloonCluster(ctx, 1950, groundY - 50);
  }

  drawPlatforms(ctx) {
    const platforms = CONFIG.PLATFORMS || [];

    for (const plat of platforms) {
      const px = Math.floor(plat.x);
      const py = Math.floor(plat.y);
      const pw = Math.floor(plat.w);
      const ph = Math.floor(plat.h);

      // Soft drop shadow below platform
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(px + 2, py + ph, pw - 4, 3);

      // Platform Dark Outline
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px, py, pw, ph);

      // Wooden Plank Body
      ctx.fillStyle = '#92400e';
      ctx.fillRect(px + 1, py + 2, pw - 2, ph - 3);

      // Dark Wood Bottom Trim
      ctx.fillStyle = '#713f12';
      ctx.fillRect(px + 1, py + ph - 2, pw - 2, 1);

      // Top Grass / Green Surface Highlight
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(px + 1, py + 1, pw - 2, 2);

      // Grass tufts / edge highlights
      ctx.fillStyle = '#86efac';
      ctx.fillRect(px + 3, py + 1, 3, 1);
      ctx.fillRect(px + Math.floor(pw / 2) - 2, py + 1, 4, 1);
      ctx.fillRect(px + pw - 6, py + 1, 3, 1);

      // Wooden Planks Vertical Seams
      ctx.fillStyle = '#5c2a08';
      for (let x = px + 18; x < px + pw - 8; x += 20) {
        ctx.fillRect(x, py + 3, 1, ph - 5);
      }

      // Golden Rivets on Corners
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 3, py + 4, 2, 2);
      ctx.fillRect(px + pw - 5, py + 4, 2, 2);
    }
  }

  drawCoins(ctx, coins, animTime) {
    if (!coins) return;
    for (const coin of coins) {
      if (!coin.collected) {
        coin.draw(ctx, animTime);
      }
    }
  }

  drawGifts(ctx, gifts, player, animTime) {
    if (!gifts) return;
    for (const gift of gifts) {
      let isNear = false;
      if (player && !gift.opened) {
        const dx = (player.x + player.width / 2) - (gift.x + gift.w / 2);
        const dy = (player.y + player.height / 2) - (gift.y + gift.h / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 38) {
          isNear = true;
        }
      }
      gift.draw(ctx, animTime, isNear);
    }
  }

  drawMachine(ctx, machine, player, animTime, coinsHeld) {
    if (!machine) return;
    let isNear = false;
    if (player) {
      const dx = (player.x + player.width / 2) - (machine.x + machine.w / 2);
      const dy = (player.y + player.height / 2) - (machine.y + machine.h / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= machine.interactionRange) {
        isNear = true;
      }
    }
    machine.draw(ctx, animTime, isNear, coinsHeld);
  }

  drawCastle(ctx, castle, player, animTime, hasKey) {
    if (!castle) return;
    let isNear = false;
    if (player) {
      const pCenterX = player.x + player.width / 2;
      const pCenterY = player.y + player.height / 2;
      const gCenterX = castle.gate.x + castle.gate.w / 2;
      const gCenterY = castle.gate.y + castle.gate.h / 2;
      const dist = Math.hypot(pCenterX - gCenterX, pCenterY - gCenterY);
      if (dist <= castle.interactionRange) {
        isNear = true;
      }
    }
    castle.draw(ctx, animTime, isNear, hasKey);
  }

  drawFlowers(ctx, groundY, segments = []) {
    const flowerSpots = [
      { x: 120, color: '#f43f5e' },
      { x: 210, color: '#fbbf24' },
      { x: 380, color: '#a855f7' },
      { x: 560, color: '#f43f5e' },
      { x: 700, color: '#38bdf8' },
      { x: 890, color: '#fbbf24' },
      { x: 1160, color: '#f43f5e' },
      { x: 1320, color: '#a855f7' },
      { x: 1550, color: '#38bdf8' },
      { x: 1820, color: '#fbbf24' },
      { x: 2000, color: '#f43f5e' },
      { x: 2150, color: '#fbbf24' }
    ];

    for (const f of flowerSpots) {
      // Check if flower is within any ground segment
      const onGround = segments.some(seg => f.x >= seg.x && f.x <= seg.x + seg.w);
      if (!onGround) continue;

      // Stem
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(f.x + 1, groundY - 4, 1, 4);
      // Petals
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x, groundY - 7, 3, 3);
      // Center
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(f.x + 1, groundY - 6, 1, 1);
    }
  }

  drawBalloonCluster(ctx, x, y) {
    // Strings
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 20);
    ctx.lineTo(x + 4, y + 45);
    ctx.stroke();

    // Balloons
    ctx.fillStyle = '#f43f5e'; // Pink/Red
    ctx.fillRect(x, y, 8, 10);
    ctx.fillRect(x + 1, y - 1, 6, 12);

    ctx.fillStyle = '#38bdf8'; // Sky Blue
    ctx.fillRect(x + 7, y - 4, 8, 10);
    ctx.fillRect(x + 8, y - 5, 6, 12);

    ctx.fillStyle = '#fbbf24'; // Yellow
    ctx.fillRect(x + 4, y - 8, 8, 10);
    ctx.fillRect(x + 5, y - 9, 6, 12);
  }

  drawPartyBunting(ctx, startX, y, length) {
    const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#4ade80'];
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, y);

    for (let x = startX; x < startX + length; x += 16) {
      const dropY = y + Math.sin((x - startX) * 0.1) * 3;
      ctx.lineTo(x, dropY);
      // Hanging triangle flag
      const color = colors[Math.floor(x / 16) % colors.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - 6, dropY);
      ctx.lineTo(x, dropY + 8);
      ctx.lineTo(x + 6, dropY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();
  }

  drawHUD(ctx, gameState) {
    ctx.font = '8px "Press Start 2P", monospace';

    // Top-Left Panel: Coins & Bank HUD (Wide enough for 200/200 and bank)
    ctx.fillStyle = 'rgba(15, 15, 25, 0.75)';
    ctx.fillRect(6, 6, 202, 22);
    ctx.strokeStyle = '#f6d854';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, 202, 22);

    // Coins Held out of TOTAL_IN_LEVEL (200)
    ctx.fillStyle = '#ffde59';
    ctx.fillText(`🪙 ${gameState.coinsHeld}/${CONFIG.COINS.TOTAL_IN_LEVEL}`, 12, 20);

    // Coins Deposited out of REQUIRED_FOR_KEY (40)
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(`🏦 ${gameState.coinsDeposited}/${CONFIG.COINS.REQUIRED_FOR_KEY}`, 114, 20);

    // Top-Right Panel: Key Status (Shifted left by 36px to give clean clearance for ? controls button)
    const keyBoxX = CONFIG.CANVAS_WIDTH - 134;
    ctx.fillStyle = 'rgba(15, 15, 25, 0.75)';
    ctx.fillRect(keyBoxX, 6, 96, 22);
    ctx.strokeStyle = gameState.hasKey ? '#fbbf24' : '#64748b';
    ctx.strokeRect(keyBoxX, 6, 96, 22);

    if (gameState.hasKey) {
      ctx.fillStyle = '#fde047';
      ctx.fillText(`🔑 KEY: YES`, keyBoxX + 6, 20);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`🔑 KEY: NO`, keyBoxX + 6, 20);
    }
  }
}
