import { useState, useEffect } from "react";
import { getBasePath } from "../js/getBasePath";

interface LightboxImageProps {
  src: string;
  alt: string;
  textPosition?: "left" | "right";
  children: React.ReactNode;
}

export default function LightboxImage({
  src,
  alt,
  textPosition = "right",
  children,
}: LightboxImageProps) {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <div className={`inline-image-block text-${textPosition}`}>
        <div className="inline-block-inner">
          <div
            className="inline-block-image"
            onClick={() => setOpen(true)}
          >
            <img src={src} alt={alt} />
          </div>
          <div className="annotation-text-holder">
            {children}
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
          <img src={src} alt={alt} />
        </div>
      )}
    </>
  );
}