/**
 * filename: assets/theme.js
 * purpose: Global storefront behavior for navigation, drawers, predictive search, collection pagination, product interactions, and AJAX cart updates.
 * key variables: window.themeStrings, data attributes for drawers/carousels/forms, Shopify AJAX endpoints.
 * ai_agent_edit_guide: Add or update interactive behavior here. Keep all DOM hooks semantic through data attributes and avoid embedding copy or section-specific business logic in templates.
 */

/**
 * Returns the first matching element for a selector.
 * @param {ParentNode} scope
 * @param {string} selector
 * @returns {Element|null}
 */
function qs(scope, selector) {
  return scope.querySelector(selector);
}

/**
 * Returns all matching elements for a selector as an array.
 * @param {ParentNode} scope
 * @param {string} selector
 * @returns {Element[]}
 */
function qsa(scope, selector) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Locks page scrolling while drawers or modals are open.
 */
function lockScroll() {
  document.documentElement.classList.add('is-locked');
  document.body.classList.add('is-locked');
}

/**
 * Restores page scrolling after drawers or modals close.
 */
function unlockScroll() {
  if (document.querySelector('.drawer.is-open, .modal.is-open')) {
    return;
  }

  document.documentElement.classList.remove('is-locked');
  document.body.classList.remove('is-locked');
}

/**
 * Returns a list of focusable descendants within a container.
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container) {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  return qsa(container, selector).filter((element) => !element.hasAttribute('hidden'));
}

/**
 * Activates a simple focus trap inside a container.
 * @param {HTMLElement} container
 * @returns {Function}
 */
function trapFocus(container) {
  const focusable = getFocusableElements(container);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (first) {
    first.focus();
  }

  /**
   * Keeps focus cycling inside the container.
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (event.key !== 'Tab' || !first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeydown);

  return () => {
    container.removeEventListener('keydown', handleKeydown);
  };
}

/**
 * Opens a drawer by id and activates focus management.
 * @param {string} drawerId
 */
function openDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);

  if (!drawer) {
    return;
  }

  if (!drawer.dataset.releaseFocus) {
    drawer.dataset.releaseFocus = 'pending';
  }

  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  drawer.dataset.releaseFocus = 'active';
  drawer._releaseFocus = trapFocus(qs(drawer, '[data-drawer-panel]') || drawer);
  lockScroll();
}

/**
 * Closes a drawer by id and restores focus if possible.
 * @param {string} drawerId
 */
function closeDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);

  if (!drawer) {
    return;
  }

  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');

  if (typeof drawer._releaseFocus === 'function') {
    drawer._releaseFocus();
    drawer._releaseFocus = null;
  }

  unlockScroll();
}

/**
 * Toggles a drawer between open and closed states.
 * @param {string} drawerId
 */
function toggleDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);

  if (!drawer) {
    return;
  }

  if (drawer.classList.contains('is-open')) {
    closeDrawer(drawerId);
  } else {
    openDrawer(drawerId);
  }
}

/**
 * Updates all visible cart count badges.
 * @param {number} count
 */
function updateCartCount(count) {
  qsa(document, '[data-cart-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

/**
 * Fetches the latest cart JSON.
 * @returns {Promise<object>}
 */
async function fetchCart() {
  const response = await fetch(`${window.Shopify.routes.root}cart.js`, {
    headers: {
      Accept: 'application/json'
    }
  });

  return response.json();
}

/**
 * Refreshes the cart drawer section markup after an AJAX mutation.
 * @returns {Promise<void>}
 */
async function refreshCartDrawer() {
  const response = await fetch(`${window.Shopify.routes.root}?section_id=cart-drawer`);
  const markup = await response.text();
  const temp = document.createElement('div');
  temp.innerHTML = markup;

  const nextSection = qs(temp, '#shopify-section-cart-drawer');
  const currentSection = document.getElementById('shopify-section-cart-drawer');

  if (nextSection && currentSection) {
    currentSection.replaceWith(nextSection);
    initDrawers();
    initCartForms();
    attachAddToCartForms(document);
  }

  const cart = await fetchCart();
  updateCartCount(cart.item_count);
}

/**
 * Initializes sticky header behavior based on scroll position.
 */
function initHeader() {
  const header = document.querySelector('.site-header');

  if (!header) {
    return;
  }

  /**
   * Condenses the header after a gentle scroll threshold.
   */
  function handleScroll() {
    header.classList.toggle('is-condensed', window.scrollY > 24);
  }

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Wires drawer open and close controls across the document.
 */
function initDrawers() {
  qsa(document, '[data-drawer-target]').forEach((button) => {
    if (button.dataset.drawerBound === 'true') {
      return;
    }

    button.dataset.drawerBound = 'true';
    button.addEventListener('click', () => {
      toggleDrawer(button.getAttribute('data-drawer-target'));
    });
  });

  qsa(document, '[data-drawer-close]').forEach((button) => {
    if (button.dataset.drawerCloseBound === 'true') {
      return;
    }

    button.dataset.drawerCloseBound = 'true';
    button.addEventListener('click', () => {
      closeDrawer(button.getAttribute('data-drawer-close'));
    });
  });

  qsa(document, '.drawer').forEach((drawer) => {
    if (drawer.dataset.overlayBound === 'true') {
      return;
    }

    drawer.dataset.overlayBound = 'true';

    drawer.addEventListener('click', (event) => {
      if (event.target.matches('[data-drawer-overlay]')) {
        closeDrawer(drawer.id);
      }
    });

    drawer.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeDrawer(drawer.id);
      }
    });
  });
}

