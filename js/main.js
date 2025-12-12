// Hero slideshow
const heroImages = [
  { src: "assets/images/service4.png", caption: "Car + Driver for Small Moves" },
  { src: "assets/images/service2.jpg", caption: "Driving Transporter for Heavy Loads" },
  { src: "assets/images/service3.jpg", caption: "Labor Only - Moving Help" },
  { src: "assets/images/service7.jpg", caption: "Repairs & Installations" },
  { src: "assets/images/service5.jpg", caption: "Tool Lending" },
  { src: "assets/images/service6.png", caption: "Taxi Service" }
];

let currentSlide = 0;
const heroImg = document.getElementById("hero-image");
const heroCaption = document.getElementById("hero-caption");

function showNextSlide() {
  currentSlide = (currentSlide + 1) % heroImages.length;
  heroImg.src = heroImages[currentSlide].src;
  heroCaption.textContent = heroImages[currentSlide].caption;
}

setInterval(showNextSlide, 4000); // Rotate every 4s

// Cart functionality (basic, no backend)
let cart = [];

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", (e) => {
    const serviceId = e.target.closest(".service-card").dataset.serviceId;
    cart.push(serviceId);
    updateCartCount();
  });
});

function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
}

// Hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");

hamburger.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent it from immediately closing
  navLinks.classList.toggle("show");
});

// Close nav when clicking outside
document.addEventListener("click", (e) => {
  if (navLinks.classList.contains("show") &&
    !navLinks.contains(e.target) &&
    !hamburger.contains(e.target)) {
    navLinks.classList.remove("show");
  }
});

// Close nav when clicking a link
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("show");
  });
});

// Carousel navigation arrows
const track = document.getElementById('carousel-track');
const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');

const scrollAmount = 300; // Adjust based on card width

leftArrow.addEventListener('click', () => {
  track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});

rightArrow.addEventListener('click', () => {
  track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

//login-signup-----------------------------
// Modal controls
const loginBtn = document.getElementById("login-btn");
const authModal = document.getElementById("auth-modal");
const closeAuth = document.getElementById("close-auth");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const termsCheckbox = document.getElementById("terms-checkbox");
const signupSubmit = document.getElementById("signup-submit");

// API
//const API = "https://thallous-pellucidly-delilah.ngrok-free.dev/api/auth/user";
//const API = "http://192.168.1.114:9090/api/auth/user";
const API = "https://localhost:9090/api/auth/user";

// Store access token in memory (not localStorage, safer)
let accessToken = null;
let username = null;
let user = null;

// Helper: automatically attach access token to protected calls
async function apiFetch(url, options = {}) {
  options.headers = options.headers || {};
  if (accessToken) {
    options.headers["Authorization"] = "Bearer " + accessToken;
  }

  let response = await fetch(url, options);

  // If access token expired → try refresh
  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      console.log("Refresh failed. Logging out.");
      accessToken = null;
      updateUserUI(null);
      return response;
    }

    // Retry original request
    options.headers["Authorization"] = "Bearer " + accessToken;
    response = await fetch(url, options);
  }

  return response;
}

