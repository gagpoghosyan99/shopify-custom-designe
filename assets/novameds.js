/**
 * NovaMeds — storefront interactions (no API secrets)
 */
(function () {
  'use strict';

  var cfg = window.NovaMeds || { routes: {} };

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, cfg.moneyFormat);
    }
    return '$' + (cents / 100).toFixed(2);
  }

  /* ── Page loader ── */
  var loader = qs('[data-nm-loader]');
  function hideLoader() {
    if (loader) loader.classList.add('is-hidden');
  }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);

  /* ── Sticky header ── */
  var header = qs('[data-nm-header]');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Scroll reveal ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    qsa('.nm-animate').forEach(function (el) {
      io.observe(el);
    });
  } else {
    qsa('.nm-animate').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ── Mobile menu ── */
  var menuToggle = qs('[data-nm-menu-toggle]');
  var mobileNav = qs('[data-nm-mobile-nav]');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ── Mega menu (desktop) ── */
  qsa('.nm-mega-nav__item.has-children').forEach(function (item) {
    var panel = qs('.nm-mega-menu', item);
    if (!panel) return;
    var timer;
    item.addEventListener('mouseenter', function () {
      clearTimeout(timer);
      panel.hidden = false;
      item.classList.add('is-open');
    });
    item.addEventListener('mouseleave', function () {
      timer = setTimeout(function () {
        panel.hidden = true;
        item.classList.remove('is-open');
      }, 120);
    });
    item.addEventListener('focusin', function () {
      panel.hidden = false;
      item.classList.add('is-open');
    });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) {
        panel.hidden = true;
        item.classList.remove('is-open');
      }
    });
  });

  /* ── Search modal ── */
  var searchModal = qs('[data-nm-search-modal]');
  var searchOverlay = qs('[data-nm-search-overlay]');
  var searchInput = qs('[data-nm-search-input]');

  function openSearch() {
    if (!searchModal) return;
    searchModal.hidden = false;
    if (searchOverlay) searchOverlay.hidden = false;
    document.body.classList.add('nm-modal-open');
    if (searchInput) setTimeout(function () { searchInput.focus(); }, 80);
  }
  function closeSearch() {
    if (!searchModal) return;
    searchModal.hidden = true;
    if (searchOverlay) searchOverlay.hidden = true;
    document.body.classList.remove('nm-modal-open');
  }
  qsa('[data-nm-search-open]').forEach(function (btn) {
    btn.addEventListener('click', openSearch);
  });
  qsa('[data-nm-search-close]').forEach(function (btn) {
    btn.addEventListener('click', closeSearch);
  });
  if (searchOverlay) searchOverlay.addEventListener('click', closeSearch);

  /* ── Cart drawer ── */
  var cartDrawer = qs('[data-nm-cart-drawer]');
  var cartOverlay = qs('[data-nm-cart-overlay]');
  var cartBody = qs('[data-nm-cart-body]');
  var cartFooter = qs('[data-nm-cart-footer]');
  var cartSubtotal = qs('[data-nm-cart-subtotal]');
  var cartCountLabel = qs('[data-nm-cart-count-label]');

  function updateCartBadges(count) {
    qsa('[data-nm-header-cart-count]').forEach(function (el) {
      el.textContent = count > 0 ? count : '';
      el.style.display = count > 0 ? '' : 'none';
    });
    if (cartCountLabel) cartCountLabel.textContent = count > 0 ? '(' + count + ')' : '';
  }

  function renderCartItem(item) {
    var img = item.image
      ? '<img src="' + item.image.replace(/(\.[^.?]+)(\?|$)/, '_120x$1$2') + '" alt="" width="72" height="72" loading="lazy">'
      : '';
    return (
      '<div class="nm-cart-line" data-key="' + item.key + '">' +
      '<a href="' + item.url + '" class="nm-cart-line__img">' + img + '</a>' +
      '<div class="nm-cart-line__info">' +
      '<a href="' + item.url + '" class="nm-cart-line__title">' + item.product_title + '</a>' +
      (item.variant_title && item.variant_title !== 'Default Title'
        ? '<p class="nm-cart-line__variant">' + item.variant_title + '</p>'
        : '') +
      '<div class="nm-cart-line__row">' +
      '<div class="nm-cart-line__qty">' +
      '<button type="button" data-nm-qty-minus data-key="' + item.key + '" aria-label="Decrease">−</button>' +
      '<span>' + item.quantity + '</span>' +
      '<button type="button" data-nm-qty-plus data-key="' + item.key + '" data-qty="' + item.quantity + '" aria-label="Increase">+</button>' +
      '</div>' +
      '<span class="nm-cart-line__price">' + formatMoney(item.final_line_price) + '</span>' +
      '</div></div>' +
      '<button type="button" class="nm-cart-line__remove" data-nm-remove data-key="' + item.key + '" aria-label="Remove">×</button></div>'
    );
  }

  function renderCart(cart) {
    if (!cartBody) return;
    updateCartBadges(cart.item_count);
    if (cart.item_count === 0) {
      cartBody.innerHTML =
        '<div class="nm-cart-drawer__empty"><p>Your bag is empty</p><a href="' +
        (cfg.routes.root || '/') +
        '" class="nm-btn nm-btn--primary">Continue shopping</a></div>';
      if (cartFooter) cartFooter.hidden = true;
      return;
    }
    cartBody.innerHTML = cart.items.map(renderCartItem).join('');
    if (cartFooter) cartFooter.hidden = false;
    if (cartSubtotal) cartSubtotal.textContent = formatMoney(cart.total_price);
    bindCartLineEvents();
  }

  function fetchCart() {
    return fetch('/cart.js', { credentials: 'same-origin' }).then(function (r) {
      return r.json();
    });
  }

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.hidden = false;
    if (cartOverlay) cartOverlay.hidden = false;
    document.body.classList.add('nm-modal-open');
    if (cartBody) cartBody.innerHTML = '<p class="nm-cart-drawer__loading">Loading…</p>';
    fetchCart().then(renderCart);
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.hidden = true;
    if (cartOverlay) cartOverlay.hidden = true;
    document.body.classList.remove('nm-modal-open');
  }

  function changeLine(key, quantity) {
    return fetch('/cart/change.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity }),
    }).then(function (r) {
      return r.json();
    });
  }

  function bindCartLineEvents() {
    qsa('[data-nm-qty-minus]', cartBody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-key');
        var qty = parseInt(btn.parentElement.querySelector('span').textContent, 10) - 1;
        changeLine(key, qty).then(renderCart);
      });
    });
    qsa('[data-nm-qty-plus]', cartBody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-key');
        var qty = parseInt(btn.getAttribute('data-qty'), 10) + 1;
        changeLine(key, qty).then(renderCart);
      });
    });
    qsa('[data-nm-remove]', cartBody).forEach(function (btn) {
      btn.addEventListener('click', function () {
        changeLine(btn.getAttribute('data-key'), 0).then(renderCart);
      });
    });
  }

  qsa('[data-nm-cart-open]').forEach(function (btn) {
    btn.addEventListener('click', openCart);
  });
  qsa('[data-nm-cart-close]').forEach(function (btn) {
    btn.addEventListener('click', closeCart);
  });
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  /* ── Quick add ── */
  qsa('[data-nm-quick-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-variant-id');
      btn.disabled = true;
      btn.textContent = 'Adding…';
      fetch('/cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id, 10), quantity: 1 }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error('Add failed');
          return fetchCart();
        })
        .then(function (cart) {
          renderCart(cart);
          openCart();
          btn.textContent = 'Added ✓';
          setTimeout(function () {
            btn.disabled = false;
            btn.textContent = '+ Quick add';
          }, 1500);
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = '+ Quick add';
        });
    });
  });

  /* ── FAQ ── */
  qsa('[data-nm-faq-question]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('[data-nm-faq-item]');
      if (!item) return;
      var wasOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('[data-nm-faq-item]').forEach(function (el) {
        el.classList.remove('is-open');
        qs('[data-nm-faq-question]', el).setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Escape key closes modals ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeCart();
      closeSearch();
    }
  });
})();