/**
 * Renders predictive search results into the target container.
 * @param {HTMLElement} resultsContainer
 * @param {Array} products
 */
function renderPredictiveResults(resultsContainer, products) {
  if (!products.length) {
    resultsContainer.innerHTML = `<p>${window.themeStrings.searchEmpty}</p>`;
    return;
  }

  resultsContainer.innerHTML = products.map((product) => {
    const image = product.featured_image ? `<img src="${product.featured_image.url}&width=144" alt="${product.title}" width="72" height="90" loading="lazy">` : '';
    const price = product.price ? `<p class="price__current">${product.price}</p>` : '';

    return `
      <a class="predictive-search__item" href="${product.url}">
        <div>${image}</div>
        <div>
          <p class="product-card__title">${product.title}</p>
          ${price}
        </div>
      </a>
    `;
  }).join('');
}

/**
 * Initializes predictive search against Shopify's suggest endpoint.
 */
function initPredictiveSearch() {
  const forms = qsa(document, '[data-predictive-search-form]');

  forms.forEach((form) => {
    if (form.dataset.predictiveBound === 'true') {
      return;
    }

    form.dataset.predictiveBound = 'true';
    const input = qs(form, 'input[type="search"]');
    const results = qs(form, '[data-predictive-results]');
    let controller;

    if (!input || !results) {
      return;
    }

    input.addEventListener('input', async () => {
      const query = input.value.trim();

      if (controller) {
        controller.abort();
      }

      if (query.length < 2) {
        results.innerHTML = '';
        return;
      }

      controller = new AbortController();
      results.innerHTML = `<p>${window.themeStrings.loading}</p>`;

      try {
        const response = await fetch(
          `${window.Shopify.routes.root}search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=4`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json'
            }
          }
        );
        const data = await response.json();
        renderPredictiveResults(results, data.resources.results.products || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          results.innerHTML = '';
        }
      }
    });
  });
}

/**
 * Posts an add-to-cart request and opens the cart drawer on success.
 * @param {HTMLFormElement} form
 */
async function handleAddToCart(form) {
  const submitButton = qs(form, '[type="submit"]');
  const formData = new FormData(form);

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    await fetch(`${window.Shopify.routes.root}cart/add.js`, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: formData
    });

    await refreshCartDrawer();
    openDrawer('CartDrawer');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

/**
 * Binds AJAX add-to-cart behavior to any matching forms in a scope.
 * @param {ParentNode} scope
 */
function attachAddToCartForms(scope) {
  qsa(scope, '[data-ajax-add-to-cart]').forEach((form) => {
    if (form.dataset.ajaxBound === 'true') {
      return;
    }

    form.dataset.ajaxBound = 'true';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      handleAddToCart(form);
    });
  });
}

/**
 * Applies swipe gesture callbacks to an element.
 * @param {HTMLElement} element
 * @param {{ left?: Function, right?: Function }} callbacks
 */
function bindSwipe(element, callbacks) {
  let startX = 0;
  let startY = 0;

  element.addEventListener('touchstart', (event) => {
    startX = event.changedTouches[0].screenX;
    startY = event.changedTouches[0].screenY;
  }, { passive: true });

  element.addEventListener('touchend', (event) => {
    const deltaX = event.changedTouches[0].screenX - startX;
    const deltaY = event.changedTouches[0].screenY - startY;

    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0 && typeof callbacks.left === 'function') {
      callbacks.left();
    }

    if (deltaX > 0 && typeof callbacks.right === 'function') {
      callbacks.right();
    }
  }, { passive: true });
}

/**
 * Initializes horizontal carousels and navigation controls.
 */
function initCarousels() {
  qsa(document, '[data-carousel]').forEach((carousel) => {
    const viewport = qs(carousel, '[data-carousel-viewport]');
    const nextButton = qs(carousel, '[data-carousel-next]');
    const prevButton = qs(carousel, '[data-carousel-prev]');

    if (!viewport) {
      return;
    }

    /**
     * Scrolls the carousel by one card width.
     * @param {number} direction
     */
    function scrollByCard(direction) {
      const slide = qs(viewport, '[data-carousel-slide]');
      const amount = slide ? slide.getBoundingClientRect().width + 16 : viewport.clientWidth * 0.8;
      viewport.scrollBy({ left: amount * direction, behavior: 'smooth' });
    }

    if (nextButton && nextButton.dataset.carouselBound !== 'true') {
      nextButton.dataset.carouselBound = 'true';
      nextButton.addEventListener('click', () => scrollByCard(1));
    }

    if (prevButton && prevButton.dataset.carouselBound !== 'true') {
      prevButton.dataset.carouselBound = 'true';
      prevButton.addEventListener('click', () => scrollByCard(-1));
    }

    bindSwipe(viewport, {
      left: () => scrollByCard(1),
      right: () => scrollByCard(-1)
    });
  });
}

