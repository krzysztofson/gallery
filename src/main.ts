import "./styles/main.scss";
function applyGallerySizeClasses() {
  const items = document.querySelectorAll<HTMLDivElement>(".gallery__item");

  items.forEach((item) => {
    const img = item.querySelector<HTMLImageElement>(".gallery__img");
    if (!img) return;
    const width = parseInt(img.getAttribute("width") || "0", 10);
    const height = parseInt(img.getAttribute("height") || "0", 10);

    if (width > 0 && height > 0) {
      if (height > width) {
        item.classList.add("gallery__item--tall");
      } else if (width > height * 2) {
        item.classList.add("gallery__item--wide");
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", applyGallerySizeClasses);
