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

  function initGallery() {
    neutralizeHero();
    document.querySelectorAll('.template-product-clothing .product-image-container').forEach(bindGallery);
  }

  function labelBag() {
    if (!document.body.classList.contains('template-product-clothing')) return;
    if (window.theme && theme.variantStrings) theme.variantStrings.addToCart = 'Add to bag';
    document.querySelectorAll('.single-add-to-cart-button--text').forEach(function (el) {
      var text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text === 'add to cart') el.textContent = 'Add to bag';
    });
  }

  window.geInitClothingGallery = initGallery;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      labelBag();
      initGallery();
    });
  } else {
    labelBag();
    initGallery();
  }
  document.addEventListener('shopify:section:load', initGallery);
})();
