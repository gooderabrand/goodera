/**
 * Clothing gallery — two images at a time, overlay arrows.
 * Works with the theme's native product-images--grid (not the thumbnail slider).
 */
(function () {
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

  function ensureNav(container) {
    var nav = container.querySelector('.ge-paired-nav');
    if (nav) return nav;
    nav = document.createElement('div');
    nav.className = 'ge-paired-nav';
    nav.innerHTML =
      '<button type="button" class="ge-paired-nav__btn ge-paired-nav__btn--prev" name="previous" aria-label="Previous">' +
      '<svg viewBox="0 0 8 12" aria-hidden="true"><path d="M7 1L2 6l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>' +
      '<button type="button" class="ge-paired-nav__btn ge-paired-nav__btn--next" name="next" aria-label="Next">' +
      '<svg viewBox="0 0 8 12" aria-hidden="true"><path d="M1 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>';
    container.appendChild(nav);
    return nav;
  }

  function destroyFlickity(slider) {
    if (!window.Flickity) return;
    var flkty = Flickity.data(slider);
    if (flkty) flkty.destroy();
  }

  function bind(container) {
    var slider = container.querySelector('.product-images');
    if (!slider || slider.dataset.pairedBound === 'true') return;
    slider.dataset.pairedBound = 'true';
    destroyFlickity(slider);
    slider.classList.add('product-images--paired');
    container.classList.add('product-image-container--paired');

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

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    slider.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function init() {
    document.querySelectorAll('.template-product-clothing .product-image-container').forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', init);

  function hideShopPayIn(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll(
      '.shopify-payment-button__button--shop-pay, .shopify-payment-button__button--branded, [aria-label*="Shop Pay"], [aria-label*="shop pay"]'
    ).forEach(function (el) {
      el.style.setProperty('display', 'none', 'important');
    });
    root.querySelectorAll('shopify-accelerated-checkout').forEach(function (host) {
      if (host.shadowRoot) hideShopPayIn(host.shadowRoot);
    });
  }

  function hideShopPayOnPdp() {
    document.querySelectorAll('.template-product-clothing .product-form, .template-product .product-form').forEach(function (form) {
      hideShopPayIn(form);
    });
  }

  hideShopPayOnPdp();
  document.addEventListener('shopify:section:load', hideShopPayOnPdp);
  var shopPayTries = 0;
  var shopPayTimer = setInterval(function () {
    hideShopPayOnPdp();
    shopPayTries += 1;
    if (shopPayTries > 20) clearInterval(shopPayTimer);
  }, 300);
})();
