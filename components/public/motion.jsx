'use client';

import { useEffect, useRef, useState } from 'react';

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

export function Reveals() {
  useEffect(() => {
    const targets = document.querySelectorAll('[data-rd-reveal], [data-rd-image], [data-rd-rule]');
    if (!targets.length) return;

    if (reduced() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('rd-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('rd-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}

export function HeroDepth({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage || reduced() || !finePointer()) return;

    const hero = stage.closest('[data-rd-hero]') || stage;
    let frame = null;

    const onMove = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const rect = hero.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        stage.style.setProperty('--mx', Math.max(-1, Math.min(1, x)).toFixed(3));
        stage.style.setProperty('--my', Math.max(-1, Math.min(1, y)).toFixed(3));
      });
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      stage.style.setProperty('--mx', '0');
      stage.style.setProperty('--my', '0');
    };

    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className={`rd-stage ${className}`} data-rd-enter style={{ '--d': 220 }}>{children}</div>;
}

export function ServeList({ items }) {
  const wrapRef = useRef(null);
  const floatRef = useRef(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const floatingImage = floatRef.current;
    if (!wrap || !floatingImage || reduced() || !finePointer()) return;

    let frame = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = false;

    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      floatingImage.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      if (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (event) => {
      const rect = wrap.getBoundingClientRect();
      targetX = Math.min(Math.max(event.clientX - rect.left + 28, 0), Math.max(rect.width - floatingImage.offsetWidth, 0));
      targetY = Math.min(Math.max(event.clientY - rect.top - floatingImage.offsetHeight / 2, 0), Math.max(rect.height - floatingImage.offsetHeight, 0));
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    wrap.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      wrap.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative" onPointerLeave={() => setActive(null)}>
      <div ref={floatRef} className={`rd-serve-float ${active?.img ? 'rd-on' : ''}`} aria-hidden="true">
        {active?.img ? <img src={active.img} alt="" width={560} height={700} /> : null}
      </div>

      {items.map((item, index) => (
        <a key={item.title} href={item.href} className="rd-serve-row dsp-focus"
           onPointerEnter={() => item.img && setActive(item)} data-rd-reveal style={{ '--d': index * 70 }}>
          <span className="rd-serve-num">{String(index + 1).padStart(2, '0')}</span>
          <span className="min-w-0">
            <span className="rd-serve-name block" style={{ color: 'var(--dsp-ink)' }}>{item.title}</span>
            {item.note ? <span className="mt-1 block text-sm" style={{ color: 'var(--dsp-muted)' }}>{item.note}</span> : null}
          </span>
          <span className="flex items-center gap-4">
            {item.img ? <span className="rd-serve-thumb"><img src={item.img} alt="" width={300} height={225} loading="lazy" /></span> : null}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                 style={{ width: 22, height: 22, color: 'var(--rd-clay)' }}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </a>
      ))}
    </div>
  );
}
