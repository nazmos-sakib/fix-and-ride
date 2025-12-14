// js/features/auth.js
import { parseErrorResponse } from '../core/utils.js';

export function initAuth(DOM, options = {}) {
  const API = options.apiBase || 'https://localhost:9090/api/user/auth';
  let accessToken = null;
  let user = null;

  // Helper: attach Authorization header if accessToken present
  async function apiFetch(url, opts = {}) {
    opts.headers = opts.headers || {};
    if (accessToken) opts.headers['Authorization'] = 'Bearer ' + accessToken;
    // Default to JSON accept
    opts.headers['Accept'] = opts.headers['Accept'] || 'application/json';
    const res = await fetch(url, opts);

    if (res.status === 401) {
      // try refresh once
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        opts.headers['Authorization'] = 'Bearer ' + accessToken;
        return fetch(url, opts);
      }
    }
    return res;
  }

  async function tryRefreshToken() {
    try {
      const res = await fetch(API + '/refresh', {
        method: 'POST',
        credentials: 'include',
        mode: 'cors'
      });

      if (!res.ok) return false;
      const data = await res.json();
      if (!data.accessToken || !data.user) return false;
      accessToken = data.accessToken;
      user = data.user;
      // store minimal info for UI - optional
      try { localStorage.setItem('loggedInUser', JSON.stringify(user)); } catch (e) {}
      updateUserUI(user);
      return true;
    } catch (e) {
      return false;
    }
  }

  // login and signup handlers use apiFetch or fetch directly
  async function login(credentials) {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    if (!res.ok) throw new Error(await parseErrorResponse(res));
    const data = await res.json();
    accessToken = data.accessToken;
    user = data.user;
    try { localStorage.setItem('loggedInUser', JSON.stringify(user)); } catch (e) {}
    updateUserUI(user);
    return data;
  }

  async function signup(payload) {
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await parseErrorResponse(res));
    return res;
  }

  async function logout() {
    try {
      await apiFetch(API + '/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      // swallow network errors
      console.warn('Logout failed:', e);
    } finally {
      accessToken = null;
      user = null;
      try { localStorage.removeItem('loggedInUser'); } catch (e) {}
      updateUserUI(null);
    }
  }

  // UI update function
  function updateUserUI(userData) {
    const logged = userData || JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    const loginBtn = DOM.loginBtn;
    const userMenu = DOM.userMenu;
    const usernameDisplay = DOM.usernameDisplay;

    if (logged && logged.username) {
      loginBtn && (loginBtn.style.display = 'none');
      if (userMenu) {
        userMenu.classList.remove('hidden');
        if (usernameDisplay) usernameDisplay.textContent = logged.username;
      }
    } else {
      loginBtn && (loginBtn.style.display = 'flex');
      userMenu && userMenu.classList.add('hidden');
      if (usernameDisplay) usernameDisplay.textContent = 'User';
    }
  }

  // Modal controls and event wiring
  function attachModalHandlers() {
    if (!DOM.loginBtn || !DOM.authModal) return;

    DOM.loginBtn.addEventListener('click', () => {
      DOM.authModal.style.display = 'block';
      showTab('login');
    });

    DOM.closeAuth?.addEventListener('click', () => { DOM.authModal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === DOM.authModal) DOM.authModal.style.display = 'none'; });

    DOM.tabLogin?.addEventListener('click', () => showTab('login'));
    DOM.tabSignup?.addEventListener('click', () => showTab('signup'));

    DOM.termsCheckbox?.addEventListener('change', () => {
      if (DOM.signupSubmit) DOM.signupSubmit.disabled = !DOM.termsCheckbox.checked;
    });

    // Login submit
    DOM.loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        email: DOM.loginForm.querySelector('#login-email').value.trim(),
        password: DOM.loginForm.querySelector('#login-password').value
      };
      try {
        const data = await login(body);
        DOM.authModal.style.display = 'none';
        alert(`Welcome back, ${data.user.username}!`);
      } catch (err) {
        alert(err.message || 'Login failed');
      }
    });

    // Signup submit
    DOM.signupForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pass = DOM.signupForm.querySelector('#signup-password').value;
      const confirm = DOM.signupForm.querySelector('#signup-confirm').value;
      if (pass !== confirm) {
        alert('Passwords do not match!');
        return;
      }

      const payload = {
        firstName: DOM.signupForm.querySelector('#first-name').value.trim(),
        lastName: DOM.signupForm.querySelector('#last-name').value.trim(),
        address: DOM.signupForm.querySelector('#address').value.trim(),
        houseNo: DOM.signupForm.querySelector('#house-number').value.trim(),
        post: DOM.signupForm.querySelector('#post').value.trim(),
        city: DOM.signupForm.querySelector('#city').value.trim(),
        email: DOM.signupForm.querySelector('#signup-email').value.trim(),
        password: pass
      };

      try {
        await signup(payload);
        alert('Signup successful! You can now log in.');
        showTab('login');
      } catch (err) {
        alert(err.message || 'Signup failed');
      }
    });
  }

  function showTab(tab) {
    const isLogin = tab === 'login';
    DOM.tabLogin?.classList.toggle('active', isLogin);
    DOM.tabSignup?.classList.toggle('active', !isLogin);
    DOM.loginForm?.classList.toggle('hidden', !isLogin);
    DOM.signupForm?.classList.toggle('hidden', isLogin);
  }

  // public init: try refresh on load
  async function init() {
    // Attempt refresh (auto-login if cookie present)
    await tryRefreshToken();
    // attach modal UI handlers
    attachModalHandlers();
  }

  return {
    init,
    apiFetch,
    getUser: () => user,
    logout,
    // expose small helper for other modules if needed
    _getAccessToken: () => accessToken
  };
}
