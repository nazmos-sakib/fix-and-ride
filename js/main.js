// Hero slideshow
const heroImages = [
  { src: "assets/images/service1.png", caption: "Car + Driver for Small Moves" },
  { src: "assets/images/service2.jpg", caption: "Driving Transporter for Heavy Loads" },
  { src: "assets/images/service3.jpg", caption: "Labor Only - Moving Help" },
  { src: "assets/images/service4.png", caption: "Repairs & Installations" },
  { src: "assets/images/service5.jpg", caption: "Tool Lending" }
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
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const pass = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (pass !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.email === email)) {
    alert("Email already registered!");
    return;
  }

  users.push({ firstName, lastName, email, pass });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful! You can now log in.");
  tabLogin.click();
});

// Persistent storage login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.pass === pass);

  if (!user) {
    alert("Invalid credentials!");
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));
  alert(`Welcome back, ${user.firstName}!`);
  authModal.style.display = "none";
  loginBtn.textContent = user.firstName; // show name instead of "Login"
});

