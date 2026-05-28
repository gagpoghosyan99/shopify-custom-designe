/**
 * NovaMeds vNext JS (additive)
 * Keep this file tiny: only progressive enhancements not in legacy `novameds.js`.
 */
(function () {
  'use strict';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  // Sticky checkout bar (catalog) — progressive enhancement
  var checkoutBar = qs('[data-nm-checkout-bar]');
  if (checkoutBar) {
    var lastY = 0;
    window.addEventListener(
      'scroll',
      function () {
        var y = window.scrollY || 0;
        var goingDown = y > lastY;
        lastY = y;
        checkoutBar.classList.toggle('is-hidden', goingDown && y > 260);
      },
      { passive: true }
    );
  }

  // Copy discount code button
  qsa('[data-nm-copy-code]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-code') || '';
      if (!code) return;
      var done = function () {
        var prev = btn.innerHTML;
        btn.innerHTML = 'Copied <strong>' + code + '</strong>';
        setTimeout(function () {
          btn.innerHTML = prev;
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(done);
      } else {
        done();
      }
    });
  });
})();

