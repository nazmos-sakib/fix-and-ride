// Service data (can later be loaded from backend)
const services = {
  "car-labor": {
    name: "Car + Labor",
    image: "assets/images/service1.png",
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
    image: "assets/images/service4.png",
    description: "Kitchen, furniture, closets, plumbing — I bring the tools, you get the fix!"
  },
  "tool-lending": {
    name: "Tool Lending",
    image: "assets/images/service5.jpg",
    description: "Need tools but not the labor? Rent my professional-grade tools for your own DIY projects."
  },
  "taxi": {
    name: "Taxi Service",
    image: "assets/images/service6.jpg",
    description: "Emergency pickup or drop-off — I can get you there quickly and safely."
  }
};

// Get selected service from query param
const params = new URLSearchParams(window.location.search);
const serviceKey = params.get('service');
const service = services[serviceKey];

if (service) {
  document.getElementById('service-name').textContent = service.name;
  document.getElementById('service-image').src = service.image;
  document.getElementById('service-description').textContent = service.description;
} else {
  document.getElementById('service-name').textContent = "Service Not Found";
}
//--- end service ---

document.addEventListener('DOMContentLoaded', () => {
  // ---------- state ----------
  let selectingStart = true; // true => we are editing start, false => editing end
  let selectedStartDate = ""; // "YYYY-MM-DD"
  let selectedEndDate = "";
  let selectedStartTime = "";
  let selectedEndTime = "";

  // example booked slots (map date -> array of booked times in "HH:MM")
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

  // Chart.js setup
  chart = new Chart(document.getElementById("availabilityChart"), {
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
    maintainAspectRatio: false, // allow fixed height from CSS
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  }
});

  // calendar month state (start with today)
  let viewDate = new Date();
  let viewMonth = viewDate.getMonth();
  let viewYear = viewDate.getFullYear();

  // ---------- helpers ----------
  const pad = n => String(n).padStart(2,'0');

  function isoDate(year, monthZeroBased, day) {
    return `${year}-${pad(monthZeroBased+1)}-${pad(day)}`;
  }

  function isBetween(dateStr, startStr, endStr) {
    if (!startStr || !endStr) return false;
    return dateStr >= startStr && dateStr <= endStr;
  }

  // ---------- open / close modal ----------
  function openCalendarModal(modeStart = true) {
    selectingStart = modeStart;
    calendarModal.style.display = 'flex';
    calendarModal.setAttribute('aria-hidden','false');
    // render view
    renderCalendar();
    // optionally pre-render times for previously selected or today
    const preDate = selectingStart ? selectedStartDate || getTodayIso() : selectedEndDate || getTodayIso();
    renderTimeSlots(preDate);
    updateChart(preDate);
    // focus for keyboard users
    calendarPopup.focus();
  }

  function closeCalendarModal() {
    calendarModal.style.display = 'none';
    calendarModal.setAttribute('aria-hidden','true');
  }

  // close when clicking overlay outside popup
  calendarModal.addEventListener('click', (e) => {
    if (e.target === calendarModal) closeCalendarModal();
  });

  // ---------- month navigation ----------
  prevMonthBtn.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  nextMonthBtn.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  // ---------- calendar rendering ----------
  function renderCalendar() {
    calendarBody.innerHTML = '';
    const firstDayRaw = new Date(viewYear, viewMonth, 1).getDay(); // Sun=0..Sat=6
    const firstDayIndexMon0 = (firstDayRaw + 6) % 7; // convert to Mon=0..Sun=6
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    monthYear.textContent = `${new Date(viewYear, viewMonth).toLocaleString('de-DE', { month: 'long', year: 'numeric' })}`;

    let day = 1;
    // 6 rows enough to cover all months starting any weekday
    for (let r = 0; r < 6; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < 7; c++) {
        const td = document.createElement('td');

        if (r === 0 && c < firstDayIndexMon0) {
          td.classList.add('empty');
          td.textContent = '';
        } else if (day > daysInMonth) {
          td.classList.add('empty');
          td.textContent = '';
        } else {
          const fullIso = isoDate(viewYear, viewMonth, day);
          td.textContent = String(day);
          td.dataset.date = fullIso;

          // add classes if selected / in range
          if (selectedStartDate === fullIso) td.classList.add('selected-start','selected');
          if (selectedEndDate === fullIso) td.classList.add('selected-end','selected');
          if (isBetween(fullIso, selectedStartDate, selectedEndDate) && selectedStartDate && selectedEndDate) {
            td.classList.add('in-range');
          }

          td.addEventListener('click', (ev) => {
            // handle selection
            if (selectingStart) {
              selectedStartDate = fullIso;
              // if end exists and end < start, clear end
              if (selectedEndDate && selectedEndDate < selectedStartDate) selectedEndDate = "";
              // update header text
              startDayEl.textContent = selectedStartDate;
            } else {
              // selecting end
              if (selectedStartDate && fullIso < selectedStartDate) {
                // if user picks end earlier than start, swap
                selectedEndDate = selectedStartDate;
                selectedStartDate = fullIso;
                startDayEl.textContent = selectedStartDate;
                endDayEl.textContent = selectedEndDate;
              } else {
                selectedEndDate = fullIso;
                endDayEl.textContent = selectedEndDate;
              }
            }
            // re-render calendar + times + chart for selected date
            renderCalendar();
            renderTimeSlots(fullIso);
            updateChart(fullIso);
          });
          day++;
        }
        tr.appendChild(td);
      }
      calendarBody.appendChild(tr);
    }
  }

  // ---------- time slots rendering ----------
  function renderTimeSlots(dateIso) {
    timeSlotsEl.innerHTML = '';
    if (!dateIso) dateIso = getTodayIso();
    const booked = bookedSlots[dateIso] || [];
    // time resolution: 15 minutes
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (const m of ['00','15','30','45']) {
        slots.push(`${pad(h)}:${m}`);
      }
    }

    slots.forEach(slot => {
      const li = document.createElement('li');
      li.tabIndex = booked.includes(slot) ? -1 : 0;
      li.textContent = slot;
      if (booked.includes(slot)) {
        li.className = 'booked';
      } else {
        li.className = 'available';
        li.addEventListener('click', () => {
          // toggle selection visuals
          timeSlotsEl.querySelectorAll('li').forEach(x => x.classList.remove('selected'));
          li.classList.add('selected');

          if (selectingStart) {
            selectedStartTime = slot;
            startTimeEl.textContent = slot;
          } else {
            selectedEndTime = slot;
            endTimeEl.textContent = slot;
          }
          // optionally update chart highlight for selected hour
          highlightChartHour(slot.slice(0,2));
        });
      }
      timeSlotsEl.appendChild(li);
    });
  }

  // ---------- chart update ----------
  function updateChart(dateIso) {
    if (!dateIso) dateIso = getTodayIso();
    const booked = bookedSlots[dateIso] || [];
    const labels = [];
    const data = [];
    const colors = [];

    for (let h = 0; h < 24; h++) {
      const hour = pad(h);
      labels.push(`${hour}:00`);
      // count how many 15-min slots booked in this hour
      let count = 0;
      for (const s of booked) {
        if (s.startsWith(`${hour}:`)) count++;
      }
      // normalize to 0..1 (0 = free, 1 = fully booked)
      const normalized = count / 4;
      data.push(normalized);
      colors.push(normalized >= 1 ? '#e57373' : (normalized > 0 ? '#ffb74d' : '#81c784'));
    }

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update();
  }

  function highlightChartHour(hourStr) {
    // optional: add a border effect to highlight an hour bar
    // find index
    const idx = chart.data.labels.findIndex(lbl => lbl.startsWith(hourStr));
    if (idx === -1) return;
    // temporarily set border or change color
    const original = chart.data.datasets[0].backgroundColor[idx];
    chart.data.datasets[0].backgroundColor[idx] = '#3f51b5';
    chart.update();
    setTimeout(() => {
      chart.data.datasets[0].backgroundColor[idx] = original;
      chart.update();
    }, 700);
  }

  // ---------- utilities ----------
  function getTodayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  // ---------- wire UI actions ----------
  beginBtn.addEventListener('click', () => openCalendarModal(true));
  endBtn.addEventListener('click', () => openCalendarModal(false));
  closeCalendarBtn.addEventListener('click', closeCalendarModal);

  // keyboard access
  beginBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCalendarModal(true); }});
  endBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCalendarModal(false); }});

  // init
  renderCalendar();
  // render chart for today initially
  updateChart(getTodayIso());
});


