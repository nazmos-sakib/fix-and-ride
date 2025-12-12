// js/features/slideshow.js
import { preloadImages } from '../core/utils.js';

export function initSlideshow(DOM, images = [], intervalMs = 4000) {
  if (!DOM || !DOM.heroImg || !DOM.heroCaption) return () => {};

  // Preload actual source strings
  const srcList = images.map(i => i.src);
  preloadImages(srcList);

  let idx = 0;
  // set initial
  DOM.heroImg.src = images[0].src || DOM.heroImg.src;
  DOM.heroCaption.textContent = images[0].caption || DOM.heroCaption.textContent;

  const timer = setInterval(() => {
    idx = (idx + 1) % images.length;
    const slide = images[idx];
    // small optimization: change src only if different
    if (DOM.heroImg.src.indexOf(slide.src) === -1) {
      DOM.heroImg.src = slide.src;
    }
    DOM.heroCaption.textContent = slide.caption || '';
  }, intervalMs);

  // Return a stop handle
  return function stop() {
    clearInterval(timer);
  };
}
