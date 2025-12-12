// js/main.js
import { createDOM } from './core/dom.js';
import { initSlideshow } from './features/slideshow.js';
import { initCarousel } from './features/carousel.js';
import { initNavigation } from './features/navigation.js';
import { initCart } from './features/cart.js';
import { initAuth } from './features/auth.js';
import { initUserMenu } from './features/userMenu.js';

const heroImages = [
  { src: "assets/images/service4.png", caption: "Car + Driver for Small Moves" },
  { src: "assets/images/service2.jpg", caption: "Driving Transporter for Heavy Loads" },
  { src: "assets/images/service3.jpg", caption: "Labor Only - Moving Help" },
  { src: "assets/images/service7.jpg", caption: "Repairs & Installations" },
  { src: "assets/images/service5.jpg", caption: "Tool Lending" },
  { src: "assets/images/service6.png", caption: "Taxi Service" }
];

document.addEventListener('DOMContentLoaded', async () => {
  const DOM = createDOM();

  // Initialize features
  initNavigation(DOM);
  initCarousel(DOM);
  const cartApi = initCart(DOM);

  // Auth must be initialized before userMenu because userMenu uses logout from auth
  const authApi = initAuth(DOM, { apiBase: 'https://localhost:9090/api/auth/user' });
  // attempt to auto-login and attach auth UI after init
  await authApi.init();

  // user menu depends on auth
  initUserMenu(DOM, authApi);

  // slideshow
  initSlideshow(DOM, heroImages, 4000);

  // Optional: contact form handler
  if (DOM.contactForm) {
    DOM.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you — message sent (demo).');
      DOM.contactForm.reset();
    });
  }

  // Example: expose cart on window for debugging
  window._fixandride = { cartApi, authApi };
});
