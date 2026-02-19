function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
var dispatchCustomEvent = function dispatchCustomEvent(eventName) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var detail = {
    detail: data
  };
  var event = new CustomEvent(eventName, data ? detail : null);
  document.dispatchEvent(event);
};
window.recentlyViewedIds = [];

/**
 *  @class
 *  @function Quantity
 */
if (!customElements.get('quantity-selector')) {
  class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('.qty');
      this.step = this.input.getAttribute('step');
      this.changeEvent = new Event('change', {
        bubbles: true
      });
      // Create buttons
      this.subtract = this.querySelector('.minus');
      this.add = this.querySelector('.plus');

      // Add functionality to buttons
      this.subtract.addEventListener('click', () => this.change_quantity(-1 * this.step));
      this.add.addEventListener('click', () => this.change_quantity(1 * this.step));

    }
    connectedCallback() {
      this.classList.add('buttons_added');
      this.validateQtyRules();
    }
    change_quantity(change) {
      // Get current value
      let quantity = Number(this.input.value);

      // Ensure quantity is a valid number
      if (isNaN(quantity)) quantity = 1;

      // Check for min & max
      if (this.input.getAttribute('min') > (quantity + change)) {
        return;
      }
      if (this.input.getAttribute('max')) {
        if (this.input.getAttribute('max') < (quantity + change)) {
          return;
        }
      }
      // Change quantity
      quantity += change;

      // Ensure quantity is always a number
      quantity = Math.max(quantity, 1);

      // Output number
      this.input.value = quantity;

      this.input.dispatchEvent(this.changeEvent);

      this.validateQtyRules();
    }
    validateQtyRules() {
      const value = parseInt(this.input.value);
      if (this.input.min) {
        const min = parseInt(this.input.min);
        this.subtract.classList.toggle('disabled', value <= min);
      }
      if (this.input.max) {
        const max = parseInt(this.input.max);
        this.add.classList.toggle('disabled', value >= max);
      }
    }
  }
  customElements.define('quantity-selector', QuantityInput);
}

/**
 *  @class
 *  @function ArrowSubMenu
 */
class ArrowSubMenu {

  constructor(self) {
    this.submenu = self.parentNode.querySelector('.sub-menu');
    this.arrow = self;
    // Add functionality to buttons
    self.addEventListener('click', (e) => this.toggle_submenu(e));
  }

  toggle_submenu(e) {
    e.preventDefault();
    let submenu = this.submenu;

    if (!submenu.classList.contains('active')) {
      submenu.classList.add('active');

    } else {
      submenu.classList.remove('active');
      this.arrow.blur();
    }
  }
}
let arrows = document.querySelectorAll('.thb-arrow');
arrows.forEach((arrow) => {
  new ArrowSubMenu(arrow);
});

/**
 *  @class
 *  @function ProductCard
 */
