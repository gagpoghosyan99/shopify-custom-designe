(function () {
  'use strict';

  var section = document.querySelector('[data-nm-trust-nl]');
  if (!section) return;

  var statsAnimated = false;

  function parseStatValue(str) {
    var raw = String(str || '').trim();
    var match = raw.match(/^([\d,]+)(.*)$/);
    if (!match) return null;
    return {
      target: parseInt(match[1].replace(/,/g, ''), 10),
      suffix: match[2] || ''
    };
  }

  function formatStatValue(value, suffix) {
    if (suffix === '%' || suffix === 'h') {
      return String(value) + suffix;
    }
    return value.toLocaleString('en-US') + suffix;
  }

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    var stats = section.querySelectorAll('[data-nm-trust-stat]');
    stats.forEach(function (el, index) {
      var parsed = parseStatValue(el.getAttribute('data-value'));
      if (!parsed || isNaN(parsed.target)) {
        el.textContent = el.getAttribute('data-value') || '';
        return;
      }

      var duration = 1800 + index * 200;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(parsed.target * eased);
        el.textContent = formatStatValue(current, parsed.suffix);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = formatStatValue(parsed.target, parsed.suffix);
        }
      }

      requestAnimationFrame(step);
    });
  }

  function revealSection() {
    section.classList.add('is-visible');
    animateStats();
  }

  if (section.getAttribute('data-anim') === 'false') {
    revealSection();
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    section.querySelectorAll('[data-nm-trust-stat]').forEach(function (el) {
      el.textContent = el.getAttribute('data-value') || '';
    });
    revealSection();
    return;
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealSection();
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(section);
  } else {
    revealSection();
  }
})();
