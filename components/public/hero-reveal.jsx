'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const HINGE_POSITION = 56;
const OPEN_POSITION = 66;

function clamp(value) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value) {
  return 1 - ((1 - value) ** 3);
}

function dropOffset(progress, distance) {
  if (progress >= 1) return 0;

  const landings = [
    [0, -distance],
    [0.36, 24],
    [0.52, -18],
    [0.65, 14],
    [0.76, -10],
    [0.85, 7],
    [0.92, -4],
    [1, 0],
  ];

  for (let index = 1; index < landings.length; index += 1) {
    const [endProgress, endOffset] = landings[index];
    if (progress <= endProgress) {
      const [startProgress, startOffset] = landings[index - 1];
      const phase = (progress - startProgress) / (endProgress - startProgress);
      const easedPhase = (1 - Math.cos(Math.PI * phase)) / 2;
      return startOffset + ((endOffset - startOffset) * easedPhase);
    }
  }

  return 0;
}

function emergeOffset(progress, distance) {
  if (progress >= 1) return 0;

  const rebounds = [
    [0, -distance],
    [0.36, 32],
    [0.52, -20],
    [0.65, 13],
    [0.76, -8],
    [0.85, 5],
    [0.92, -2.5],
    [1, 0],
  ];

  for (let index = 1; index < rebounds.length; index += 1) {
    const [endProgress, endOffset] = rebounds[index];
    if (progress <= endProgress) {
      const [startProgress, startOffset] = rebounds[index - 1];
      const phase = (progress - startProgress) / (endProgress - startProgress);
      const easedPhase = (1 - Math.cos(Math.PI * phase)) / 2;
      return startOffset + ((endOffset - startOffset) * easedPhase);
    }
  }

  return 0;
}

function renderDrop(element, progress, start, end, distance, horizontalDrift, imageTravel) {
  if (!element) return 0;
  const localProgress = clamp((progress - start) / (end - start));
  const visibility = easeOutCubic(clamp(localProgress / 0.18));
  const arrival = easeOutCubic(clamp(localProgress / 0.5));
  const verticalOffset = dropOffset(localProgress, distance);
  const horizontalOffset = horizontalDrift + emergeOffset(localProgress, imageTravel);
  const landingScale = 1 - Math.min(Math.max(verticalOffset, 0) / 800, 0.03);
  const entryTilt = -1.6 * (1 - arrival);
  element.style.opacity = String(visibility);
  element.style.filter = `blur(${(1 - visibility) * 7}px)`;
  element.style.transform = `translate3d(${horizontalOffset}px, ${verticalOffset}px, 0) rotateZ(${entryTilt}deg) scaleY(${landingScale})`;
  return localProgress;
}

function HeroAction({ href, children, variant = 'accent' }) {
  const className = `rd-button rd-button--${variant} dsp-focus`;
  if (/^(https?:|tel:|mailto:)/.test(href)) {
    return <a href={href} className={className} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{children}</a>;
  }
  return <Link href={href} className={className}>{children}</Link>;
}