if (!customElements.get('product-card')) {
  class ProductCard extends HTMLElement {
    constructor() {
      super();
      this.swatches = this.querySelector('.product-card-swatches--container');
      this.image = this.querySelector('.product-card--featured-image-link .product-primary-image');
      this.additional_images = this.querySelectorAll('.product-secondary-image');
      this.additional_images_nav = this.querySelectorAll('.product-secondary-images-nav li');
      this.quick_add = this.querySelector('.product-card--add-to-cart-button-simple');
      this.size_options = this.querySelector('.product-card-sizes');
      this.originalProductData = null; // Store original product data for size options
      this.originalSizeStates = new Map(); // Store original size option states
      this.originalImageStates = new Map(); // Store original image states
    }
    connectedCallback() {
      if (this.swatches) {
        this.enableSwatches(this.swatches, this.image);
      }
      if (this.additional_images && this.additional_images.length > 0) {
        this.enableAdditionalImages();
      }
      if (this.quick_add) {
        this.enableQuickAdd();
      }
      if (this.size_options) {
        this.storeOriginalSizeStates();
        this.enableSizeOptions();
      }
      if (this.image) {
        this.storeOriginalImageStates();
      }
    }
    enableAdditionalImages() {
      let image_length = this.additional_images.length;
      let images = this.additional_images;
      let nav = this.additional_images_nav;
      let image_container = this.querySelector('.product-card--featured-image-link');
      const mousemove = function (e) {
        let l = e.offsetX;
        let w = this.getBoundingClientRect().width;
        let prc = l / w;
        let sel = Math.floor(prc * image_length);
        let selimg = images[sel];
        images.forEach((image, index) => {
          if (image.classList.contains('hover')) {
            image.classList.remove('hover');
            if (nav.length) {
              nav[index].classList.remove('active');
            }
          }
        });
        if (selimg) {
          if (!selimg.classList.contains('hover')) {
            selimg.classList.add('hover');
            if (nav.length) {
              nav[sel].classList.add('active');
            }
          }
        }

      };
      const mouseleave = function (e) {
        images.forEach((image, index) => {
          image.classList.remove('hover');
          if (nav.length) {
            nav[index].classList.remove('active');
          }
        });
      };
      if (image_container) {
        image_container.addEventListener('touchstart', mousemove, {
          passive: true
        });
        image_container.addEventListener('touchmove', mousemove, {
          passive: true
        });
        image_container.addEventListener('touchend', mouseleave, {
          passive: true
        });
        image_container.addEventListener('mouseenter', mousemove, {
          passive: true
        });
        image_container.addEventListener('mousemove', mousemove, {
          passive: true
        });
        image_container.addEventListener('mouseleave', mouseleave, {
          passive: true
        });
      }

      images.forEach(function (image) {
        window.addEventListener('load', (event) => {
          lazySizes.loader.unveil(image);
        });
      });

    }
    enableSwatches(swatches, image) {
      // Handle regular color variant swatches (with radio inputs)
      let swatch_inputs = swatches.querySelectorAll('.product-card-swatch-input');
      let org_srcset = image ? image.dataset.srcset : '';
      this.color_index = this.swatches.dataset.index;

      swatch_inputs.forEach((input, index) => {
        let label = input.nextElementSibling;
        
        window.addEventListener('load', (event) => {
          let image = new Image();
          image.srcset = input.dataset.srcset;
          lazySizes.loader.unveil(image);
        });

        label.addEventListener('mouseover', () => {
          // Remove active class from all labels
          swatch_inputs.forEach(input => {
            input.nextElementSibling.classList.remove('active');
            input.checked = false;
          });
          
          // Add active class to hovered label and check the input
          label.classList.add('active');
          input.checked = true;
          
          // Update image if srcset is available
          if (image && input.dataset.srcset) {
            image.setAttribute('srcset', input.dataset.srcset);
          } else if (image) {
            image.setAttribute('srcset', org_srcset);
          }
          
          // Update size options for regular color variants
          if (this.size_options) {
            this.current_options[this.color_index] = label.querySelector('span').innerText;
            this.updateMasterId();
          }
        });

        input.addEventListener('change', (evt) => {
          // Update all labels
          swatch_inputs.forEach(input => {
            input.nextElementSibling.classList.remove('active');
          });
          
          // Add active to checked label
          if (input.checked) {
            input.nextElementSibling.classList.add('active');
          }
          
          // Update image
          if (image && input.dataset.srcset) {
            image.setAttribute('srcset', input.dataset.srcset);
          } else if (image) {
            image.setAttribute('srcset', org_srcset);
          }
          
          // Update size options
          if (this.size_options) {
            this.current_options[this.color_index] = input.nextElementSibling.querySelector('span').innerText;
            this.updateMasterId();
          }
        });
      });

      // Handle sibling swatches (with dynamic size option updates and enhanced hover images)
      let sibling_labels = swatches.querySelectorAll('.product-form__input--siblings label');
      let currentSiblingProduct = null;
      let currentSiblingImages = null;
      
      sibling_labels.forEach((label) => {
        label.addEventListener('mouseover', async () => {
          // Remove active class from all sibling labels
          sibling_labels.forEach(l => l.classList.remove('active'));
          
          // Add active class to hovered label
          label.classList.add('active');
          
          // Update color text for sibling product
          this.updateColorTextForSibling(label);
          
          // Update images if the label has a data-srcset attribute
          const link = label.querySelector('a');
          if (link && link.dataset.srcset && image) {
            
            // Update the primary image to show sibling color
            this.updateImageSrcset(image, link.dataset.srcset);
            
          }
          
          // Fetch sibling images for hover functionality (always, not just when size options exist)
          if (link) {
            const siblingUrl = link.getAttribute('href');
            // Better URL parsing to handle various URL formats
            let siblingHandle = siblingUrl;
            
            // Remove query parameters and hash
            siblingHandle = siblingHandle.split('?')[0].split('#')[0];
            
            // Extract handle from URL path
            const urlParts = siblingHandle.split('/');
            siblingHandle = urlParts[urlParts.length - 1];
            
            // Remove any trailing slashes
            siblingHandle = siblingHandle.replace(/\/$/, '');
            
            if (siblingHandle && siblingHandle !== '') {
              try {
                // Fetch sibling product data
                const response = await fetch(`/products/${siblingHandle}.js`);
                if (response.ok) {
                  const siblingProduct = await response.json();
                  
                  
                  // Store current sibling product
                  currentSiblingProduct = siblingProduct;
                  
                  // Store sibling images for hover functionality
                  currentSiblingImages = this.prepareSiblingImages(siblingProduct);
                  
                  // Update additional images to show sibling images during hover
                  this.updateAdditionalImagesForSibling(currentSiblingImages);
                  
                } else {
                  console.warn('Failed to fetch sibling product:', siblingHandle, response.status);
                }
              } catch (error) {
                console.error('Error fetching sibling product:', error);
              }
            } else {
              console.warn('Invalid sibling handle extracted from URL:', siblingUrl);
            }
          }
          
          // Update size options for sibling product (only if size options exist)
          if (this.size_options && link && currentSiblingProduct) {
            this.updateSizeOptionsForSibling(currentSiblingProduct);
          }
        });
        
        // Handle mouseout to restore original size options and images
        label.addEventListener('mouseout', () => {
          // Only restore if this is not the currently active sibling
          if (!label.classList.contains('active')) {
            this.restoreOriginalSizeOptions();
            this.restoreOriginalImages();
            this.restoreOriginalAdditionalImages();
            this.restoreOriginalColorText();
          }
        });
        
        // Handle click to make sibling selection permanent
        label.addEventListener('click', (e) => {
          e.preventDefault();
          // Update color text permanently for clicked sibling
          this.updateColorTextForSibling(label);
          // Navigate to the sibling product
          const link = label.querySelector('a');
          if (link) {
            window.location.href = link.getAttribute('href');
          }
        });
      });
    }
    
    storeOriginalImageStates() {
      // Store original primary image state
      if (this.image) {
        this.originalImageStates.set('primary', {
          dataSrcset: this.image.getAttribute('data-srcset'),
          srcset: this.image.getAttribute('srcset'),
          src: this.image.getAttribute('src')
        });
      }
      
      // Store original additional images states for hover functionality
      this.additional_images.forEach((img, index) => {
        this.originalImageStates.set(`additional_${index}`, {
          dataSrcset: img.getAttribute('data-srcset'),
          srcset: img.getAttribute('srcset'),
          src: img.getAttribute('src')
        });
      });
    }
    
    restoreOriginalImages() {
      // Restore primary image
      if (this.image) {
        const originalState = this.originalImageStates.get('primary');
        if (originalState) {
          this.image.setAttribute('data-srcset', originalState.dataSrcset);
          if (originalState.srcset) {
            this.image.setAttribute('srcset', originalState.srcset);
          }
          if (originalState.src) {
            this.image.setAttribute('src', originalState.src);
          }
          
          // Force lazy loading to reload
          if (window.lazySizes) {
            window.lazySizes.loader.unveil(this.image);
          }
        }
      }
    }
    
    restoreOriginalAdditionalImages() {
      // Restore additional images to their original state
      this.additional_images.forEach((img, index) => {
        const originalState = this.originalImageStates.get(`additional_${index}`);
        if (originalState) {
          img.setAttribute('data-srcset', originalState.dataSrcset);
          if (originalState.srcset) {
            img.setAttribute('srcset', originalState.srcset);
          }
          if (originalState.src) {
            img.setAttribute('src', originalState.src);
          }
          
          // Force lazy loading to reload
          if (window.lazySizes) {
            window.lazySizes.loader.unveil(img);
          }
        }
      });
    }
    
    updateColorTextForSibling(label) {
      // Update color text when hovering over sibling swatch
      const colorTextElement = this.querySelector('.product-card-color-text');
      if (!colorTextElement) return;
      
      // Store original color text if not already stored
      if (!this.originalColorText) {
        this.originalColorText = colorTextElement.textContent.trim();
      }
      
      // Extract color from the label's title attribute or style
      const link = label.querySelector('a');
      if (link) {
        const title = link.getAttribute('title');
        if (title) {
          // Extract color from title (e.g., "Self Care Club Hoodie - Black" -> "Black")
          const colorMatch = title.match(/- ([^-]+)$/);
          if (colorMatch) {
            const colorName = colorMatch[1].trim();
            colorTextElement.textContent = colorName;
            colorTextElement.setAttribute('data-color-text', colorName);
          }
        }
      }
    }
    
    restoreOriginalColorText() {
      // Restore original color text
      const colorTextElement = this.querySelector('.product-card-color-text');
      if (colorTextElement && this.originalColorText) {
        colorTextElement.textContent = this.originalColorText;
        colorTextElement.setAttribute('data-color-text', this.originalColorText);
      }
    }
    
    prepareSiblingImages(siblingProduct) {
      // Prepare sibling images for hover functionality
      const siblingImages = [];
      
      
      if (siblingProduct && siblingProduct.images && siblingProduct.images.length > 0) {
        // Get the number of additional images to show (from theme settings)
        const maxImages = window.theme?.settings?.products_hover_images_count || 4;
        
        
        // Start from index 1 (skip the first image as it's the primary)
        for (let i = 1; i <= maxImages && i < siblingProduct.images.length; i++) {
          const image = siblingProduct.images[i];
          if (image) {
            // Handle different image formats from Shopify API
            let imageSrc = image.src || image.url || image;
            let imageAlt = image.alt || siblingProduct.title;
            
            // If imageSrc is still undefined, try to construct it from the image object
            if (!imageSrc && image.id) {
              // Construct Shopify image URL from ID
              imageSrc = `https://cdn.shopify.com/s/files/1/${image.id}`;
            }
            
            if (imageSrc) {
              // Ensure protocol is included (fix protocol-relative URLs)
              if (imageSrc.startsWith('//')) {
                imageSrc = 'https:' + imageSrc;
              }
              
              // Create proper srcset URLs with correct query parameter handling
              const separator = imageSrc.includes('?') ? '&' : '?';
              const srcset = `${imageSrc}${separator}width=375 375w, ${imageSrc}${separator}width=770 770w`;
              
              siblingImages.push({
                src: imageSrc,
                srcset: srcset,
                alt: imageAlt
              });
              
            }
          }
        }
      }
      
      return siblingImages;
    }
    
    updateAdditionalImagesForSibling(siblingImages) {
      // Update additional images to show sibling images during hover
      
      if (!siblingImages || siblingImages.length === 0) {
        return;
      }
      
      this.additional_images.forEach((img, index) => {
        if (siblingImages[index]) {
          const siblingImage = siblingImages[index];
          
          
          // Update image attributes
          img.setAttribute('data-srcset', siblingImage.srcset);
          img.setAttribute('srcset', siblingImage.srcset);
          img.setAttribute('src', siblingImage.src);
          img.setAttribute('alt', siblingImage.alt);
          
          // Force lazy loading to reload
          if (window.lazySizes) {
            window.lazySizes.loader.unveil(img);
          }
        }
      });
    }
    
    updateImageSrcset(imageElement, newSrcset) {
      const currentDataSrcset = imageElement.getAttribute('data-srcset');
      const currentSrcset = imageElement.getAttribute('srcset');
      
      
      if (currentDataSrcset !== newSrcset) {
        // Extract the first image URL from the srcset for direct src update
        const firstImageUrl = newSrcset.split(',')[0].trim().split(' ')[0];
        
        
        // More aggressive approach to force image reload
        // 1. Clear all image attributes first
        imageElement.removeAttribute('data-srcset');
        imageElement.removeAttribute('srcset');
        imageElement.removeAttribute('src');
        
        // 2. Force a reflow
        imageElement.offsetHeight;
        
        // 3. Set new attributes
        imageElement.setAttribute('data-srcset', newSrcset);
        imageElement.setAttribute('srcset', newSrcset);
        imageElement.setAttribute('src', firstImageUrl);
        
        // 4. Force lazy loading to reload the image
        if (window.lazySizes) {
          window.lazySizes.loader.unveil(imageElement);
        }
        
        // 5. Add a cache-busting parameter to force reload
        const cacheBustUrl = firstImageUrl + (firstImageUrl.includes('?') ? '&' : '?') + 'cb=' + Date.now();
        imageElement.setAttribute('src', cacheBustUrl);
        
      }
    }
    
    updateSizeOptionsForSibling(siblingProduct) {
      if (!this.size_options || !siblingProduct.variants) return;
      
      // Get the size option index from the original product
      const sizeIndex = parseInt(this.size_options.dataset.index);
      const sizeOptionsVariantName = this.size_options.dataset.sizeOptionName || 'Size';
      
      // Find the size option in the sibling product
      let siblingSizeIndex = -1;
      siblingProduct.options.forEach((option, index) => {
        if (option.name.toLowerCase() === sizeOptionsVariantName.toLowerCase()) {
          siblingSizeIndex = index;
        }
      });
      
      if (siblingSizeIndex === -1) return;
      
      // Update each size option based on sibling product availability
      const sizeElements = this.size_options.querySelectorAll('.product-card-sizes--size');
      sizeElements.forEach((sizeElement) => {
        const sizeValue = sizeElement.querySelector('span').textContent.trim();
        
        // Check if this size is available in the sibling product
        const isAvailable = siblingProduct.variants.some(variant => 
          variant.options[siblingSizeIndex] === sizeValue && variant.available
        );
        
        // Update the size element
        if (isAvailable) {
          sizeElement.classList.remove('is-disabled');
          sizeElement.style.opacity = '1';
          sizeElement.style.pointerEvents = 'auto';
        } else {
          sizeElement.classList.add('is-disabled');
          sizeElement.style.opacity = '0.3';
          sizeElement.style.pointerEvents = 'none';
        }
      });
    }
    
    storeOriginalSizeStates() {
      if (!this.size_options) return;
      
      const sizeElements = this.size_options.querySelectorAll('.product-card-sizes--size');
      sizeElements.forEach((sizeElement) => {
        const sizeValue = sizeElement.querySelector('span').textContent.trim();
        this.originalSizeStates.set(sizeValue, {
          hasDisabledClass: sizeElement.classList.contains('is-disabled'),
          opacity: sizeElement.style.opacity,
          pointerEvents: sizeElement.style.pointerEvents
        });
      });
    }
    
    restoreOriginalSizeOptions() {
      if (!this.size_options) return;
      
      // Restore original size options from stored states
      const sizeElements = this.size_options.querySelectorAll('.product-card-sizes--size');
      sizeElements.forEach((sizeElement) => {
        const sizeValue = sizeElement.querySelector('span').textContent.trim();
        const originalState = this.originalSizeStates.get(sizeValue);
        
        if (originalState) {
          // Restore original disabled state
          if (originalState.hasDisabledClass) {
            sizeElement.classList.add('is-disabled');
          } else {
            sizeElement.classList.remove('is-disabled');
          }
          
          // Restore original styles
          sizeElement.style.opacity = originalState.opacity;
          sizeElement.style.pointerEvents = originalState.pointerEvents;
        }
      });
    }
    
    enableQuickAdd() {
      this.quick_add.addEventListener('click', this.quickAdd.bind(this));
    }
    enableSizeOptions() {
      let size_list = this.size_options.querySelectorAll('.product-card-sizes--size'),
        featured_image = this.querySelector('.product-card--featured-image'),
        has_hover = featured_image ? featured_image.classList.contains('thb-hover') : false,
        size_parent = this.size_options.parentElement;

      this.size_index = this.size_options.dataset.index;

      this.current_options = this.size_options.dataset.options.split(',');

      this.updateMasterId();

      size_parent.addEventListener('mouseenter', () => {
        if (has_hover && featured_image) {
          featured_image.classList.remove('thb-hover');
        }
      }, {
        passive: true
      });
      size_parent.addEventListener('mouseleave', () => {
        if (has_hover && featured_image) {
          featured_image.classList.add('thb-hover');
        }
      }, {
        passive: true
      });
      size_list.forEach((size) => {
        size.addEventListener('click', (evt) => {
          evt.preventDefault();

          if (size.classList.contains('is-disabled')) {
            return;
          }
          this.current_options[this.size_index] = size.querySelector('span').innerText;
          this.updateMasterId();

          size.classList.add('loading');
          size.setAttribute('aria-disabled', true);
          const config = {
            method: 'POST',
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/javascript'
            }
          };
          let formData = new FormData();

          formData.append('id', this.currentVariant.id);
          formData.append('quantity', 1);
          formData.append('sections', this.getSectionsToRender().map((section) => section.section));
          formData.append('sections_url', window.location.pathname);

          config.body = formData;

          fetch(`${theme.routes.cart_add_url}`, config)
            .then((response) => response.json())
            .then((response) => {
              if (response.status) {
                return;
              }
              this.renderContents(response);

              dispatchCustomEvent('cart:item-added', {
                product: response.hasOwnProperty('items') ? response.items[0] : response
              });
            })
            .catch((e) => {
              console.error(e);
            })
            .finally(() => {
              size.classList.remove('loading');
              size.removeAttribute('aria-disabled');
            });
        });
      });
    }
    updateMasterId() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => {
          return this.current_options[index] === option;
        }).includes(false);
      });
      setTimeout(() => {
        this.setDisabled();
      }, 100);
    }
    getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }
    setDisabled() {
      const variant_data = this.getVariantData();

      if (variant_data) {

        if (this.currentVariant) {
          const selected_options = this.currentVariant.options.map((value, index) => {
            return {
              value,
              index: `option${index + 1}`
            };
          });

          const available_options = this.createAvailableOptionsTree(variant_data, selected_options);

          const fieldset_options = Object.values(available_options)[this.size_index];
          if (fieldset_options) {
            if (this.size_options.querySelectorAll('.product-card-sizes--size').length) {
              this.size_options.querySelectorAll('.product-card-sizes--size').forEach((input, input_i) => {
                input.classList.toggle('is-disabled', fieldset_options[input_i].isUnavailable);
              });
            }
          }
        } else {
          if (this.size_options.querySelectorAll('.product-card-sizes--size').length) {
            this.size_options.querySelectorAll('.product-card-sizes--size').forEach((input, input_i) => {
              input.classList.add('is-disabled');
            });
          }
        }

      }
      return true;
    }
    createAvailableOptionsTree(variant_data, selected_options) {
      // Reduce variant array into option availability tree
      return variant_data.reduce((options, variant) => {

        // Check each option group (e.g. option1, option2, option3) of the variant
        Object.keys(options).forEach(index => {

          if (variant[index] === null) return;

          let entry = options[index].find(option => option.value === variant[index]);

          if (typeof entry === 'undefined') {
            // If option has yet to be added to the options tree, add it
            entry = {
              value: variant[index],
              isUnavailable: true
            };
            options[index].push(entry);
          }

          // Check how many selected option values match a variant
          const countVariantOptionsThatMatchCurrent = selected_options.reduce((count, {
            value,
            index
          }) => {
            return variant[index] === value ? count + 1 : count;
          }, 0);

          // Only enable an option if an available variant matches all but one current selected value
          if (countVariantOptionsThatMatchCurrent >= selected_options.length - 1) {
            entry.isUnavailable = entry.isUnavailable && variant.available ? false : entry.isUnavailable;
          }

          // Make sure if a variant is unavailable, disable currently selected option
          if ((!this.currentVariant || !this.currentVariant.available) && selected_options.find((option) => option.value === entry.value && index === option.index)) {
            entry.isUnavailable = true;
          }

          // First option is always enabled
          if (index === 'option1') {
            entry.isUnavailable = entry.isUnavailable && variant.available ? false : entry.isUnavailable;
          }
        });

        return options;
      }, {
        option1: [],
        option2: [],
        option3: []
      });
    }
    quickAdd(evt) {
      evt.preventDefault();
      if (this.quick_add.disabled) {
        return;
      }
      this.quick_add.classList.add('loading');
      this.quick_add.setAttribute('aria-disabled', true);

      const config = {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/javascript'
        }
      };

      let formData = new FormData();

      formData.append('id', this.quick_add.dataset.productId);
      formData.append('quantity', 1);
      formData.append('sections', this.getSectionsToRender().map((section) => section.section));
      formData.append('sections_url', window.location.pathname);

      config.body = formData;

      fetch(`${theme.routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            return;
          }
          this.renderContents(response);

          dispatchCustomEvent('cart:item-added', {
            product: response.hasOwnProperty('items') ? response.items[0] : response
          });
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.quick_add.classList.remove('loading');
          this.quick_add.removeAttribute('aria-disabled');
        });

      return false;
    }
    getSectionsToRender() {
      return [{
        id: 'Cart',
        section: 'main-cart',
        selector: '.thb-cart-form'
      },
      {
        id: 'Cart-Drawer',
        section: 'cart-drawer',
        selector: '.cart-drawer'
      },
      {
        id: 'cart-drawer-toggle',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      }];
    }
    renderContents(parsedState) {
      this.getSectionsToRender().forEach((section => {
        if (!document.getElementById(section.id)) {
          return;
        }
        const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
        elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

        if (section.id === 'Cart-Drawer') {
          document.getElementById('Cart-Drawer')?.notesToggle();
          document.getElementById('Cart-Drawer')?.removeProductEvent();
        }

        if (section.id === 'Cart' && typeof Cart !== 'undefined') {
          new Cart().renderContents(parsedState);
        }
      }));


      if (document.getElementById('Cart-Drawer')) {
        document.getElementById('Cart-Drawer').classList.add('active');
        document.body.classList.add('open-cart');
        document.body.classList.add('open-cc');
        if (document.getElementById('Cart-Drawer').querySelector('.product-recommendations--full')) {
          document.getElementById('Cart-Drawer').querySelector('.product-recommendations--full').classList.add('active');
        }
        dispatchCustomEvent('cart-drawer:open');
      }
    }
    getSectionInnerHTML(html, selector = '.shopify-section') {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
  }
  customElements.define('product-card', ProductCard);
}


/**
 *  @class
 *  @function PanelClose
 */
if (!customElements.get('side-panel-close')) {
  class PanelClose extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.cc = document.querySelector('.click-capture');

      this.onClick = (e) => {
        let panel = document.querySelectorAll('.side-panel.active');
        if (panel.length) {
          this.close_panel(e, panel[0]);
        }
      };
      // Add functionality to buttons
      this.addEventListener('click', this.onClick.bind(this));
      document.addEventListener('panel:close', this.onClick.bind(this));
      if (!this.cc.hasAttribute('initialized')) {
        this.cc.addEventListener('click', this.onClick.bind(this));
        this.cc.setAttribute('initialized', '');
      }

    }
    close_panel(e, panel) {
      if (e) {
        e.preventDefault();
      }
      if (!panel) {
        panel = e?.target.closest('.side-panel.active');

        if (!panel) {
          return;
        }
      }
      if (panel.classList.contains('product-drawer') || document.body.classList.contains('open-quick-view')) {
        this.close_quick_view();
      } else if (panel.classList.contains('cart-drawer')) {
        if (panel.querySelector('.product-recommendations--full')) {
          if (!document.body.classList.contains('open-quick-view')) {
            panel.querySelector('.product-recommendations--full').classList.remove('active');
          }
        }
        if (window.innerWidth < 1069) {
          if (!document.body.classList.contains('open-quick-view')) {
            panel.classList.remove('active');
            document.body.classList.remove('open-cc');
            document.body.classList.remove('open-cart');
          } else {
            this.close_quick_view();
          }
        } else {
          if (panel.querySelector('.product-recommendations--full')) {
            if (!document.body.classList.contains('open-quick-view')) {
              setTimeout(() => {
                panel.classList.remove('active');
                document.body.classList.remove('open-cc');
                document.body.classList.remove('open-cart');
              }, 500);
            } else {
              this.close_quick_view();
            }
          } else {
            panel.classList.remove('active');
            document.body.classList.remove('open-cc');
            document.body.classList.remove('open-cart');
          }
        }
      } else {
        panel.classList.remove('active');
        document.body.classList.remove('open-cc');
      }
    }
    close_quick_view() {
      let panel = document.getElementById('Product-Drawer');

      if (panel.querySelector('.product-quick-images--container')) {
        panel.querySelector('.product-quick-images--container').classList.remove('active');
      }
      if (window.innerWidth < 1069) {
        panel.classList.remove('active');
        if (!document.body.classList.contains('open-cart') || !document.body.classList.contains('open-quick-view')) {
          document.body.classList.remove('open-cc');
        }
        document.body.classList.remove('open-quick-view');
      } else {
        if (panel.querySelector('.product-quick-images--container')) {
          setTimeout(() => {
            panel.classList.remove('active');
            if (!document.body.classList.contains('open-cart') || !document.body.classList.contains('open-quick-view')) {
              document.body.classList.remove('open-cc');
            }
            document.body.classList.remove('open-quick-view');
            panel.querySelector('#Product-Drawer-Content').innerHTML = '';
          }, 500);
        }
      }
    }
  }
  customElements.define('side-panel-close', PanelClose);

  document.addEventListener('keyup', (e) => {
    if (e.code) {
      if (e.code.toUpperCase() === 'ESCAPE') {
        dispatchCustomEvent('panel:close');
      }
    }
  });
}
/**
 *  @class
 *  @function CartDrawer
 */
if (!customElements.get('cart-drawer')) {
  class CartDrawer extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback() {

      let button = document.getElementById('cart-drawer-toggle');


      // Add functionality to buttons
      button.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.add('open-cc');
        document.body.classList.add('open-cart');
        this.classList.add('active');
        this.focus();
        setTimeout(() => {
          this.querySelector('.product-recommendations--full')?.classList.add('active');
        });
        dispatchCustomEvent('cart-drawer:open');
      });

      this.debouncedOnChange = debounce((event) => {
        this.onChange(event);
      }, 300);

      document.addEventListener('cart:refresh', (event) => {
        this.refresh();
      });

      this.addEventListener('change', this.debouncedOnChange.bind(this));

      this.notesToggle();
      this.removeProductEvent();
    }
    onChange(event) {
      if (event.target.classList.contains('qty')) {
        this.updateQuantity(event.target.dataset.index, event.target.value);
      }
    }
    removeProductEvent() {
      let removes = this.querySelectorAll('.remove');

      removes.forEach((remove) => {
        remove.addEventListener('click', (event) => {
          this.updateQuantity(event.target.dataset.index, '0');

          event.preventDefault();
        });
      });
    }
    getSectionsToRender() {
      return [{
        id: 'Cart-Drawer',
        section: 'cart-drawer',
        selector: '.cart-drawer'
      },
      {
        id: 'cart-drawer-toggle',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      }];
    }
    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
    notesToggle() {
      let notes_toggle = document.getElementById('order-note-toggle');

      if (!notes_toggle) {
        return;
      }

      notes_toggle.addEventListener('click', (event) => {
        notes_toggle.nextElementSibling.classList.add('active');
      });
      notes_toggle.nextElementSibling.querySelectorAll('.button, .order-note-toggle__content-overlay').forEach((el) => {
        el.addEventListener('click', (event) => {
          notes_toggle.nextElementSibling.classList.remove('active');
          this.saveNotes();
        });
      });
    }
    saveNotes() {
      fetch(`${theme.routes.cart_update_url}.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': `application/json`
        },
        body: JSON.stringify({
          'note': document.getElementById('mini-cart__notes').value
        })
      });
    }
    updateQuantity(line, quantity) {
      this.querySelector(`#CartDrawerItem-${line}`)?.classList.add('thb-loading');
      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname
      });

      dispatchCustomEvent('line-item:change:start', {
        quantity: quantity
      });
      this.querySelector('.product-recommendations--full')?.classList.remove('active');

      fetch(`${theme.routes.cart_change_url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': `application/json`
        },
        ...{
          body
        }
      })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.getSectionsToRender().forEach((section => {
            const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

            if (parsedState.sections) {
              elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            }
          }));

          this.removeProductEvent();
          this.notesToggle();
          dispatchCustomEvent('line-item:change:end', {
            quantity: quantity,
            cart: parsedState
          });

          this.querySelector(`#CartDrawerItem-${line}`)?.classList.remove('thb-loading');
        });
    }
    refresh() {
      this.querySelector('.product-recommendations--full')?.classList.remove('active');
      let sections = 'cart-drawer,cart-bubble';
      fetch(`${window.location.pathname}?sections=${sections}`)
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.getSectionsToRender().forEach((section => {
            const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

            elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState[section.section], section.selector);
          }));

          this.removeProductEvent();
          this.notesToggle();
        });
    }
  }
  customElements.define('cart-drawer', CartDrawer);
}