/**
 * Initializes the product gallery swipe and thumbnail behavior.
 */
function initProductGallery() {
  qsa(document, '[data-product-gallery]').forEach((gallery) => {
    const strip = qs(gallery, '[data-product-gallery-strip]');
    const thumbs = qsa(gallery, '[data-product-thumb]');

    if (!strip) {
      return;
    }

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        const slide = strip.children[index];

        if (slide) {
          slide.scrollIntoView({ behavior: 'smooth', inline: 'start' });
        }
      });
    });

    bindSwipe(strip, {
      left: () => {
        strip.scrollBy({ left: strip.clientWidth, behavior: 'smooth' });
      },
      right: () => {
        strip.scrollBy({ left: strip.clientWidth * -1, behavior: 'smooth' });
      }
    });
  });
}

/**
 * Expands or auto-loads collection products depending on section settings.
 */
function initCollectionPager() {
  qsa(document, '[data-collection-pagination]').forEach((wrapper) => {
    const mode = wrapper.getAttribute('data-collection-pagination');
    const button = qs(wrapper, '[data-load-more]');
    const items = qsa(wrapper, '[data-product-grid-item]');
    const revealCount = 6;
    let visible = items.filter((item) => !item.classList.contains('is-hidden')).length || revealCount;

    /**
     * Reveals the next batch of hidden items and updates button visibility.
     */
    function revealNextBatch() {
      items.slice(visible, visible + revealCount).forEach((item) => {
        item.classList.remove('is-hidden');
      });

      visible += revealCount;

      if (button) {
        button.hidden = visible >= items.length;
      }
    }

    if (button && button.dataset.loadMoreBound !== 'true') {
      button.dataset.loadMoreBound = 'true';
      button.addEventListener('click', revealNextBatch);
    }

    if (mode === 'infinite-scroll') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealNextBatch();
          }
        });
      }, { rootMargin: '240px 0px' });

      if (button) {
        observer.observe(button);
      }
    }
  });
}

/**
 * Initializes accordion interfaces for product content and filters.
 */
function initAccordions() {
  qsa(document, '[data-accordion]').forEach((accordion) => {
    const button = qs(accordion, '[data-accordion-button]');

    if (!button || button.dataset.accordionBound === 'true') {
      return;
    }

    button.dataset.accordionBound = 'true';
    button.addEventListener('click', () => {
      const expanded = accordion.classList.toggle('is-open');
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });
}

/**
 * Initializes product size guide modals using drawer-like behavior.
 */
function initSizeGuide() {
  qsa(document, '[data-size-guide-trigger]').forEach((button) => {
    if (button.dataset.sizeGuideBound === 'true') {
      return;
    }

    button.dataset.sizeGuideBound = 'true';
    button.addEventListener('click', () => openDrawer(button.getAttribute('data-size-guide-trigger')));
  });
}

/**
 * Initializes cart note and discount helper forms in drawer or page.
 */
function initCartForms() {
  qsa(document, '[data-cart-note-form]').forEach((form) => {
    if (form.dataset.noteBound === 'true') {
      return;
    }

    form.dataset.noteBound = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const note = /** @type {HTMLInputElement} */ (qs(form, '[name="note"]'));

      await fetch(`${window.Shopify.routes.root}cart/update.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ note: note ? note.value : '' })
      });

      refreshCartDrawer();
    });
  });

  qsa(document, '[data-discount-form]').forEach((form) => {
    if (form.dataset.discountBound === 'true') {
      return;
    }

    form.dataset.discountBound = 'true';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = /** @type {HTMLInputElement} */ (qs(form, '[name="discount"]'));
      const code = input ? input.value.trim() : '';

      window.location.href = code
        ? `${window.Shopify.routes.root}checkout?discount=${encodeURIComponent(code)}`
        : `${window.Shopify.routes.root}checkout`;
    });
  });
}

/**
 * Initializes sticky add-to-cart bar buttons so they submit the primary product form.
 */
function initStickyAtc() {
  qsa(document, '[data-sticky-submit]').forEach((button) => {
    if (button.dataset.stickyBound === 'true') {
      return;
    }

    button.dataset.stickyBound = 'true';
    button.addEventListener('click', () => {
      const formId = button.getAttribute('data-sticky-submit');
      const form = formId ? document.getElementById(formId) : null;

      if (form) {
        form.requestSubmit();
      }
    });
  });
}

/**
 * Boots all global interactive behavior once the document is ready.
 */
function initTheme() {
  initHeader();
  initDrawers();
  initPredictiveSearch();
  attachAddToCartForms(document);
  initCarousels();
  initProductGallery();
  initCollectionPager();
  initAccordions();
  initSizeGuide();
  initCartForms();
  initStickyAtc();
}

document.addEventListener('DOMContentLoaded', initTheme);
