import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Fades/slides every page section into view as the visitor scrolls.
export default function SectionReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    const scan = () => {
      document.querySelectorAll('main section:not(.reveal)').forEach((el) => {
        el.classList.add('reveal');
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.querySelector('main'), { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);

  return null;
}