/**
 *  @class
 *  @function SelectWidth
 */
class SelectWidth {
  constructor() {
    let _this = this;
    // resize on initial load
    window.addEventListener('load', () => {
      document.querySelectorAll('.resize-select').forEach(_this.resizeSelect);
    });

    // delegated listener on change
    document.body.addEventListener('change', (e) => {
      if (e.target.matches('.resize-select') && e.target.offsetParent !== null) {
        _this.resizeSelect(e.target);
      }
    });
    window.addEventListener('resize.resize-select', function () {
      document.querySelectorAll('.resize-select').forEach(_this.resizeSelect);
    });
  }

  resizeSelect(sel) {
    let tempOption = document.createElement('option');
    tempOption.textContent = sel.selectedOptions[0].textContent;

    let tempSelect = document.createElement('select'),
      offset = 13;
    tempSelect.style.visibility = 'hidden';
    tempSelect.style.position = 'fixed';
    tempSelect.appendChild(tempOption);
    if (sel.classList.contains('thb-language-code') || sel.classList.contains('thb-currency-code') || sel.classList.contains('facet-filters__sort')) {
      offset = 2;
    }
    sel.after(tempSelect);
    if (tempSelect.clientWidth > 0) {
      sel.style.width = `${+tempSelect.clientWidth + offset}px`;
    }
    tempSelect.remove();
  }
}