// === Attempt refresh using httpOnly cookie ===
async function tryRefreshToken() {
  try {
    const res = await fetch(API + "/refresh", {
      method: "POST",
      credentials: "include",
      mode: "cors"
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (!data.accessToken || !data.user) {
      console.log("Refresh response missing required fields");
      return false;
    }
    accessToken = data.accessToken;
    username = data.user.username;
    user = data.user;
    
    // Store in localStorage for UI
    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
    
    console.log("Token refreshed");
    return true;
  } catch {
    return false;
  }
}

// Open modal
loginBtn.addEventListener("click", () => {
  authModal.style.display = "block";
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
});

// Close modal
closeAuth.addEventListener("click", () => {
  authModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.style.display = "none";
});

// Switch tabs
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
});
tabSignup.addEventListener("click", () => {
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// Enable signup button when terms accepted
termsCheckbox.addEventListener("change", () => {
  signupSubmit.disabled = !termsCheckbox.checked;
});

// Persistent storage signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userEmail = document.getElementById("signup-email").value.trim();
  const pass = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (pass !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  const body = {
    firstName: document.getElementById("first-name").value.trim(),
    lastName: document.getElementById("last-name").value.trim(),
    address: document.getElementById("address").value.trim(),
    houseNo: document.getElementById("house-number").value.trim(),
    post: document.getElementById("post").value.trim(),
    city: document.getElementById("city").value.trim(),
    email: userEmail,
    password: pass
  };

  const res = await fetch(`${API}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let errorMessage = `res-status ${res.status} -> `;
    let responseBody = await res.text(); // read ONCE

    try {
      const errorData = JSON.parse(responseBody);
      if (errorData.error) {
        errorMessage += errorData.error;
      } else if (errorData.message) {
        errorMessage += errorData.message;
      } else {
        const fieldErrors = Object.entries(errorData)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join("\n");
        errorMessage += fieldErrors;
      }
    } catch (e) {
      if (responseBody) errorMessage += responseBody;
    }

    alert(errorMessage);
    return;
  }
  alert("Signup successful! You can now log in.");
  tabLogin.click();
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    email: document.getElementById("login-email").value.trim(),
    password: document.getElementById("login-password").value
  };

  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let errorMessage = `res-status ${res.status} -> `;
    let responseBody = await res.text();

    try {
      const errorData = JSON.parse(responseBody);
      if (errorData.error) {
        errorMessage += errorData.error;
      } else if (errorData.message) {
        errorMessage += errorData.message;
      } else {
        const fieldErrors = Object.entries(errorData)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join("\n");
        errorMessage += fieldErrors;
      }
    } catch (e) {
      if (responseBody) errorMessage += responseBody;
    }

    alert(errorMessage);
    return;
  }

  const data = await res.json();
  accessToken = data.accessToken;
  user = data.user;

  // Store user data
  localStorage.setItem('loggedInUser', JSON.stringify(data.user));

  alert(`Welcome back, ${data.user.username}!`);
  authModal.style.display = "none";
  
  // Update UI
  updateUserUI(data.user);
  
  // Setup dropdown listeners after UI update
  setupUserMenuListeners();
});

// Update user UI
function updateUserUI(userData) {
  const loggedInUser = userData || JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const loginBtn = document.getElementById('login-btn');
  const userMenu = document.getElementById('user-menu');
  const usernameDisplay = document.getElementById('username-display');
  
  if (loggedInUser && loggedInUser.username) {
    // User is logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'flex';
      if (usernameDisplay) {
        usernameDisplay.textContent = loggedInUser.username;
      }
    }
  } else {
    // User is not logged in
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// Setup user menu listeners
function setupUserMenuListeners() {
  const userAvatar = document.getElementById('user-avatar');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (userAvatar && dropdownMenu) {
    // Remove any existing listeners first
    userAvatar.removeEventListener('click', handleUserAvatarClick);
    document.removeEventListener('click', handleOutsideClick);
    
    if (logoutBtn) {
      logoutBtn.removeEventListener('click', handleLogoutClick);
    }
    
    // Add new listeners
    userAvatar.addEventListener('click', handleUserAvatarClick);
    document.addEventListener('click', handleOutsideClick);
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogoutClick);
    }
  }
}

function handleUserAvatarClick(e) {
  e.stopPropagation();
  const dropdownMenu = document.getElementById('dropdown-menu');
  dropdownMenu.classList.toggle('show');
}

function handleOutsideClick(e) {
  const userAvatar = document.getElementById('user-avatar');
  const dropdownMenu = document.getElementById('dropdown-menu');
  
  if (dropdownMenu && dropdownMenu.classList.contains('show')) {
    if (!dropdownMenu.contains(e.target) && !userAvatar.contains(e.target)) {
      dropdownMenu.classList.remove('show');
    }
  }
}

async function handleLogoutClick(e) {
  e.preventDefault();
  await logout();
}

// === Logout ===
async function logout() {
  try {
    // Call logout API
    await apiFetch(API + "/logout", {
      method: "POST",
      credentials: "include"
    });
  } catch (error) {
    console.log("Logout API call failed:", error);
  }
  
  // Clear local storage
  localStorage.removeItem('loggedInUser');
  accessToken = null;
  username = null;
  user = null;
  
  // Update UI
  updateUserUI(null);
  
  // Hide dropdown if open
  const dropdownMenu = document.getElementById('dropdown-menu');
  if (dropdownMenu) {
    dropdownMenu.classList.remove('show');
  }
  
  // Redirect to home page
  window.location.href = 'index.html';
}

// === AUTO-LOGIN on page load ===
(async function init() {
  console.log("Checking session...");

  // Try refresh token → automatically login
  const refreshed = await tryRefreshToken();

  if (refreshed) {
    // Update UI with user menu
    const userData = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    updateUserUI(userData);
  } else {
    // Ensure login button is visible
    updateUserUI(null);
  }
  
  // Setup user menu listeners
  setupUserMenuListeners();
  
  console.log("Initialization complete");
})();