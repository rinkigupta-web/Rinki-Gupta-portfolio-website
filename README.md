# Rinki Gupta — UX/UI & Graphic Design Portfolio

A high-end, responsive personal portfolio website crafted for **Rinki Gupta** (UX/UI Designer & Graphic Designer). Featuring a scroll-driven 360° character turntable, an interactive 3D portfolio flip-book case study archive, physics-based Watermelon UI wiggling service cards, and a direct action contact deck.

**Live Repository:** [https://github.com/rinkigupta-web/Rinki-Gupta-portfolio-website](https://github.com/rinkigupta-web/Rinki-Gupta-portfolio-website)

---

## ✦ Core Features & Architectural Highlights

### 1. Scroll-Driven 360° Character Turntable (Hero)
- **Kinematic Scroll Mapping:** 192 sequential high-resolution frames (`frame_0001.jpg` to `frame_0192.jpg`) rendered smoothly on an HTML5 `<canvas>`.
- **Lerp Spring Interpolation:** Frame scrubbing uses linear interpolation (`requestAnimationFrame`) to eliminate stutter, snapping, and layout thrashing.
- **Adaptive Canvas Scaling:** Automatically adjusts to screen pixel density (`devicePixelRatio`) preserving 16:9 aspect ratio across all devices without distortion.
- **Interactive Scrubber Widget:** Allows users to scrub frames manually via slider, toggle playback, and see angle readouts in real time.

### 2. About Me Section (Playful & Editorial)
- **Interactive 3D Sprite Avatar:** Custom eye-tracking and state-based character animation reflecting user focus.
- **4 Key Pillars Glass Cards:** Highlights UX/UI Design, Digital Art, Creative Design, and AI × Design with distinctive pastel gradients, dark-mode adaptations, and tilt effects.
- **Micro-Badges & Personality Bar:** Quick metrics badges and interactive hobby pills ("Things I love exploring").

### 3. Interactive 3D A4 Portfolio Book (Work Section)
- **3D Page Turn Engine:** Built with pure CSS 3D transforms (`preserve-3d`, perspective projection, and dual-surface page folding).
- **Curated 4 Case Studies:**
  1. **Futuroom** — Spatial AI Room Customization App.
  2. **Urelia** — E-Commerce Fashion App & Design System.
  3. **Wandora** — Travel Discovery & Trip Planning Platform.
  4. **Branchwood** — Minimal Furniture-Shopping App & UX Case Study.
- **Full Editorial Layout:** Hardcover front & back with embossed borders, table of contents with interactive jump-links, dual-sided project pages with Behance links, and closing colophon.

### 4. Watermelon UI Wiggling Cards (Services Section)
- **Physics-Inspired Swipe Cards:** Inspired by Watermelon UI's card deck with natural spring physics, rotation wiggle, and responsive touch gestures.
- **3 Core Offerings:**
  - `01` — UX/UI Design (Research, user flows, wireframes, Figma systems).
  - `02` — Web Design & Interactive Prototyping (Responsive layouts, micro-interactions, motion).
  - `03` — Graphic Design & Visual Identity (Brand identity, typography, digital creatives).
- **Desktop & Mobile Controls:** Swipe, drag, or navigate with previous/next arrows and active indicator pills.

### 5. Direct Action Contact Deck & Footer
- **Availability Status Indicator:** Live green status badge showing openness to full-time UX/UI opportunities, internships, and freelance projects.
- **WhatsApp Direct Action:** One-tap button opening a prefilled chat message to `+91 8902756585`.
- **Direct Email with Clipboard Copy:** Clickable `mailto:` link with one-click clipboard copy and animated confirmation badge.
- **Social Connect:** Direct links to LinkedIn, Behance, and GitHub.
- **CV Download:** Instant download of `Rinki_Gupta_CV.pdf`.
- **Site Footer:** Brand info, quick anchor navigation, copyright, and smooth back-to-top button.

### 6. Light & Dark Mode Engine
- Native CSS custom properties with comprehensive contrast auditing.
- Persistent theme toggle in floating pill navbar with system preference detection.

---

## ✦ Deploying to Vercel

This repository is optimized out-of-the-box for **zero-configuration deployment on Vercel**.

### Step 1: Import Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Select your GitHub repository: `rinkigupta-web/Rinki-Gupta-portfolio-website`.

### Step 2: Configure & Deploy
1. **Framework Preset:** Select **Other** (Static Site).
2. **Root Directory:** `./` (default).
3. **Build & Output Settings:** Leave default (no build step needed).
4. Click **Deploy**.

Vercel will detect `index.html` and `vercel.json`, automatically applying Edge CDN caching rules (`immutable` cache for the 192 turntable video frames, asset caching, and security headers).

---

## ✦ Local Development

### Option 1: Live PowerShell Server
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 3000
```
or double-click `start.bat`.

### Option 2: Node / npx serve
```bash
npm start
```
or:
```bash
npx serve .
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## ✦ Technology Stack
- **Languages:** HTML5, Modern CSS3 (CSS Variables, Grid, Flexbox, 3D Transforms), Vanilla JavaScript (ES6+).
- **Fonts:** Plus Jakarta Sans & Syne (Google Fonts).
- **Dependencies:** Zero external runtime libraries — pure vanilla performance.
- **Deployment Platform:** Vercel (Edge CDN).

---

## ✦ Author
**Rinki Gupta**  
- Email: [rinkigupta.uxui@gmail.com](mailto:rinkigupta.uxui@gmail.com)  
- LinkedIn: [linkedin.com/in/rinki-gupta-a73a2b283](https://www.linkedin.com/in/rinki-gupta-a73a2b283/)  
- Behance: [behance.net/rinkigupta29](https://www.behance.net/rinkigupta29)  
- GitHub: [github.com/rinkigupta-web](https://github.com/rinkigupta-web)
