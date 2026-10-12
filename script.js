/**
 * RINKI GUPTA — UX/UI Portfolio 360° Hero Animation Engine
 * 
 * Features:
 * - 192 frames sequential 360° turntable scrub
 * - Scroll-driven pinned hero stage
 * - High-DPI hardware accelerated canvas rendering
 * - Progressive asynchronous preloading with intelligent nearest-frame fallback
 * - Smooth lerp spring interpolation (zero jitter / stutter)
 * - Interactive scrubber widget with drag & scroll sync
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const TOTAL_FRAMES = 192;
  const FRAME_WIDTH = 1920;
  const FRAME_HEIGHT = 1080;
  const FRAME_ASPECT = FRAME_WIDTH / FRAME_HEIGHT;
  const LERP_FACTOR = 0.25;

  // --- DOM Elements ---
  const heroContainer = document.getElementById('hero');
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  const scrubSlider = document.getElementById('scrub-slider');
  const scrubFill = document.getElementById('scrub-fill');
  const frameDisplay = document.getElementById('frame-display');
  const angleDisplay = document.getElementById('angle-display');
  const preloadContainer = document.getElementById('preload-container');
  const preloadBar = document.getElementById('preload-bar');

  const themeToggle = document.getElementById('theme-toggle');
  const moonIcon = themeToggle ? themeToggle.querySelector('.moon-icon') : null;
  const sunIcon = themeToggle ? themeToggle.querySelector('.sun-icon') : null;

  // --- State Variables ---
  const frames = new Array(TOTAL_FRAMES + 1);
  const frameLoaded = new Array(TOTAL_FRAMES + 1).fill(false);
  let loadedCount = 0;

  let targetFrame = 1;
  let currentRenderedFrame = 1;
  let lastDrawnActualIndex = -1;

  let isScrubbingSlider = false;

  // Helper to format frame path: video_frames/frame_0001.jpg
  function getFramePath(index) {
    const padded = String(index).padStart(4, '0');
    return `video_frames/frame_${padded}.jpg`;
  }

  // --- High DPI Canvas Resizing ---
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round((rect.width || window.innerWidth) * dpr);
    const h = Math.round((rect.height || window.innerHeight) * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      lastDrawnActualIndex = -1; // Force repaint
    }
  }

  // --- Canvas Rendering with Cover Aspect Ratio ---
  function drawFrame(frameIndex) {
    if (!canvas || !ctx) return;
    resizeCanvas();

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;

    const validIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
    let imgToDraw = null;
    let actualIndex = -1;

    // Check if current target frame is loaded
    if (frameLoaded[validIndex] && frames[validIndex] && frames[validIndex].complete && frames[validIndex].naturalWidth > 0) {
      imgToDraw = frames[validIndex];
      actualIndex = validIndex;
    } else {
      // Find nearest loaded frame to avoid any blank flash
      let nearest = -1;
      let minDiff = Infinity;
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        if (frameLoaded[i] && frames[i] && frames[i].complete && frames[i].naturalWidth > 0) {
          const diff = Math.abs(i - validIndex);
          if (diff < minDiff) {
            minDiff = diff;
            nearest = i;
          }
        }
      }
      if (nearest !== -1) {
        imgToDraw = frames[nearest];
        actualIndex = nearest;
      }
    }

    if (!imgToDraw) return;

    const canvasAspect = cw / ch;
    let drawW, drawH, drawX, drawY;

    if (canvasAspect > FRAME_ASPECT) {
      drawW = cw;
      drawH = cw / FRAME_ASPECT;
      drawX = 0;
      drawY = (ch - drawH) / 2;
    } else {
      drawH = ch;
      drawW = ch * FRAME_ASPECT;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear background with stage tone
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#111217' : '#ededf0';
    ctx.fillRect(0, 0, cw, ch);

    ctx.drawImage(imgToDraw, drawX, drawY, drawW, drawH);
    lastDrawnActualIndex = actualIndex;
  }

  // --- Progressive Preloading Engine ---
  function preloadImages() {
    // 1. Load Frame 1 immediately
    const firstImg = new Image();
    firstImg.onload = () => {
      frames[1] = firstImg;
      frameLoaded[1] = true;
      loadedCount++;
      drawFrame(1);
      updatePreloadProgress();

      // 2. Load all remaining frames concurrently
      loadRemainingFrames();
    };
    firstImg.onerror = () => {
      loadRemainingFrames();
    };
    firstImg.src = getFramePath(1);
    if (firstImg.complete && firstImg.naturalWidth > 0) {
      frames[1] = firstImg;
      frameLoaded[1] = true;
      loadedCount++;
      drawFrame(1);
    }
  }

  function loadRemainingFrames() {
    // Load anchor keyframes first for fast visual scrub coverage
    const keyframes = [];
    for (let i = 16; i <= TOTAL_FRAMES; i += 16) keyframes.push(i);
    if (!keyframes.includes(TOTAL_FRAMES)) keyframes.push(TOTAL_FRAMES);

    keyframes.forEach(idx => {
      if (frameLoaded[idx]) return;
      const img = new Image();
      img.onload = () => {
        frames[idx] = img;
        frameLoaded[idx] = true;
        loadedCount++;
        updatePreloadProgress();
        drawFrame(currentRenderedFrame);
      };
      img.src = getFramePath(idx);
    });

    // Load full sequence
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      if (frameLoaded[i]) continue;
      const img = new Image();
      img.onload = () => {
        frames[i] = img;
        frameLoaded[i] = true;
        loadedCount++;
        updatePreloadProgress();
        // Redraw current view if this frame is closest or exact
        if (Math.round(currentRenderedFrame) === i) {
          drawFrame(currentRenderedFrame);
        }
      };
      img.src = getFramePath(i);
    }
  }

  function updatePreloadProgress() {
    const pct = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
    if (preloadBar) {
      preloadBar.style.width = `${pct}%`;
    }
    if (pct >= 100 && preloadContainer) {
      setTimeout(() => {
        preloadContainer.style.opacity = '0';
      }, 500);
    }
  }

  // --- Scroll Tracking & Progress Mapping ---
  function computeScrollProgress() {
    if (isScrubbingSlider || !heroContainer) return;

    const rect = heroContainer.getBoundingClientRect();
    const scrollableDist = heroContainer.offsetHeight - window.innerHeight;

    if (scrollableDist <= 0) {
      targetFrame = 1;
      return;
    }

    // rect.top is 0 at top of hero, -scrollableDist when hero ends
    const scrolledPx = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolledPx / scrollableDist));

    // Map 0 -> 1 directly to frame 1 -> TOTAL_FRAMES
    targetFrame = 1 + progress * (TOTAL_FRAMES - 1);
  }

  // --- UI Updates (Scrub Slider, Badges, Angle) ---
  function updateUI(frameVal) {
    const frameInt = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameVal)));
    const padded = String(frameInt).padStart(3, '0');

    if (frameDisplay) {
      frameDisplay.textContent = padded;
    }

    // Calculate rotation degree (0° to 360°)
    const angle = Math.round(((frameInt - 1) / (TOTAL_FRAMES - 1)) * 360);
    if (angleDisplay) {
      angleDisplay.textContent = `${angle}°`;
    }

    // Sync slider thumb & progress fill
    if (!isScrubbingSlider && scrubSlider) {
      scrubSlider.value = frameInt;
    }
    if (scrubFill) {
      const pct = ((frameInt - 1) / (TOTAL_FRAMES - 1)) * 100;
      scrubFill.style.width = `${pct}%`;
    }
  }

  // --- Animation Render Loop ---
  function renderLoop() {
    const diff = targetFrame - currentRenderedFrame;

    if (Math.abs(diff) > 0.001) {
      currentRenderedFrame += diff * LERP_FACTOR;
    } else {
      currentRenderedFrame = targetFrame;
    }

    drawFrame(currentRenderedFrame);
    updateUI(currentRenderedFrame);

    requestAnimationFrame(renderLoop);
  }

  // --- Interactive Scrubber Controls ---
  function setupScrubberEvents() {
    if (!scrubSlider || !heroContainer) return;

    const handleScrubInput = (e) => {
      isScrubbingSlider = true;
      const val = parseFloat(e.target.value);
      targetFrame = val;
      currentRenderedFrame = val;

      const scrollableDist = heroContainer.offsetHeight - window.innerHeight;
      const progress = (val - 1) / (TOTAL_FRAMES - 1);
      const targetScrollTop = heroContainer.offsetTop + progress * scrollableDist;

      window.scrollTo({
        top: targetScrollTop,
        behavior: 'auto'
      });
    };

    scrubSlider.addEventListener('input', handleScrubInput);
    scrubSlider.addEventListener('change', () => {
      isScrubbingSlider = false;
    });

    scrubSlider.addEventListener('pointerdown', () => {
      isScrubbingSlider = true;
    });
    window.addEventListener('pointerup', () => {
      isScrubbingSlider = false;
    });
  }

  // --- Theme Toggle (Dark / Light) ---
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);

      if (newTheme === 'dark') {
        if (moonIcon) moonIcon.style.display = 'none';
        if (sunIcon) sunIcon.style.display = 'block';
      } else {
        if (moonIcon) moonIcon.style.display = 'block';
        if (sunIcon) sunIcon.style.display = 'none';
      }

      lastDrawnActualIndex = -1; // Trigger canvas background redraw
      drawFrame(currentRenderedFrame);
    });
  }

  // --- Smooth Scrolling for Navigation Links ---
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // --- About Section Interactivity (Eye Tracking, 3D Tilt, Scroll Reveals) ---
  function setupAboutInteractions() {
    const aboutSection = document.getElementById('about');
    const pupilLeft = document.getElementById('girl-pupil-left') || document.getElementById('pupil-left');
    const pupilRight = document.getElementById('girl-pupil-right') || document.getElementById('pupil-right');
    const girlVisual = document.getElementById('girl-visual');
    const tiltCards = document.querySelectorAll('[data-tilt]');

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // 1. Dynamic 6-State Sprite Eye Tracking Interaction
    const girlSprite = document.getElementById('girl-sprite');
    if (aboutSection && !isTouch && girlSprite) {
      let currentState = 'center';

      function setGirlEyeState(state) {
        if (currentState === state) return;
        currentState = state;
        girlSprite.className = `girl-sprite-box state-${state}`;
      }

      window.addEventListener('mousemove', (e) => {
        const aboutRect = aboutSection.getBoundingClientRect();
        
        // Active when about section is in viewport
        if (aboutRect.top <= window.innerHeight + 100 && aboutRect.bottom >= -100) {
          const spriteRect = girlSprite.getBoundingClientRect();
          const eyeCenterX = spriteRect.left + spriteRect.width / 2;
          const eyeCenterY = spriteRect.top + spriteRect.height * 0.35; // approximate eye height

          const dx = e.clientX - eyeCenterX;
          const dy = e.clientY - eyeCenterY;
          const dist = Math.hypot(dx, dy);

          // Conceptual 3×3 Directional Grid:
          if (dist < 60) {
            // Center Dead-zone around the face
            setGirlEyeState('center');
          } else if (dy < -40) {
            // Upper Row
            if (dx > 45) {
              setGirlEyeState('up-right'); // Top-Right -> Looking Upper-Right
            } else if (dx < -65) {
              setGirlEyeState('up');       // Top-Left fallback -> Looking Up
            } else {
              setGirlEyeState('up');       // Top-Center -> Looking Up
            }
          } else if (dy > 50) {
            // Lower Row
            if (dx > 140 && dy < 90) {
              setGirlEyeState('right');    // Far lower-right transition
            } else if (dx < -140 && dy < 90) {
              setGirlEyeState('left');     // Far lower-left transition
            } else {
              setGirlEyeState('down');     // Bottom-Center / Lower -> Looking Down
            }
          } else if (dx > 45) {
            // Mid-Right -> Looking Right
            setGirlEyeState('right');
          } else if (dx < -45) {
            // Mid-Left -> Looking Left
            setGirlEyeState('left');
          } else {
            // Neutral Center
            setGirlEyeState('center');
          }
        } else {
          setGirlEyeState('center');
        }
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        setGirlEyeState('center');
      });
    }

    // 2. Subtle 3D Tilt for Floating Glass Cards
    if (!isTouch) {
      tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -6;
          const rotateY = ((x - centerX) / centerX) * 6;

          card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
        });
      });
    }

    // 3. Scroll Reveal / Entry Animations
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      };

      const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('about-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll('.about-headline, .about-intro-paragraph, .about-quick-metrics, .central-girl-container, .about-glass-card, .about-personality-bar').forEach(el => {
        el.classList.add('about-reveal-item');
        revealObserver.observe(el);
      });
    }
  }

  // --- Window Event Listeners ---
  window.addEventListener('scroll', computeScrollProgress, { passive: true });
  window.addEventListener('resize', () => {
    resizeCanvas();
    computeScrollProgress();
    drawFrame(currentRenderedFrame);
  }, { passive: true });

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    preloadImages();
    setupScrubberEvents();
    setupSmoothScroll();
    setupAboutInteractions();
    computeScrollProgress();
    renderLoop();
  });

  // Also run immediately if DOM is already ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    resizeCanvas();
    preloadImages();
    setupScrubberEvents();
    setupSmoothScroll();
    setupAboutInteractions();
    computeScrollProgress();
    renderLoop();
  }

})();
