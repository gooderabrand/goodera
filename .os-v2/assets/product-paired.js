/**
 * Clothing gallery — two images at a time, Lululemon pill + drag.
 */
(function () {
  var PILL =
    '<button type="button" class="ge-paired-nav__btn ge-paired-nav__btn--prev" name="previous" aria-label="Previous slide">' +
    '<span class="ge-paired-nav__sr">Previous slide</span>' +
    '<svg fill="none" viewBox="0 0 24 24" height="24" focusable="false" aria-hidden="true">' +
    '<path d="M19.5 12h-15m0 0 5.625-6M4.5 12l5.625 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '</svg></button>' +
    '<button type="button" class="ge-paired-nav__btn ge-paired-nav__btn--next" name="next" aria-label="Next slide">' +
    '<span class="ge-paired-nav__sr">Next slide</span>' +
    '<svg fill="none" viewBox="0 0 24 24" height="24" focusable="false" aria-hidden="true">' +
    '<path d="M4.5 12h15m0 0-5.625-6m5.625 6-5.625 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '</svg></button>';

  function visibleCount() {
    return window.matchMedia('(min-width: 1068px)').matches ? 2 : 1;
  }

  function pageSize(slider) {
    var slide = slider.querySelector('.product-images__slide');
    if (!slide) return slider.clientWidth;
    var styles = getComputedStyle(slider);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return (slide.getBoundingClientRect().width + gap) * visibleCount();
  }

  function neutralizeHero() {
    document.querySelectorAll('.template-product-clothing [data-header-hero]').forEach(function (el) {
      el.removeAttribute('data-header-hero');
      el.removeAttribute('data-header-tone');
    });
  }

  function ensureNav(container) {
    var nav = container.querySelector('.ge-paired-nav');
    if (!nav) {
      nav = document.createElement('div');
      container.appendChild(nav);
    }
    nav.className = 'ge-paired-nav';
    nav.setAttribute('data-lll-pl', 'control-group-zest');
    nav.innerHTML = PILL;
    return nav;
  }

  function destroyFlickity(slider) {
    if (!window.Flickity) return;
    var flkty = Flickity.data(slider);
    if (flkty) flkty.destroy();
  }

  function bindDrag(slider, go) {
    if (slider.dataset.geDragBound === 'true') return;
    slider.dataset.geDragBound = 'true';
    var startX = 0;
    var startLeft = 0;
    var dragging = false;
    var moved = 0;

    slider.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      if (e.button !== 0) return;
      if (e.target.closest('.ge-paired-nav, button, a')) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startLeft = slider.scrollLeft;
      slider.classList.add('is-dragging');
      try { slider.setPointerCapture(e.pointerId); } catch (err) {}
    });

    slider.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      slider.scrollLeft = startLeft - dx;
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      slider.classList.remove('is-dragging');
      if (moved < 8 && e && typeof e.clientX === 'number') {
        var rect = slider.getBoundingClientRect();
        go(e.clientX > rect.left + rect.width / 2 ? 1 : -1);
      }
    }

    slider.addEventListener('pointerup', endDrag);
    slider.addEventListener('pointercancel', endDrag);
  }

  function bindGallery(container) {
    var slider = container.querySelector('.product-images');
    if (!slider || slider.dataset.pairedBound === 'true') return;
    slider.dataset.pairedBound = 'true';
    destroyFlickity(slider);
    slider.classList.add('product-images--paired');
    container.classList.add('product-image-container--paired');
    neutralizeHero();
    var nav = ensureNav(container);
    var prev = nav.querySelector('.ge-paired-nav__btn--prev');
    var next = nav.querySelector('.ge-paired-nav__btn--next');

    function update() {
      var max = Math.max(0, slider.scrollWidth - slider.clientWidth - 2);
      if (prev) prev.disabled = slider.scrollLeft <= 2;
      if (next) next.disabled = slider.scrollLeft >= max;
      if (nav) nav.hidden = max <= 0;
    }

    function go(direction) {
      slider.scrollBy({ left: direction * pageSize(slider), behavior: 'smooth' });
    }

    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); go(1); });
    bindDrag(slider, go);
    slider.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function placeBreadcrumbs() {
    if (!document.body.classList.contains('template-product-clothing')) return;
    var info = document.querySelector('.product-information--inner');
    if (!info) return;
    if (!window.__geCrumbsTemplate) {
      var live = document.querySelector('.breadcrumbs');
      if (live) window.__geCrumbsTemplate = live.cloneNode(true);
    }
    if (!window.__geCrumbsTemplate) return;
    var node = window.__geCrumbsTemplate.cloneNode(true);
    var current = info.querySelector('.breadcrumbs');
    if (current) current.replaceWith(node);
    else {
      var title = info.querySelector('.product-title-container');
      if (title) info.insertBefore(node, title);
      else info.insertBefore(node, info.firstChild);
    }
    document.querySelectorAll('.section-breadcrumbs').forEach(function (section) {
      section.setAttribute('hidden', '');
    });
  }

  function initGallery() {
    neutralizeHero();
    placeBreadcrumbs();
    document.querySelectorAll('.template-product-clothing .product-image-container').forEach(bindGallery);
  }

  function labelBag() {
    var label = window.theme && theme.variantStrings && theme.variantStrings.addToCart;
    if (!label) return;
    document.querySelectorAll('.single-add-to-cart-button--text').forEach(function (el) {
      var text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text === 'add to cart') el.textContent = label;
    });
    document.querySelectorAll('[data-quick-add-label]').forEach(function (el) {
      var text = (el.getAttribute('data-quick-add-label') || '').trim().toLowerCase();
      if (text === 'add to cart') el.setAttribute('data-quick-add-label', label);
    });
  }

  function paintShopLogo(host) {
    var root = host.shadowRoot;
    if (!root) return false;
    if (host.dataset.geShopWatch !== 'true') {
      host.dataset.geShopWatch = 'true';
      var obs = new MutationObserver(function () { paintShopLogo(host); });
      obs.observe(root, { childList: true, subtree: true });
    }
    if (!root.querySelector('style[data-ge-shop-ink]')) {
      var style = document.createElement('style');
      style.setAttribute('data-ge-shop-ink', '');
      style.textContent = '.shop-pay-logo,svg,img{filter:brightness(0)!important}';
      root.appendChild(style);
    }
    var logos = root.querySelectorAll('.shop-pay-logo, svg, img');
    if (!logos.length) return false;
    logos.forEach(function (logo) {
      logo.style.filter = 'brightness(0)';
    });
    host.classList.remove('ge-shop-ink');
    return true;
  }

  function inkShopMarks() {
    if (!document.body.classList.contains('template-product-clothing')) return true;
    var hosts = document.querySelectorAll('shopify-payment-terms');
    if (!hosts.length) return false;
    var done = true;
    hosts.forEach(function (host) {
      if (!paintShopLogo(host)) done = false;
    });
    return done;
  }

  function startShopInk() {
    if (!document.body.classList.contains('template-product-clothing')) return;
    if (startShopInk.timer) clearInterval(startShopInk.timer);
    var tries = 0;
    startShopInk.timer = setInterval(function () {
      tries += 1;
      if (inkShopMarks() || tries >= 40) {
        clearInterval(startShopInk.timer);
        startShopInk.timer = null;
        document.querySelectorAll('shopify-payment-terms').forEach(function (host) {
          if (!host.shadowRoot) host.classList.add('ge-shop-ink');
        });
      }
    }, 200);
  }

  window.geInitClothingGallery = initGallery;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      labelBag();
      initGallery();
      startShopInk();
    });
  } else {
    labelBag();
    initGallery();
    startShopInk();
  }
  document.addEventListener('shopify:section:load', function () {
    initGallery();
    startShopInk();
  });
})();
