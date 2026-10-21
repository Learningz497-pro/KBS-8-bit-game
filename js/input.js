/**
 * Input Manager Module
 * Normalizes keyboard controls strictly according to project specifications:
 * - ArrowLeft: Move left
 * - ArrowRight: Move right
 * - Space: Jump
 * - D: Reserved exclusively for inventory machine (never moves right)
 * - E: Gift interaction
 * - U: Castle key interaction
 * Prevents browser scrolling and recovers smoothly when focus is lost.
 */

export class InputManager {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
      interactGift: false,
      interactMachine: false,
      interactCastle: false,
      toggleControls: false
    };

    this.enabled = true;

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('blur', () => this.reset());
    window.addEventListener('focus', () => this.reset());
  }

  onKeyDown(e) {
    if (!this.enabled) return;

    // Prevent unwanted page scrolling for game movement controls when game input is active
    if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'ArrowLeft') this.keys.left = true;
    if (e.code === 'ArrowRight') this.keys.right = true;
    if (e.code === 'Space') {
      if (!this.keys.jump) {
        this.keys.jumpPressed = true;
      }
      this.keys.jump = true;
    }

    if (e.code === 'KeyE') this.keys.interactGift = true;
    if (e.code === 'KeyD') this.keys.interactMachine = true;
    if (e.code === 'KeyU') this.keys.interactCastle = true;
    if (e.code === 'KeyH') this.keys.toggleControls = true;
  }

  onKeyUp(e) {
    if (e.code === 'ArrowLeft') this.keys.left = false;
    if (e.code === 'ArrowRight') this.keys.right = false;
    if (e.code === 'Space') {
      this.keys.jump = false;
      this.keys.jumpPressed = false;
    }
    if (e.code === 'KeyE') this.keys.interactGift = false;
    if (e.code === 'KeyD') this.keys.interactMachine = false;
    if (e.code === 'KeyU') this.keys.interactCastle = false;
    if (e.code === 'KeyH') this.keys.toggleControls = false;
  }

  reset() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
  }

  consumeJumpPress() {
    const wasPressed = this.keys.jumpPressed;
    this.keys.jumpPressed = false;
    return wasPressed;
  }

  consumeInteractGift() {
    const wasPressed = this.keys.interactGift;
    this.keys.interactGift = false;
    return wasPressed;
  }

  consumeInteractMachine() {
    const wasPressed = this.keys.interactMachine;
    this.keys.interactMachine = false;
    return wasPressed;
  }

  consumeInteractCastle() {
    const wasPressed = this.keys.interactCastle;
    this.keys.interactCastle = false;
    return wasPressed;
  }

  consumeToggleControls() {
    const wasPressed = this.keys.toggleControls;
    this.keys.toggleControls = false;
    return wasPressed;
  }
}