export default function HeroReveal({ restaurantName, imageAlt, headingLines, description, secondaryLabel, secondaryHref }) {
  const stageRef = useRef(null);
  const heroRef = useRef(null);
  const photoRef = useRef(null);
  const baseRef = useRef(null);
  const leafRef = useRef(null);
  const seamRef = useRef(null);
  const copyRef = useRef(null);
  const nameRef = useRef(null);
  const statementRef = useRef(null);
  const descriptionRef = useRef(null);
  const actionsRef = useRef(null);
  const progressRef = useRef(0);
  const draggingRef = useRef(false);
  const [foldPercent, setFoldPercent] = useState(0);
  const [dragging, setDragging] = useState(false);

  function renderFold(progress, scrollProgress = 0) {
    const hero = heroRef.current;
    const photo = photoRef.current;
    const base = baseRef.current;
    const leaf = leafRef.current;
    const seam = seamRef.current;
    const copy = copyRef.current;
    if (!hero || !photo || !base || !leaf || !seam || !copy) return;

    const bounded = clamp(progress);
    const eased = bounded * bounded * (3 - 2 * bounded);
    const folded = 1 - eased;
    const foldAngle = -76 * folded;
    const compactFold = window.matchMedia('(max-width: 959px)').matches;
    progressRef.current = bounded;
    photo.style.transform = `rotateX(${-1.2 * folded}deg) rotateY(${7.5 * folded}deg) translateZ(${14 * folded}px)`;
    base.style.transform = `rotateY(${6.5 * folded}deg) translateZ(${10 * folded}px)`;
    base.style.setProperty('--rd-base-shade', `${0.34 * folded}`);
    leaf.style.transform = `rotateY(${foldAngle}deg)`;
    leaf.style.setProperty('--rd-fold-shade', `${0.68 * folded}`);
    leaf.style.setProperty('--rd-fold-highlight', `${0.28 * folded}`);
    leaf.style.setProperty('--rd-leaf-shadow', `${0.48 * folded}`);
    leaf.style.setProperty('--rd-leaf-edge', `${0.18 * folded}`);
    seam.style.transform = `translateZ(${14 + eased * 5}px) rotateY(${-1.4 * folded}deg)`;
    seam.style.opacity = compactFold ? String(1 - clamp((eased - 0.55) / 0.35)) : '1';
    copy.style.transform = `translate3d(${10 * folded}px, ${scrollProgress * -8}px, 0) rotateY(${-1.2 * folded}deg)`;
    copy.style.setProperty('--rd-copy-glow', `${0.16 + folded * 0.12}`);
    const imageTravel = Math.min(560, Math.max(260, copy.clientWidth * 0.95));
    renderDrop(nameRef.current, bounded, 0.02, 0.44, 76, 14 * folded, imageTravel);
    const statementProgress = renderDrop(statementRef.current, bounded, 0.15, 0.58, 68, 10 * folded, imageTravel);
    renderDrop(descriptionRef.current, bounded, 0.31, 0.74, 58, 7 * folded, imageTravel);
    renderDrop(actionsRef.current, bounded, 0.47, 0.9, 50, 4 * folded, imageTravel);
    copy.style.setProperty('--rd-rule-scale', String(easeOutCubic(statementProgress)));
    seam.setAttribute('aria-valuenow', String(Math.round(bounded * 100)));
    seam.setAttribute('aria-valuetext', `${Math.round(bounded * 100)} percent unfolded`);
  }

  function setFoldFromPointer(clientX) {
    const hero = heroRef.current;
    const bounds = hero?.getBoundingClientRect();
    if (!bounds || !hero) return;
    const styles = window.getComputedStyle(hero);
    const hingePosition = Number.parseFloat(styles.getPropertyValue('--rd-hero-hinge')) || HINGE_POSITION;
    const openPosition = Number.parseFloat(styles.getPropertyValue('--rd-hero-open')) || OPEN_POSITION;
    const pointerPosition = ((clientX - bounds.left) / bounds.width) * 100;
    const next = (pointerPosition - hingePosition) / (openPosition - hingePosition);
    const bounded = Math.min(1, Math.max(0, next));
    renderFold(bounded);
    setFoldPercent(Math.round(bounded * 100));
  }

  function onPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setDragging(true);
    setFoldFromPointer(event.clientX);
  }

  function onPointerMove(event) {
    if (draggingRef.current) setFoldFromPointer(event.clientX);
  }

  function onPointerUp(event) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    draggingRef.current = false;
    setDragging(false);
  }

  function onKeyDown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = Math.min(1, Math.max(0, progressRef.current + (event.key === 'ArrowRight' ? 0.08 : -0.08)));
    renderFold(next);
    setFoldPercent(Math.round(next * 100));
  }

  useEffect(() => {
    const stage = stageRef.current;
    const hero = heroRef.current;
    if (!stage || !hero) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderFold(1);
      return undefined;
    }
    let frame = 0;
    const updateFold = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const travel = Math.max(stage.offsetHeight - hero.offsetHeight, 1);
      const stickyTop = Number.parseFloat(window.getComputedStyle(hero).top) || 0;
      const progress = clamp((stickyTop - rect.top) / travel);
      renderFold(progress, progress);
    };
    const onScroll = () => {
      if (!draggingRef.current && !frame) frame = window.requestAnimationFrame(updateFold);
    };
    updateFold();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const nameWords = String(restaurantName || '').trim().split(/\s+/);
  const nameLead = nameWords.slice(0, -1).join(' ');
  const nameTail = nameWords.at(-1);

  return (
    <section ref={stageRef} className="rd-home-hero-stage">
      <div
        ref={heroRef}
        className={`rd-home-hero${dragging ? ' rd-home-hero--dragging' : ''}`}
      >
        <div ref={photoRef} className="rd-hero-photo" aria-label={imageAlt || 'Food served at Dim Sum Puri'} role="img">
          <div ref={baseRef} className="rd-hero-photo-base">
            <Image src="/images/chicken-chilly.jpg" alt="" fill priority sizes="(max-width: 767px) 100vw, 66vw" />
          </div>
          <div ref={leafRef} className="rd-hero-photo-leaf" aria-hidden="true">
            <Image src="/images/chicken-chilly.jpg" alt="" fill priority sizes="(max-width: 959px) 82vw, 10vw" />
          </div>
        </div>
        <button
          ref={seamRef}
          type="button"
          className="rd-woven-seam dsp-focus"
          aria-label="Drag the woven hinge to unfold the food image"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={foldPercent}
          aria-valuetext={`${foldPercent} percent unfolded`}
          aria-orientation="horizontal"
          role="slider"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <span><ArrowLeftRight aria-hidden="true" /></span>
        </button>
        <div ref={copyRef} className="rd-hero-copy">
          <p ref={nameRef} className="rd-hero-name">
            {nameLead ? <span>{nameLead}</span> : null}
            <span>{nameTail}</span>
          </p>
          <h1 ref={statementRef} className="rd-display" lang="ne">
            {headingLines.filter(Boolean).map((line) => <span key={line}>{line}</span>)}
          </h1>
          <p ref={descriptionRef} className="rd-hero-description">{description}</p>
          <div ref={actionsRef} className="rd-hero-actions">
            <HeroAction href="/menu">Order online<ArrowRight aria-hidden="true" /></HeroAction>
            <HeroAction href={secondaryHref} variant="light"><MessageCircle aria-hidden="true" />{secondaryLabel}</HeroAction>
          </div>
        </div>
      </div>
    </section>
  );
}
