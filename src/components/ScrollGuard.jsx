import { useEffect } from 'react';

// iOS Safari has no scroll anchoring: when a step swap / list collapse briefly
// shrinks the page, the browser clamps scrollY to the bottom (the footer) and
// never returns. After any tap, watch for that clamp and put the user back.
export default function ScrollGuard() {
  useEffect(() => {
    let raf = 0, until = 0, anchorY = 0, lastY = 0, lastH = 0, clamped = false;

    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const tick = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight;
      const maxY = h - window.innerHeight;
      if (!clamped && h < lastH - 40 && y < lastY - 40) clamped = true;   // height shrank, scroll was pushed up
      if (clamped && maxY >= anchorY - 2) {                                // page tall enough again
        if (Math.abs(y - anchorY) > 40) window.scrollTo(0, anchorY);
        clamped = false;
        stop();
        return;
      }
      lastY = y; lastH = h;
      if (performance.now() < until) raf = requestAnimationFrame(tick); else stop();
    };
    const begin = () => {
      stop();
      anchorY = window.scrollY; lastY = anchorY; lastH = document.documentElement.scrollHeight;
      clamped = false; until = performance.now() + 1800;
      raf = requestAnimationFrame(tick);
    };
    const cancel = () => stop();

    document.addEventListener('click', begin, true);
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchmove', cancel, { passive: true });
    return () => {
      stop();
      document.removeEventListener('click', begin, true);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchmove', cancel);
    };
  }, []);
  return null;
}
