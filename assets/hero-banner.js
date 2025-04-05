class HeroBanner extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector('.hero-banner__video');
    this.fallbackImage = this.querySelector('.hero-banner__fallback-img');
    this.initializeVideo();
  }

  initializeVideo() {
    if (!this.video) return;

    const iframe = this.video.querySelector('iframe');
    if (!iframe) return;

    // Load iframe when it's in viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const src = iframe.getAttribute('data-src');
          if (src) {
            iframe.setAttribute('src', src);
            iframe.removeAttribute('data-src');
          }
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(iframe);
  }
}

customElements.define('hero-banner', HeroBanner); 