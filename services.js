/**
 * =====================================================================
 * RINKI PORTFOLIO — SERVICES SECTION WIGGLING CARDS ENGINE
 * =====================================================================
 * Reference: Watermelon UI Animated Wiggling Cards
 * (https://ui.watermelon.sh/animated-components/wiggling-cards)
 *
 * Features:
 * - Dynamic 3D wiggling tilt based on track offset:
 *   [-w, -0.1*w, 0, 0.1*w, w] -> [10deg, 10deg, 0deg, -10deg, -10deg]
 * - Depth blur (0px to 4px) and subtle scale/opacity falloff for background cards
 * - Real-time 1:1 pointer drag with touch-pan-y, spring settle transition
 * - Drag threshold (< 8px = click, >= 8px = drag), drag buffer (50px), velocity threshold (400px/s)
 * - Tactile hover tilt on active card
 * - Prev/Next buttons, interactive pagination pill tabs, keyboard arrow navigation
 * - Responsive auto-sizing for desktop, tablet, and mobile
 * =====================================================================
 */

class WigglingCardsManager {
  constructor() {
    this.container = document.getElementById('services-wiggling-cards') || document.getElementById('services');
    this.viewport = document.getElementById('wiggling-viewport');
    this.track = document.getElementById('wiggling-track');
    this.cards = Array.from(document.querySelectorAll('.service-wiggle-card'));
    this.prevBtn = document.getElementById('wiggling-prev-btn');
    this.nextBtn = document.getElementById('wiggling-next-btn');
    this.dots = Array.from(document.querySelectorAll('.wiggling-dot-pill'));

    if (!this.track || this.cards.length === 0) return;

    this.cardCount = this.cards.length;

    const urlParams = new URLSearchParams(window.location.search);
    const cardParam = parseInt(urlParams.get('card'), 10);
    this.currentIndex = (!isNaN(cardParam) && cardParam >= 0 && cardParam < this.cardCount) ? cardParam : 0;

    // Dimensions
    this.cardWidth = 390;
    this.gap = 64;

    // Pointer Drag State
    this.isPointerDown = false;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.currentTrackX = 0;
    this.dragStartX = 0;
    this.dragThreshold = 8;
    this.dragBuffer = 50;
    this.velocityThreshold = 400; // px/s
    this.hasMovedBeyondThreshold = false;
    this.hasJustDragged = false;
    this.lastPointerX = 0;
    this.pointerVelocity = 0;

    // Animation / RAF state
    this.rafId = null;
    this.isTransitioning = false;

    this.init();
  }

  init() {
    this.updateDimensions();
    window.addEventListener('resize', () => {
      this.updateDimensions();
      this.updateCardTransforms(false);
    });

    this.setupPointerEvents();
    this.setupButtonEvents();
    this.setupDotEvents();
    this.setupCardDirectClicks();
    this.setupHoverTilt();
    this.setupKeyboardEvents();

    // Initial positioning
    this.updateCardTransforms(false);
    this.updateControls();
  }

