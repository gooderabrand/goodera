/**
 * Clothing paired gallery — inject overlay arrows and page by two on desktop.
 */
(function () {
  function pageSize(slider) {
    var slide = slider.querySelector('.product-images__slide.is-active, .product-images__slide');
    if (!slide) return slider.clientWidth;
    var gap = parseFloat(getComputedStyle(slider).gap) || 0;
    var visible = window.matchMedia('(min-width: 768px)').matches ? 2 : 1;
    return (slide.getBoundingClientRect().width + gap) * visible;
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

  function bind(container) {
    var slider = container.querySelector('.product-images');
    if (!slider || slider.dataset.pairedBound === 'true') return;
    slider.dataset.pairedBound = 'true';
    slider.classList.add('product-images--paired');
    container.classList.add('product-image-container--paired');

    var nav = ensureNav(container);
    var prev = nav.querySelector('.ge-paired-nav__btn--prev');
    var next = nav.querySelector('.ge-paired-nav__btn--next');

    function update() {
      var max = Math.max(0, slider.scrollWidth - slider.clientWidth - 2);
      if (prev) prev.disabled = slider.scrollLeft <= 2;
      if (next) next.disabled = slider.scrollLeft >= max;
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
})();