if (typeof SelectWidth !== 'undefined') {
  new SelectWidth();
}

/**
 *  @class
 *  @function FooterMenuToggle
 */
class FooterMenuToggle {
  constructor() {
    let _this = this;
    // resize on initial load
    document.querySelectorAll('.thb-widget-title.collapsible').forEach((button) => {
      button.addEventListener('click', (e) => {
        button.classList.toggle('active');
      });
    });
  }
}

/**
 *  @class
 *  @function QuickView
 */
if (!customElements.get('quick-view')) {
  class QuickView extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.drawer = document.getElementById('Product-Drawer');
      this.body = document.body;

      this.addEventListener('click', this.setupEventListener.bind(this));

    }
    setupEventListener(e) {
      e.preventDefault();
      let productHandle = this.dataset.productHandle,
        href = `${theme.routes.root_url}/products/${productHandle}?view=quick-view`;

      // remove double `/` in case shop might have /en or language in URL
      href = href.replace('//', '/');
      if (!href || !productHandle) {
        return;
      }
      if (this.classList.contains('loading')) {
        return;
      }
      this.classList.add('loading');
      fetch(href, {
        method: 'GET'
      })
        .then((response) => {
          this.classList.remove('loading');
          return response.text();
        })
        .then(text => {
          const sectionInnerHTML = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('#Product-Drawer-Content').innerHTML;

          this.renderQuickview(sectionInnerHTML, href, productHandle);

        });
    }
    renderQuickview(sectionInnerHTML, href, productHandle) {
      if (sectionInnerHTML) {

        this.drawer.querySelector('#Product-Drawer-Content').innerHTML = sectionInnerHTML;

        let js_files = this.drawer.querySelector('#Product-Drawer-Content').querySelectorAll('script');

        if (js_files.length > 0) {
          var head = document.getElementsByTagName('head')[0];
          js_files.forEach((js_file, i) => {
            let script = document.createElement('script');
            script.src = js_file.src;
            head.appendChild(script);
          });
        }

        setTimeout(() => {
          if (Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }
          if (window.ProductModel) {
            window.ProductModel.loadShopifyXR();
          }
        }, 300);

        this.body.classList.add('open-cc');
        this.body.classList.add('open-quick-view');
        this.drawer.classList.add('active');

        this.drawer.querySelector('.side-panel-close').focus();

        setTimeout(() => {
          this.drawer.querySelector('.product-quick-images--container').classList.add('active');
        });
        dispatchCustomEvent('quick-view:open', {
          productUrl: href,
          productHandle: productHandle
        });
        addIdToRecentlyViewed(productHandle);
      }
    }
  }
  customElements.define('quick-view', QuickView);
}