  updateDimensions() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) {
      // Mobile
      this.cardWidth = Math.min(screenWidth - 44, 340);
      this.gap = 24;
    } else if (screenWidth < 1024) {
      // Tablet
      this.cardWidth = 360;
      this.gap = 48;
    } else {
      // Desktop
      this.cardWidth = 390;
      this.gap = 64;
    }

    // Set viewport width to cardWidth so active card is centered
    if (this.viewport) {
      this.viewport.style.width = `${this.cardWidth}px`;
    }

    // Apply minWidth to cards
    this.cards.forEach(card => {
      card.style.minWidth = `${this.cardWidth}px`;
      card.style.maxWidth = `${this.cardWidth}px`;
    });
  }

  /**
   * Target track X when card `index` is centered.
   * In Watermelon UI track coordinate system:
   * x = -(index * (cardWidth + gap))
   */
  getTargetTrackX(index) {
    return -(index * (this.cardWidth + this.gap));
  }

  /**
   * Watermelon UI signature wiggling formula:
   * distance = x - center;
   * rotate = [-cardWidth, -cardWidth * 0.1, 0, cardWidth * 0.1, cardWidth]
   *          -> [10, 10, 0, -10, -10]
   */
  calculateRotation(distance) {
    const w = this.cardWidth;
    const threshold = w * 0.12;

    if (distance <= -threshold) return 10;
    if (distance >= threshold) return -10;

    // Linear mapping between -threshold and +threshold
    return -(distance / threshold) * 10;
  }

  /**
   * Watermelon UI blur calculation:
   * distance: [-w, -0.2*w, 0, 0.2*w, w] -> [4, 2, 0, 2, 4]
   */
  calculateBlur(distance) {
    const w = this.cardWidth;
    const norm = Math.min(1, Math.abs(distance) / w);
    return (norm * 3.5).toFixed(1);
  }

  /**
   * Watermelon UI opacity calculation:
   * distance: [-w, -0.2*w, 0, 0.2*w, w] -> [0.65, 0.85, 1, 0.85, 0.65]
   */
  calculateOpacity(distance) {
    const w = this.cardWidth;
    const norm = Math.min(1, Math.abs(distance) / w);
    return Math.max(0.6, 1 - norm * 0.38).toFixed(2);
  }

  /**
   * Scale factor for background cards
   */
  calculateScale(distance) {
    const w = this.cardWidth;
    const norm = Math.min(1, Math.abs(distance) / w);
    return Math.max(0.92, 1 - norm * 0.08).toFixed(3);
  }

  /**
   * Updates all cards and track transform based on currentTrackX.
   * @param {boolean} animate - Whether to apply CSS transition
   */
  updateCardTransforms(animate = true) {
    if (!animate) {
      this.currentTrackX = this.getTargetTrackX(this.currentIndex);
    }

    const x = this.currentTrackX;
    const transitionCurve = animate ? 'transform 0.48s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';

    // Move track
    this.track.style.transition = transitionCurve;
    this.track.style.transform = `translateX(${x}px)`;
    this.track.style.gap = `${this.gap}px`;

    // Update each card
    this.cards.forEach((card, i) => {
      const center = -(i * (this.cardWidth + this.gap));
      const distance = x - center;

      const rotate = this.calculateRotation(distance);
      const blur = this.calculateBlur(distance);
      const opacity = this.calculateOpacity(distance);
      const scale = this.calculateScale(distance);

      // Z-Index: active card sits highest
      const isCardActive = (i === this.currentIndex);
      const zIndex = isCardActive ? 10 : (5 - Math.min(4, Math.abs(i - this.currentIndex)));

      card.style.transition = animate 
        ? 'transform 0.48s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease, filter 0.35s ease, box-shadow 0.35s ease' 
        : 'none';
      card.style.transform = `rotate(${rotate.toFixed(2)}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = zIndex;

      if (isCardActive) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });

    this.updateControls();
  }

  goToIndex(targetIndex, animate = true) {
    if (targetIndex < 0 || targetIndex >= this.cardCount) return;
    this.currentIndex = targetIndex;
    this.currentTrackX = this.getTargetTrackX(this.currentIndex);
    this.updateCardTransforms(animate);
  }

  goToNext() {
    if (this.currentIndex < this.cardCount - 1) {
      this.goToIndex(this.currentIndex + 1, true);
    }
  }

  goToPrev() {
    if (this.currentIndex > 0) {
      this.goToIndex(this.currentIndex - 1, true);
    }
  }

  updateControls() {
    // Prev / Next button states
    if (this.prevBtn) {
      this.prevBtn.disabled = (this.currentIndex <= 0);
      this.prevBtn.style.opacity = this.currentIndex <= 0 ? '0.38' : '1';
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = (this.currentIndex >= this.cardCount - 1);
      this.nextBtn.style.opacity = this.currentIndex >= this.cardCount - 1 ? '0.38' : '1';
    }

    // Dot pills
    this.dots.forEach((dot, idx) => {
      if (idx === this.currentIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-selected', 'false');
      }
    });
  }

  setupPointerEvents() {
    const trackEl = this.track;

    const onPointerDown = (e) => {
      // Ignore right clicks or secondary buttons
      if (e.button !== 0) return;

      this.isPointerDown = true;
      this.hasMovedBeyondThreshold = false;
      this.isDragging = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.lastPointerX = e.clientX;
      this.startTime = Date.now();
      this.dragStartX = this.getTargetTrackX(this.currentIndex);
      this.currentTrackX = this.dragStartX;
      this.pointerVelocity = 0;

      trackEl.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!this.isPointerDown) return;

      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      // Calculate velocity
      const now = Date.now();
      const dt = Math.max(1, now - this.startTime);
      this.pointerVelocity = (e.clientX - this.lastPointerX) / (dt / 1000);
      this.lastPointerX = e.clientX;

      if (!this.hasMovedBeyondThreshold) {
        // Prevent accidental swipe when user is scrolling vertically
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
          this.isPointerDown = false;
          trackEl.style.cursor = 'grab';
          return;
        }

        if (Math.abs(dx) > this.dragThreshold) {
          this.hasMovedBeyondThreshold = true;
          this.isDragging = true;
          document.body.style.userSelect = 'none';
        } else {
          return;
        }
      }

      if (this.isDragging) {
        // Calculate drag bounds with rubber-band resistance
        const minX = this.getTargetTrackX(this.cardCount - 1);
        const maxX = this.getTargetTrackX(0);

        let proposedX = this.dragStartX + dx;

        // Rubber-band resistance at boundaries
        if (proposedX > maxX) {
          const over = proposedX - maxX;
          proposedX = maxX + over * 0.28;
        } else if (proposedX < minX) {
          const under = minX - proposedX;
          proposedX = minX - under * 0.28;
        }

        this.currentTrackX = proposedX;

        // Real-time 1:1 wiggling card rotation and tracking
        this.updateCardTransforms(false);
      }
    };

    const onPointerUp = (e) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      trackEl.style.cursor = 'grab';
      document.body.style.userSelect = '';

      if (this.isDragging) {
        this.hasJustDragged = true;
        setTimeout(() => {
          this.hasJustDragged = false;
        }, 220);

        const dx = e.clientX - this.startX;
        const velocity = (e.clientX - this.startX) / Math.max(1, (Date.now() - this.startTime));

        // Swipe decision: threshold buffer or velocity flick
        const shouldGoNext = (dx < -this.dragBuffer) || (velocity < -0.42 && dx < -15);
        const shouldGoPrev = (dx > this.dragBuffer) || (velocity > 0.42 && dx > 15);

        if (shouldGoNext && this.currentIndex < this.cardCount - 1) {
          this.goToIndex(this.currentIndex + 1, true);
        } else if (shouldGoPrev && this.currentIndex > 0) {
          this.goToIndex(this.currentIndex - 1, true);
        } else {
          // Snap back smoothly
          this.goToIndex(this.currentIndex, true);
        }
      }
    };

    trackEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  setupButtonEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPrev();
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToNext();
      });
    }
  }

  setupDotEvents() {
    this.dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(dot.dataset.index, 10);
        if (!isNaN(idx)) {
          this.goToIndex(idx, true);
        }
      });
    });
  }

  setupCardDirectClicks() {
    this.cards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (this.hasJustDragged) return;
        // Clicking an inactive adjacent card jumps to it!
        if (idx !== this.currentIndex) {
          e.preventDefault();
          this.goToIndex(idx, true);
        }
      });
    });
  }

  setupHoverTilt() {
    // Subtle tactile mouse tilt on the active card when hovering
    this.cards.forEach((card, idx) => {
      card.addEventListener('mousemove', (e) => {
        if (this.isDragging || idx !== this.currentIndex) return;
        const rect = card.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        // Subtle 3D tilt: max 2.5 degrees
        const tiltZ = -normX * 3.5;
        const tiltX = normY * 2.5;

        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltZ.toFixed(2)}deg) scale(1.01)`;
      });

      card.addEventListener('mouseleave', () => {
        if (idx === this.currentIndex && !this.isDragging) {
          card.style.transform = `rotate(0deg) scale(1)`;
        }
      });
    });
  }

  setupKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      const servicesSec = document.getElementById('services');
      if (!servicesSec) return;

      const rect = servicesSec.getBoundingClientRect();
      const inView = (rect.top <= window.innerHeight * 0.75 && rect.bottom >= window.innerHeight * 0.25);

      if (inView) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          this.goToNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          this.goToPrev();
        }
      }
    });
  }
}

// Global initialization
function initWigglingCards() {
  if (!window.rinkiWigglingCards && document.getElementById('wiggling-track')) {
    window.rinkiWigglingCards = new WigglingCardsManager();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWigglingCards);
} else {
  initWigglingCards();
}
