import { useState, useEffect } from "react";
import { getBasePath } from "../js/getBasePath";

interface StickyLightboxProps {
  backgroundSrc?: string;
  lightboxSrc: string;
  alt: string;
  heading?: string;
  body?: string;
}

export default function StickyLightbox({
  backgroundSrc,
  lightboxSrc,
  alt,
  heading,
  body,
}: StickyLightboxProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const resolvedBg = backgroundSrc ? `${getBasePath()}${backgroundSrc}` : null;
  const resolvedLightbox = `${getBasePath()}${lightboxSrc}`;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const el = document.querySelector(".sticky-lightbox-anchor");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky-lightbox-annotation">
      <div className={`photo-container${visible ? " position-fixed" : ""}`}
        style={!resolvedBg ? { background: "#fff" } : undefined}>
        {resolvedBg && <img src={resolvedBg} alt="" className="anno-photo" />}
      </div>

      <div className="sticky-lightbox-anchor sticky-lightbox-inner">
        <div
          className="sticky-lightbox-image"
          onClick={() => setOpen(true)}
        >
          <img src={resolvedLightbox} alt={alt} />
          <span className="sticky-lightbox-zoom">⤢</span>
        </div>

        <div className="sticky-lightbox-text-column">
          <div className="sticky-lightbox-text">
            {heading && <h2>{heading}</h2>}
            {body && <p>{body}</p>}
          </div>
        </div>
      </div>

      {open && (
        <div
          className="lightbox-overlay active"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <button className="lightbox-close" onClick={() => setOpen(false)}>
            ✕
          </button>
          <img src={resolvedLightbox} alt={alt} />
        </div>
      )}
    </div>
  );
}