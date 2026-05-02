import { useEffect } from 'react';

/**
 * useScrollReveal — adds `.visible` to any `.fade-up` element
 * when it enters the viewport. Call once at app level.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );

    const attach = () =>
      document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

    // Run once immediately, then on DOM changes (dynamic content)
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { observer.disconnect(); mo.disconnect(); };
  }, []);
}
