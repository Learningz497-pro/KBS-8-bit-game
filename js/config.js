/**
 * Central Configuration for Birthday Adventure Game
 * Expanded Milestone: 5000px World, 5 Gameplay Sections, 12 Gifts, 200 Coins, 15 Enemies
 * All values are configurable and strictly respect locked requirements.
 */

export const CONFIG = {
  // Screen & Rendering dimensions (Logical 16:9 pixel resolution)
  CANVAS_WIDTH: 384,
  CANVAS_HEIGHT: 216,
  WORLD_WIDTH: 5000,
  GROUND_Y: 175,

  // Physics constants (with 3-mode jump mechanics)
  PHYSICS: {
    GRAVITY: 820,
    MOVE_SPEED: 110,
    JUMP_IMPULSE: 275,           // Mode A & B base jump impulse
    DOUBLE_JUMP_IMPULSE: 255,    // Mode C extra high-jump impulse boost
    DOUBLE_JUMP_WINDOW: 0.32,    // 320ms window for double-press detection
    ACCELERATION: 800,
    FRICTION: 900,
    COYOTE_TIME: 0.1,            // 100ms
    JUMP_BUFFER: 0.1             // 100ms
  },

  // Locked Coin Economy (200 total, exactly 40 required for key deposit)
  COINS: {
    TOTAL_IN_LEVEL: 200,         // Exactly 200 coins in level
    REQUIRED_FOR_KEY: 40         // Fixed deposit requirement
  },

  // Inventory Machine parameters (Placed at ~75% of 5000px world = 3750px)
  MACHINE: {
    id: 'inventory_machine',
    x: 3750,
    y: 109,                      // Sits on Ground 8 (175 - 66), height 66px > player 58px
    w: 36,
    h: 66,
    interactionRange: 44,        // Proximity activation distance
    depositRequired: 40          // Exactly 40 coins required for the key
  },

  // Final Castle Climax & Gate (Placed near the end of the world: 4800..4950px)
  CASTLE: {
    id: 'birthday_castle',
    x: 4800,
    y: 45,                       // Sits on Ground 9 (175 - 130), 130px tall majestic castle
    w: 150,
    h: 130,
    gate: {
      x: 4850,
      y: 115,
      w: 50,
      h: 60
    },
    entranceTrigger: {
      x: 4860,
      y: 115,
      w: 30,
      h: 60
    },
    interactionRange: 50         // Proximity activation distance for U key
  },

  // Level Geometry: 9 Ground Segments with 8 jumpable chasms/gaps
  GROUND_SEGMENTS: [
    // Section 1: The Beginning (0..1045)
    { id: 'ground_1', x: 0, w: 560 },        // 0 to 560 (Gap 1: 560-625 = 65px)
    { id: 'ground_2', x: 625, w: 420 },      // 625 to 1045 (Gap 2: 1045-1120 = 75px)

    // Section 2: The First Challenge (1120..2000)
    { id: 'ground_3', x: 1120, w: 380 },     // 1120 to 1500 (Gap 3: 1500-1580 = 80px)
    { id: 'ground_4', x: 1580, w: 420 },     // 1580 to 2000 (Gap 4: 2000-2085 = 85px)

    // Section 3: The Lost Gifts (2085..2980)
    { id: 'ground_5', x: 2085, w: 340 },     // 2085 to 2425 (Gap 5: 2425-2515 = 90px)
    { id: 'ground_6', x: 2515, w: 465 },     // 2515 to 2980 (Gap 6: 2980-3070 = 90px)

    // Section 4: The Coin Challenge (3070..4100)
    { id: 'ground_7', x: 3070, w: 420 },     // 3070 to 3490 (Gap 7: 3490-3580 = 90px)
    { id: 'ground_8', x: 3580, w: 520 },     // 3580 to 4100 (Machine at 3750, Gap 8: 4100-4190 = 90px)

    // Section 5: The Final Journey (4190..5000)
    { id: 'ground_9', x: 4190, w: 810 }      // 4190 to 5000 (Castle at 4800)
  ],

  // Elevated Platforms (One-way jump-through platforms & stepping stones)
  PLATFORMS: [
    // Section 1: The Beginning
    { id: 'plat_1', x: 240, y: 135, w: 70, h: 10 },
    { id: 'plat_bridge_1', x: 570, y: 130, w: 50, h: 10 }, // Stepping stone over Gap 1
    { id: 'plat_2', x: 760, y: 130, w: 80, h: 10 },

    // Section 2: The First Challenge
    { id: 'plat_bridge_2', x: 1055, y: 130, w: 55, h: 10 },// Stepping stone over Gap 2
    { id: 'plat_3', x: 1220, y: 125, w: 75, h: 10 },
    { id: 'plat_4', x: 1360, y: 95, w: 65, h: 10 },        // High platform for Gift #3
    { id: 'plat_bridge_3', x: 1510, y: 130, w: 55, h: 10 },// Stepping stone over Gap 3
    { id: 'plat_5', x: 1720, y: 125, w: 75, h: 10 },
    { id: 'plat_6', x: 1860, y: 90, w: 70, h: 10 },

    // Section 3: The Lost Gifts
    { id: 'plat_bridge_4', x: 2015, y: 130, w: 55, h: 10 },// Stepping stone over Gap 4
    { id: 'plat_7', x: 2150, y: 125, w: 60, h: 10 },
    { id: 'plat_8', x: 2260, y: 85, w: 60, h: 10 },        // High perch for Gift #5
    { id: 'plat_bridge_5a', x: 2435, y: 135, w: 40, h: 10 },// Lower stepping stone over Gap 5
    { id: 'plat_bridge_5b', x: 2475, y: 95, w: 40, h: 10 }, // Upper stepping stone over Gap 5
    { id: 'plat_9', x: 2600, y: 120, w: 70, h: 10 },
    { id: 'plat_10', x: 2730, y: 80, w: 65, h: 10 },       // High perch for Gift #6
    { id: 'plat_11', x: 2850, y: 120, w: 70, h: 10 },

    // Section 4: The Coin Challenge & Inventory Machine
    { id: 'plat_bridge_6', x: 2995, y: 130, w: 60, h: 10 },// Stepping stone over Gap 6
    { id: 'plat_12', x: 3140, y: 120, w: 75, h: 10 },
    { id: 'plat_13', x: 3270, y: 85, w: 70, h: 10 },       // High alternate coin route for Gift #8
    { id: 'plat_14', x: 3400, y: 120, w: 65, h: 10 },
    { id: 'plat_bridge_7', x: 3505, y: 130, w: 60, h: 10 },// Stepping stone over Gap 7
    { id: 'plat_15', x: 3880, y: 125, w: 75, h: 10 },
    { id: 'plat_16', x: 4000, y: 90, w: 70, h: 10 },

    // Section 5: The Final Journey
    { id: 'plat_bridge_8', x: 4115, y: 130, w: 60, h: 10 },// Stepping stone over Gap 8
    { id: 'plat_17', x: 4280, y: 120, w: 75, h: 10 },
    { id: 'plat_18', x: 4410, y: 80, w: 70, h: 10 },       // High obstacle for Gift #10
    { id: 'plat_19', x: 4540, y: 115, w: 75, h: 10 }
  ],

  // 6 Checkpoints across the 5000px world
  CHECKPOINTS: [
    { id: 'cp_1_start', x: 60, y: 117 },
    { id: 'cp_2_challenge', x: 1140, y: 117 },
    { id: 'cp_3_lost_gifts', x: 2100, y: 117 },
    { id: 'cp_4_coin_trail', x: 3090, y: 117 },
    { id: 'cp_5_machine', x: 3600, y: 117 },
    { id: 'cp_6_castle_approach', x: 4210, y: 117 }
  ],

  // 15 Patrolling Enemies with varied placements, speeds, and bounds
  ENEMIES: [
    // Section 1: The Beginning
    { id: 'enemy_1', x: 320, y: 161, w: 18, h: 14, minX: 250, maxX: 480, speed: 20, color: '#f43f5e', name: 'Pink Slime' },
    { id: 'enemy_2', x: 820, y: 161, w: 18, h: 14, minX: 720, maxX: 950, speed: 25, color: '#a855f7', name: 'Purple Slime' },

    // Section 2: The First Challenge
    { id: 'enemy_3', x: 1190, y: 161, w: 18, h: 14, minX: 1130, maxX: 1320, speed: 28, color: '#22c55e', name: 'Green Slime' },
    { id: 'enemy_4', x: 1250, y: 111, w: 18, h: 14, minX: 1225, maxX: 1290, speed: 20, color: '#0ea5e9', name: 'Blue Slime' },
    { id: 'enemy_5', x: 1640, y: 161, w: 18, h: 14, minX: 1590, maxX: 1800, speed: 30, color: '#eab308', name: 'Golden Slime' },

    // Section 3: The Lost Gifts
    { id: 'enemy_6', x: 2180, y: 161, w: 18, h: 14, minX: 2100, maxX: 2360, speed: 32, color: '#f43f5e', name: 'Pink Slime' },
    { id: 'enemy_7', x: 2280, y: 71, w: 18, h: 14, minX: 2265, maxX: 2315, speed: 18, color: '#a855f7', name: 'Purple Slime' },
    { id: 'enemy_8', x: 2620, y: 161, w: 18, h: 14, minX: 2530, maxX: 2750, speed: 35, color: '#ef4444', name: 'Ruby Slime' },
    { id: 'enemy_9', x: 2870, y: 106, w: 18, h: 14, minX: 2855, maxX: 2915, speed: 22, color: '#eab308', name: 'Golden Slime' },

    // Section 4: The Coin Challenge & Machine
    { id: 'enemy_10', x: 3180, y: 161, w: 18, h: 14, minX: 3090, maxX: 3300, speed: 30, color: '#0ea5e9', name: 'Blue Slime' },
    { id: 'enemy_11', x: 3360, y: 161, w: 18, h: 14, minX: 3250, maxX: 3470, speed: 34, color: '#ef4444', name: 'Ruby Slime' },
    { id: 'enemy_12', x: 3900, y: 161, w: 18, h: 14, minX: 3840, maxX: 4050, speed: 32, color: '#eab308', name: 'Golden Slime' },

    // Section 5: The Final Journey
    { id: 'enemy_13', x: 4250, y: 161, w: 18, h: 14, minX: 4200, maxX: 4360, speed: 32, color: '#a855f7', name: 'Purple Slime' },
    { id: 'enemy_14', x: 4430, y: 66, w: 18, h: 14, minX: 4415, maxX: 4475, speed: 24, color: '#ef4444', name: 'Ruby Slime' },
    { id: 'enemy_15', x: 4620, y: 161, w: 18, h: 14, minX: 4550, maxX: 4740, speed: 34, color: '#eab308', name: 'Golden Slime' }
  ],

  /* ==========================================================================
     PERSONALIZATION SECTION: EDIT YOUR 12 BIRTHDAY GIFT MESSAGES HERE
     --------------------------------------------------------------------------
     Instructions for customization:
     - You can freely edit 'title' and 'message' for each of the 12 gifts below.
     - Keep 'id', 'x', 'y', 'w', 'h', and 'opened: false' unchanged to preserve
       level geometry and trigger mechanics.
     - Emojis (🎉, ✨, 🎂, etc.) are fully supported.
     ========================================================================== */
  GIFTS: [
    // Section 1: The Beginning (0..1045px)
    {
      id: "gift_1",
      x: 180,
      y: 157,
      w: 18,
      h: 18,
      title: "🎁 Gift #1: Sweet Beginnings",
      message: "Happy Birthday! Wishing you a day filled with infinite smiles, wonderful surprises, and sweet moments! 🎂✨",
      opened: false
    },
    {
      id: "gift_2",
      x: 880,
      y: 157,
      w: 18,
      h: 18,
      title: "🎁 Gift #2: Joy & Wonder",
      message: "Here's to another unforgettable year of joy, wild adventures, and pure happiness! Never stop exploring! 🎈🥳",
      opened: false
    },

    // Section 2: The First Challenge
    {
      id: "gift_3",
      x: 1385,
      y: 77, // On high platform plat_4 (Mode B/C jump reward)
      w: 18,
      h: 18,
      title: "🎁 Gift #3: Reaching Higher",
      message: "Look how high you've climbed! May you always reach for the stars and turn every dream into reality! 🌟✨",
      opened: false
    },
    {
      id: "gift_4",
      x: 1680,
      y: 157,
      w: 18,
      h: 18,
      title: "🎁 Gift #4: Sunshine & Smiles",
      message: "You bring so much warmth, light, and positive energy wherever you go. Keep shining brightly! ☀️💖",
      opened: false
    },

    // Section 3: The Lost Gifts
    {
      id: "gift_5",
      x: 2285,
      y: 67, // On high platform plat_8
      w: 18,
      h: 18,
      title: "🎁 Gift #5: Overcoming Obstacles",
      message: "No obstacle is too tough for you! Your courage, passion, and kindness make every path an adventure! 🧗‍♀️💫",
      opened: false
    },
    {
      id: "gift_6",
      x: 2755,
      y: 62, // On high perch plat_10
      w: 18,
      h: 18,
      title: "🎁 Gift #6: Hidden Gem",
      message: "You discovered the hidden gem! Just like this treasure, your presence in our lives is truly priceless! 💎✨",
      opened: false
    },
    {
      id: "gift_7",
      x: 2920,
      y: 157,
      w: 18,
      h: 18,
      title: "🎁 Gift #7: Laughter & Cheers",
      message: "May your upcoming year be packed with hearty laughter, delightful surprises, and true friends! 🥂🎉",
      opened: false
    },

    // Section 4: The Coin Challenge & Machine
    {
      id: "gift_8",
      x: 3295,
      y: 67, // On high platform plat_13
      w: 18,
      h: 18,
      title: "🎁 Gift #8: Golden Memories",
      message: "Here's celebrating every golden memory made so far, and the many magnificent ones yet to come! 📸💛",
      opened: false
    },
    {
      id: "gift_9",
      x: 3650,
      y: 157, // Safe near machine
      w: 18,
      h: 18,
      title: "🎁 Gift #9: The Key to Happiness",
      message: "Almost at the key dispenser! Remember that the real treasure is the love and joy you share every day! 🗝️❤️",
      opened: false
    },

    // Section 5: The Final Journey & Castle
    {
      id: "gift_10",
      x: 4435,
      y: 62, // On high platform plat_18
      w: 18,
      h: 18,
      title: "🎁 Gift #10: A Bright Future",
      message: "The horizon ahead is dazzling and full of promise! May every step you take lead to triumph and joy! 🌈🚀",
      opened: false
    },
    {
      id: "gift_11",
      x: 4720,
      y: 157,
      w: 18,
      h: 18,
      title: "🎁 Gift #11: Dreams Come True",
      message: "Believe in yourself as much as we believe in you! Happy Birthday, superstar! 🌠🎂",
      opened: false
    },
    {
      id: "gift_12",
      x: 4760,
      y: 157, // Right before the castle gate
      w: 18,
      h: 18,
      title: "🎁 Gift #12: The Grand Climax",
      message: "You've arrived at the Royal Castle! Use the Golden Castle Key and step inside for your special surprise! 👑🏰🎉",
      opened: false
    }
  ],

  // Exactly 200 Collectible Coins placed in the level (40 coins per section)
  COIN_LIST: generateExpandedLevelCoins(),

  /* ==========================================================================
     FINAL BIRTHDAY SURPRISE DESTINATION URL
     --------------------------------------------------------------------------
     - When empty (""), entering the unlocked castle opens the beautiful in-game
       celebration modal with "Play Again" and birthday congratulations.
     - When set to a valid URL (e.g. "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
       or any private video link), walking into the castle gate will automatically
       redirect the player to your special birthday video!
     ========================================================================== */
  BIRTHDAY_VIDEO_URL: "",

  // Debug flag
  DEBUG: false
};

