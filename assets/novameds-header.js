/* NovaMeds header — left drawer menu */
(function () {
  'use strict';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function initDrawer(root) {
    if (!root) return;

    var drawer = qs('[data-nm-hdr-drawer]', root);
    var menuToggle = qs('[data-nm-menu-toggle]', root);
    if (!drawer || !menuToggle) return;

    var closeTriggers = qsa('[data-nm-hdr-drawer-close]', root);

    function setOpen(open) {
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nm-modal-open', open);
    }

    function closeDrawer() {
      setOpen(false);
    }

    function openDrawer() {
      setOpen(true);
    }

    function toggleDrawer() {
      setOpen(!drawer.classList.contains('is-open'));
    }

    menuToggle.addEventListener('click', function (e) {
      e.preventDefault();
      toggleDrawer();
    });

    closeTriggers.forEach(function (btn) {
      btn.addEventListener('click', closeDrawer);
    });

    drawer.querySelectorAll('.nm-hdr-drawer__link, .nm-hdr-drawer__cta').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
        menuToggle.focus();
      }
    });

    window.NovaMedsHeader = window.NovaMedsHeader || {};
    window.NovaMedsHeader.closeDrawer = closeDrawer;
  }

  function initAll() {
    qsa('[data-nm-nova-header]').forEach(initDrawer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (evt) {
    var root = evt.target;
    if (root && root.matches && root.matches('[data-nm-nova-header]')) {
      initDrawer(root);
    } else if (root) {
      var nested = qs('[data-nm-nova-header]', root);
      if (nested) initDrawer(nested);
    }
  });
})();
