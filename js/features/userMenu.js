// js/features/userMenu.js
export function initUserMenu(DOM, authApi) {
  if (!DOM || !DOM.userAvatar || !DOM.dropdownMenu) return;

  // Toggle dropdown on avatar click
  document.addEventListener('click', (e) => {
    if (e.target.closest('#user-avatar')) {
      e.stopPropagation();
      DOM.dropdownMenu.classList.toggle('show');
    } else if (!e.target.closest('#dropdown-menu')) {
      DOM.dropdownMenu.classList.remove('show');
    }
  });

  // Logout click
  DOM.logoutBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    await authApi.logout();
    // close dropdown
    DOM.dropdownMenu.classList.remove('show');
    // redirect to home to refresh UI state
    window.location.href = 'index.html';
  });
}
