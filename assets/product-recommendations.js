/**
 *  @class
 *  @function ProductRecommendations
 */
class ProductRecommendations extends HTMLElement {
	constructor() {
		super();

		this.parent = this.closest('.product-recommendations--parent');

	}
	fetchProducts() {
		fetch(this.dataset.url)
			.then(response => response.text())
			.then(text => {
				const html = document.createElement('div');
				html.innerHTML = text;
				const recommendations = html.querySelector('product-recommendations');

				if (recommendations && recommendations.innerHTML.trim().length) {
					this.innerHTML = recommendations.innerHTML;

					// Initialize ProductCard custom elements for sibling functionality
					this.querySelectorAll('product-card').forEach(card => {
						if (!customElements.get('product-card')) {
							// ProductCard custom element not defined yet, wait for it
							setTimeout(() => {
								if (customElements.get('product-card')) {
									customElements.upgrade(card);
								}
							}, 100);
						} else {
							customElements.upgrade(card);
						}
					});

					if ( this.parent ) {
						this.parent.classList.add('product-recommendations--full');

						if ( document.body.classList.contains('open-cart')) {
							this.parent.classList.add('active');
						}
					}

				}

				this.classList.add('product-recommendations--loaded');

			})
			.catch(e => {
				console.error(e);
			});
	}
	connectedCallback() {
		this.fetchProducts();
	}
}

customElements.define('product-recommendations', ProductRecommendations);
