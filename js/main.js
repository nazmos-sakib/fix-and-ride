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
 
const API = "https://thallous-pellucidly-delilah.ngrok-free.dev/api/auth/user";
//const API = "http://192.168.1.114:9090/api/auth/user";
//const API = "http://localhost:9090/api/auth/user";

// Store access token in memory (not localStorage, safer)
let accessToken = null;
let username = null;

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
            showLoginUI();
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

    console.log("calling api");
        const res = await fetch(API + "/refresh", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: "include"  // IMPORTANT! allows cookies
        });

        if (!res.ok) return false;

        const data = await res.json();
        if ("accessToken" in data) {
            console.log("accesstoken not given");
            return false
        }
        accessToken = data.accessToken;
        username = data.user.username
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
    firstName : document.getElementById("first-name").value.trim(),
    lastName : document.getElementById("last-name").value.trim(),
    address : document.getElementById("address").value.trim(),
    houseNo : document.getElementById("house-number").value.trim(),
    post : document.getElementById("post").value.trim(),
    city : document.getElementById("city").value.trim(),
    email : userEmail,
    password : pass
  
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
      // case: { "error": "Bad credentials: ..." }
        errorMessage += errorData.error;
      } else if (errorData.message) {
      // case: { "message": "Something else" }
        errorMessage += errorData.message;
      } else {
      // case: { "houseNo": "must not be blank", "email": "must not be blank" }
      // Collect all field errors
        const fieldErrors = Object.entries(errorData)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join("\n");
        errorMessage += fieldErrors;
      }
    } catch (e) {
      // if not valid JSON, just show raw text
      if (responseBody) errorMessage += responseBody;
    }

    alert(errorMessage);
    return;
  }
  alert("Signup successful! You can now log in.");
  tabLogin.click();
});



//   login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    email: document.getElementById("login-email").value.trim(),
    password: document.getElementById("login-password").value
  };

  const res = await fetch(`${API}/login`, {
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
      errorMessage += errorData.error; // will contain your "Bad credentials: ..."
    } else if (errorData.message) {
      errorMessage += errorData.message; // fallback if some other error
    } else {
      // handle field-level errors (map of field → message)
      const fieldErrors = Object.entries(errorData)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join("\n");
      errorMessage += fieldErrors;
    }
  } catch (e) {
    // if not valid JSON, just show raw text
    if (responseBody) errorMessage += responseBody;
  }

  alert(errorMessage);
  return;
}

//storing JWT token
const data = await res.json();

accessToken = data.accessToken;
//localStorage.setItem('token', data.token);
//localStorage.setItem('loggedInUser', JSON.stringify(data.user));

alert(`Welcome back, ${data.user.username}!`);
authModal.style.display = "none";
loginBtn.textContent = data.user.username;
});

// example of calling a protected endpoint:
async function whoAmI() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('You are:', data.username);
}

// === Load user profile ===
async function me() {
    const res = await apiFetch(API + "/me");

    if (!res.ok) {
        console.warn("Not authenticated");
        return;
    }

    const data = await res.json();
    //document.getElementById("welcome").innerText = "Welcome, " + data.username;
}

// === Logout ===
async function logout() {
    await apiFetch(API + "/logout", {method: "POST"});
    accessToken = null;
    showLoginUI();
}


// === AUTO-LOGIN on page load ===
(async function init() {
    console.log("Checking session...");

    // Try refresh token → automatically login
    const refreshed = await tryRefreshToken();

    if (refreshed) {
        //showUserUI();
        //await me();

        authModal.style.display = "none";
        loginBtn.textContent = data.user.username;
    } else {
        //showLoginUI();
    }
})();