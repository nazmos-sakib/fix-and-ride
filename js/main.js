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
