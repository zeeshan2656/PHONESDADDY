// PhonesDaddy - Ultra-Modern Hero Flagship Slider
(function () {
  'use strict';

  function initHeroSlider() {
    const slider = document.getElementById('heroSliderSection');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const tabs = Array.from(slider.querySelectorAll('.hero-slider-tab'));
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    const ambientGlow = slider.querySelector('.hero-ambient-glow');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let timer = null;
    let progressTimer = null;
    let progressStartTime = 0;
    const SLIDE_DURATION = 6000; // 6 seconds per slide
    let isPaused = false;

    // Theme glow colors matching each slide
    const glowColors = [
      'rgba(13, 148, 136, 0.45)',  // Cyan / Teal for Samsung
      'rgba(245, 158, 11, 0.38)',  // Warm Amber / Titanium for Apple
      'rgba(16, 185, 129, 0.40)',  // Aurora Emerald for Titanium Flagship
      'rgba(249, 115, 22, 0.38)'   // Sunset Orange for Xiaomi
    ];

    function goToSlide(index, manual = false) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      currentIndex = index;

      // Update slides active state
      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.add('active');
          slide.setAttribute('aria-hidden', 'false');
        } else {
          slide.classList.remove('active');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      // Update tabs active state
      tabs.forEach((tab, i) => {
        const progressBar = tab.querySelector('.hero-tab-progress');
        if (i === currentIndex) {
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
          if (progressBar) {
            progressBar.style.width = '0%';
          }
        } else {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
          if (progressBar) {
            progressBar.style.width = '0%';
          }
        }
      });

      // Update ambient dynamic glow
      if (ambientGlow && glowColors[currentIndex]) {
        ambientGlow.style.setProperty('--current-glow', glowColors[currentIndex]);
      }

      // Reset auto-play timer
      resetAutoPlay();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startProgress() {
      stopProgress();
      progressStartTime = Date.now();

      function updateProgress() {
        if (isPaused) {
          progressTimer = requestAnimationFrame(updateProgress);
          return;
        }

        const elapsed = Date.now() - progressStartTime;
        const progress = Math.min(100, (elapsed / SLIDE_DURATION) * 100);

        const activeTab = tabs[currentIndex];
        if (activeTab) {
          const bar = activeTab.querySelector('.hero-tab-progress');
          if (bar) bar.style.width = progress + '%';
        }

        if (elapsed < SLIDE_DURATION) {
          progressTimer = requestAnimationFrame(updateProgress);
        }
      }

      progressTimer = requestAnimationFrame(updateProgress);
    }

    function stopProgress() {
      if (progressTimer) {
        cancelAnimationFrame(progressTimer);
        progressTimer = null;
      }
    }

    function resetAutoPlay() {
      if (timer) clearInterval(timer);
      stopProgress();

      if (!isPaused) {
        startProgress();
        timer = setInterval(() => {
          if (!isPaused) {
            nextSlide();
          }
        }, SLIDE_DURATION);
      }
    }

    // Attach Tab Clicks
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        goToSlide(i, true);
      });
    });

    // Attach Arrow Buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
      });
    }

    // Pause on Hover
    slider.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    slider.addEventListener('mouseleave', () => {
      isPaused = false;
      resetAutoPlay();
    });

    // Touch Swipe Navigation for Mobile/Tablet
    let touchStartX = 0;
    let touchStartY = 0;

    slider.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        // If swipe is primarily horizontal and > 40px
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
      }
    }, { passive: true });

    // Keyboard Arrow Navigation
    document.addEventListener('keydown', (e) => {
      // Only when hero is roughly in viewport and not inside input
      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }
      const rect = slider.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        if (e.key === 'ArrowRight') {
          nextSlide();
        } else if (e.key === 'ArrowLeft') {
          prevSlide();
        }
      }
    });

    // Quick Compare Handlers on Slide Buttons
    slider.querySelectorAll('.btn-slide-compare').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slug = btn.getAttribute('data-slug');
        if (!slug) return;

        if (typeof CompareBasket !== 'undefined') {
          const added = CompareBasket.add(slug);
          if (added) {
            btn.innerHTML = `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Added!`;
            btn.style.borderColor = 'var(--primary)';
            btn.style.color = 'var(--primary)';

            const list = CompareBasket.get();
            if (list.length >= 2) {
              setTimeout(() => {
                window.location.href = `/compare?phones=${list.join(',')}`;
              }, 600);
            } else {
              setTimeout(() => {
                btn.innerHTML = `+ Compare`;
                btn.style.borderColor = '';
                btn.style.color = '';
              }, 2500);
            }
          }
        }
      });
    });

    // Initialize first slide
    goToSlide(0);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSlider);
  } else {
    initHeroSlider();
  }
})();
