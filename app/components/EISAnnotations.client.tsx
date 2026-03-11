import { useEffect } from 'react';

export default function EISAnnotations() {
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll('.sticky-annotation').forEach((annotation) => {
        const container = annotation.querySelector('.photo-container') as HTMLElement;
        if (!container) return;

        const rect = annotation.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInView) {
          container.classList.add('position-fixed');
          container.style.opacity = '1';
        } else {
          container.classList.remove('position-fixed');
          container.style.opacity = '0';
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}