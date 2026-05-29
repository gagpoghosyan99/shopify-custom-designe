/**
 * Customer reviews — infinite marquee loop
 */
(function () {
  'use strict';

  var section = document.querySelector('[data-nm-creviews]');
  if (!section) return;

  var track = section.querySelector('[data-nm-creviews-track]');
  var marquee = section.querySelector('[data-nm-creviews-marquee]');
  if (!track || !marquee) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 767px)').matches;

  if (reduced) {
    section.classList.add('nm-creviews--static');
    return;
  }

  if (mobile) {
    section.classList.add('nm-creviews--mobile-scroll');
    return;
  }

  section.classList.add('nm-creviews--running');
})();
