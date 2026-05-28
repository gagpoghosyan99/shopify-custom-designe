/**
 * NovaMeds storefront — modals, cart drawer, search (Shopify Cart API)
 */
(function () {
  'use strict';

  var cfg = window.NovaMeds || { routes: {} };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, cfg.moneyFormat);
    }
    return '$' + (cents / 100).toFixed(2);
  }

  /* ── Modal manager (one overlay, one panel at a time) ── */
  var overlay = qs('[data-nm-overlay]');
  var searchModal = qs('[data-nm-search-modal]');
  var searchInput = qs('[data-nm-search-input]');
  var cartDrawer = qs('[data-nm-cart-drawer]');
  var cartBody = qs('[data-nm-cart-body]');
  var cartFooter = qs('[data-nm-cart-footer]');
  var cartSubtotal = qs('[data-nm-cart-subtotal]');
  var cartCountLabel = qs('[data-nm-cart-count-label]');
  var activeModal = null;

  function showEl(el) {
    if (!el) return;
    el.hidden = false;
    el.removeAttribute('aria-hidden');
    el.classList.add('is-open');
  }

  function hideEl(el) {
    if (!el) return;
    el.hidden = true;
    el.setAttribute('aria-hidden', 'true');
    el.classList.remove('is-open');
  }

  function lockBody(lock) {
    document.body.classList.toggle('nm-modal-open', lock);
  }

  var menuDrawer = qs('[data-nm-hdr-drawer]');

  function closeMenuDrawer() {
    if (window.NovaMedsHeader && window.NovaMedsHeader.closeDrawer) {
      window.NovaMedsHeader.closeDrawer();
      return;
    }
    if (menuDrawer) {
      menuDrawer.classList.remove('is-open');
      menuDrawer.setAttribute('aria-hidden', 'true');
    }
    var menuToggle = qs('[data-nm-menu-toggle]');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  }

  function closePanels() {
    hideEl(searchModal);
    hideEl(cartDrawer);
    hideEl(overlay);
    activeModal = null;
  }

  function closeAll() {
    closePanels();
    closeMenuDrawer();
    lockBody(false);
  }

  function openPanel(name) {
    closeAll();
    activeModal = name;
    showEl(overlay);
    lockBody(true);
    if (name === 'search') {
      showEl(searchModal);
      if (searchInput) setTimeout(function () { searchInput.focus(); }, 50);
    }
    if (name === 'cart') {
      showEl(cartDrawer);
      loadCart();
    }
  }

  /* ── Loader ── */
  var loader = qs('[data-nm-loader]');
  function hideLoader() {
    if (loader) loader.classList.add('is-hidden');
  }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);

  /* ── Header scroll ── */
  var header = qs('[data-nm-header]');
  if (header) {
    window.addEventListener(
      'scroll',
      function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
      },
      { passive: true }
    );
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

  /* Mobile menu drawer is handled in novameds-header.js */

  /* ── Cart API ── */
  function updateCartBadges(count) {
    qsa('[data-nm-header-cart-count]').forEach(function (el) {
      if (count > 0) {
        el.textContent = String(count);
        el.style.display = '';
      } else {
        el.textContent = '';
        el.style.display = 'none';
      }
    });
    if (cartCountLabel) cartCountLabel.textContent = count > 0 ? '(' + count + ')' : '';
  }

  function cartImageUrl(url) {
    if (!url) return '';
    if (url.indexOf('?') > -1) return url.replace('?', '&width=120&height=120&');
    return url + '?width=120&height=120';
  }

  function renderCartItem(item) {
    var img = item.image
      ? '<img src="' + cartImageUrl(item.image) + '" alt="" width="72" height="72" loading="lazy">'
      : '';
    return (
      '<div class="nm-cart-line" data-key="' +
      item.key +
      '">' +
      '<a href="' +
      item.url +
      '" class="nm-cart-line__img">' +
      img +
      '</a>' +
      '<div class="nm-cart-line__info">' +
      '<a href="' +
      item.url +
      '" class="nm-cart-line__title">' +
      escapeHtml(item.product_title) +
      '</a>' +
      (item.variant_title && item.variant_title !== 'Default Title'
        ? '<p class="nm-cart-line__variant">' + escapeHtml(item.variant_title) + '</p>'
        : '') +
      '<div class="nm-cart-line__row">' +
      '<div class="nm-cart-line__qty">' +
      '<button type="button" data-nm-qty-minus data-key="' +
      item.key +
      '" aria-label="Decrease">−</button>' +
      '<span>' +
      item.quantity +
      '</span>' +
      '<button type="button" data-nm-qty-plus data-key="' +
      item.key +
      '" data-qty="' +
      item.quantity +
      '" aria-label="Increase">+</button>' +
      '</div>' +
      '<span class="nm-cart-line__price">' +
      formatMoney(item.final_line_price) +
      '</span>' +
      '</div></div>' +
      '<button type="button" class="nm-cart-line__remove" data-nm-remove data-key="' +
      item.key +
      '" aria-label="Remove">×</button></div>'
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCart(cart) {
    if (!cartBody) return;
    updateCartBadges(cart.item_count || 0);
    if (!cart.items || cart.items.length === 0) {
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
  }

  function fetchCart() {
    return fetch('/cart.js', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(function (res) {
      if (!res.ok) throw new Error('Cart fetch failed: ' + res.status);
      return res.json();
    });
  }

  function loadCart() {
    if (!cartBody) return;
    cartBody.innerHTML = '<p class="nm-cart-drawer__loading">Loading…</p>';
    if (cartFooter) cartFooter.hidden = true;
    fetchCart()
      .then(renderCart)
      .catch(function () {
        cartBody.innerHTML =
          '<div class="nm-cart-drawer__empty"><p>Could not load cart. <button type="button" class="nm-btn nm-btn--secondary" data-nm-cart-retry>Try again</button></p></div>';
      });
  }

  function changeLine(key, quantity) {
    return fetch('/cart/change.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity }),
    }).then(function (res) {
      if (!res.ok) throw new Error('Cart update failed');
      return res.json();
    });
  }

  /* ── Delegated events (cart lines, close, open) ── */
  document.addEventListener('click', function (e) {
    var t = e.target;

    if (t.closest('[data-nm-search-open]')) {
      e.preventDefault();
      openPanel('search');
      return;
    }
    if (t.closest('[data-nm-cart-open]')) {
      e.preventDefault();
      openPanel('cart');
      return;
    }
    if (t.closest('[data-nm-search-close]') || t.closest('[data-nm-cart-close]')) {
      e.preventDefault();
      closeAll();
      return;
    }
    if (t === overlay || t.closest('[data-nm-overlay]')) {
      closeAll();
      return;
    }
    if (searchModal && searchModal.contains(t) && !t.closest('.nm-search-modal__inner')) {
      closeAll();
      return;
    }

    if (t.closest('[data-nm-cart-retry]')) {
      e.preventDefault();
      loadCart();
      return;
    }
    if (t.closest('[data-nm-qty-minus]')) {
      e.preventDefault();
      var btnM = t.closest('[data-nm-qty-minus]');
      var keyM = btnM.getAttribute('data-key');
      var qtyM = parseInt(btnM.parentElement.querySelector('span').textContent, 10) - 1;
      changeLine(keyM, qtyM).then(renderCart).catch(loadCart);
      return;
    }
    if (t.closest('[data-nm-qty-plus]')) {
      e.preventDefault();
      var btnP = t.closest('[data-nm-qty-plus]');
      changeLine(btnP.getAttribute('data-key'), parseInt(btnP.getAttribute('data-qty'), 10) + 1)
        .then(renderCart)
        .catch(loadCart);
      return;
    }
    if (t.closest('[data-nm-remove]')) {
      e.preventDefault();
      changeLine(t.closest('[data-nm-remove]').getAttribute('data-key'), 0)
        .then(renderCart)
        .catch(loadCart);
      return;
    }
    if (t.closest('[data-nm-quick-add]')) {
      e.preventDefault();
      var btn = t.closest('[data-nm-quick-add]');
      var id = btn.getAttribute('data-variant-id');
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'Adding…';
      fetch('/cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id, 10), quantity: 1 }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Add failed');
          return fetchCart();
        })
        .then(function (cart) {
          renderCart(cart);
          openPanel('cart');
          btn.textContent = 'Added ✓';
          setTimeout(function () {
            btn.disabled = false;
            btn.textContent = label;
          }, 1200);
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = label;
        });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  /* Prevent clicks inside drawer/modal from closing via bubbling to overlay logic */
  if (cartDrawer) {
    cartDrawer.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }
  if (searchModal) {
    var searchInner = qs('.nm-search-modal__inner', searchModal);
    if (searchInner) {
      searchInner.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  /* ── FAQ ── */
  qsa('[data-nm-faq-question]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('[data-nm-faq-item]');
      if (!item) return;
      var wasOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('[data-nm-faq-item]').forEach(function (el) {
        el.classList.remove('is-open');
        var q = qs('[data-nm-faq-question]', el);
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  cfg.closePanels = closePanels;
  cfg.closeAll = closeAll;

  /* Initial cart badge from page */
  fetchCart()
    .then(function (cart) {
      updateCartBadges(cart.item_count || 0);
    })
    .catch(function () {});
})();