/**
 *  @class
 *  @function SidePanelContentTabs
 */
if (!customElements.get('side-panel-content-tabs')) {
  class SidePanelContentTabs extends HTMLElement {
    constructor() {
      super();
      this.buttons = this.querySelectorAll('button');
      this.panels = this.parentElement.querySelectorAll('.side-panel-content--tab-panel');
    }
    connectedCallback() {
      this.setupButtonObservers();
    }
    disconnectedCallback() {

    }
    setupButtonObservers() {
      this.buttons.forEach((item, i) => {
        item.addEventListener('click', (e) => {
          this.toggleActiveClass(i);
        });
      });
    }
    toggleActiveClass(i) {
      this.buttons.forEach((button) => {
        button.classList.remove('tab-active');
      });
      this.buttons[i].classList.add('tab-active');

      this.panels.forEach((panel) => {
        panel.classList.remove('tab-active');
      });
      this.panels[i].classList.add('tab-active');
    }
  }

  customElements.define('side-panel-content-tabs', SidePanelContentTabs);
}

/**
 *  @class
 *  @function CollapsibleRow
 */
if (!customElements.get('collapsible-row')) {
  // https://css-tricks.com/how-to-animate-the-details-element/
  class CollapsibleRow extends HTMLElement {
    constructor() {
      super();

      this.details = this.querySelector('details');
      this.summary = this.querySelector('summary');
      this.content = this.querySelector('.collapsible__content');

      // Store the animation object (so we can cancel it if needed)
      this.animation = null;
      // Store if the element is closing
      this.isClosing = false;
      // Store if the element is expanding
      this.isExpanding = false;
    }
    connectedCallback() {
      this.setListeners();
    }
    setListeners() {
      this.querySelector('summary').addEventListener('click', (e) => this.onClick(e));
    }
    instantClose() {
      this.tl.timeScale(10).reverse();
    }
    animateClose() {
      this.tl.timeScale(3).reverse();
    }
    animateOpen() {
      this.tl.timeScale(1).play();
    }
    onClick(e) {
      // Stop default behaviour from the browser
      e.preventDefault();
      // Add an overflow on the <details> to avoid content overflowing
      this.details.style.overflow = 'hidden';
      // Check if the element is being closed or is already closed
      if (this.isClosing || !this.details.open) {
        this.open();
        // Check if the element is being openned or is already open
      } else if (this.isExpanding || this.details.open) {
        this.shrink();
      }
    }
    shrink() {
      // Set the element as "being closed"
      this.isClosing = true;

      // Store the current height of the element
      const startHeight = `${this.details.offsetHeight}px`;
      // Calculate the height of the summary
      const endHeight = `${this.summary.offsetHeight}px`;

      // If there is already an animation running
      if (this.animation) {
        // Cancel the current animation
        this.animation.cancel();
      }

      // Start a WAAPI animation
      this.animation = this.details.animate({
        // Set the keyframes from the startHeight to endHeight
        height: [startHeight, endHeight]
      }, {
        duration: 250,
        easing: 'ease'
      });

      // When the animation is complete, call onAnimationFinish()
      this.animation.onfinish = () => this.onAnimationFinish(false);
      // If the animation is cancelled, isClosing variable is set to false
      this.animation.oncancel = () => this.isClosing = false;
    }

    open() {
      // Apply a fixed height on the element
      this.details.style.height = `${this.details.offsetHeight}px`;
      // Force the [open] attribute on the details element
      this.details.open = true;
      // Wait for the next frame to call the expand function
      window.requestAnimationFrame(() => this.expand());
    }

    expand() {
      // Set the element as "being expanding"
      this.isExpanding = true;
      // Get the current fixed height of the element
      const startHeight = `${this.details.offsetHeight}px`;
      // Calculate the open height of the element (summary height + content height)
      const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

      // If there is already an animation running
      if (this.animation) {
        // Cancel the current animation
        this.animation.cancel();
      }

      // Start a WAAPI animation
      this.animation = this.details.animate({
        // Set the keyframes from the startHeight to endHeight
        height: [startHeight, endHeight]
      }, {
        duration: 400,
        easing: 'ease-out'
      });
      // When the animation is complete, call onAnimationFinish()
      this.animation.onfinish = () => this.onAnimationFinish(true);
      // If the animation is cancelled, isExpanding variable is set to false
      this.animation.oncancel = () => this.isExpanding = false;
    }

    onAnimationFinish(open) {
      // Set the open attribute based on the parameter
      this.details.open = open;
      // Clear the stored animation
      this.animation = null;
      // Reset isClosing & isExpanding
      this.isClosing = false;
      this.isExpanding = false;
      // Remove the overflow hidden and the fixed height
      this.details.style.height = this.details.style.overflow = '';
    }
  }
  customElements.define('collapsible-row', CollapsibleRow);
}

/**
 *  @function addIdToRecentlyViewed
 */
function addIdToRecentlyViewed(handle) {

  if (!handle) {
    let product = document.querySelector('.thb-product-detail');

    if (product) {
      handle = product.dataset.handle;
    }
  }
  if (!handle) {
    return;
  }
  if (window.localStorage) {
    let recentIds = window.localStorage.getItem('recently-viewed');
    if (recentIds != 'undefined' && recentIds != null) {
      window.recentlyViewedIds = JSON.parse(recentIds);
    }
  }
  // Remove current product if already in recently viewed array
  var i = window.recentlyViewedIds.indexOf(handle);

  if (i > -1) {
    window.recentlyViewedIds.splice(i, 1);
  }

  // Add id to array
  window.recentlyViewedIds.unshift(handle);

  if (window.localStorage) {
    window.localStorage.setItem('recently-viewed', JSON.stringify(window.recentlyViewedIds));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof FooterMenuToggle !== 'undefined') {
    new FooterMenuToggle();
  }
});