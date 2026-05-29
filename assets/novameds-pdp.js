/* NovaMeds — PDP gallery (arrows, swipe, thumbs) */
(function () {
  function initGallery(page) {
    var root = page.querySelector('[data-nm-pdp-gallery]');
    if (!root) return;

    var carousel = root.querySelector('[data-nm-pdp-carousel]');
    if (!carousel) return;

    var slides = carousel.querySelectorAll('[data-nm-pdp-slide]');
    var thumbs = page.querySelectorAll('[data-nm-pdp-thumb]');
    var dots = page.querySelectorAll('[data-nm-pdp-dot]');
    var prevBtn = page.querySelector('[data-nm-pdp-prev]');
    var nextBtn = page.querySelector('[data-nm-pdp-next]');
    var total = slides.length;
    var current = 0;
    var ticking = false;

    function clampIndex(idx) {
      if (total <= 0) return 0;
      if (idx < 0) return total - 1;
      if (idx >= total) return 0;
      return idx;
    }

    function setActiveIndex(idx) {
      current = clampIndex(idx);
      thumbs.forEach(function (t) {
        t.classList.toggle('is-active', String(t.getAttribute('data-index')) === String(current));
      });
      dots.forEach(function (d) {
        d.classList.toggle('is-active', String(d.getAttribute('data-index')) === String(current));
      });
      if (prevBtn) prevBtn.disabled = total <= 1;
      if (nextBtn) nextBtn.disabled = total <= 1;
    }

    function scrollToIndex(idx, behavior) {
      var target = clampIndex(idx);
      var slide = null;
      slides.forEach(function (s) {
        if (String(s.getAttribute('data-nm-pdp-slide')) === String(target)) slide = s;
      });
      if (!slide) return;
      carousel.scrollTo({ left: slide.offsetLeft, behavior: behavior || 'smooth' });
      setActiveIndex(target);
    }

    function readIndexFromScroll() {
      var best = 0;
      var bestDist = Infinity;
      slides.forEach(function (s) {
        var dist = Math.abs(s.offsetLeft - carousel.scrollLeft);
        if (dist < bestDist) {
          bestDist = dist;
          best = parseInt(s.getAttribute('data-nm-pdp-slide') || '0', 10) || 0;
        }
      });
      setActiveIndex(best);
    }

    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        scrollToIndex(parseInt(btn.getAttribute('data-index') || '0', 10));
      });
    });

    dots.forEach(function (btn) {
      btn.addEventListener('click', function () {
        scrollToIndex(parseInt(btn.getAttribute('data-index') || '0', 10));
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        scrollToIndex(current - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        scrollToIndex(current + 1);
      });
    }

    carousel.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          readIndexFromScroll();
        });
      },
      { passive: true }
    );

    root.addEventListener('keydown', function (e) {
      if (total <= 1) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToIndex(current - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToIndex(current + 1);
      }
    });

    setActiveIndex(0);
  }

  function initReviewsLoop(page) {
    var section = page.querySelector('[data-nm-pdp-reviews]');
    if (!section) return;

    var track = section.querySelector('[data-nm-pdp-reviews-track]');
    var prev = section.querySelector('[data-nm-pdp-reviews-prev]');
    var next = section.querySelector('[data-nm-pdp-reviews-next]');
    if (!track) return;

    var cards = track.querySelectorAll('.nm-pdp-review-card');
    if (cards.length <= 1) return;

    var autoplayMs = 5500;
    var autoplayTimer = null;
    var step = 0;

    function getStep() {
      var first = cards[0];
      if (!first) return 320;
      var cs = window.getComputedStyle(track);
      var gap = parseFloat(cs.columnGap || cs.gap || '0') || 0;
      return Math.round(first.getBoundingClientRect().width + gap);
    }

    function refreshStep() {
      step = getStep();
    }

    function scrollByStep(dir) {
      refreshStep();
      var max = track.scrollWidth - track.clientWidth;
      var target = track.scrollLeft + dir * step;

      if (target > max + 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      if (target < 0) {
        track.scrollTo({ left: max, behavior: 'smooth' });
        return;
      }
      track.scrollBy({ left: dir * step, behavior: 'smooth' });
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = window.setInterval(function () {
        scrollByStep(1);
      }, autoplayMs);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        scrollByStep(-1);
        startAutoplay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        scrollByStep(1);
        startAutoplay();
      });
    }

    track.addEventListener('scroll', refreshStep, { passive: true });
    window.addEventListener('resize', refreshStep, { passive: true });
    section.addEventListener('mouseenter', stopAutoplay);
    section.addEventListener('mouseleave', startAutoplay);
    section.addEventListener('focusin', stopAutoplay);
    section.addEventListener('focusout', startAutoplay);

    refreshStep();
    startAutoplay();
  }

  function initWishlist(page) {
    var btn = page.querySelector('[data-nm-pdp-wish]');
    if (!btn) return;

    var variantId = btn.getAttribute('data-variant-id');
    if (!variantId) return;

    function setSaved(saved) {
      btn.classList.toggle('is-active', saved);
      btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      btn.textContent = saved ? '♥' : '♡';
    }

    function findCartLine(cart) {
      if (!cart || !cart.items) return null;
      for (var i = 0; i < cart.items.length; i++) {
        if (String(cart.items[i].variant_id) === String(variantId)) return cart.items[i];
      }
      return null;
    }

    fetch('/cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        setSaved(!!findCartLine(cart));
      })
      .catch(function () {});

    btn.addEventListener('click', function () {
      var isActive = btn.classList.contains('is-active');
      btn.disabled = true;

      if (isActive) {
        fetch('/cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
          .then(function (res) { return res.json(); })
          .then(function (cart) {
            var line = findCartLine(cart);
            if (!line) {
              setSaved(false);
              return null;
            }
            return fetch('/cart/change.js', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: line.key, quantity: 0 }),
            }).then(function (res) { return res.json(); });
          })
          .then(function (cart) {
            if (cart && window.NovaMeds && window.NovaMeds.closePanels) {
              /* badge refresh via cart reload */
            }
            setSaved(false);
            if (typeof fetch === 'function') {
              fetch('/cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
                .then(function (r) { return r.json(); })
                .then(function (c) {
                  document.querySelectorAll('[data-nm-header-cart-count]').forEach(function (el) {
                    var n = c.item_count || 0;
                    el.textContent = n > 0 ? String(n) : '';
                    el.style.display = n > 0 ? '' : 'none';
                  });
                })
                .catch(function () {});
            }
          })
          .finally(function () { btn.disabled = false; });
        return;
      }

      fetch('/cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId, 10), quantity: 1 }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Add failed');
          return res.json();
        })
        .then(function () {
          setSaved(true);
          return fetch('/cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          document.querySelectorAll('[data-nm-header-cart-count]').forEach(function (el) {
            var n = cart.item_count || 0;
            el.textContent = n > 0 ? String(n) : '';
            el.style.display = n > 0 ? '' : 'none';
          });
          var label = document.querySelector('[data-nm-cart-count-label]');
          if (label) label.textContent = cart.item_count > 0 ? '(' + cart.item_count + ')' : '';
        })
        .catch(function () {})
        .finally(function () { btn.disabled = false; });
    });

    page.addEventListener('change', function (e) {
      if (!e.target.matches('input[data-nm-opt]')) return;
      var idInput = page.querySelector('[data-nm-variant-id]');
      if (idInput) {
        variantId = idInput.value;
        btn.setAttribute('data-variant-id', variantId);
        fetch('/cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
          .then(function (res) { return res.json(); })
          .then(function (cart) { setSaved(!!findCartLine(cart)); })
          .catch(function () {});
      }
    });
  }

  function initInfoScroll(root) {
    var infoScroll = root.querySelector('[data-nm-pdp-info-scroll]');
    if (!infoScroll || window.matchMedia('(max-width: 990px)').matches) return;

    infoScroll.addEventListener(
      'wheel',
      function (e) {
        var atTop = infoScroll.scrollTop <= 0;
        var atBottom = infoScroll.scrollTop + infoScroll.clientHeight >= infoScroll.scrollHeight - 1;
        if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) return;
        e.stopPropagation();
      },
      { passive: true }
    );
  }

  function initPage(root) {
    initGallery(root);
    initInfoScroll(root);
    initReviewsLoop(root);
    initWishlist(root);
  }

  function boot() {
    document.querySelectorAll('[data-nm-product-page]').forEach(initPage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (e) {
    var page = e.target.querySelector('[data-nm-product-page]');
    if (page) initPage(page);
  });
})();
