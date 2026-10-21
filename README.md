# 🎂 Birthday Adventure Game (KBS-8-bit-game)

A retro 8-bit pixel-art platformer/adventure game created as a personal birthday surprise. Built with pure HTML5 Canvas 2D, Vanilla CSS3, and ES6 JavaScript Modules — running 100% client-side with zero build dependencies, perfectly optimized for GitHub Pages.

---

## 🎮 Game Overview

- **World Length:** 5000px side-scrolling retro world divided into 5 progressive sections:
  1. **Section 1: The Beginning (0–1000px):** Introductory movement, basic coins, first gift, gentle slimes.
  2. **Section 2: The First Challenge (1000–2000px):** Elevated platforms, stepping stones over gaps, 2 gifts, 3 slimes.
  3. **Section 3: The Lost Gifts (2000–3000px):** Multi-tier platforms, narrow landings, consecutive jumps, 3 gifts, 4 slimes.
  4. **Section 4: The Coin Challenge & Machine (3000–4100px):** Demanding platforming, alternate coin routes, 3 gifts, and the arcade **Inventory Machine** at `x: 3750px`.
  5. **Section 5: The Final Journey & Castle Climax (4100–5000px):** High stepping stones, elite slimes, 3 final milestone gifts, leading to the **Royal Castle** at `x: 4800px`.
- **Storytelling Gifts:** 12 unique, collectible gift boxes across the world displaying personal birthday messages.
- **Coin Economy:** Exactly 200 collectible coins (40 coins per section).
- **Golden Key Machine:** Deposit exactly 40 coins at the Inventory Machine (`x: 3750px`) via `D` key to receive the Golden Castle Key. Retain 160 coins balance.
- **Castle Climax & Redirect:** Approach the locked Royal Castle at `x: 4800px` with the Golden Key, press `U` to unlock (portcullis rises with confetti burst), then walk inside the doorway to trigger the birthday video surprise (or the celebratory in-game victory screen if no URL is set).

---

## 🕹️ Keyboard Controls

| Key | Action |
| :--- | :--- |
| `←` / `→` (Arrow Keys) | Move left / right |
| `Space` | **Mode A:** Normal short jump (tap and release) |
| `Hold Space` | **Mode B:** High variable jump (hold for maximum arc) |
| `Double Space` | **Mode C:** Extra-high jump boost (second press within 320ms; bounded single-use) |
| `E` | Open nearby gift box |
| `D` | Deposit 40 coins at the Inventory Machine |
| `U` | Unlock the Royal Castle Gate with the Golden Key |
| `H` / `?` (Top-Right Icon) | Open Controls & Help modal |
| `Enter` | Confirm active modal (OK) |
| `Escape` | Close / cancel active modal |

---

## ✍️ How to Personalize the Game

All customizable content is located in **`js/config.js`**:

### 1. Personalize the 12 Gift Messages
Open `js/config.js` and locate the `GIFTS` array (line ~175). You can customize the `title` and `message` for all 12 gifts:

```javascript
{
  id: "gift_1",
  x: 180,
  y: 157,
  w: 18,
  h: 18,
  title: "🎁 Gift #1: Your Custom Title",
  message: "Write your heartfelt personal birthday message here! 💖🎉",
  opened: false
}
```
*Note: Keep `id`, `x`, `y`, `w`, `h`, and `opened: false` intact so the gifts stay on their platforms.*

### 2. Set Your Birthday Video URL
In `js/config.js` (line ~315), paste your special video URL:

```javascript
BIRTHDAY_VIDEO_URL: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
```
- If left empty (`""`), walking inside the castle presents a celebratory in-game victory screen with a "Play Again" button.
- If filled with a link (YouTube, Vimeo, Google Drive, etc.), entering the castle automatically redirects the player to the video.

---

## 🚀 Running Locally

Because this game uses standard ES6 JavaScript modules, run any local static HTTP server:

```bash
# Python 3
python -m http.server 8080

# Or Node.js npx
npx serve .
```

Open `http://localhost:8080/` in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

---

## 🌐 Deploying to GitHub Pages

This repository includes a ready-to-run GitHub Actions deployment workflow at `.github/workflows/deploy.yml`.

To deploy:
1. Create your new GitHub repository.
2. Link it:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository settings:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. GitHub Pages will build and deploy automatically within ~60 seconds!