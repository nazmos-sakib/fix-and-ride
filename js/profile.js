// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Load user data from localStorage or API
  loadUserProfile();
  
  // Setup event listeners
  setupEventListeners();
});

async function loadUserProfile() {
  // Check if user is logged in
  const loggedInUser = localStorage.getItem('loggedInUser');
  
  if (loggedInUser) {
    try {
      const user = JSON.parse(loggedInUser);
      
      // Update profile display
      document.getElementById('username-display').textContent = user.username || 'User';
      document.getElementById('profile-name').textContent = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.username;
      document.getElementById('user-fullname').textContent = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.username;
      document.getElementById('user-email').textContent = user.email || 'nazmos@fixandride.com';
      
      // Set other user info if available
      if (user.address) {
        document.getElementById('user-address').textContent = 
          `${user.address} ${user.houseNo || ''}, ${user.post || ''} ${user.city || ''}`;
      }
      
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  } else {
    // Redirect to login if not logged in
    window.location.href = 'index.html';
  }
}

function setupEventListeners() {
  // Edit buttons
  document.getElementById('edit-personal-btn').addEventListener('click', () => {
    alert('Edit feature coming soon!');
  });
  
  document.querySelector('.edit-avatar-btn').addEventListener('click', () => {
    alert('Avatar edit feature coming soon!');
  });
  
  // Back to home navigation
  document.querySelectorAll('a[href="index.html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  });
}

// Initialize user menu toggle
const userAvatar = document.getElementById('user-avatar');
const dropdownMenu = document.getElementById('dropdown-menu');

if (userAvatar && dropdownMenu) {
  userAvatar.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!userAvatar.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('show');
    }
  });
}