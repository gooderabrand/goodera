/**
 * Clothing PDP: compact Apple Pay, hover/click color swap.
 * Sibling clicks fetch the full product page (assigned template + blocks)
 * and swap gallery + buy-box inner HTML only when the title and form exist.
 */
(function () {
  var cache = {};

  function labelBag() {
    if (!document.body.classList.contains('template-product-clothing')) return;
    if (window.theme && theme.variantStrings) theme.variantStrings.addToCart = 'Add to bag';
    document.querySelectorAll('.single-add-to-cart-button--text').forEach(function (el) {
      var text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text === 'add to cart') el.textContent = 'Add to bag';
    });
  }

  function appleOk() {
    try { return !!(window.ApplePaySession && ApplePaySession.canMakePayments()); }
    catch (e) { return false; }
  }

  function rootUrl() {
    var r = (window.theme && theme.routes && theme.routes.root_url) || '/';
    return r.length > 1 && r.slice(-1) === '/' ? r.slice(0, -1) : r;
  }

  function pageUrl(url) {
    return String(url || '').split('#')[0];
  }

  function buyApple(form) {
    if (!form) return;
    var id = form.querySelector('[name="id"]');
    if (!id || !id.value) return;
    var qty = form.querySelector('[name="quantity"]');
    var body = new URLSearchParams();
    body.set('id', id.value);
    body.set('quantity', (qty && qty.value) || '1');
    fetch((window.theme && theme.routes && theme.routes.cart_add_url) || '/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: body,
      credentials: 'same-origin'
    }).then(function (res) {
      if (!res.ok) throw new Error('add');
      window.location.href = rootUrl() + '/checkout';
    }).catch(function () { form.submit(); });
  }

  function addAppleBtn(row) {
    if (!row || row.querySelector('.ge-apple-pay') || !appleOk()) return;
    var form = row.closest('form') || document.querySelector('.product-form form');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ge-apple-pay';
    btn.setAttribute('aria-label', 'Apple Pay');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      buyApple(form);
    });
    var atc = row.querySelector('.single-add-to-cart-button');
    if (atc) row.insertBefore(btn, atc);
    else row.appendChild(btn);
  }

  function hideWallets() {
    document.querySelectorAll('.template-product-clothing .product-form').forEach(function (form) {
      form.querySelectorAll('shopify-accelerated-checkout, shopify-accelerated-checkout-cart').forEach(function (host) {
        host.style.setProperty('display', 'none', 'important');
        host.setAttribute('hidden', '');
      });
      form.querySelectorAll('.product-form__checkout-row').forEach(function (row) {
        addAppleBtn(row);
        if (!row.querySelector('.ge-apple-pay')) row.classList.add('ge-wallet-hidden');
        else row.classList.remove('ge-wallet-hidden');
      });
    });
  }

  function productDoc(html) {
    if (!html) return null;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var detail = doc.querySelector('.thb-product-detail');
    if (!detail) return null;
    if (!detail.querySelector('.product-information .product-title')) return null;
    if (!detail.querySelector('.product-form, form [name="id"]')) return null;
    return doc;
  }

  function prefetch(url) {
    var clean = pageUrl(url);
    if (!clean) return Promise.resolve(null);
    if (cache[clean]) return cache[clean];
    cache[clean] = fetch(clean, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('page');
        return r.text();
      })
      .then(function (html) {
        if (!productDoc(html)) throw new Error('incomplete');
        return html;
      })
      .catch(function () { delete cache[clean]; return null; });
    return cache[clean];
  }

  function parseAttr(el, name) {
    try { return JSON.parse(el.getAttribute(name) || '[]'); }
    catch (e) { return []; }
  }

  function preview(swatch) {
    var images = parseAttr(swatch, 'data-images');
    var sizes = parseAttr(swatch, 'data-sizes');
    var color = swatch.getAttribute('data-color') || '';
    var slider = document.querySelector('.template-product-clothing .product-images');
    if (slider && images.length) {
      var imgs = slider.querySelectorAll('img');
      for (var i = 0; i < imgs.length && i < images.length; i++) {
        imgs[i].src = images[i];
        imgs[i].srcset = images[i];
      }
    }
    var nameEl = document.querySelector('[data-ge-color-name]');
    if (nameEl && color) nameEl.textContent = color;
    document.querySelectorAll('.template-product-clothing .product-form__input--block input[type="radio"]').forEach(function (input) {
      var match = sizes.find(function (s) {
        return String(s.name).toLowerCase() === String(input.value).toLowerCase();
      });
      if (!match) return;
      if (match.available) {
        input.classList.remove('is-disabled');
        input.disabled = false;
      } else {
        input.classList.add('is-disabled');
      }
    });
    document.querySelectorAll('.product-color-siblings__swatch').forEach(function (el) {
      el.classList.toggle('is-active', el === swatch);
    });
  }

  function swapInner(currentRoot, incomingRoot, selector) {
    var dest = currentRoot.querySelector(selector);
    var src = incomingRoot.querySelector(selector);
    if (!dest || !src) return false;
    dest.innerHTML = src.innerHTML;
    return true;
  }

  function applyHtml(html, url, push) {
    var doc = productDoc(html);
    var incoming = doc && doc.querySelector('.thb-product-detail');
    var current = document.querySelector('.template-product-clothing .thb-product-detail')
      || document.querySelector('.thb-product-detail');
    if (!incoming || !current) {
      window.location.href = url;
      return;
    }

    var galleryOk = swapInner(current, incoming, '.product-image-container');
    var infoOk = swapInner(current, incoming, '.product-information');
    if (!galleryOk || !infoOk) {
      window.location.href = url;
      return;
    }
    if (incoming.getAttribute('data-handle')) {
      current.setAttribute('data-handle', incoming.getAttribute('data-handle'));
    }

    neutralizeHero();
    if (push) history.pushState({ geClothingUrl: url }, '', url);
    if (window.geInitClothingGallery) window.geInitClothingGallery();
    labelBag();
    bindSwatches();
    hideWallets();
  }

  function loadColor(url, push) {
    return prefetch(url).then(function (html) { applyHtml(html, url, push); });
  }

  function bindSwatches() {
    var root = document.querySelector('[data-ge-color-siblings]');
    if (!root || root.dataset.geBound === 'true') return;
    root.dataset.geBound = 'true';
    prefetch(root.getAttribute('data-current-url') || window.location.pathname);
    root.querySelectorAll('.product-color-siblings__swatch').forEach(function (swatch) {
      var url = swatch.getAttribute('data-url');
      if (url) prefetch(url);
      swatch.addEventListener('mouseenter', function () { preview(swatch); if (url) prefetch(url); });
      swatch.addEventListener('focus', function () { preview(swatch); if (url) prefetch(url); });
      swatch.addEventListener('click', function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (!url || url.split('?')[0] === window.location.pathname) return;
        document.querySelectorAll('.product-color-siblings__swatch').forEach(function (el) {
          el.setAttribute('aria-current', el === swatch ? 'true' : 'false');
          el.classList.toggle('is-active', el === swatch);
        });
        loadColor(url, true);
      });
    });
    root.addEventListener('mouseleave', function () {
      var committed = root.querySelector('.product-color-siblings__swatch[aria-current="true"]');
      if (committed) preview(committed);
    });
  }

  window.addEventListener('popstate', function (event) {
    loadColor((event.state && event.state.geClothingUrl) || window.location.href, false);
  });

  function neutralizeHero() {
    document.querySelectorAll('.template-product-clothing [data-header-hero]').forEach(function (el) {
      el.removeAttribute('data-header-hero');
      el.removeAttribute('data-header-tone');
    });
  }

  function init() {
    labelBag();
    neutralizeHero();
    bindSwatches();
    hideWallets();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('shopify:section:load', init);
  var n = 0;
  var t = setInterval(function () { hideWallets(); if (++n > 40) clearInterval(t); }, 250);
})();
