/**
 * Collection page: related-collection rail, and the Filters drawer.
 * The theme button only opens a popover we do not use. This opens the
 * filter sheet from the right instead.
 */
(function () {
  function sheet() {
    return document.getElementById('GeFacetSheet');
  }

  function setExpanded(open) {
    document.querySelectorAll('#Facets-Toggle, #Sort-Toggle').forEach(function (button) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function labelApply() {
    var label = document.querySelector('#ProductCount .facets__label');
    var button = document.querySelector('.ge-facet-sheet__apply span');
    var clear = document.querySelector('.ge-facet-sheet__reset');
    if (clear) clear.textContent = 'Clear all';
    if (!label || !button) return;
    var match = (label.textContent || '').match(/(\d+)/);
    if (!match) return;
    button.textContent = 'View ' + match[1] + (match[1] === '1' ? ' product' : ' products');
  }

  function enhanceSort(root) {
    var form = root.querySelector('#FacetFiltersFormMobile');
    if (!form) return;
    var select = form.querySelector('#SortByMobile');
    if (!select) return;
    var existing = form.querySelector('.ge-sort-facet');
    if (existing) {
      existing.querySelectorAll('input[type="radio"]').forEach(function (input) {
        input.checked = input.value === select.value;
      });
      return;
    }

    var details = document.createElement('details');
    details.className = 'thb-filter ge-sort-facet';
    details.open = true;

    var summary = document.createElement('summary');
    summary.className = 'thb-filter-title';
    summary.innerHTML = '<span></span>Sort By';
    details.appendChild(summary);

    var sortLabels = {
      manual: 'Featured',
      'best-selling': 'Best Selling',
      'created-descending': 'New Arrivals',
      'price-descending': 'Price: High to Low',
      'price-ascending': 'Price: Low to High'
    };
    var sortOrder = ['manual', 'created-descending', 'best-selling', 'price-descending', 'price-ascending'];
    var options = Array.prototype.filter.call(select.options, function (option) {
      return sortLabels[option.value] || option.selected;
    });
    options.sort(function (a, b) {
      var ai = sortOrder.indexOf(a.value);
      var bi = sortOrder.indexOf(b.value);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });

    var list = document.createElement('div');
    list.className = 'thb-filter-content ge-sort-facet__list';
    options.forEach(function (option) {
      var row = document.createElement('label');
      row.className = 'ge-sort-facet__option';
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'ge-sort-facet';
      input.value = option.value;
      input.checked = option.selected;
      input.addEventListener('change', function () {
        select.value = input.value;
        var bar = document.getElementById('SortByBar');
        if (bar) bar.value = input.value;
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });
      row.appendChild(input);
      row.appendChild(document.createTextNode(sortLabels[option.value] || option.text));
      list.appendChild(row);
    });
    details.appendChild(list);

    var firstRow = form.querySelector('collapsible-row');
    if (firstRow) form.insertBefore(details, firstRow);
    else form.appendChild(details);

    var nativeSort = select.closest('.thb-filter-sort-count');
    if (nativeSort) nativeSort.hidden = true;

    form.querySelectorAll('details.thb-filter:not(.ge-sort-facet)').forEach(function (row) {
      row.removeAttribute('open');
    });
  }

  function openFilters() {
    var root = sheet();
    if (!root) return;
    enhanceSort(root);
    labelApply();
    root.hidden = false;
    root.inert = false;
    window.requestAnimationFrame(function () {
      root.classList.add('is-open');
    });
    document.body.classList.add('open-cc');
    setExpanded(true);
  }

  function closeFilters() {
    var root = sheet();
    if (!root) return;
    root.classList.remove('is-open');
    root.inert = true;
    document.body.classList.remove('open-cc');
    setExpanded(false);
    window.setTimeout(function () {
      if (!root.classList.contains('is-open')) root.hidden = true;
    }, 240);
  }

  function filtersOpen() {
    var root = sheet();
    return root && root.classList.contains('is-open');
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var toggle = target.closest('#Facets-Toggle, #Sort-Toggle');
    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      if (filtersOpen()) closeFilters();
      else openFilters();
      return;
    }

    if (target.closest('[data-ge-facet-close], .click-capture')) {
      if (filtersOpen()) closeFilters();
      return;
    }

    var prev = target.closest('[data-ge-rail-prev]');
    var next = target.closest('[data-ge-rail-next]');
    if (!prev && !next) return;
    var scroller = document.querySelector('.ge-collection-rail__scroller');
    if (!scroller) return;
    event.preventDefault();
    var card = scroller.querySelector('.ge-collection-rail__card');
    var distance = card ? card.getBoundingClientRect().width + 16 : 280;
    scroller.scrollBy({ left: prev ? -distance : distance, behavior: 'smooth' });
  }, true);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && filtersOpen()) closeFilters();
  });
})();
