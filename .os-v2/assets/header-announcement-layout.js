(() => {
  if (window.geHeaderAnnouncementLayout) return;
  window.geHeaderAnnouncementLayout = true;
  const desktop = window.matchMedia('(min-width: 990px)');
  let bar, anchor;

  function restore() {
    if (anchor?.isConnected && bar) anchor.replaceWith(bar);
    anchor = null;
    bar = null;
  }

  function sequenceAnnouncements() {
    const root = document.querySelector('.announcement-bar--crossfade');
    if (!root || root.dataset.geSeq === '1') return;
    const items = Array.from(root.querySelectorAll('.announcement-bar--item')).filter((el) => (el.textContent || '').trim());
    if (!items.length) return;
    root.dataset.geSeq = '1';
    root.classList.add('is-cycling');
    items.forEach((el, i) => el.classList.toggle('is-on', i === 0));
    if (items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const speed = (root.style.getPropertyValue('--marquee-speed') || '20s').trim();
    const total = /ms$/i.test(speed) ? parseFloat(speed) : parseFloat(speed) * 1000;
    const hold = Math.max(3200, (Number.isFinite(total) ? total : 20000) / items.length - 480);
    let index = 0;

    const advance = () => {
      const current = items[index];
      const nextIndex = (index + 1) % items.length;
      let moved = false;
      const showNext = () => {
        if (moved) return;
        moved = true;
        current.removeEventListener('transitionend', onEnd);
        index = nextIndex;
        items[index].classList.add('is-on');
        window.setTimeout(advance, hold);
      };
      const onEnd = (event) => {
        if (event.target !== current || event.propertyName !== 'opacity') return;
        showNext();
      };
      current.addEventListener('transitionend', onEnd);
      current.classList.remove('is-on');
      window.setTimeout(showNext, 280);
    };

    window.setTimeout(advance, hold);
  }

  function sync() {
    restore();
    const slot = document.querySelector('[data-desktop-layout="centered_announcement"] [data-header-announcement]');
    const source = document.querySelector('.announcement-bar-section .announcement-bar');
    if (desktop.matches && document.body.classList.contains('ge-nav-horizontal') && slot && source) {
      bar = source;
      anchor = document.createComment('Announcement returns here on mobile or original layout');
      bar.replaceWith(anchor);
      slot.append(bar);
    }
    sequenceAnnouncements();
    window.dispatchEvent(new Event('resize'));
  }

  desktop.addEventListener('change', sync);
  document.addEventListener('shopify:section:unload', event => {
    if (event.target.matches('.header-section, .announcement-bar-section')) restore();
  });
  document.addEventListener('shopify:section:load', sync);
  document.addEventListener('shopify:section:reorder', sync);
  document.addEventListener('shopify:block:select', event => {
    if (!bar || !bar.contains(event.target)) return;
    bar.querySelectorAll('.announcement-bar--item').forEach(item => {
      item.style.animation = 'none';
      item.style.opacity = item === event.target || item.contains(event.target) ? '1' : '0';
    });
  });
  document.addEventListener('shopify:block:deselect', () => {
    bar?.querySelectorAll('.announcement-bar--item').forEach(item => {
      item.style.removeProperty('animation');
      item.style.removeProperty('opacity');
    });
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync, { once: true });
  else sync();
})();
