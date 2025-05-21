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

function initGalleryModal() {
  const galleryItems =
    document.querySelectorAll<HTMLDivElement>(".gallery__item");
  const modal = document.getElementById("modal") as HTMLDialogElement;
  if (!modal || galleryItems.length === 0) return;

  const modalState = {
    currentIndex: 0,
  };

  setupModalControls(modal, modalState, galleryItems);
  attachGalleryItemClickHandlers(galleryItems, modal, modalState);
}

function setupModalControls(
  modal: HTMLDialogElement,
  modalState: { currentIndex: number },
  galleryItems: NodeListOf<HTMLDivElement>
) {
  const modalImg = modal.querySelector("img");
  const modalIframe = modal.querySelector("iframe");
  if (!modalImg || !modalIframe) return;
  setupCloseButton(modal);

  const handleKeyNavigation = createKeyboardNavigationHandler(
    modal,
    modalState,
    galleryItems,
    modalImg,
    modalIframe
  );

  modal.addEventListener("close", () => {
    document.removeEventListener("keydown", handleKeyNavigation);
    stopVideo(modalIframe);
  });

  setupBackdropClickHandler(modal);
}

function setupCloseButton(modal: HTMLDialogElement) {
  const closeButton = modal.querySelector<HTMLButtonElement>(".modal-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => modal.close());
  }
}

function setupBackdropClickHandler(modal: HTMLDialogElement) {
  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isInDialog) {
      modal.close();
    }
  });
}

function createKeyboardNavigationHandler(
  modal: HTMLDialogElement,
  modalState: { currentIndex: number },
  galleryItems: NodeListOf<HTMLDivElement>,
  modalImg: HTMLImageElement,
  modalIframe: HTMLIFrameElement
) {
  return (e: KeyboardEvent) => {
    if (!modal.open) return;

    if (e.key === "ArrowRight") {
      navigateGallery("next", modalState, galleryItems, modalImg, modalIframe);
    } else if (e.key === "ArrowLeft") {
      navigateGallery("prev", modalState, galleryItems, modalImg, modalIframe);
    }
  };
}

function navigateGallery(
  direction: "next" | "prev",
  modalState: { currentIndex: number },
  galleryItems: NodeListOf<HTMLDivElement>,
  modalImg: HTMLImageElement,
  modalIframe: HTMLIFrameElement
) {
  const { currentIndex } = modalState;
  const totalItems = galleryItems.length;

  const newIndex =
    direction === "next"
      ? (currentIndex + 1) % totalItems
      : (currentIndex - 1 + totalItems) % totalItems;

  updateModalContent(newIndex, galleryItems, modalImg, modalIframe, modalState);
}

function updateModalContent(
  index: number,
  galleryItems: NodeListOf<HTMLDivElement>,
  modalImg: HTMLImageElement,
  modalIframe: HTMLIFrameElement,
  modalState: { currentIndex: number }
) {
  const item = galleryItems[index];
  if (!item) return;

  const videoSrc = item.getAttribute("data-video-src");
  if (videoSrc) {
    // Show iframe, hide image, set src with autoplay
    modalImg.classList.add("is-hidden");
    modalIframe.classList.remove("is-hidden");
    // Add autoplay param if not present
    let src = videoSrc;
    if (!/[\?&]autoplay=1/.test(src)) {
      src += (src.includes("?") ? "&" : "?") + "autoplay=1";
    }
    modalIframe.src = src;
  } else {
    // Show image, hide iframe, clear iframe src
    modalImg.classList.remove("is-hidden");
    modalIframe.classList.add("is-hidden");
    stopVideo(modalIframe);

    const img = item.querySelector<HTMLImageElement>(".gallery__img");
    if (!img) return;
    modalImg.src = img.src;
    modalImg.alt = img.alt || "Gallery item";
  }
  modalState.currentIndex = index;
}

function stopVideo(modalIframe: HTMLIFrameElement) {
  modalIframe.src = "";
}

function attachGalleryItemClickHandlers(
  galleryItems: NodeListOf<HTMLDivElement>,
  modal: HTMLDialogElement,
  modalState: { currentIndex: number }
) {
  const modalImg = modal.querySelector("img");
  const modalIframe = modal.querySelector("iframe");
  if (!modalImg || !modalIframe) return;

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      updateModalContent(
        index,
        galleryItems,
        modalImg,
        modalIframe,
        modalState
      );
      modal.showModal();

      const handleKeyNav = createKeyboardNavigationHandler(
        modal,
        modalState,
        galleryItems,
        modalImg,
        modalIframe
      );
      document.addEventListener("keydown", handleKeyNav);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyGallerySizeClasses();
  initGalleryModal();
});
