/**
 * Collection sort drawer. Filters already open #Facet-Drawer.
 */
(function () {
  function panelOpen() {
    return document.querySelector('.side-panel.active');
  }

  function closePanel(panel) {
    if (!panel) return;
    panel.classList.remove('active');
    if (!panelOpen()) document.body.classList.remove('open-cc');
  }

  function openPanel(panel) {
    if (!panel) return;
    document.querySelectorAll('.side-panel.active').forEach(function (open) {
      if (open !== panel) open.classList.remove('active');
    });
    panel.classList.add('active');
    document.body.classList.add('open-cc');
  }

  document.addEventListener(
    'click',
    function (event) {
      var filterToggle = event.target.closest('#Facets-Toggle');
      if (!filterToggle) return;
      var sortDrawer = document.getElementById('Sort-Drawer');
      var facet = document.getElementById('Facet-Drawer');
      if (!sortDrawer || !sortDrawer.classList.contains('active')) return;
      sortDrawer.classList.remove('active');
      var sortToggle = document.getElementById('Sort-Toggle');
      if (sortToggle) sortToggle.setAttribute('aria-expanded', 'false');
      if (!facet || !facet.classList.contains('active')) {
        document.body.classList.remove('open-cc');
      }
    },
    true
  );

  document.addEventListener('click', function (event) {
    var sortToggle = event.target.closest('#Sort-Toggle');
    if (sortToggle) {
      event.preventDefault();
      var drawer = document.getElementById('Sort-Drawer');
      if (!drawer) return;
      if (drawer.classList.contains('active')) closePanel(drawer);
      else openPanel(drawer);
      sortToggle.setAttribute('aria-expanded', drawer.classList.contains('active') ? 'true' : 'false');
      return;
    }

    var option = event.target.closest('[data-sort-value]');
    if (!option) return;
    event.preventDefault();
    var select = document.getElementById('SortByBar');
    if (select) {
      select.value = option.getAttribute('data-sort-value');
      select.dispatchEvent(new Event('input', { bubbles: true }));
    }
    document.querySelectorAll('.ge-sort-drawer__option').forEach(function (el) {
      el.classList.toggle('is-active', el === option);
    });
    closePanel(document.getElementById('Sort-Drawer'));
    var toggle = document.getElementById('Sort-Toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
})();
