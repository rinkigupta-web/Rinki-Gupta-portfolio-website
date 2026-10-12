/**
 * =====================================================================
 * RINKI GUPTA PORTFOLIO — DIRECT CONTACT & FOOTER LOGIC
 * =====================================================================
 * Clean, lightweight, direct contact interactions:
 * - 1-Click Clipboard Email Copy with Accessible Feedback
 * - Dynamic Current Year Copyright in Footer
 * - Accessible Back to Top Smooth Scrolling
 * =====================================================================
 */

(function () {
  'use strict';

  // Config & Constants
  const CONTACT_EMAIL = 'rinkigupta.uxui@gmail.com';

  // DOM Elements
  const copyEmailBtn = document.getElementById('btn-copy-email');
  const currentYearSpan = document.getElementById('current-year');
  const backToTopBtn = document.getElementById('btn-back-to-top');

  // 1. Dynamic Footer Year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // 2. Copy Email Address to Clipboard
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      let copied = false;

      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(CONTACT_EMAIL);
          copied = true;
        } catch (err) {
          copied = false;
        }
      }

      // Robust fallback via textarea
      if (!copied) {
        try {
          const tempInput = document.createElement('textarea');
          tempInput.value = CONTACT_EMAIL;
          tempInput.style.position = 'fixed';
          tempInput.style.opacity = '0';
          document.body.appendChild(tempInput);
          tempInput.focus();
          tempInput.select();
          copied = document.execCommand('copy');
          document.body.removeChild(tempInput);
        } catch (err) {
          copied = false;
        }
      }

      // Accessible Feedback Notification
      const textSpan = copyEmailBtn.querySelector('.copy-text');
      const originalText = textSpan ? textSpan.textContent : 'Copy email';

      if (copied) {
        copyEmailBtn.classList.add('copied');
        if (textSpan) textSpan.textContent = 'Email copied!';

        setTimeout(() => {
          copyEmailBtn.classList.remove('copied');
          if (textSpan) textSpan.textContent = originalText;
        }, 2600);
      } else {
        window.prompt('Copy email address:', CONTACT_EMAIL);
      }
    });
  }

  // 3. Smooth Back to Top
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
