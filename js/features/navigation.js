// js/features/navigation.js
export function initNavigation(DOM) {
  if (!DOM || !DOM.hamburger || !DOM.navLinks) return;

  const hamburger = DOM.hamburger;
  const navLinks = DOM.navLinks;

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('show');
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('show') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navLinks.classList.remove('show');
    }
  });

  // Close nav when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('show'));
  });
}
