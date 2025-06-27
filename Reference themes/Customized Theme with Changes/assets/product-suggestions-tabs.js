// Add tab switching logic here
// Function to load recommended products (initially loaded by Liquid, this function is for potential dynamic updates)
function loadRecommendedProducts(containerSelector, productId, sectionId) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // If content is already present (loaded by Liquid), no need to fetch again on tab click
  if (container.children.length > 0) {
     console.log('Recommended products already loaded by Liquid.');
     return;
  }

  // This part would be needed if the product context could change dynamically
  // and you needed to re-fetch recommendations.
  // For a static section, the Liquid render is usually sufficient.

  console.log('Load recommended products (dynamic fetch - likely not needed for static section).');
  // Example of fetching the section content again, could be adapted.
  // const url = `${window.location.pathname}?sections=${sectionId}&product_id=${productId}`;
  // fetch(url)
  //   .then(response => response.json())
  //   .then(json => {
  //     if (json[sectionId]) {
  //       const html = new DOMParser().parseFromString(json[sectionId], 'text/html');
  //       const recommendedContent = html.querySelector(containerSelector);
  //       if (recommendedContent) {
  //          container.innerHTML = recommendedContent.innerHTML;
  //       }
  //     }
  //   })
  //   .catch(e => {
  //     console.error('Error loading recommended products:', e);
  //   });
}

// Function to load recently viewed products
function loadRecentlyViewedProducts(containerSelector) {
   const container = document.querySelector(containerSelector);
   if (!container) return;

   // Check if products are already loaded
   if (container.dataset.loaded) {
     console.log('Recently viewed products already loaded.');
     return;
   }

  if (!window.localStorage) {
     container.innerHTML = '<p>Recently viewed products not supported by your browser.</p>';
     return;
  }

  let recentIds = window.localStorage.getItem('recently-viewed');
  let products = '';
  const max = 4; // Or make this a setting from section settings

  if (recentIds && typeof(recentIds) !== undefined) {
    window.recentlyViewedIds = JSON.parse(recentIds);

    const uniqueRecentHandles = [...new Set(window.recentlyViewedIds)].filter(handle => handle).slice(0, max);

    if (uniqueRecentHandles.length === 0) {
       container.innerHTML = '<p>No recently viewed products found.</p>';
       return;
    }

    // Construct the query string with product handles
    const productQuery = uniqueRecentHandles.map(handle => `handle:${handle}`).join(' OR ');

    // Use the search URL with the recently-viewed view and the constructed query
    const url = `${theme.routes.search_url}?view=recently-viewed&type=product&q=${encodeURIComponent(productQuery)}`;

    fetch(url)
      .then(response => {
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return response.text();
      })
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        // Find the element containing the product grid in the fetched HTML
        const recentlyViewedContent = html.querySelector('.products');

        if (recentlyViewedContent && recentlyViewedContent.innerHTML.trim().length) {
          // Insert the inner HTML of the product grid into the container
          container.innerHTML = recentlyViewedContent.innerHTML;
          container.dataset.loaded = 'true'; // Mark as loaded
           // You might need to trigger any theme-specific JavaScript for new product cards here
        } else {
           container.innerHTML = '<p>No recently viewed products found.</p>'; // Display a message if no products or content not found
        }
      })
      .catch(e => {
        console.error('Error loading recently viewed products:', e);
        container.innerHTML = '<p>Error loading recently viewed products.</p>'; // Display error message
      });
  } else {
     container.innerHTML = '<p>No recently viewed products found.</p>';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const section = document.querySelector('.section-product-suggestions-tabs');
  if (!section) return;

  // Selectors for the product list containers within each tab (targeting the ul.products)
  const recommendedContainerSelector = '#tab-recommended .products';
  const recentlyViewedContainerSelector = '#tab-recently-viewed .products';
  
  // The recommended products are initially loaded by Liquid

  section.querySelectorAll('.tab-link').forEach(function(tab) {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');

      section.querySelectorAll('.tab-link').forEach(function(link) {
        link.classList.remove('current');
      });
      this.classList.add('current');

      section.querySelectorAll('.tab-content').forEach(function(content) {
        content.classList.remove('current');
      });
      section.querySelector(`#${tabId}`).classList.add('current');

      // Trigger loading of products only for the recently viewed tab on click
      if (tabId === 'tab-recently-viewed') {
         loadRecentlyViewedProducts(recentlyViewedContainerSelector);
      } else if (tabId === 'tab-recommended') {
         // Recommended products are loaded by Liquid initially.
         // If dynamic reloads are needed, uncomment the loadRecommendedProducts call here
         // and implement the fetching logic within that function.
      }
    });
  });

  // Manually trigger a click on the initially active tab (Recommended) to ensure its content is visible and JS logic runs if needed
   section.querySelector('.tab-link.current').click();

}); 