/**
 * Generates exactly 200 accessible collectible coins across the 5000px level.
 * Distributed with 40 coins in each of the 5 gameplay sections.
 */
function generateExpandedLevelCoins() {
  const coins = [];
  let id = 1;

  const addRun = (startX, stepX, count, y) => {
    for (let i = 0; i < count; i++) {
      coins.push({
        id: `coin_${id++}`,
        x: startX + i * stepX,
        y: y,
        w: 10,
        h: 10,
        collected: false
      });
    }
  };

  // Section 1: The Beginning (0..1045) — 40 coins
  addRun(100, 20, 6, 155);    // 6 coins ground (100..200)
  addRun(250, 18, 4, 117);    // 4 coins on plat_1
  addRun(340, 20, 7, 155);    // 7 coins ground (340..460)
  addRun(470, 15, 5, 140);    // 5 coins leading to gap 1
  addRun(575, 16, 3, 112);    // 3 coins on plat_bridge_1 over gap 1
  addRun(640, 20, 5, 155);    // 5 coins ground
  addRun(770, 18, 4, 112);    // 4 coins on plat_2
  addRun(850, 20, 6, 155);    // 6 coins ground
  // Section 1 total = 6 + 4 + 7 + 5 + 3 + 5 + 4 + 6 = 40 coins

  // Section 2: The First Challenge (1045..2000) — 40 coins
  addRun(1060, 16, 3, 112);   // 3 coins on plat_bridge_2 over gap 2
  addRun(1135, 20, 6, 155);   // 6 coins ground
  addRun(1230, 18, 4, 107);   // 4 coins on plat_3
  addRun(1310, 20, 5, 155);   // 5 coins ground
  addRun(1370, 18, 4, 77);    // 4 coins on high plat_4
  addRun(1445, 14, 4, 140);   // 4 coins leading to gap 3
  addRun(1515, 16, 3, 112);   // 3 coins on plat_bridge_3 over gap 3
  addRun(1595, 20, 5, 155);   // 5 coins ground
  addRun(1730, 18, 3, 107);   // 3 coins on plat_5
  addRun(1870, 18, 3, 72);    // 3 coins on high plat_6
  // Section 2 total = 3 + 6 + 4 + 5 + 4 + 4 + 3 + 5 + 3 + 3 = 40 coins

  // Section 3: The Lost Gifts (2000..2980) — 40 coins
  addRun(2020, 16, 3, 112);   // 3 coins on plat_bridge_4 over gap 4
  addRun(2095, 20, 5, 155);   // 5 coins ground
  addRun(2160, 18, 3, 107);   // 3 coins on plat_7
  addRun(2270, 18, 3, 67);    // 3 coins on high plat_8
  addRun(2340, 20, 5, 155);   // 5 coins ground
  addRun(2440, 16, 2, 117);   // 2 coins on lower bridge 5a
  addRun(2480, 16, 2, 77);    // 2 coins on upper bridge 5b
  addRun(2530, 20, 5, 155);   // 5 coins ground
  addRun(2610, 18, 4, 102);   // 4 coins on plat_9
  addRun(2740, 18, 3, 62);    // 3 coins on high plat_10
  addRun(2860, 18, 4, 102);   // 4 coins on plat_11
  addRun(2935, 14, 1, 155);   // 1 coin ground
  // Section 3 total = 3 + 5 + 3 + 3 + 5 + 2 + 2 + 5 + 4 + 3 + 4 + 1 = 40 coins

  // Section 4: The Coin Challenge & Machine (2980..4100) — 40 coins
  addRun(3000, 16, 3, 112);   // 3 coins on plat_bridge_6 over gap 6
  addRun(3085, 20, 5, 155);   // 5 coins ground
  addRun(3150, 18, 4, 102);   // 4 coins on plat_12
  addRun(3280, 18, 4, 67);    // 4 coins on high plat_13
  addRun(3360, 18, 4, 155);   // 4 coins ground
  addRun(3410, 18, 3, 102);   // 3 coins on plat_14
  addRun(3510, 16, 3, 112);   // 3 coins on plat_bridge_7 over gap 7
  addRun(3600, 20, 5, 155);   // 5 coins ground before machine
  addRun(3795, 18, 3, 155);   // 3 coins ground immediately past machine
  addRun(3890, 18, 3, 107);   // 3 coins on plat_15
  addRun(4010, 18, 3, 72);    // 3 coins on plat_16
  // Section 4 total = 3 + 5 + 4 + 4 + 4 + 3 + 3 + 5 + 3 + 3 + 3 = 40 coins

  // Section 5: The Final Journey & Castle (4100..5000) — 40 coins
  addRun(4120, 16, 3, 112);   // 3 coins on plat_bridge_8 over gap 8
  addRun(4205, 20, 6, 155);   // 6 coins ground
  addRun(4290, 18, 4, 102);   // 4 coins on plat_17
  addRun(4420, 18, 4, 62);    // 4 coins on high plat_18
  addRun(4500, 20, 5, 155);   // 5 coins ground
  addRun(4550, 18, 4, 97);    // 4 coins on plat_19
  addRun(4630, 20, 6, 155);   // 6 coins ground
  addRun(4740, 14, 8, 155);   // 8 coins in Castle Courtyard approaching gate
  // Section 5 total = 3 + 6 + 4 + 4 + 5 + 4 + 6 + 8 = 40 coins

  // Grand Total = 40 + 40 + 40 + 40 + 40 = 200 coins
  return coins;
}
