/**
 * =====================================================================
 * RINKI 3D A4 INTERACTIVE PORTFOLIO BOOK — CORE ENGINE & DATA ARCHITECTURE
 * =====================================================================
 * Features:
 * - 3D Perspective Flipbook with A4 Portrait proportions
 * - Realistic double-sided leaves with Front/Back faces and dynamic Z-indexing
 * - Smooth Pointer/Mouse/Touch drag-to-turn physics with 3D curl & spine shading
 * - Strict Click vs Drag discrimination (movement < 8px = click, >= 8px = drag)
 * - Decoupled data-driven architecture: Cover + 4 Project Pages + Colophon
 * - Corner click, next/prev controls, keyboard navigation, and responsive scaling
 * =====================================================================
 */

// 1. DATA ARCHITECTURE — 4 INDEPENDENT PROJECT PAGES + COVERS
const BOOK_PROJECTS_DATA = {
  cover: {
    title: "SELECTED WORK",
    subtitle: "PORTFOLIO ARCHIVE",
    edition: "VOL. 01 • 2024 — 2025",
    author: "RINKI",
    role: "UX/UI DESIGN • DIGITAL ART • CREATIVE DIRECTION",
    accent: "#ec4899",
    tagline: "Bridging human emotion, visual depth, and interactive craft"
  },
  toc: {
    heading: "TABLE OF CONTENTS",
    subheading: "Curated Projects & Case Studies",
    summary: "An interactive editorial archive spanning complex UX systems, digital painting, generative spatial design, and brand identity."
  },
  pages: [
    {
      pageNumber: 1,
      id: "futuroom",
      title: "FUTUROOM",
      subtitle: "AI & AR Furniture Shopping Experience",
      category: "UX/UI DESIGN",
      categoryTheme: "peach",
      year: "2026",
      behanceUrl: "https://www.behance.net/gallery/253136939/FUTUROOM-CASE-STUDY",
      summary: "AI-curated furniture discovery and spatial AR room preview app. Enables users to explore personalized recommendations, inspect to-scale pieces in real space, and purchase curated styles.",
      tags: ["Mobile App", "Spatial AR", "Figma", "Design System"],
      metrics: { label1: "AR Accuracy", val1: "99.2%", label2: "Style Match", val2: "AI-Curated" },
      accentColor: "#ea580c",
      previewType: "image",
      image: "images/projects/futuroom_screen.jpg",
      imageFit: "cover",
      imagePosition: "55% 45%"
    },
    {
      pageNumber: 2,
      id: "urelia",
      title: "URELIA",
      subtitle: "AI-Assisted Jewellery Experience",
      category: "AI × DESIGN",
      categoryTheme: "cyan",
      year: "2026",
      behanceUrl: "https://www.behance.net/gallery/256099963/URELIA-JEWELERY-E-COMMERCE-WEBSITE-APP-DESIGN",
      summary: "An elegant jewellery website blending Indian craftsmanship with contemporary minimalism. Designed using Google Stitch to explore AI-assisted workflows, visual storytelling, and curated discovery.",
      tags: ["Google Stitch", "AI Workflow", "E-Commerce", "Editorial UI", "Jewellery"],
      metrics: { label1: "AI Workflow", val1: "Google Stitch", label2: "Design Focus", val2: "Storytelling" },
      accentColor: "#06b6d4",
      previewType: "image",
      image: "images/projects/urelia_screen.jpg",
      imageFit: "cover",
      imagePosition: "50% 25%"
    },
    {
      pageNumber: 3,
      id: "wandora",
      title: "WANDORA",
      subtitle: "Travel Website",
      category: "UX/UI DESIGN",
      categoryTheme: "purple",
      year: "2026",
      behanceUrl: "https://www.behance.net/gallery/255944797/WANDORA-TRAVEL-WEBSITE",
      summary: "A modern travel discovery and trip-planning experience with intuitive navigation, curated destinations, seamless booking flows, and responsive layouts.",
      tags: ["Travel UX", "Web Design", "Journey Planner", "Responsive UI", "Figma"],
      metrics: { label1: "Discovery Flow", val1: "Intuitive", label2: "Design Focus", val2: "Travel UX" },
      accentColor: "#8b5cf6",
      previewType: "image",
      image: "images/projects/wandora_screen.jpg",
      imageFit: "cover",
      imagePosition: "50% 25%"
    },
    {
      pageNumber: 4,
      id: "branchwood",
      title: "BRANCHWOOD",
      subtitle: "Furniture Shopping App UX/UI",
      category: "UX/UI DESIGN",
      categoryTheme: "purple",
      year: "2025",
      behanceUrl: "https://www.behance.net/gallery/228792971/Branchwood-App-UX-UI-Design-Case-study",
      summary: "Mobile furniture-shopping app created entirely in Figma with a hands-on UX/UI design approach. Focuses on effortless product discovery, clear navigation, and confident buyer decisions with transparent specifications.",
      tags: ["Figma", "Mobile App", "Design System", "E-Commerce", "UI Components"],
      metrics: { label1: "Creation Tool", val1: "100% Figma", label2: "Design Approach", val2: "Hands-on UX" },
      accentColor: "#2563eb",
      previewType: "image",
      image: "images/projects/branchwood_screen.jpg",
      imageFit: "cover",
      imagePosition: "50% 50%"
    }
  ],
  colophon: {
    heading: "COLOPHON & ARCHIVE NOTES",
    statement: "Crafted with passion, precision, and an obsession with detail. Every project represents an exploration at the intersection of human empathy, visual aesthetics, and emerging technology.",
    tools: ["Figma", "Adobe Photoshop", "Illustrator", "HTML5", "CSS3", "Responsive Design", "Framer"],
    copyright: "All projects copyright © 2024–2025 Rinki. All rights reserved."
  }
};


