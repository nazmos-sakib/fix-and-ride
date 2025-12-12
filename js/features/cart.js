// js/features/cart.js
export function initCart(DOM) {
  if (!DOM || !DOM.cartCount || !DOM.carouselTrack) return;

  const countEl = DOM.cartCount;
  const track = DOM.carouselTrack;
  const STORAGE_KEY = 'fr_cart_count';

  let cart = [];
  // initialize from sessionStorage
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { cart = JSON.parse(stored) || []; } catch (e) { cart = []; }
  }
  updateCount();

  // Delegated handler: clicking an element with data-service-id will add to cart,
  // but we intentionally avoid interfering with anchor navigation when clicking the link itself.
  track.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn) {
      e.preventDefault();
      const card = addBtn.closest('.service-card');
      if (!card) return;
      const serviceId = card.dataset.serviceId || card.getAttribute('href') || ('item-' + Date.now());
      cart.push(serviceId);
      save();
      updateCount();
    }
  });

  function save() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  function updateCount() {
    countEl.textContent = cart.length;
  }

  return {
    add(serviceId) { cart.push(serviceId); save(); updateCount(); },
    clear() { cart = []; save(); updateCount(); },
    getCount() { return cart.length; }
  };
}
