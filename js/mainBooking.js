// js/mainBooking.js
import { state } from './booking/bookingState.js';
import { loadServiceFromUrl } from './booking/serviceLoader.js';
import { openCalendarModal, closeCalendarModal } from './booking/modal.js';
import { initCalendar } from './booking/calendar.js';
import { initTimeSlots } from './booking/timeSlots.js';
import { initAvailability } from './booking/availability.js';
import { initBookingSubmit } from './booking/bookingSubmit.js';

// Populate DOM references
document.addEventListener('DOMContentLoaded', async () => {
  // DOM mapping (must match your HTML IDs)
  state.DOM = {
    // service
    serviceImage: document.getElementById('service-image'),
    serviceName: document.getElementById('service-name'),
    serviceDesc: document.getElementById('service-description'),

    // booking header
    startDay: document.getElementById('start-day'),
    startTime: document.getElementById('start-time'),
    endDay: document.getElementById('end-day'),
    endTime: document.getElementById('end-time'),
    beginBtn: document.getElementById('begin-btn'),
    endBtn: document.getElementById('end-btn'),

    // calendar modal & parts
    calendarModal: document.getElementById('calendar-modal'),
    calendarPopup: document.querySelector('.calendar-popup'),
    calendarBody: document.getElementById('calendar-body'),
    monthYear: document.getElementById('month-year'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    timeSlotContainer: document.querySelector('.time-slot-container'),
    timeSlots: document.getElementById('time-slots'),
    closeCalendar: document.getElementById('close-calendar'),

    // confirm
    confirmBtn: document.getElementById('confirm-btn')
  };

  // Basic safety checks
  if (!state.DOM.timeSlots) {
    console.error('Missing #time-slots element. Aborting booking initialization.');
    return;
  }

  // Load service info into page
  loadServiceFromUrl();

  // initialize availability chart
  const avail = initAvailability();

  // Initialize calendar (pass callback to render times & chart when a date selected)
  const cal = initCalendar({
    onDateSelected(dateIso) {
      // Render time slots for selected date
      timeSlots.renderTimeSlots(dateIso);
      // Update chart for the date
      avail.updateChart(dateIso);
    }
  });

  // Init timeSlots module
  const timeSlots = initTimeSlots({
    onTimeSelected(dateIso, slotHHMM, durationHours) {
      // when user selects a time, close modal and update chart highlight
      closeCalendarModal();
      avail.updateChart(dateIso);
      avail.highlightSelection(slotHHMM, durationHours);
      // reflect start/end in header (already done by timeSlots)
    },
    onDurationChanged(newDur) {
      // re-render chart for selected date to reflect changes
      const dateFor = state.selectedStartDate || (new Date()).toISOString().slice(0,10);
      avail.updateChart(dateFor);
    }
  });

  // Wire open/close modal triggers
  // beginBtn opens modal in start mode
  state.DOM.beginBtn?.addEventListener('click', () => {
    state.selectingStart = true;
    openCalendarModal(true);
    // render calendar and pre-render times (for selected date or today)
    cal.render();
    const dateFor = state.selectedStartDate || (new Date()).toISOString().slice(0,10);
    timeSlots.renderTimeSlots(dateFor);
    avail.updateChart(dateFor);
  });
  state.DOM.endBtn?.addEventListener('click', () => {
    state.selectingStart = false;
    openCalendarModal(false);
    cal.render();
    const dateFor = state.selectedEndDate || state.selectedStartDate || (new Date()).toISOString().slice(0,10);
    timeSlots.renderTimeSlots(dateFor);
    avail.updateChart(dateFor);
  });

  // Close calendar when close button clicked or overlay clicked
  state.DOM.closeCalendar?.addEventListener('click', () => closeCalendarModal());
  state.DOM.calendarModal?.addEventListener('click', (e) => {
    if (e.target === state.DOM.calendarModal) closeCalendarModal();
  });

  // Keyboard opening
  state.DOM.beginBtn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state.DOM.beginBtn.click(); }
  });
  state.DOM.endBtn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state.DOM.endBtn.click(); }
  });

  // Initialize confirm/save handler
  initBookingSubmit({
    onBookingSaved(booking) {
      // update chart for the date to show new booking
      if (avail && typeof avail.updateChart === 'function') {
        avail.updateChart(booking.date);
      }
      // optionally update any UI etc
      console.log('Booking saved locally:', booking);
    }
  });

  // initial render
  cal.render();
  const initialDate = (new Date()).toISOString().slice(0,10);
  timeSlots.renderTimeSlots(initialDate);
  avail.updateChart(initialDate);

  // Initialize header placeholders
  if (!state.selectedStartDate) state.DOM.startDay.textContent = 'morgen';
  if (!state.selectedEndDate) state.DOM.endDay.textContent = 'morgen';
});
