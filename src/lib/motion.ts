import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** gsap.matchMedia conditions. Reduced motion always wins: nothing animates. */
export const MOTION_QUERIES = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  phone: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
} as const;

export const EASE = {
  enter: 'power3.out',
  exit: 'power2.in',
} as const;

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.2,
} as const;

export const STAGGER = 0.06;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fade elements up once as they scroll into view, in batches.
 * Hidden with opacity only (not visibility), so they stay in the Tab order and readable by screen readers.
 * Call inside a gsap.matchMedia() branch so reduced motion skips it entirely.
 */
export function batchReveal(targets: gsap.TweenTarget, distance = 16): void {
  const elements = gsap.utils.toArray<HTMLElement>(targets);
  if (!elements.length) return;
  gsap.set(elements, { opacity: 0, y: distance });
  ScrollTrigger.batch(elements, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: DURATION.base,
        ease: EASE.enter,
        stagger: STAGGER,
        overwrite: true,
      }),
  });
}

/**
 * Reveal every [data-reveal] block inside root as it scrolls into view. A block that receives
 * keyboard focus before it has been revealed shows at once. Returns a cleanup function.
 */
export function revealBlocks(root: HTMLElement): () => void {
  batchReveal(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  const onFocusIn = (event: FocusEvent) => {
    const block = (event.target as Element).closest('[data-reveal]');
    if (block) gsap.to(block, { opacity: 1, y: 0, duration: DURATION.fast, overwrite: true });
  };
  root.addEventListener('focusin', onFocusIn);
  return () => root.removeEventListener('focusin', onFocusIn);
}

/** Scroll to a section by id, smoothly unless the visitor prefers reduced motion. */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
