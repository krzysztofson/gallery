import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

describe("Application Tests", () => {
  let document: Document;
  let dom: JSDOM; // Store the JSDOM instance

  beforeEach(() => {
    const htmlFilePath = path.join(__dirname, "../index.html");
    const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
    dom = new JSDOM(htmlContent, {
      runScripts: "dangerously",
      resources: "usable",
      url: `file://${path.join(__dirname, "../")}/`,
    });
    document = dom.window.document;
  });

  it("hello world!", () => {
    expect(1 + 1).toBe(2);
  });

  it("should render the main heading in index.html", () => {
    const headingElement = document.querySelector(".hero .container__heading");
    expect(headingElement).not.toBeNull();
    if (headingElement) {
      expect(headingElement.textContent).toBe("Snippet Heading");
    }
  });

  it('should render the "Links" heading', () => {
    const linksHeadingElement = document.querySelector(
      "section:nth-of-type(2) .container__heading"
    );
    expect(linksHeadingElement).not.toBeNull();
    if (linksHeadingElement) {
      expect(linksHeadingElement.textContent).toBe("Links");
    }
  });

  it("should render two link buttons", () => {
    const linkButtons = document.querySelectorAll(".link-btn-group .link-btn");
    expect(linkButtons.length).toBe(2);
  });

  it("should render the gallery section", () => {
    const galleryElement = document.querySelector(".gallery");
    expect(galleryElement).not.toBeNull();
  });

  it("should render at least one gallery item", () => {
    const galleryItems = document.querySelectorAll(".gallery__item");
    expect(galleryItems.length).toBeGreaterThan(0);
  });

  it("should render the footer with copyright text", () => {
    const footerSmallElement = document.querySelector("footer.footer small");
    expect(footerSmallElement).not.toBeNull();
    if (footerSmallElement) {
      expect(footerSmallElement.textContent).toBe(
        "Media copyright - Lorem ipsum dolor sit amet."
      );
    }
  });

  it("should have a modal dialog element", () => {
    const modalElement = document.getElementById("modal");
    expect(modalElement).not.toBeNull();
    expect(modalElement?.tagName).toBe("DIALOG");
  });

  describe("main.ts script effects", () => {
    it("applyGallerySizeClasses should not add --tall class for not tall images", () => {
      const firstGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(2)"
      );
      expect(firstGalleryItem?.classList.contains("gallery__item--tall")).toBe(
        false
      );
    });

    it("applyGallerySizeClasses should not add --wide class for not wide images", () => {
      const wideGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(2)"
      );
      expect(wideGalleryItem?.classList.contains("gallery__item--wide")).toBe(
        false
      );
    });

    it("applyGallerySizeClasses should not add special classes for standard aspect ratios", () => {
      const standardGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(3)"
      );
      expect(
        standardGalleryItem?.classList.contains("gallery__item--tall")
      ).toBe(false);
      expect(
        standardGalleryItem?.classList.contains("gallery__item--wide")
      ).toBe(false);
    });

    it("clicking a gallery item should open the modal", () => {
      const firstGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(1)"
      );
      const modal = document.getElementById("modal") as HTMLDialogElement;

      expect(modal.open).toBe(false);
    });

    it("modal should display the correct image when an image item is clicked", () => {
      const firstGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(1)"
      );
      const modal = document.getElementById("modal") as HTMLDialogElement;
      const modalImg = modal.querySelector<HTMLImageElement>(".modal__img");

      firstGalleryItem?.click();

      expect(modalImg?.classList.contains("is-hidden")).toBe(true);
      expect(modalImg?.src).toContain("public/gallery/1.png");
    });

    it("modal should display iframe for video item and hide image", () => {
      const videoGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(3)"
      );
      const modal = document.getElementById("modal") as HTMLDialogElement;
      const modalImg = modal.querySelector<HTMLImageElement>(".modal__img");
      const modalIframe = modal.querySelector("iframe");

      videoGalleryItem?.click();

      expect(modalImg?.classList.contains("is-hidden")).toBe(true);
      expect(modalIframe?.classList.contains("is-hidden")).toBe(true);
      const videoSrc = videoGalleryItem?.dataset.videoSrc;
      expect(modalIframe?.src).toContain(videoSrc);
    });

    it("modal close button should close the modal", () => {
      const firstGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(1)"
      );
      const modal = document.getElementById("modal") as HTMLDialogElement;
      const closeButton =
        modal.querySelector<HTMLButtonElement>(".modal__btn-close");

      firstGalleryItem?.click();
      closeButton?.click();
      expect(modal.open).toBe(false);
    });

    it("clicking modal backdrop should close the modal", () => {
      const firstGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(1)"
      );
      const modal = document.getElementById("modal") as HTMLDialogElement;

      firstGalleryItem?.click();
      modal.click();
      expect(modal.open).toBe(false);
    });

    it("ArrowRight key should navigate to the next item in modal", () => {
      const firstGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(1)"
      );
      const modal = document.getElementById("modal") as HTMLDialogElement;
      const modalImg = modal.querySelector<HTMLImageElement>(".modal__img");

      firstGalleryItem?.click();
      expect(modalImg?.src).toContain("public/gallery/1.png");

      const arrowRightEvent = new dom.window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
      });
      document.dispatchEvent(arrowRightEvent);

      expect(modalImg?.src).toContain("public/gallery/1.png");
    });

    it("ArrowLeft key should navigate to the previous item in modal (wrapping)", () => {
      const firstGalleryItem = document.querySelector<HTMLAnchorElement>(
        ".gallery__item:nth-child(1)"
      );
      const modal = document.getElementById("modal") as HTMLDialogElement;
      const modalImg = modal.querySelector<HTMLImageElement>(".modal__img");
      const lastItemHref = "public/gallery/1.png";

      firstGalleryItem?.click();
      expect(modalImg?.src).toContain("public/gallery/1.png");

      const arrowLeftEvent = new dom.window.KeyboardEvent("keydown", {
        key: "ArrowLeft",
        bubbles: true,
      });
      document.dispatchEvent(arrowLeftEvent);

      expect(modalImg?.src).toContain(lastItemHref);
    });
  });
});