// 2. 3D BOOK ENGINE CLASS
class PortfolioBook {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.leavesContainer = document.getElementById('book-leaves');
    this.pageIndicator = document.getElementById('book-page-indicator');
    this.pageDotsContainer = document.getElementById('book-page-dots');
    this.prevBtn = document.getElementById('book-prev-btn');
    this.nextBtn = document.getElementById('book-next-btn');
    this.perspectiveWrapper = document.getElementById('book-perspective-wrapper');

    // Spreads:
    // Spread 0: Closed Cover (all leaves 0..3 unturned)
    // Spread 1: Leaf 0 turned -> Left: Table of Contents / Inside Cover | Right: Page 01
    // Spread 2: Leaf 1 turned -> Left: Page 02 | Right: Page 03
    // Spread 3: Leaf 2 turned -> Left: Page 04 | Right: Colophon
    // Spread 4: Leaf 3 turned -> Closed Back Cover (Left: Final Closing Page)
    this.totalSpreads = 4;
    this.leaves = [];
    this.leafCount = 4;

    const urlParams = new URLSearchParams(window.location.search);
    const spreadParam = parseInt(urlParams.get('spread'), 10);
    this.currentSpread = (!isNaN(spreadParam) && spreadParam >= 0 && spreadParam <= this.totalSpreads) ? spreadParam : 1;

    // Pointer Interaction State
    this.isPointerDown = false;
    this.isDragging = false;
    this.hasMovedBeyondThreshold = false;
    this.hasJustDragged = false;
    this.dragThreshold = 8; // 8px threshold for click vs drag
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.activeLeafIndex = -1;
    this.dragDirection = null; // 'forward' or 'backward'
    this.dragProgress = 0;
    this.isAnimating = false;

