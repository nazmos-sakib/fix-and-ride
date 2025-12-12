// js/core/utils.js
export function preloadImages(images = []) {
  return images.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
}

export async function parseErrorResponse(response) {
  // safe parse of error body
  let text = '';
  try {
    text = await response.text();
  } catch (_e) {
    return `HTTP ${response.status}`;
  }

  try {
    const obj = JSON.parse(text);
    if (obj.error) return obj.error;
    if (obj.message) return obj.message;
    if (typeof obj === 'object') {
      return Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
    }
    return text || `HTTP ${response.status}`;
  } catch {
    return text || `HTTP ${response.status}`;
  }
}
