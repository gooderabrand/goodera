document.addEventListener('DOMContentLoaded', function() {
  // Password page video background functionality
  const videoBackground = document.querySelector('.password-video-background');
  
  if (videoBackground) {
    const video = videoBackground.querySelector('video');
    const fallbackImage = videoBackground.querySelector('.video-fallback');
    
    if (video) {
      // Handle video loading
      video.addEventListener('loadeddata', function() {
        // Video loaded successfully
        if (fallbackImage) {
          fallbackImage.style.display = 'none';
        }
      });
      
      // Handle video errors
      video.addEventListener('error', function() {
        // Video failed to load, show fallback image
        if (fallbackImage) {
          fallbackImage.style.display = 'block';
        }
        if (video) {
          video.style.display = 'none';
        }
      });
      
      // Handle video playback issues
      video.addEventListener('stalled', function() {
        // Video stalled, show fallback image
        if (fallbackImage) {
          fallbackImage.style.display = 'block';
        }
      });
      
      // Ensure video plays on mobile devices
      video.addEventListener('canplay', function() {
        // Try to play video (may be blocked on mobile)
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(function(error) {
            // Auto-play was prevented, show fallback image
            if (fallbackImage) {
              fallbackImage.style.display = 'block';
            }
            if (video) {
              video.style.display = 'none';
            }
          });
        }
      });
      
      // Set video attributes for better mobile support
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.setAttribute('loop', '');
    }
  }
  
  // Logo positioning functionality
  const logoContainer = document.querySelector('.password-logo-container');
  if (logoContainer) {
    // Remove any existing position classes
    logoContainer.classList.remove('logo-position-left', 'logo-position-right', 'logo-position-center');
    
    // Add default center positioning if no specific position is set
    if (!logoContainer.classList.contains('logo-position-left') && 
        !logoContainer.classList.contains('logo-position-right') && 
        !logoContainer.classList.contains('logo-position-center')) {
      logoContainer.classList.add('logo-position-center');
    }
  }
});
