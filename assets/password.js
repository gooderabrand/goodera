document.addEventListener('DOMContentLoaded', function() {
  const videoContainer = document.querySelector('.password-hero-background__video');
  if (!videoContainer) return;

  const iframe = videoContainer.querySelector('iframe');
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
});
