/**
 * NovaMeds PDP — desktop gallery lock (InfinityHoop-style).
 * Uses position:fixed while scrolling; pins to bottom at section end.
 */
(function () {
  'use strict';

  var DESKTOP_MQ = window.matchMedia('(min-width: 991px)');
  var TOP_OFFSET = 115;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function init(page) {
    var layout = qs('[data-nm-product-layout]', page);
    var mediaCol = qs('[data-nm-pdp-media]', page);
    var inner = qs('[data-nm-pdp-sticky-inner]', page);
    if (!layout || !mediaCol || !inner) return;

    var enabled = false;
    var raf = 0;

    function clearStyles() {
      inner.style.position = '';
      inner.style.top = '';
      inner.style.left = '';
      inner.style.width = '';
      inner.style.zIndex = '';
      mediaCol.style.minHeight = '';
      page.classList.remove('is-pdp-media-fixed');
    }

    function measure() {
      if (!enabled) return;

      var scrollY = window.scrollY || window.pageYOffset;
      var pageRect = page.getBoundingClientRect();
      var pageTop = scrollY + pageRect.top;
      var pageBottom = pageTop + page.offsetHeight;
      var layoutH = layout.offsetHeight;
      var innerH = inner.offsetHeight;
      var colRect = mediaCol.getBoundingClientRect();
      var start = pageTop - TOP_OFFSET;
      var end = pageBottom - innerH - TOP_OFFSET;

      if (scrollY < start) {
        clearStyles();
        return;
      }

      page.classList.add('is-pdp-media-fixed');
      mediaCol.style.minHeight = layoutH + 'px';
      mediaCol.style.position = 'relative';

      if (scrollY >= end) {
        inner.style.position = 'absolute';
        inner.style.top = layoutH - innerH + 'px';
        inner.style.left = '0';
        inner.style.width = '100%';
        inner.style.zIndex = '2';
        return;
      }

      inner.style.position = 'fixed';
      inner.style.top = TOP_OFFSET + 'px';
      inner.style.left = colRect.left + 'px';
      inner.style.width = colRect.width + 'px';
      inner.style.zIndex = '2';
    }

    function onScrollOrResize() {
      if (!enabled) return;
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        measure();
      });
    }

    function enable() {
      if (enabled) return;
      enabled = true;
      measure();
      window.addEventListener('scroll', onScrollOrResize, { passive: true });
      window.addEventListener('resize', onScrollOrResize);
    }

    function disable() {
      if (!enabled) return;
      enabled = false;
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      clearStyles();
      mediaCol.style.position = '';
    }

    function onMqChange() {
      if (DESKTOP_MQ.matches) {
        enable();
      } else {
        disable();
      }
    }

    if (typeof DESKTOP_MQ.addEventListener === 'function') {
      DESKTOP_MQ.addEventListener('change', onMqChange);
    } else {
      DESKTOP_MQ.addListener(onMqChange);
    }

    onMqChange();
  }

  function boot() {
    document.querySelectorAll('[data-nm-product-page]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', function (evt) {
    var root = evt.target;
    if (!root) return;
    var page = root.matches && root.matches('[data-nm-product-page]') ? root : qs('[data-nm-product-page]', root);
    if (page) init(page);
  });
})();
