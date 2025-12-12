// js/core/dom.js
export function createDOM() {
  return {
    // hero
    heroImg: document.getElementById('hero-image'),
    heroCaption: document.getElementById('hero-caption'),

    // navigation
    hamburger: document.getElementById('hamburger'),
    navLinks: document.getElementById('nav-links'),

    // carousel
    carouselTrack: document.getElementById('carousel-track'),
    leftArrow: document.getElementById('left-arrow'),
    rightArrow: document.getElementById('right-arrow'),

    // cart
    cartCount: document.getElementById('cart-count'),

    // auth & user menu
    loginBtn: document.getElementById('login-btn'),
    authModal: document.getElementById('auth-modal'),
    closeAuth: document.getElementById('close-auth'),
    tabLogin: document.getElementById('tab-login'),
    tabSignup: document.getElementById('tab-signup'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    termsCheckbox: document.getElementById('terms-checkbox'),
    signupSubmit: document.getElementById('signup-submit'),

    userMenu: document.getElementById('user-menu'),
    userAvatar: document.getElementById('user-avatar'),
    dropdownMenu: document.getElementById('dropdown-menu'),
    usernameDisplay: document.getElementById('username-display'),
    logoutBtn: document.getElementById('logout-btn'),

    // contact form
    contactForm: document.getElementById('contact-form'),
  };
}
