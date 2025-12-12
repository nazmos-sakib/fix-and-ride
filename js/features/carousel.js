// js/features/carousel.js
export function initCarousel(DOM) {
  if (!DOM || !DOM.carouselTrack) return;

  const track = DOM.carouselTrack;
  const left = DOM.leftArrow;
  const right = DOM.rightArrow;

  function computeScrollAmount() {
    // prefer card width if available
    const card = track.querySelector('.service-card');
    if (card) return Math.round(card.getBoundingClientRect().width + 20); // include gap
    return Math.round(track.clientWidth * 0.8);
  }

  left?.addEventListener('click', () => {
    track.scrollBy({ left: -computeScrollAmount(), behavior: 'smooth' });
  });

  right?.addEventListener('click', () => {
    track.scrollBy({ left: computeScrollAmount(), behavior: 'smooth' });
  });

  // Optional: keyboard navigation for accessibility
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') track.scrollBy({ left: -computeScrollAmount(), behavior: 'smooth' });
    if (e.key === 'ArrowRight') track.scrollBy({ left: computeScrollAmount(), behavior: 'smooth' });
  });
}
