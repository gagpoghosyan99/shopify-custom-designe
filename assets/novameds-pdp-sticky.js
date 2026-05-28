/**
 * NovaMeds PDP — lock left gallery on desktop (position: fixed).
 */
(function () {
  'use strict';

  var MQ = '(min-width: 991px)';
  var TOP = 115;

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function lockGallery(page) {
    var layout = page.querySelector('[data-nm-product-layout]');
    var media = page.querySelector('[data-nm-pdp-media]');
    var inner = page.querySelector('[data-nm-pdp-sticky-inner]');
    var spacer = page.querySelector('[data-nm-pdp-spacer]');
    if (!layout || !media || !inner) return null;

    var raf = 0;
    var running = false;

    function unlock() {
      inner.classList.remove('is-locked', 'is-pinned-bottom');
      inner.style.left = '';
      inner.style.width = '';
      inner.style.right = '';
      media.style.minHeight = '';
      if (spacer) spacer.style.height = '0';
      page.classList.remove('is-pdp-media-fixed');
    }

    function tick() {
      if (!running) return;

      var innerH = inner.offsetHeight;
      if (spacer) spacer.style.height = innerH + 'px';

      var layoutRect = layout.getBoundingClientRect();
      var mediaRect = media.getBoundingClientRect();
      var layoutH = layout.offsetHeight;

      media.style.position = 'relative';
      media.style.minHeight = layoutH + 'px';

      if (layoutRect.bottom <= TOP || layoutRect.top >= window.innerHeight) {
        unlock();
        return;
      }

      if (layoutRect.top > TOP) {
        unlock();
        return;
      }

      page.classList.add('is-pdp-media-fixed');

      if (layoutRect.bottom <= TOP + innerH) {
        inner.classList.remove('is-locked');
        inner.classList.add('is-pinned-bottom');
        inner.style.left = '0';
        inner.style.width = '100%';
        inner.style.right = '';
        return;
      }

      inner.classList.add('is-locked');
      inner.classList.remove('is-pinned-bottom');
      inner.style.left = mediaRect.left + 'px';
      inner.style.width = mediaRect.width + 'px';
      inner.style.right = 'auto';
    }

    function requestTick() {
      if (!running) return;
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        tick();
      });
    }

    function start() {
      if (running) return;
      running = true;
      tick();
      window.addEventListener('scroll', requestTick, { passive: true });
      window.addEventListener('resize', requestTick);
    }

    function stop() {
      if (!running) return;
      running = false;
      window.removeEventListener('scroll', requestTick);
      window.removeEventListener('resize', requestTick);
      unlock();
      media.style.position = '';
    }

    function mqChange() {
      if (window.matchMedia(MQ).matches) {
        start();
      } else {
        stop();
      }
    }

    var mql = window.matchMedia(MQ);
    if (mql.addEventListener) mql.addEventListener('change', mqChange);
    else if (mql.addListener) mql.addListener(mqChange);

    mqChange();

    return { stop: stop, refresh: tick };
  }

  function boot() {
    qsa('[data-nm-product-page]').forEach(lockGallery);
  }

  window.NovaMedsPdpSticky = { lockGallery: lockGallery, boot: boot };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', boot);

  document.addEventListener('shopify:section:load', function (e) {
    var root = e.target;
    if (!root) return;
    var page = root.matches && root.matches('[data-nm-product-page]')
      ? root
      : root.querySelector('[data-nm-product-page]');
    if (page) lockGallery(page);
  });
})();
