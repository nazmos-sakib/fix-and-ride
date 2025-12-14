import CONFIG from "./config.js";


// Service data (can later be loaded from backend)
const services = {
  "car-labor": {
    name: "Car + Labor",
    image: "assets/images/service4.png",
    description: "I drive my own car and help you move small stuff or transport you."
  },
  "labor-transporter": {
    name: "Labor + Transporter",
    image: "assets/images/service2.jpg",
    description: "I drive a hired transporter. You pay the transporter separately."
  },
  "labor-only": {
    name: "Labor Only (Moving)",
    image: "assets/images/service3.jpg",
    description: "Heavy lifting, loading/unloading, stairs — I do it all!"
  },
  "repairs": {
    name: "Repairs & Installations",
    image: "assets/images/service7.jpg",
    description: "Kitchen, furniture, closets, plumbing — I bring the tools, you get the fix!"
  },
  "tool-lending": {
    name: "Tool Lending",
    image: "assets/images/service5.jpg",
    description: "Need tools but not the labor? Rent my professional-grade tools for your own DIY projects."
  },
  "taxi": {
    name: "Taxi Service",
    image: "assets/images/service6.png",
    description: "Emergency pickup or drop-off — I can get you there quickly and safely."
  }
};

// Get selected service from query param
const params = new URLSearchParams(window.location.search);
const serviceKey = params.get('service');
const service = services[serviceKey];

let accessToken = null;
let user = null;

if (service) {
  document.getElementById('service-name').textContent = service.name;
  document.getElementById('service-image').src = service.image;
  document.getElementById('service-description').textContent = service.description;
} else {
  document.getElementById('service-name').textContent = "Service Not Found";
}