    this.init();
  }

  init() {
    this.renderLeaves();
    this.createPaginationDots();
    this.setupPointerEvents();
    this.setupButtonEvents();
    this.setupKeyboardEvents();
    this.setupResizeObserver();
    this.updateSpreadState(false);
  }

  // Generate All 4 Physical Double-Sided Leaves
  renderLeaves() {
    if (!this.leavesContainer) return;
    this.leavesContainer.innerHTML = '';
    this.leaves = [];

    const data = BOOK_PROJECTS_DATA;

    // Leaf 0: Front Cover (front) & Table of Contents (back)
    const leaf0 = this.createLeafElement(0, 
      this.generateFrontCoverHtml(data.cover),
      this.generateTocHtml(data.toc, data.pages)
    );
    this.leavesContainer.appendChild(leaf0);
    this.leaves.push(leaf0);

    // Leaves 1 to 2: 4 Project Pages (2 pages per leaf)
    for (let i = 0; i < 2; i++) {
      const pFront = data.pages[i * 2];     // Pages 1, 3
      const pBack = data.pages[i * 2 + 1];  // Pages 2, 4

      const leaf = this.createLeafElement(i + 1,
        this.generateProjectPageHtml(pFront, true),
        this.generateProjectPageHtml(pBack, false)
      );
      this.leavesContainer.appendChild(leaf);
      this.leaves.push(leaf);
    }

    // Leaf 3: Inside Back Cover / Colophon (front) & Back Cover (back)
    const leaf3 = this.createLeafElement(3,
      this.generateColophonHtml(data.colophon),
      this.generateBackCoverHtml(data.cover)
    );
    this.leavesContainer.appendChild(leaf3);
    this.leaves.push(leaf3);
  }

  createLeafElement(leafIndex, frontContent, backContent) {
    const leaf = document.createElement('div');
    leaf.className = `book-leaf leaf-${leafIndex}`;
    leaf.dataset.leafIndex = leafIndex;

    leaf.innerHTML = `
      <div class="leaf-face front-face">
        <div class="page-gutter-shadow gutter-left"></div>
        <div class="page-content-wrapper">
          ${frontContent}
        </div>
        <div class="leaf-corner-trigger corner-bottom-right" title="Click or drag to turn forward">
          <span class="corner-fold"></span>
        </div>
        <div class="leaf-corner-trigger corner-top-right" title="Click or drag to turn forward">
          <span class="corner-fold"></span>
        </div>
        <div class="page-light-sheen"></div>
        <div class="page-dynamic-shadow"></div>
      </div>
      <div class="leaf-face back-face">
        <div class="page-gutter-shadow gutter-right"></div>
        <div class="page-content-wrapper">
          ${backContent}
        </div>
        <div class="leaf-corner-trigger corner-bottom-left" title="Click or drag to turn back">
          <span class="corner-fold"></span>
        </div>
        <div class="leaf-corner-trigger corner-top-left" title="Click or drag to turn back">
          <span class="corner-fold"></span>
        </div>
        <div class="page-light-sheen"></div>
        <div class="page-dynamic-shadow"></div>
      </div>
    `;

    return leaf;
  }

  // HTML Generators for Pages
  generateFrontCoverHtml(cover) {
    return `
      <div class="book-cover-surface front-cover-art">
        <div class="cover-border-emboss">
          <div class="cover-header-meta">
            <span class="edition-pill">${cover.edition}</span>
            <span class="monogram-pill">✦ RINKI</span>
          </div>
          <div class="cover-hero-title">
            <div class="title-eyebrow">PORTFOLIO COLLECTION</div>
            <h1 class="cover-main-title">${cover.title}</h1>
            <div class="title-sub">${cover.subtitle}</div>
          </div>
          <div class="cover-geometric-accent">
            <div class="geo-ring ring-1"></div>
            <div class="geo-ring ring-2"></div>
            <div class="geo-diamond">✦</div>
          </div>
          <div class="cover-footer-meta">
            <div class="cover-role">${cover.role}</div>
            <div class="cover-tagline">${cover.tagline}</div>
            <div class="cover-open-cue">
              <span>DRAG EDGE OR CLICK TO OPEN</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  generateBackCoverHtml(cover) {
    return `
      <div class="book-cover-surface back-cover-art">
        <div class="cover-border-emboss">
          <div class="back-cover-center">
            <div class="back-monogram">R</div>
            <div class="back-title">Rinki Portfolio Archive 2024–2025</div>
            <div class="back-meta">ARCHIVE 2024 — 2025</div>
            <div class="back-barcode">
              <span>|||||||||||||||||||||||||||||||||||||</span>
              <small>ISBN 978-0-UX-ART-2025</small>
            </div>
          </div>
          <div class="back-cover-footer">
            <span>Thank you for reading.</span>
            <span>End of Volume One.</span>
          </div>
        </div>
      </div>
    `;
  }

  generateTocHtml(toc, pages) {
    let itemsHtml = '';
    pages.forEach(p => {
      const pageStr = String(p.pageNumber).padStart(2, '0');
      const displayTitle = p.title.startsWith('PAGE') ? p.subtitle : `${p.title} — ${p.subtitle}`;
      itemsHtml += `
        <li class="toc-item" data-jump-page="${p.pageNumber}">
          <span class="toc-num">${pageStr}</span>
          <span class="toc-title">${displayTitle}</span>
          <span class="toc-cat cat-${p.categoryTheme}">${p.category}</span>
          <span class="toc-dots"></span>
          <span class="toc-target">P.${pageStr}</span>
        </li>
      `;
    });

    return `
      <div class="editorial-page toc-page">
        <div class="page-running-head">
          <span>RINKI — SELECTED WORK</span>
          <span>INDEX & ARCHIVE</span>
        </div>
        <div class="toc-header">
          <span class="folio-badge-pill">ARCHIVE OVERVIEW</span>
          <h2 class="toc-title">${toc.heading}</h2>
          <p class="toc-sub">${toc.summary}</p>
        </div>
        <ul class="toc-list">
          ${itemsHtml}
        </ul>
        <div class="page-footer-folio">
          <span>FOLIO PREVIEW</span>
          <span class="page-stamp">INDEX / 04</span>
        </div>
      </div>
    `;
  }

  generateColophonHtml(colophon) {
    let toolsHtml = colophon.tools.map(t => `<span class="colophon-tool-pill">${t}</span>`).join('');

    return `
      <div class="editorial-page colophon-page">
        <div class="page-running-head">
          <span>RINKI — SELECTED WORK</span>
          <span>VOLUME CONCLUSION</span>
        </div>
        <div class="colophon-header">
          <span class="folio-badge-pill">CLOSING NOTES</span>
          <h2 class="colophon-title">${colophon.heading}</h2>
        </div>
        <div class="colophon-statement">
          <p class="statement-lead">${colophon.statement}</p>
        </div>
        <div class="colophon-section">
          <h4 class="colophon-sub">CREATIVE TOOLS & PIPELINE</h4>
          <div class="tools-grid">
            ${toolsHtml}
          </div>
        </div>
        <div class="colophon-section contact-plug">
          <h4 class="colophon-sub">COLLABORATIONS & INQUIRIES</h4>
          <p class="colophon-note">Open to select product design systems, editorial illustration, and generative AI research roles.</p>
          <a href="#contact" class="book-inquire-link">Get in Touch with Rinki ↗</a>
        </div>
        <div class="page-footer-folio">
          <span>${colophon.copyright}</span>
          <span class="page-stamp">COLOPHON</span>
        </div>
      </div>
    `;
  }

  generateProjectPageHtml(project, isRightSide) {
    const pageNumFormatted = String(project.pageNumber).padStart(2, '0');
    const tagsHtml = project.tags.map(t => `<span class="proj-tag">#${t}</span>`).join(' ');

    return `
      <div class="editorial-page project-page project-${project.id}" data-project-id="${project.id}">
        <!-- Top Running Folio -->
        <div class="page-running-head">
          <span>RINKI ARCHIVE // 2024–2025</span>
          <span class="cat-pill-badge cat-${project.categoryTheme}">${project.category}</span>
        </div>

        <!-- Project Header -->
        <div class="project-page-header">
          <div class="project-num-row">
            <span class="big-folio-num">${pageNumFormatted}</span>
            <span class="project-year-pill">${project.year}</span>
          </div>
          <h3 class="project-headline-title">${project.title}</h3>
          <h4 class="project-sub-title">${project.subtitle}</h4>
        </div>

        <!-- Interactive Visual Showcase Mockup / Card -->
        <div class="project-visual-card" data-behance-url="${project.behanceUrl}" title="View ${project.title} Case Study on Behance">
          <div class="card-preview-art preview-${project.previewType}">
            <!-- Project Real Image or Vector Art Mockup -->
            ${project.image ? `<img src="${project.image}" alt="${project.title} Showcase" class="project-hero-img" style="object-fit: ${project.imageFit || 'cover'}; object-position: ${project.imagePosition || '50% 50%'};" loading="lazy" />` : this.generateMockupSvg(project.previewType, project.accentColor)}
            <div class="art-overlay-glass">
              <span class="art-inspect-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                Inspect Case Study
              </span>
            </div>
            <!-- Floating Behance Badge -->
            <a href="${project.behanceUrl}" target="_blank" rel="noopener noreferrer" class="card-behance-badge btn-behance-view" data-behance-url="${project.behanceUrl}" aria-label="View ${project.title} Case Study on Behance">
              <span>View on Behance</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>

        <!-- Project Context & Highlights -->
        <div class="project-narrative-box">
          <p class="project-summary-text">${project.summary}</p>
          <div class="project-stats-row">
            <div class="stat-item">
              <span class="stat-v">${project.metrics.val1}</span>
              <span class="stat-l">${project.metrics.label1}</span>
            </div>
            <div class="stat-item">
              <span class="stat-v">${project.metrics.val2}</span>
              <span class="stat-l">${project.metrics.label2}</span>
            </div>
          </div>
          <div class="project-tags-cloud">
            ${tagsHtml}
          </div>
        </div>

        <!-- Page Footer Folio -->
        <div class="page-footer-folio">
          <span>PORTFOLIO SPECIFICATION</span>
          <span class="page-stamp">PAGE ${pageNumFormatted}</span>
        </div>
      </div>
    `;
  }

  // Generates clean vector wireframe/mockup artwork tailored to the project type
  generateMockupSvg(type, accentColor) {
    if (type === 'app-wireframe' || type === 'health-dashboard') {
      return `
        <svg class="preview-svg-canvas" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="180" rx="8" fill="rgba(15,16,20,0.4)"/>
          <!-- App Header -->
          <rect x="20" y="18" width="60" height="8" rx="4" fill="${accentColor}" opacity="0.8"/>
          <circle cx="295" cy="22" r="5" fill="rgba(255,255,255,0.2)"/>
          <!-- Metric Card -->
          <rect x="20" y="38" width="130" height="54" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)"/>
          <rect x="32" y="50" width="45" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
          <rect x="32" y="64" width="70" height="14" rx="4" fill="${accentColor}"/>
          <!-- Chart Card -->
          <rect x="160" y="38" width="140" height="54" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)"/>
          <path d="M172 76L195 56L220 68L255 48L288 62" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round"/>
          <!-- List Rows -->
          <rect x="20" y="104" width="280" height="28" rx="6" fill="rgba(255,255,255,0.04)"/>
          <circle cx="36" cy="118" r="6" fill="${accentColor}" opacity="0.6"/>
          <rect x="52" y="115" width="80" height="6" rx="3" fill="rgba(255,255,255,0.4)"/>
          <rect x="240" y="115" width="45" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
          <rect x="20" y="140" width="280" height="28" rx="6" fill="rgba(255,255,255,0.04)"/>
          <circle cx="36" cy="154" r="6" fill="var(--accent-magenta)" opacity="0.6"/>
          <rect x="52" y="151" width="95" height="6" rx="3" fill="rgba(255,255,255,0.4)"/>
        </svg>
      `;
    } else if (type === 'art-landscape' || type === 'character-lore' || type === 'vector-botany') {
      return `
        <svg class="preview-svg-canvas" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradArt-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#ec4899" stop-opacity="0.2"/>
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="8" fill="url(#gradArt-${type})"/>
          <!-- Sun / Moon -->
          <circle cx="160" cy="70" r="32" fill="${accentColor}" opacity="0.4"/>
          <!-- Geometric Mountain Peaks / Landscape -->
          <path d="M40 160L120 75L180 135L260 55L310 160Z" fill="rgba(15,16,22,0.85)"/>
          <path d="M0 180L70 120L150 180Z" fill="rgba(25,26,35,0.9)"/>
          <path d="M120 75L135 90L115 110" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          <circle cx="60" cy="40" r="1.5" fill="#fff" opacity="0.8"/>
          <circle cx="250" cy="35" r="1.5" fill="#fff" opacity="0.8"/>
          <circle cx="210" cy="25" r="1" fill="#fff" opacity="0.6"/>
        </svg>
      `;
    } else {
      return `
        <svg class="preview-svg-canvas" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="180" rx="8" fill="rgba(18,20,28,0.5)"/>
          <!-- Typographic Grid / Layout wireframe -->
          <rect x="25" y="25" width="120" height="130" rx="6" fill="rgba(255,255,255,0.04)" stroke="${accentColor}" stroke-dasharray="3 3"/>
          <rect x="40" y="45" width="90" height="14" rx="3" fill="${accentColor}" opacity="0.8"/>
          <rect x="40" y="68" width="70" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
          <rect x="40" y="80" width="80" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
          <rect x="160" y="25" width="135" height="60" rx="6" fill="rgba(255,255,255,0.06)"/>
          <circle cx="185" cy="55" r="14" fill="${accentColor}" opacity="0.3"/>
          <rect x="160" y="95" width="135" height="60" rx="6" fill="rgba(255,255,255,0.06)"/>
          <line x1="170" y1="115" x2="280" y2="115" stroke="${accentColor}" stroke-width="2"/>
          <line x1="170" y1="130" x2="250" y2="130" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        </svg>
      `;
    }
  }

  // 3. Z-INDEX AND SPREAD STATE MANAGEMENT
  updateSpreadState(animate = true) {
    const totalLeaves = this.leaves.length;

    this.leaves.forEach((leaf, i) => {
      // If leaf has been turned to left (i < this.currentSpread):
      // Angle: -180deg
      // Stacking on left: earlier leaves sit below later leaves -> z-index = i + 1
      if (i < this.currentSpread) {
        leaf.classList.add('turned');
        leaf.classList.remove('active-turning');
        if (animate) {
          leaf.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.4, 1)';
        } else {
          leaf.style.transition = 'none';
        }
        leaf.style.transform = 'rotateY(-180deg)';
        leaf.style.zIndex = i + 1;
      } 
      // If leaf is unturned on the right (i >= this.currentSpread):
      // Angle: 0deg
      // Stacking on right: earlier leaves sit above later leaves -> z-index = totalLeaves - i
      else {
        leaf.classList.remove('turned');
        leaf.classList.remove('active-turning');
        if (animate) {
          leaf.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.4, 1)';
        } else {
          leaf.style.transition = 'none';
        }
        leaf.style.transform = 'rotateY(0deg)';
        leaf.style.zIndex = totalLeaves - i;
      }

      // Reset dynamic shadows
      const frontShadow = leaf.querySelector('.front-face .page-dynamic-shadow');
      const backShadow = leaf.querySelector('.back-face .page-dynamic-shadow');
      if (frontShadow) frontShadow.style.opacity = '0';
      if (backShadow) backShadow.style.opacity = '0';
    });

    // Update Controls & Metadata
    this.updateControls();
  }

  updateControls() {
    // Pagination & Label
    if (this.pageIndicator) {
      if (this.currentSpread === 0) {
        this.pageIndicator.innerHTML = `<strong>Cover</strong> &bull; Closed Book`;
      } else if (this.currentSpread === this.totalSpreads) {
        this.pageIndicator.innerHTML = `<strong>Back Cover</strong> &bull; Archive 2024–2025`;
      } else {
        const leftPageNum = (this.currentSpread - 1) * 2;
        const rightPageNum = leftPageNum + 1;
        const leftStr = leftPageNum === 0 ? 'TOC' : `Page ${String(leftPageNum).padStart(2, '0')}`;
        const rightStr = rightPageNum > 4 ? 'Colophon' : `Page ${String(rightPageNum).padStart(2, '0')}`;
        this.pageIndicator.innerHTML = `<strong>${leftStr}</strong> &amp; <strong>${rightStr}</strong> <span class="dim">/ 04</span>`;
      }
    }

    // Prev / Next button states
    if (this.prevBtn) {
      this.prevBtn.disabled = (this.currentSpread <= 0);
      this.prevBtn.style.opacity = this.currentSpread <= 0 ? '0.4' : '1';
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = (this.currentSpread >= this.totalSpreads);
      this.nextBtn.style.opacity = this.currentSpread >= this.totalSpreads ? '0.4' : '1';
    }

    // Update Dots
    if (this.pageDotsContainer) {
      const dots = this.pageDotsContainer.querySelectorAll('.book-dot');
      dots.forEach((dot, idx) => {
        if (idx === this.currentSpread) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Toggle perspective wrapper class for styling
    if (this.perspectiveWrapper) {
      if (this.currentSpread === 0) {
        this.perspectiveWrapper.classList.add('is-closed-cover');
        this.perspectiveWrapper.classList.remove('is-open-spread');
      } else if (this.currentSpread === this.totalSpreads) {
        this.perspectiveWrapper.classList.add('is-closed-back');
        this.perspectiveWrapper.classList.remove('is-open-spread');
      } else {
        this.perspectiveWrapper.classList.remove('is-closed-cover', 'is-closed-back');
        this.perspectiveWrapper.classList.add('is-open-spread');
      }
    }
  }

  createPaginationDots() {
    if (!this.pageDotsContainer) return;
    this.pageDotsContainer.innerHTML = '';

    for (let i = 0; i <= this.totalSpreads; i++) {
      const dot = document.createElement('button');
      dot.className = `book-dot ${i === this.currentSpread ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to spread ${i}`);
      dot.addEventListener('click', () => {
        this.flipToSpread(i);
      });
      this.pageDotsContainer.appendChild(dot);
    }
  }

  // 4. PROGRAMMATIC PAGE TURNS (Buttons & Corner Clicks)
  flipNext() {
    if (this.currentSpread < this.totalSpreads && !this.isAnimating) {
      this.flipToSpread(this.currentSpread + 1);
    }
  }

  flipPrev() {
    if (this.currentSpread > 0 && !this.isAnimating) {
      this.flipToSpread(this.currentSpread - 1);
    }
  }

  flipToSpread(targetSpread) {
    if (targetSpread === this.currentSpread || this.isAnimating) return;
    if (targetSpread < 0 || targetSpread > this.totalSpreads) return;

    this.isAnimating = true;

    // Single step flip with full 3D arc
    if (Math.abs(targetSpread - this.currentSpread) === 1) {
      const isForward = targetSpread > this.currentSpread;
      const leafToTurn = isForward ? this.currentSpread : this.currentSpread - 1;
      const leaf = this.leaves[leafToTurn];

      if (leaf) {
        leaf.style.zIndex = 50; // In-flight leaf on top
        leaf.style.transition = 'transform 0.55s cubic-bezier(0.25, 1, 0.4, 1)';
        leaf.style.transform = isForward ? 'rotateY(-180deg)' : 'rotateY(0deg)';

        setTimeout(() => {
          this.currentSpread = targetSpread;
          this.updateSpreadState(false);
          this.isAnimating = false;
        }, 550);
        return;
      }
    }

    // Multi-step jump (from TOC or dots)
    this.currentSpread = targetSpread;
    this.updateSpreadState(true);
    setTimeout(() => {
      this.isAnimating = false;
    }, 600);
  }

  // 5. POINTER INTERACTION (DRAG TO FLIP WITH 3D CURL + CLICK TO NAVIGATE)
  setupPointerEvents() {
    const bookEl = this.container;

    // Pointer Down (Mouse, Touch, Pen)
    bookEl.addEventListener('pointerdown', (e) => {
      if (this.isAnimating) return;

      // Don't hijack if user clicked an explicit Behance link or TOC item directly
      // However, we track whether it turns into a drag!
      this.isPointerDown = true;
      this.hasMovedBeyondThreshold = false;
      this.isDragging = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startTime = Date.now();

      const rect = bookEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const bookMid = rect.width / 2;

      // Determine forward or backward turn target
      if (clickX >= bookMid) {
        // Right side of book -> Turning Forward
        if (this.currentSpread < this.totalSpreads) {
          this.activeLeafIndex = this.currentSpread;
          this.dragDirection = 'forward';
        } else {
          this.activeLeafIndex = -1;
        }
      } else {
        // Left side of book -> Turning Backward
        if (this.currentSpread > 0) {
          this.activeLeafIndex = this.currentSpread - 1;
          this.dragDirection = 'backward';
        } else {
          this.activeLeafIndex = -1;
        }
      }

      if (this.activeLeafIndex >= 0) {
        const leaf = this.leaves[this.activeLeafIndex];
        leaf.style.zIndex = 60; // Keep on top during potential drag
      }
    });

    // Pointer Move
    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown || this.activeLeafIndex < 0) return;

      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      const dist = Math.hypot(dx, dy);

      // Check threshold for drag initiation
      if (!this.hasMovedBeyondThreshold) {
        if (dist > this.dragThreshold) {
          this.hasMovedBeyondThreshold = true;
          this.isDragging = true;
          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'grabbing';
        } else {
          return;
        }
      }

      if (this.isDragging) {
        const leaf = this.leaves[this.activeLeafIndex];
        const rect = bookEl.getBoundingClientRect();
        const pageWidth = rect.width / 2;

        leaf.style.transition = 'none'; // Instant 1:1 cursor tracking

        let progress = 0;
        if (this.dragDirection === 'forward') {
          // Dragging leftward (dx < 0)
          progress = Math.max(0, Math.min(1, -dx / (pageWidth * 1.05)));
          const angle = -180 * progress;
          // Organic page curl proportional to vertical mouse pull
          const curlZ = (dy / rect.height) * 12 * Math.sin(progress * Math.PI);
          const skewY = (dy / rect.height) * 4 * Math.sin(progress * Math.PI);

          leaf.style.transform = `rotateY(${angle.toFixed(1)}deg) rotateZ(${curlZ.toFixed(1)}deg) skewY(${skewY.toFixed(1)}deg)`;

          // Shading
          const shadow = leaf.querySelector(progress > 0.5 ? '.back-face .page-dynamic-shadow' : '.front-face .page-dynamic-shadow');
          if (shadow) {
            shadow.style.opacity = (Math.sin(progress * Math.PI) * 0.55).toFixed(2);
          }
        } else {
          // Dragging rightward (dx > 0)
          progress = Math.max(0, Math.min(1, dx / (pageWidth * 1.05)));
          const angle = -180 + 180 * progress;
          const curlZ = -(dy / rect.height) * 12 * Math.sin(progress * Math.PI);
          const skewY = -(dy / rect.height) * 4 * Math.sin(progress * Math.PI);

          leaf.style.transform = `rotateY(${angle.toFixed(1)}deg) rotateZ(${curlZ.toFixed(1)}deg) skewY(${skewY.toFixed(1)}deg)`;

          // Shading
          const shadow = leaf.querySelector(progress > 0.5 ? '.front-face .page-dynamic-shadow' : '.back-face .page-dynamic-shadow');
          if (shadow) {
            shadow.style.opacity = (Math.sin(progress * Math.PI) * 0.55).toFixed(2);
          }
        }

        this.dragProgress = progress;
      }
    }, { passive: true });

    // Pointer Up (Release)
    window.addEventListener('pointerup', (e) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      if (this.isDragging) {
        // Set flag so simultaneous click handlers (e.g. Behance links) do NOT trigger
        this.hasJustDragged = true;
        setTimeout(() => {
          this.hasJustDragged = false;
        }, 250);

        const leaf = this.leaves[this.activeLeafIndex];
        const elapsed = Date.now() - this.startTime;
        const dx = e.clientX - this.startX;
        const velocity = Math.abs(dx) / Math.max(1, elapsed);

        // Turn complete threshold: 35% drag or high velocity flick
        const shouldComplete = (this.dragProgress > 0.35) || (velocity > 0.45 && this.dragProgress > 0.1);

        leaf.style.transition = 'transform 0.42s cubic-bezier(0.25, 1, 0.4, 1)';

        if (this.dragDirection === 'forward') {
          if (shouldComplete) {
            leaf.style.transform = 'rotateY(-180deg)';
            setTimeout(() => {
              this.currentSpread++;
              this.updateSpreadState(false);
              this.activeLeafIndex = -1;
            }, 420);
          } else {
            // Cancel and snap back
            leaf.style.transform = 'rotateY(0deg)';
            setTimeout(() => {
              this.updateSpreadState(false);
              this.activeLeafIndex = -1;
            }, 420);
          }
        } else {
          // Backward drag
          if (shouldComplete) {
            leaf.style.transform = 'rotateY(0deg)';
            setTimeout(() => {
              this.currentSpread--;
              this.updateSpreadState(false);
              this.activeLeafIndex = -1;
            }, 420);
          } else {
            // Cancel and snap back
            leaf.style.transform = 'rotateY(-180deg)';
            setTimeout(() => {
              this.updateSpreadState(false);
              this.activeLeafIndex = -1;
            }, 420);
          }
        }
      } else {
        // PURE CLICK DETECTED (movement < 8px)
        this.handleClickInteraction(e);
      }
    });

    // Handle corner click trigger zones
    bookEl.addEventListener('click', (e) => {
      // Handled via pointerup click discrimination
    });
  }

  // 6. CLICK VS DRAG HANDLER
  handleClickInteraction(e) {
    if (this.hasJustDragged) return;

    // Check if clicked on a corner trigger
    const cornerTrigger = e.target.closest('.leaf-corner-trigger');
    if (cornerTrigger) {
      if (cornerTrigger.classList.contains('corner-bottom-right') || cornerTrigger.classList.contains('corner-top-right')) {
        this.flipNext();
        return;
      }
      if (cornerTrigger.classList.contains('corner-bottom-left') || cornerTrigger.classList.contains('corner-top-left')) {
        this.flipPrev();
        return;
      }
    }

    // Check if clicked on a Table of Contents jump item
    const tocItem = e.target.closest('.toc-item');
    if (tocItem) {
      const pageNum = parseInt(tocItem.dataset.jumpPage, 10);
      if (!isNaN(pageNum)) {
        // Page 1 is on spread 1, Page 2 on spread 2, Page 3 on spread 2, etc.
        const targetSpread = Math.floor(pageNum / 2) + 1;
        this.flipToSpread(targetSpread);
        return;
      }
    }

    // Check if clicked on Behance View Button, Badge, or Card
    const behanceBtn = e.target.closest('.btn-behance-view') || e.target.closest('.card-behance-badge') || e.target.closest('.project-visual-card');
    if (behanceBtn) {
      const url = behanceBtn.dataset.behanceUrl || behanceBtn.closest('[data-behance-url]')?.dataset.behanceUrl || behanceBtn.getAttribute('href');
      if (url && !this.hasJustDragged) {
        e.preventDefault();
        // Show non-intrusive feedback toast & open in new tab
        this.showBehanceToast(url);
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
    }
  }

  showBehanceToast(url) {
    let toast = document.getElementById('book-behance-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'book-behance-toast';
      toast.className = 'book-toast-alert';
      document.body.appendChild(toast);
    }
    let title = 'Case Study';
    if (url.includes('/gallery/')) {
      const parts = url.split('/gallery/')[1].split('/');
      title = (parts[1] || parts[0]).replace(/-/g, ' ');
    }
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <span>Opening Behance project: <strong>${title}</strong></span>
    `;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 7. BUTTON & KEYBOARD NAVIGATION
  setupButtonEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.flipPrev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.flipNext());
    }
  }

  setupKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      // Only active if work section is in viewport
      const workSec = document.getElementById('work');
      if (!workSec) return;
      const rect = workSec.getBoundingClientRect();
      const inView = (rect.top <= window.innerHeight * 0.7 && rect.bottom >= window.innerHeight * 0.3);

      if (inView) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          this.flipNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          this.flipPrev();
        }
      }
    });
  }

  // 8. RESPONSIVE RESIZE OBSERVER (Preserves exact A4 ratios)
  setupResizeObserver() {
    if (!window.ResizeObserver) return;
    const ro = new ResizeObserver((entries) => {
      for (let entry of entries) {
        this.recalculateA4Proportions();
      }
    });
    ro.observe(this.container);
  }

  recalculateA4Proportions() {
    const bookEl = this.container;
    const stageWidth = bookEl.parentElement.offsetWidth;
    
    // A4 Portrait Page Ratio = 1 : 1.4142
    // Open 2-page Spread Ratio = 2 : 1.4142 = 1.4142 : 1
    // Calculate maximum fit inside stage without viewport overflow
    let spreadWidth = Math.min(940, stageWidth - 32);
    if (window.innerWidth < 768) {
      spreadWidth = Math.min(stageWidth - 20, 680);
    }
    const spreadHeight = Math.round(spreadWidth / 1.4142);

    bookEl.style.width = `${spreadWidth}px`;
    bookEl.style.height = `${spreadHeight}px`;
  }
}

// Global initialization on DOM ready or immediate if already interactive
function initPortfolioBook() {
  if (!window.rinkiPortfolioBook && document.getElementById('portfolio-book')) {
    window.rinkiPortfolioBook = new PortfolioBook('portfolio-book');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioBook);
} else {
  initPortfolioBook();
}
