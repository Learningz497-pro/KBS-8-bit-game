/**
 * Main Game Loop & State Manager (Stage 3.7 Castle Climax, Key Unlock & Final Redirect)
 * Orchestrates player physics, platform collisions, ground gaps, collectible coins (100 total),
 * interactive gift dialogs, 8-bit inventory vending machine (40-coin key dispenser),
 * Grand Castle Climax (U key unlock, gate opening, entrance trigger & final video redirect),
 * enemies, camera tracking, and rendering.
 */

import { CONFIG } from './config.js';
import { Renderer } from './renderer.js?v=7';
import { Player } from './player.js?v=7';
import { InputManager } from './input.js?v=7';
import { Enemy } from './enemy.js?v=7';
import { Coin, Gift, Machine, Castle } from './collectibles.js?v=7';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    if (this.canvas) {
      this.canvas.width = CONFIG.CANVAS_WIDTH;
      this.canvas.height = CONFIG.CANVAS_HEIGHT;
      this.renderer = new Renderer(this.canvas);
    }
    this.input = new InputManager();

    // Initial state strictly matching locked economy and progression rules
    this.state = {
      coinsHeld: 0,
      coinsDeposited: 0,
      hasKey: false,
      keyUsed: false,
      machineCompleted: false,
      castleUnlocked: false,
      isTransitioning: false,
      activeModal: null,
      isPaused: false
    };

    // Level data: ground segments, platforms, and checkpoints
    this.levelData = {
      groundSegments: CONFIG.GROUND_SEGMENTS,
      platforms: CONFIG.PLATFORMS,
      checkpoints: CONFIG.CHECKPOINTS
    };

    // Spawn player standing on the ground (Ground Y = 175, Player height = 58 -> Y = 117)
    this.player = new Player(60, CONFIG.GROUND_Y - 58);
    this.cameraX = 0;
    this.animTime = 0;

    // Initialize patrolling party enemies
    this.enemies = CONFIG.ENEMIES.map(cfg => new Enemy(cfg));

    // Initialize exactly 100 collectible coins
    this.coins = CONFIG.COIN_LIST.map(cfg => new Coin(cfg));

    // Initialize multiple gifts
    this.gifts = CONFIG.GIFTS.map(cfg => new Gift(cfg));

    // Initialize Inventory Machine at ~75% level mark
    this.machine = new Machine(CONFIG.MACHINE);
    this.machineSubState = null; // 'CONFIRM' | 'INSUFFICIENT' | 'REWARD' | 'COMPLETED'

    // Initialize Grand Castle Climax at level end (~2220px)
    this.castle = new Castle(CONFIG.CASTLE);
    this.castleSubState = null; // 'LOCKED' | 'CONFIRM'

    // Modal DOM references & listeners
    this.modalOpenTime = 0;
    this.initModalUI();

    this.lastTime = 0;
    this.init();
  }

  initModalUI() {
    this.modalContainer = document.getElementById('modal-container');
    
    // Gift Modal elements
    this.giftModal = document.getElementById('gift-modal');
    this.giftTitle = document.getElementById('gift-modal-title');
    this.giftText = document.getElementById('gift-modal-text');
    this.btnGiftOkay = document.getElementById('btn-gift-okay');

    if (this.btnGiftOkay) {
      this.btnGiftOkay.addEventListener('click', () => this.closeGiftModal());
    }

    // Machine Modal elements
    this.machineModal = document.getElementById('machine-modal');
    this.machineModalTitle = document.getElementById('machine-modal-title');
    this.machineModalDesc = document.getElementById('machine-modal-desc');
    this.machineStatusRow = document.getElementById('machine-status-row');
    this.machineCoinsHeld = document.getElementById('machine-coins-held');
    this.machineCoinsReq = document.getElementById('machine-coins-required');
    this.machineStatusMsg = document.getElementById('machine-status-msg');
    this.btnMachineConfirm = document.getElementById('btn-machine-confirm');
    this.btnMachineCancel = document.getElementById('btn-machine-cancel');
    this.btnMachineClose = document.getElementById('btn-machine-close');

    if (this.btnMachineConfirm) {
      this.btnMachineConfirm.addEventListener('click', () => this.confirmMachineDeposit());
    }
    if (this.btnMachineCancel) {
      this.btnMachineCancel.addEventListener('click', () => this.closeMachineModal());
    }
    if (this.btnMachineClose) {
      this.btnMachineClose.addEventListener('click', () => this.closeMachineModal());
    }

    // Castle Modal elements
    this.castleModal = document.getElementById('castle-modal');
    this.castleModalTitle = document.getElementById('castle-modal-title');
    this.castleModalDesc = document.getElementById('castle-modal-desc');
    this.btnCastleConfirm = document.getElementById('btn-castle-confirm');
    this.btnCastleCancel = document.getElementById('btn-castle-cancel');
    this.btnCastleClose = document.getElementById('btn-castle-close');

    if (this.btnCastleConfirm) {
      this.btnCastleConfirm.addEventListener('click', () => this.confirmCastleUnlock());
    }
    if (this.btnCastleCancel) {
      this.btnCastleCancel.addEventListener('click', () => this.closeCastleModal());
    }
    if (this.btnCastleClose) {
      this.btnCastleClose.addEventListener('click', () => this.closeCastleModal());
    }

    // Victory Fallback Modal elements
    this.victoryModal = document.getElementById('victory-modal');
    this.victoryTitle = document.getElementById('victory-title');
    this.victoryText = document.getElementById('victory-text');
    this.btnSurprise = document.getElementById('btn-surprise');
    this.btnReplay = document.getElementById('btn-replay');

    if (this.btnSurprise) {
      this.btnSurprise.addEventListener('click', () => this.handleSurpriseClick());
    }
    if (this.btnReplay) {
      this.btnReplay.addEventListener('click', () => this.handleReplayClick());
    }

    // Controls & Help Modal elements
    this.controlsModal = document.getElementById('controls-modal');
    this.btnControlsIcon = document.getElementById('btn-controls-icon');
    this.btnControlsClose = document.getElementById('btn-controls-close');

    if (this.btnControlsIcon) {
      this.btnControlsIcon.addEventListener('click', () => {
        if (this.state.activeModal === 'CONTROLS') {
          this.closeControlsModal();
        } else if (!this.state.activeModal) {
          this.openControlsModal();
        }
      });
    }
    if (this.btnControlsClose) {
      this.btnControlsClose.addEventListener('click', () => this.closeControlsModal());
    }

    // Modal keyboard dismissal and confirmation handlers
    window.addEventListener('keydown', (e) => {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const elapsed = now - this.modalOpenTime;

      if (this.state.activeModal === 'CONTROLS') {
        if (['Enter', 'Space', 'Escape', 'KeyH'].includes(e.code) && elapsed > 150) {
          e.preventDefault();
          this.closeControlsModal();
        }
      } else if (!this.state.activeModal && e.code === 'KeyH') {
        e.preventDefault();
        this.openControlsModal();
      } else if (this.state.activeModal === 'GIFT') {
        if (['Enter', 'Space', 'Escape'].includes(e.code) || (e.code === 'KeyE' && elapsed > 280)) {
          e.preventDefault();
          this.closeGiftModal();
        }
      } else if (this.state.activeModal === 'MACHINE') {
        if (this.machineSubState === 'CONFIRM') {
          if (e.code === 'Enter' && elapsed > 200) {
            e.preventDefault();
            this.confirmMachineDeposit();
          } else if ((e.code === 'Escape' || (e.code === 'KeyD' && elapsed > 280))) {
            e.preventDefault();
            this.closeMachineModal();
          }
        } else {
          // Insufficient, Reward or Completed state: Enter/Space/Escape/D closes
          if (['Enter', 'Space', 'Escape'].includes(e.code) || (e.code === 'KeyD' && elapsed > 280)) {
            e.preventDefault();
            this.closeMachineModal();
          }
        }
      } else if (this.state.activeModal === 'CASTLE') {
        if (this.castleSubState === 'CONFIRM') {
          if (e.code === 'Enter' && elapsed > 200) {
            e.preventDefault();
            this.confirmCastleUnlock();
          } else if ((e.code === 'Escape' || (e.code === 'KeyU' && elapsed > 280))) {
            e.preventDefault();
            this.closeCastleModal();
          }
        } else {
          // Locked notification state: Enter/Space/Escape/U closes
          if (['Enter', 'Space', 'Escape'].includes(e.code) || (e.code === 'KeyU' && elapsed > 280)) {
            e.preventDefault();
            this.closeCastleModal();
          }
        }
      } else if (this.state.activeModal === 'VICTORY') {
        if (['Enter', 'Space'].includes(e.code) && elapsed > 200) {
          e.preventDefault();
          this.handleSurpriseClick();
        }
      }
    });
  }

  init() {
    console.log("🎮 Birthday Adventure Game Initialized (Expanded 5000px World)");
    console.log(`Resolution: ${CONFIG.CANVAS_WIDTH}x${CONFIG.CANVAS_HEIGHT} (16:9 pixel-crisp)`);
    console.log(`World Width: ${CONFIG.WORLD_WIDTH}px (5 Sections, 12 Gifts, 200 Coins, 15 Enemies)`);
    console.log(`Controls: ArrowLeft/Right move, Space jump (Hold: higher, Double: extra-high), E gift, D machine, U castle, H / ? help.`);

    // Optional test params for headless visual inspection
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('testModal') === 'controls') {
        this.openControlsModal();
      } else if (params.get('testModal') === 'gift' && this.gifts[0]) {
        this.openGiftModal(this.gifts[0]);
      } else if (params.get('testModal') === 'machine_insufficient') {
        this.state.coinsHeld = 35;
        this.player.x = 3720;
        this.cameraX = 3600;
        this.openMachineModal();
      } else if (params.get('testModal') === 'machine_confirm') {
        this.state.coinsHeld = 65;
        this.player.x = 3720;
        this.cameraX = 3600;
        this.openMachineModal();
      } else if (params.get('testModal') === 'machine_reward') {
        this.state.coinsHeld = 65;
        this.player.x = 3720;
        this.cameraX = 3600;
        this.openMachineModal();
        this.confirmMachineDeposit();
      } else if (params.get('testModal') === 'machine_proximity') {
        this.state.coinsHeld = 45;
        this.player.x = 3725;
        this.cameraX = 3600;
      } else if (params.get('testModal') === 'castle_locked') {
        this.state.hasKey = false;
        this.player.x = 4820;
        this.cameraX = 4616;
        this.openCastleModal();
      } else if (params.get('testModal') === 'castle_confirm') {
        this.state.hasKey = true;
        this.state.coinsHeld = 25;
        this.state.coinsDeposited = 40;
        this.player.x = 4820;
        this.cameraX = 4616;
        this.openCastleModal();
      } else if (params.get('testModal') === 'castle_unlocked') {
        this.state.hasKey = true;
        this.state.castleUnlocked = true;
        this.state.keyUsed = true;
        this.player.x = 4820;
        this.cameraX = 4616;
        this.castle.unlock();
      } else if (params.get('testModal') === 'castle_victory') {
        this.state.hasKey = true;
        this.state.castleUnlocked = true;
        this.state.keyUsed = true;
        this.player.x = 4865;
        this.cameraX = 4616;
        this.castle.unlock();
        this.triggerFinalEntrance();
      } else if (params.get('testModal') === 'castle_proximity') {
        this.state.hasKey = true;
        this.state.coinsHeld = 25;
        this.state.coinsDeposited = 40;
        this.player.x = 4820;
        this.cameraX = 4616;
      } else if (params.get('testModal') === 'castle_locked_proximity') {
        this.state.hasKey = false;
        this.player.x = 4820;
        this.cameraX = 4616;
      }

      if (params.get('testSection') === '2') {
        this.player.x = 1140;
        this.cameraX = 1000;
      } else if (params.get('testSection') === '3') {
        this.player.x = 2100;
        this.cameraX = 1960;
      } else if (params.get('testSection') === '4') {
        this.player.x = 3600;
        this.cameraX = 3500;
      } else if (params.get('testSection') === '5') {
        this.player.x = 4650;
        this.cameraX = 4500;
      }
    }

    // Start game loop
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.animTime += dt;
    const isBlocked = this.state.isPaused || !!this.state.activeModal;

    // Check controls panel toggle
    if (this.input.consumeToggleControls()) {
      if (this.state.activeModal === 'CONTROLS') {
        this.closeControlsModal();
      } else if (!this.state.activeModal) {
        this.openControlsModal();
      }
    }

    // 1. Update player physics & movement with level platform/gap data
    this.player.update(dt, this.input, isBlocked, this.levelData);

    // 2. If gameplay is not blocked: update enemies, machine, castle, collect coins, check interactions
    if (!isBlocked) {
      for (const enemy of this.enemies) {
        enemy.update(dt);
      }
      this.machine.update(dt);
      this.castle.update(dt);
      this.checkEnemyCollisions();
      this.checkCoinCollections();
      this.checkGiftInteractions();
      this.checkMachineInteraction();
      this.checkCastleInteraction();
      this.checkCastleEntranceTrigger();
    }

    // 3. Smooth side-scrolling camera follow
    // Keep player in the left-third to center of the viewport
    const targetCamX = this.player.x - CONFIG.CANVAS_WIDTH / 3;
    const maxCamX = CONFIG.WORLD_WIDTH - CONFIG.CANVAS_WIDTH;
    const clampedCamX = Math.max(0, Math.min(targetCamX, maxCamX));

    // Smooth lerp follow
    this.cameraX += (clampedCamX - this.cameraX) * 0.12;
  }

  checkCoinCollections() {
    const pLeft = this.player.x + 4;
    const pRight = this.player.x + this.player.width - 4;
    const pTop = this.player.y;
    const pBottom = this.player.y + this.player.height;

    for (const coin of this.coins) {
      if (coin.collected) continue;

      // Reliable AABB collision overlap
      const cLeft = coin.x;
      const cRight = coin.x + coin.w;
      const cTop = coin.y;
      const cBottom = coin.y + coin.h;

      if (pRight > cLeft && pLeft < cRight && pBottom > cTop && pTop < cBottom) {
        const collected = coin.collect();
        if (collected) {
          this.state.coinsHeld++;
        }
      }
    }
  }

  checkGiftInteractions() {
    if (!this.input.keys.interactGift) return;

    const pCenterX = this.player.x + this.player.width / 2;
    const pCenterY = this.player.y + this.player.height / 2;

    for (const gift of this.gifts) {
      if (gift.opened) continue;

      const gCenterX = gift.x + gift.w / 2;
      const gCenterY = gift.y + gift.h / 2;
      const dist = Math.hypot(pCenterX - gCenterX, pCenterY - gCenterY);

      // Interaction range within 38px
      if (dist <= 38) {
        this.input.consumeInteractGift();
        this.openGiftModal(gift);
        break;
      }
    }
  }

  openGiftModal(gift) {
    const opened = gift.open();
    if (!opened) return;

    this.state.activeModal = 'GIFT';
    this.modalOpenTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    if (this.giftTitle) this.giftTitle.textContent = gift.title;
    if (this.giftText) this.giftText.textContent = gift.message;

    if (this.modalContainer) this.modalContainer.classList.remove('hidden');
    if (this.giftModal) this.giftModal.classList.remove('hidden');

    // Reset keyboard states so movement ceases immediately
    this.input.reset();
  }

  closeGiftModal() {
    if (this.giftModal) this.giftModal.classList.add('hidden');
    if (this.modalContainer) this.modalContainer.classList.add('hidden');

    this.state.activeModal = null;
    this.input.reset();
  }

  checkMachineInteraction() {
    if (!this.input.keys.interactMachine) return;

    const pCenterX = this.player.x + this.player.width / 2;
    const pCenterY = this.player.y + this.player.height / 2;
    const mCenterX = this.machine.x + this.machine.w / 2;
    const mCenterY = this.machine.y + this.machine.h / 2;
    const dist = Math.hypot(pCenterX - mCenterX, pCenterY - mCenterY);

    if (dist <= this.machine.interactionRange) {
      this.input.consumeInteractMachine();
      this.openMachineModal();
    }
  }

  openMachineModal() {
    this.state.activeModal = 'MACHINE';
    this.modalOpenTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    if (this.modalContainer) this.modalContainer.classList.remove('hidden');
    if (this.machineModal) this.machineModal.classList.remove('hidden');

    // Case 1: Machine already completed / Key already dispensed
    if (this.state.hasKey || this.machine.keyDispensed) {
      this.machineSubState = 'COMPLETED';
      if (this.machineModalTitle) this.machineModalTitle.textContent = "🏧 Key Dispenser Machine";
      if (this.machineModalDesc) this.machineModalDesc.textContent = "Machine Empty - The Golden Castle Key has already been dispensed! 🗝️ Head towards the Castle Gate at the end of the world!";
      if (this.machineStatusRow) this.machineStatusRow.classList.add('hidden');
      if (this.machineStatusMsg) this.machineStatusMsg.textContent = "";
      if (this.btnMachineConfirm) this.btnMachineConfirm.classList.add('hidden');
      if (this.btnMachineCancel) this.btnMachineCancel.classList.add('hidden');
      if (this.btnMachineClose) this.btnMachineClose.classList.remove('hidden');
    }
    // Case 2: Insufficient Coins (coinsHeld < 40)
    else if (this.state.coinsHeld < CONFIG.COINS.REQUIRED_FOR_KEY) {
      this.machineSubState = 'INSUFFICIENT';
      const needed = CONFIG.COINS.REQUIRED_FOR_KEY - this.state.coinsHeld;
      if (this.machineModalTitle) this.machineModalTitle.textContent = "🏧 Key Dispenser Machine";
      if (this.machineModalDesc) this.machineModalDesc.textContent = "Not enough coins to unlock the Golden Castle Key!";
      if (this.machineStatusRow) this.machineStatusRow.classList.remove('hidden');
      if (this.machineCoinsHeld) this.machineCoinsHeld.textContent = this.state.coinsHeld;
      if (this.machineCoinsReq) this.machineCoinsReq.textContent = CONFIG.COINS.REQUIRED_FOR_KEY;
      if (this.machineStatusMsg) this.machineStatusMsg.textContent = `Collect ${needed} more coin${needed > 1 ? 's' : ''} to unlock the key.`;
      if (this.btnMachineConfirm) this.btnMachineConfirm.classList.add('hidden');
      if (this.btnMachineCancel) this.btnMachineCancel.classList.add('hidden');
      if (this.btnMachineClose) this.btnMachineClose.classList.remove('hidden');
    }
    // Case 3: Sufficient Coins (coinsHeld >= 40) - Confirmation Prompt
    else {
      this.machineSubState = 'CONFIRM';
      const remaining = this.state.coinsHeld - CONFIG.COINS.REQUIRED_FOR_KEY;
      if (this.machineModalTitle) this.machineModalTitle.textContent = "🏧 Key Dispenser Machine";
      if (this.machineModalDesc) this.machineModalDesc.textContent = "Deposit 40 coins into the machine to unlock the Golden Castle Key?";
      if (this.machineStatusRow) this.machineStatusRow.classList.remove('hidden');
      if (this.machineCoinsHeld) this.machineCoinsHeld.textContent = this.state.coinsHeld;
      if (this.machineCoinsReq) this.machineCoinsReq.textContent = CONFIG.COINS.REQUIRED_FOR_KEY;
      if (this.machineStatusMsg) this.machineStatusMsg.textContent = `You will retain ${remaining} coins after this transaction.`;
      if (this.btnMachineConfirm) this.btnMachineConfirm.classList.remove('hidden');
      if (this.btnMachineCancel) this.btnMachineCancel.classList.remove('hidden');
      if (this.btnMachineClose) this.btnMachineClose.classList.add('hidden');
    }

    // Reset input to stop player motion immediately
    this.input.reset();
  }

  confirmMachineDeposit() {
    // Guards
    if (this.state.activeModal !== 'MACHINE' || this.machineSubState !== 'CONFIRM') return;
    if (this.state.hasKey || this.machine.keyDispensed) return;
    if (this.state.coinsHeld < CONFIG.COINS.REQUIRED_FOR_KEY) return;

    // Atomic transaction execution
    this.state.coinsHeld -= CONFIG.COINS.REQUIRED_FOR_KEY;
    this.state.coinsDeposited += CONFIG.COINS.REQUIRED_FOR_KEY;
    this.state.hasKey = true;
    this.state.machineCompleted = true;
    this.machine.dispenseKey();

    // Transition modal to Reward View
    this.machineSubState = 'REWARD';
    if (this.machineModalTitle) this.machineModalTitle.textContent = "✨ KEY UNLOCKED! ✨";
    if (this.machineModalDesc) this.machineModalDesc.textContent = "You received the Golden Castle Key! 🗝️✨";
    if (this.machineStatusRow) this.machineStatusRow.classList.remove('hidden');
    if (this.machineCoinsHeld) this.machineCoinsHeld.textContent = this.state.coinsHeld;
    if (this.machineCoinsReq) this.machineCoinsReq.textContent = `${this.state.coinsDeposited}/${CONFIG.COINS.REQUIRED_FOR_KEY} (Paid)`;
    if (this.machineStatusMsg) this.machineStatusMsg.textContent = `Transaction successful! Remaining balance: ${this.state.coinsHeld} coins.`;
    if (this.btnMachineConfirm) this.btnMachineConfirm.classList.add('hidden');
    if (this.btnMachineCancel) this.btnMachineCancel.classList.add('hidden');
    if (this.btnMachineClose) this.btnMachineClose.classList.remove('hidden');
  }

  closeMachineModal() {
    if (this.machineModal) this.machineModal.classList.add('hidden');
    if (this.modalContainer) this.modalContainer.classList.add('hidden');

    this.state.activeModal = null;
    this.machineSubState = null;
    this.input.reset();
  }

  checkCastleInteraction() {
    if (!this.input.keys.interactCastle) return;

    const pCenterX = this.player.x + this.player.width / 2;
    const pCenterY = this.player.y + this.player.height / 2;
    const gCenterX = this.castle.gate.x + this.castle.gate.w / 2;
    const gCenterY = this.castle.gate.y + this.castle.gate.h / 2;
    const dist = Math.hypot(pCenterX - gCenterX, pCenterY - gCenterY);

    if (dist <= this.castle.interactionRange) {
      this.input.consumeInteractCastle();
      this.openCastleModal();
    }
  }

  openCastleModal() {
    // If castle already unlocked, do not show any modal
    if (this.state.castleUnlocked) {
      this.castleSubState = 'LOCKED';
      if (this.btnCastleConfirm) this.btnCastleConfirm.classList.add('hidden');
      return;
    }

    this.state.activeModal = 'CASTLE';
    this.modalOpenTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    if (this.modalContainer) this.modalContainer.classList.remove('hidden');
    if (this.castleModal) this.castleModal.classList.remove('hidden');

    // Case 1: Player does NOT own the key
    if (!this.state.hasKey) {
      this.castleSubState = 'LOCKED';
      if (this.castleModalTitle) this.castleModalTitle.textContent = "🏰 Castle Gate";
      if (this.castleModalDesc) this.castleModalDesc.textContent = "The castle is locked. Find the Golden Castle Key first!";
      if (this.btnCastleConfirm) this.btnCastleConfirm.classList.add('hidden');
      if (this.btnCastleCancel) this.btnCastleCancel.classList.add('hidden');
      if (this.btnCastleClose) this.btnCastleClose.classList.remove('hidden');
    }
    // Case 2: Player owns the key and gate is locked (Confirmation Prompt)
    else {
      this.castleSubState = 'CONFIRM';
      if (this.castleModalTitle) this.castleModalTitle.textContent = "🏰 Castle Gate";
      if (this.castleModalDesc) this.castleModalDesc.textContent = "UNLOCK THE CASTLE?\n\nUse the Golden Castle Key to open the entrance?";
      if (this.btnCastleConfirm) this.btnCastleConfirm.classList.remove('hidden');
      if (this.btnCastleCancel) this.btnCastleCancel.classList.remove('hidden');
      if (this.btnCastleClose) this.btnCastleClose.classList.add('hidden');
    }

    this.input.reset();
  }

  confirmCastleUnlock() {
    // Guards
    if (this.state.activeModal !== 'CASTLE' || this.castleSubState !== 'CONFIRM') return;
    if (!this.state.hasKey || this.state.castleUnlocked) return;

    // Atomic unlock transaction
    this.state.castleUnlocked = true;
    this.state.keyUsed = true;
    this.castle.unlock();

    // Close modal and resume gameplay so player walks inside doorway to trigger redirect
    this.closeCastleModal();
  }

  closeCastleModal() {
    if (this.castleModal) this.castleModal.classList.add('hidden');
    if (this.modalContainer && this.state.activeModal !== 'VICTORY') {
      this.modalContainer.classList.add('hidden');
    }

    this.state.activeModal = null;
    this.castleSubState = null;
    this.input.reset();
  }

  openControlsModal() {
    if (this.state.activeModal && this.state.activeModal !== 'CONTROLS') return;
    this.state.activeModal = 'CONTROLS';
    this.modalOpenTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    if (this.modalContainer) this.modalContainer.classList.remove('hidden');
    if (this.controlsModal) this.controlsModal.classList.remove('hidden');

    this.input.reset();
  }

  closeControlsModal() {
    if (this.controlsModal) this.controlsModal.classList.add('hidden');
    if (this.modalContainer && this.state.activeModal !== 'VICTORY') {
      this.modalContainer.classList.add('hidden');
    }

    this.state.activeModal = null;
    this.input.reset();
  }

  checkCastleEntranceTrigger() {
    if (!this.state.castleUnlocked || this.state.isTransitioning || !!this.state.activeModal) return;

    const pLeft = this.player.x + 6;
    const pRight = this.player.x + this.player.width - 6;
    const pTop = this.player.y;
    const pBottom = this.player.y + this.player.height;

    const tLeft = this.castle.entranceTrigger.x;
    const tRight = this.castle.entranceTrigger.x + this.castle.entranceTrigger.w;
    const tTop = this.castle.entranceTrigger.y;
    const tBottom = this.castle.entranceTrigger.y + this.castle.entranceTrigger.h;

    // Fires when player physically enters the open doorway
    if (pRight > tLeft && pLeft < tRight && pBottom > tTop && pTop < tBottom) {
      this.triggerFinalEntrance();
    }
  }

  triggerFinalEntrance() {
    if (this.state.isTransitioning) return;
    this.state.isTransitioning = true;
    this.input.reset();

    // If BIRTHDAY_VIDEO_URL is configured with a valid destination, redirect directly
    if (CONFIG.BIRTHDAY_VIDEO_URL && CONFIG.BIRTHDAY_VIDEO_URL.trim().length > 0) {
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = CONFIG.BIRTHDAY_VIDEO_URL.trim();
      }
    }
    // No popup message or victory modal is shown
  }

  handleSurpriseClick() {
    if (CONFIG.BIRTHDAY_VIDEO_URL && CONFIG.BIRTHDAY_VIDEO_URL.trim().length > 0) {
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = CONFIG.BIRTHDAY_VIDEO_URL.trim();
      }
    } else {
      this.handleReplayClick();
    }
  }

  handleReplayClick() {
    if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
      window.location.reload();
    }
  }

  checkEnemyCollisions() {
    for (const enemy of this.enemies) {
      if (enemy.isRemoved || enemy.isDefeated) continue;

      // Player and enemy horizontal overlap
      const pLeft = this.player.x + 6;
      const pRight = this.player.x + this.player.width - 6;
      const eLeft = enemy.x;
      const eRight = enemy.x + enemy.w;

      const horizOverlap = pRight > eLeft && pLeft < eRight;
      if (!horizOverlap) continue;

      // Vertical positions
      const pFeet = this.player.y + this.player.height;
      const pTop = this.player.y;
      const eTop = enemy.y;
      const eBottom = enemy.y + enemy.h;

      const vertOverlap = pFeet >= eTop && pTop <= eBottom;
      if (!vertOverlap) continue;

      // Jump-Stomp Condition:
      // Player is descending (vy > 0) and feet hit the upper zone of the enemy
      if (this.player.vy > 0 && pFeet <= eTop + 10) {
        const stomped = enemy.defeat();
        if (stomped) {
          this.player.bounce();
        }
      } else {
        // Side / bottom collision: forgiving damage knockback and invulnerability
        this.player.takeDamage(enemy.x + enemy.w / 2);
      }
    }
  }

  render() {
    if (!this.renderer) return;
    this.renderer.render(
      this.state,
      this.player,
      this.cameraX,
      this.enemies,
      this.coins,
      this.gifts,
      this.machine,
      this.castle,
      this.animTime
    );
  }
}

// Instantiate game when DOM is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.__gameInstance = new Game();
  });
}

export { Game };