// --- main booking logic ---
document.addEventListener('DOMContentLoaded', () => {

  // ---------- state ----------
  let selectingStart = true;
  let selectedStartDate = "";
  let selectedStartTime = "";
  let selectedEndDate = "";
  let selectedEndTime = "";

  // example booked slots (date -> array of times)
  let bookedSlots = {
    "2025-08-10": ["10:00","10:15","11:00","14:00"],
    "2025-08-11": ["09:00","15:00","18:00"]
  };

  // DOM refs
  const calendarModal = document.getElementById('calendar-modal');
  const calendarPopup = document.querySelector('.calendar-popup');
  const beginBtn = document.getElementById('begin-btn');
  const endBtn = document.getElementById('end-btn');
  const closeCalendarBtn = document.getElementById('close-calendar');

  const calendarBody = document.getElementById('calendar-body');
  const monthYear = document.getElementById('month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');

  const timeSlotsEl = document.getElementById('time-slots');

  const startDayEl = document.getElementById('start-day');
  const startTimeEl = document.getElementById('start-time');
  const endDayEl = document.getElementById('end-day');
  const endTimeEl = document.getElementById('end-time');

  const costEl = document.getElementById('service-cost');

  // auth & user menu
  const  loginBtn = document.getElementById('login-btn');
  const  authModal = document.getElementById('auth-modal');
  const  closeAuth = document.getElementById('close-auth');
  const  tabLogin = document.getElementById('tab-login');
  const  tabSignup = document.getElementById('tab-signup');
  const  loginForm = document.getElementById('login-form');
  const  signupForm = document.getElementById('signup-form');
  const  termsCheckbox = document.getElementById('terms-checkbox');
  const  signupSubmit = document.getElementById('signup-submit');

  const  userMenu = document.getElementById('user-menu');
  const  userAvatar = document.getElementById('user-avatar');
  const  dropdownMenu = document.getElementById('dropdown-menu');
  const  usernameDisplay = document.getElementById('username-display');
  const  logoutBtn = document.getElementById('logout-btn');

  const price = document.getElementById("summary-rate");

  // Chart.js setup (preserve existing functionality)
  const chart = new Chart(document.getElementById("availabilityChart"), {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Belegt (1) / Frei (0)",
        data: [],
        backgroundColor: []
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });

  // calendar month state
  let viewDate = new Date();
  let viewMonth = viewDate.getMonth();
  let viewYear = viewDate.getFullYear();

  // ---------- helpers ----------
  const pad = n => String(n).padStart(2,'0');
  function isoDate(year, monthZeroBased, day) {
    return `${year}-${pad(monthZeroBased+1)}-${pad(day)}`;
  }
  function getTodayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
  function isBetween(dateStr, startStr, endStr) {
    if (!startStr || !endStr) return false;
    return dateStr >= startStr && dateStr <= endStr;
  }

  // ---------- modal open/close ----------
  function openCalendarModal(modeStart = true) {
    selectingStart = modeStart;
    calendarModal.style.display = 'flex';
    calendarModal.setAttribute('aria-hidden','false');
    const preDate = selectingStart ? selectedStartDate || getTodayIso() : selectedEndDate || getTodayIso();
    renderCalendar();
    renderTimeSlots(preDate);
    updateChart(preDate);
    calendarPopup.focus();
  }
  function closeCalendarModal() {
    calendarModal.style.display = 'none';
    calendarModal.setAttribute('aria-hidden','true');
  }
  calendarModal.addEventListener('click', (e) => { if (e.target === calendarModal) closeCalendarModal(); });

  prevMonthBtn.addEventListener('click', () => { viewMonth--; if (viewMonth<0){viewMonth=11; viewYear--;} renderCalendar(); });
  nextMonthBtn.addEventListener('click', () => { viewMonth++; if (viewMonth>11){viewMonth=0; viewYear++;} renderCalendar(); });

  // ---------- calendar rendering ----------
  function renderCalendar() {
    calendarBody.innerHTML = '';
    const firstDayRaw = new Date(viewYear, viewMonth, 1).getDay();
    const firstDayIndexMon0 = (firstDayRaw + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    monthYear.textContent = `${new Date(viewYear, viewMonth).toLocaleString('de-DE', { month: 'long', year: 'numeric' })}`;

    let day = 1;
    for (let r=0; r<6; r++) {
      const tr = document.createElement('tr');
      for (let c=0; c<7; c++) {
        const td = document.createElement('td');
        if ((r===0 && c<firstDayIndexMon0) || day>daysInMonth) {
          td.classList.add('empty'); td.textContent=''; 
        } else {
          const fullIso = isoDate(viewYear, viewMonth, day);
          td.textContent = day; td.dataset.date = fullIso;

          if (selectedStartDate === fullIso) td.classList.add('selected-start','selected');
          if (selectedEndDate === fullIso) td.classList.add('selected-end','selected');
          if (isBetween(fullIso, selectedStartDate, selectedEndDate) && selectedStartDate && selectedEndDate) {
            td.classList.add('in-range');
          }

          td.addEventListener('click', async () => {
            if (selectingStart) {
              selectedStartDate = fullIso;
              if (selectedEndDate && selectedEndDate<selectedStartDate) selectedEndDate="";
              startDayEl.textContent = selectedStartDate;
            } else {
              if (selectedStartDate && fullIso<selectedStartDate){
                selectedEndDate=selectedStartDate; selectedStartDate=fullIso;
                startDayEl.textContent=selectedStartDate; endDayEl.textContent=selectedEndDate;
              } else {
                selectedEndDate=fullIso; endDayEl.textContent=selectedEndDate;
              }
            }
            renderCalendar();
            renderTimeSlots(fullIso);
            updateChart(fullIso);
            await updateCost();
          });

          day++;
        }
        tr.appendChild(td);
      }
      calendarBody.appendChild(tr);
    }
  }

  // ---------- time slots ----------
  function renderTimeSlots(dateIso){
    timeSlotsEl.innerHTML = '';
    if(!dateIso) dateIso=getTodayIso();
    const booked = bookedSlots[dateIso] || [];
    for(let h=0; h<24; h++){
      for(const m of ['00','15','30','45']){
        const slot=`${pad(h)}:${m}`;
        const li=document.createElement('li');
        li.tabIndex = booked.includes(slot)?-1:0;
        li.textContent=slot;
        if(booked.includes(slot)){ li.className='booked'; }
        else{
          li.className='available';
          li.addEventListener('click', async ()=>{
            timeSlotsEl.querySelectorAll('li').forEach(x=>x.classList.remove('selected'));
            li.classList.add('selected');

            if(selectingStart){ selectedStartTime=slot; startTimeEl.textContent=slot; }
            else{ selectedEndTime=slot; endTimeEl.textContent=slot; }

            await updateCost();
          });
        }
        timeSlotsEl.appendChild(li);
      }
    }
  }

  // ---------- chart ----------
  function updateChart(dateIso){
    if(!dateIso) dateIso=getTodayIso();
    const booked = bookedSlots[dateIso] || [];
    const labels=[]; const data=[]; const colors=[];
    for(let h=0;h<24;h++){
      const hour=pad(h);
      labels.push(`${hour}:00`);
      let count=0; for(const s of booked){ if(s.startsWith(`${hour}:`)) count++; }
      const normalized=count/4;
      data.push(normalized);
      colors.push(normalized>=1?'#e57373':(normalized>0?'#ffb74d':'#81c784'));
    }
    chart.data.labels=labels; chart.data.datasets[0].data=data; chart.data.datasets[0].backgroundColor=colors;
    chart.update();
  }

  // ---------- cost calculation ----------
  async function fetchServiceRate(serviceId, date, customerType='long-term'){
    let baseRate = await getServicePrice(serviceId); // default hourly
    const d=new Date(date); const day=d.getDay();
    if(day===0||day===6) baseRate*=1.2;
    if(customerType==='long-term') baseRate*=0.9;
    const holidays=['2025-12-25','2025-12-31'];
    if(holidays.includes(date)) baseRate*=1.5;
    return baseRate;
  }

  async function updateCost(){
    // Update summary display
    document.getElementById('summary-start').textContent = selectedStartDate && selectedStartTime ? `${selectedStartDate} ${selectedStartTime}` : '--';
    document.getElementById('summary-end').textContent = selectedEndDate && selectedEndTime ? `${selectedEndDate} ${selectedEndTime}` : '--';

    if(!selectedStartDate || !selectedStartTime || !selectedEndDate || !selectedEndTime){
      costEl.textContent='€0.00';
      document.getElementById('summary-duration').textContent = '--';
      document.getElementById('summary-rate').textContent = '€0.00';
      return;
    }

    const start = new Date(`${selectedStartDate}T${selectedStartTime}`);
    const end = new Date(`${selectedEndDate}T${selectedEndTime}`);
    if(end <= start){
      costEl.textContent='Invalid time';
      document.getElementById('summary-duration').textContent = '--';
      document.getElementById('summary-rate').textContent = '--';
      return;
    }

    const diffHours = (end - start)/(1000*60*60); // hours
    const rateStart = await fetchServiceRate(serviceKey, selectedStartDate);
    const rateEnd = await fetchServiceRate(serviceKey, selectedEndDate);
    const avgRate = (rateStart + rateEnd)/2;
    const cost = (diffHours * avgRate).toFixed(2);

    // Update display
    costEl.textContent = `€${cost}`;
    document.getElementById('summary-duration').textContent = diffHours.toFixed(2);
    document.getElementById('summary-rate').textContent = `€${avgRate.toFixed(2)}`;
  }


  // ---------- wire UI ----------
  beginBtn.addEventListener('click',()=>openCalendarModal(true));
  endBtn.addEventListener('click',()=>openCalendarModal(false));
  closeCalendarBtn.addEventListener('click',closeCalendarModal);

  beginBtn.addEventListener('keydown', e=>{if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openCalendarModal(true); }});
  endBtn.addEventListener('keydown', e=>{if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openCalendarModal(false); }});

  // init
  renderCalendar();
  updateChart(getTodayIso());
  updateCost();

  // ---------- confirm booking ----------


document.getElementById('confirm-btn').addEventListener('click', async () => {
  try {
    // 1️⃣ Validate that all fields are selected
    if (!selectedStartDate || !selectedStartTime || !selectedEndDate || !selectedEndTime) {
      alert("Please select start and end times");
      return;
    }

    // 2️⃣ Prepare booking data to send
    const bookingData = {
      serviceId: serviceKey,
      serviceName: service.name,
      userEmail: user.email,
      startDate: selectedStartDate,   // e.g., "2025-12-14"
      startTime: selectedStartTime,   // e.g., "10:30"
      endDate: selectedEndDate,
      endTime: selectedEndTime,
      cost: costEl.textContent        // e.g., "150.50"
    };

    // 3️⃣ Send POST request to backend
    const response = await fetch(`${CONFIG.BASE_URL}/api/user/service/confirm-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });

    // 4️⃣ Check if response is OK
    if (!response.ok) {
      // Try to extract error message from backend
      let errorMsg = "Booking failed";
      try {
        const errorData = await response.json();
        if (errorData.message) errorMsg = errorData.message;
      } catch (err) {
        console.error("Error parsing backend error:", err);
      }
      throw new Error(errorMsg);
    }

    // 5️⃣ Parse JSON response
    const data = await response.json();

    // 6️⃣ Convert ISO date-time strings to JS Date objects
    const startDateTime = new Date(data.startDateTime);
    const endDateTime = new Date(data.endDateTime);

    const cart = JSON.parse(localStorage.getItem('cart')||'[]');
    cart.push(data);
    localStorage.setItem('cart', JSON.stringify(cart));

    // 7️⃣ Show confirmation to user
    alert(
      `Booking confirmed!\n` +
      `Booking ID: ${data.bookingID}\n` +
      `Service: ${data.serviceName}\n` +
      `Start: ${startDateTime.toLocaleString()}\n` +
      `End: ${endDateTime.toLocaleString()}\n` +
      `Cost: ${data.cost}`
    );

    // Redirect AFTER alert is dismissed
    window.location.href = "index.html";

  } catch (err) {
    console.error("Booking error:", err);
    alert(err.message);
  }
});





  async function logout() {
    const API = `${CONFIG.BASE_URL}/api/user/auth`;

    try {
      const res = await fetch(API + '/logout', {
        method: 'POST',
        credentials: 'include',
        mode: 'cors'
      });

      if (!res.ok) {
        throw new Error(`Logout failed: ${res.status}`);
      }
    } catch (e) {
      console.warn('Logout failed:', e);
    } finally {
      // ✅ always runs
      accessToken = null;
      user = null;

      try {
        localStorage.removeItem('loggedInUser');
      } catch (e) {}

      updateUserUI();
    }
  }


  function initUserMenu() {
    if (!userAvatar || !dropdownMenu) return;

    // Toggle dropdown on avatar click
    document.addEventListener('click', (e) => {
      if (e.target.closest('#user-avatar')) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
      } else if (!e.target.closest('#dropdown-menu')) {
        dropdownMenu.classList.remove('show');
      }
    });

    // Logout click
    logoutBtn?.addEventListener('click', async (e) => {
      console.log("log out button clicked");
      e.preventDefault();
      await logout();
      // close dropdown
      dropdownMenu.classList.remove('show');
      // redirect to home to refresh UI state
      window.location.href = 'index.html';
    });
  }

  function updateUserUI() {
      const logged =  JSON.parse(localStorage.getItem('loggedInUser') || 'null');
   
      if (logged && logged.username) {
        user = logged;
        console.log("user loged in")
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

  let servicePricePromise = null;

  function getServicePrice(serviceId) {
    if (!servicePricePromise) {
      if (!serviceKey) {
        console.error("service_key not found in URL");
        throw new Error("service_key not found in URL");
      }
      servicePricePromise = fetch(
        `${CONFIG.BASE_URL}/api/user/service/${serviceId}/price`,
        {
          method: "GET",
          credentials: "include",
          mode: "cors"
        }
      )
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch price");
        return res.json();
      })
      .then(data => {
        if (!data.success) throw new Error(data.message);
        return Number(data.price); // ✅ IMPORTANT
      })
      .catch(err => {
        servicePricePromise = null; // allow retry
        throw err;
      });
    }

    return servicePricePromise;
  }


  async function initRegPrice(){
    let baseRate = "€0.0";

    try {
      baseRate = await getServicePrice(serviceKey);
    } catch (err) {
      console.error("Failed to fetch base rate:", err);
      return 0; // or throw again, or fallback value
    }
      let price = await getServicePrice()
      document.getElementById("regular-hourly-rate").innerText = `Regular Hourly Rate:€ ${baseRate}`;
  }
  updateUserUI();
  initUserMenu();
  initRegPrice();

}); //end of document.addEventListener('DOMContentLoaded', () => {})


