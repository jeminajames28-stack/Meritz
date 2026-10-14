import { useRef } from 'react';
import { SECTION_IDS } from '@/content';
import { DURATION, EASE, MOTION_QUERIES, ScrollTrigger, gsap, useGSAP } from '@/lib/motion';

type Props = {
  onRegister: () => void;
  onTvAds: () => void;
};

const BAR_BUTTON =
  'flex h-12 w-full touch-manipulation items-center justify-center text-[13px] font-medium uppercase tracking-[0.08em] transition-colors active:bg-brand-soft focus-visible:outline-offset-[-4px] motion-reduce:transition-none';

/** Desktop corner buttons, always on screen, and the phone bottom bar, which appears once the first screen has scrolled away. */
export default function FloatingActions({ onRegister, onTvAds }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Focus follows the scroll, so keyboard and screen reader users land in section 02 too.
  const goToTvAds = () => {
    onTvAds();
    document.getElementById(SECTION_IDS.tvAds)?.focus({ preventScroll: true });
  };

  useGSAP(
    () => {
      const nav = navRef.current;
      const bar = barRef.current;
      const hero = document.getElementById('hero');
      if (!nav || !bar || !hero) return;

      // While hidden, the buttons are skipped by Tab and screen readers, not only faded out.
      const setReachable = (reachable: boolean) => {
        nav.inert = !reachable;
        nav.style.visibility = reachable ? '' : 'hidden';
      };

      // progress 1 = the hero is fully above the viewport. onRefresh covers a reload further down the page.
      const watchHero = (onChange: (past: boolean) => void) =>
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => onChange(self.progress === 1),
          onRefresh: (self) => onChange(self.progress === 1),
        });

      // Focus inside keeps the buttons on screen. Hiding them would make them inert and drop focus to the page.
      const watchFocus = (el: HTMLElement, onChange: (inside: boolean) => void) => {
        const onFocusIn = () => onChange(true);
        const onFocusOut = (event: FocusEvent) => {
          if (!el.contains(event.relatedTarget as Node | null)) onChange(false);
        };
        el.addEventListener('focusin', onFocusIn);
        el.addEventListener('focusout', onFocusOut);
        return () => {
          el.removeEventListener('focusin', onFocusIn);
          el.removeEventListener('focusout', onFocusOut);
        };
      };

      const reset = () => {
        gsap.killTweensOf(bar);
        gsap.set(bar, { clearProps: 'opacity,visibility,transform' });
        nav.inert = false;
        nav.style.visibility = '';
      };

      // Desktop has no branch: the corner buttons stay visible from the first screen onwards.
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.phone, () => {
        let past = false;
        let scrollingDown = false;
        let focused = false;
        let shown = false;
        let lastY = window.scrollY;
        setReachable(false);
        gsap.set(bar, { yPercent: 100 });

        const sync = () => {
          const visible = (past && !scrollingDown) || focused;
          if (visible === shown) return;
          shown = visible;
          if (visible) {
            setReachable(true);
            gsap.to(bar, { yPercent: 0, duration: DURATION.fast, ease: EASE.enter, overwrite: true });
          } else {
            gsap.to(bar, {
              yPercent: 100,
              duration: DURATION.fast,
              ease: EASE.exit,
              overwrite: true,
              onComplete: () => setReachable(false),
            });
          }
        };

        watchHero((isPast) => {
          past = isPast;
          sync();
        });

        // The bar hides while scrolling down and comes back on scroll up or once scrolling pauses,
        // so a visitor who only scrolls down still gets it.
        let idleTimer: number | undefined;
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            const y = self.scroll();
            // Ignore small jitter, such as the rubber-band bounce at the ends of the page.
            // The direction is the net move since the last accepted position, not the last frame.
            if (Math.abs(y - lastY) < 8) return;
            scrollingDown = y > lastY;
            lastY = y;
            sync();
            window.clearTimeout(idleTimer);
            idleTimer = window.setTimeout(() => {
              scrollingDown = false;
              sync();
            }, 400);
          },
        });

        const unwatchFocus = watchFocus(bar, (inside) => {
          focused = inside;
          sync();
        });

        return () => {
          window.clearTimeout(idleTimer);
          unwatchFocus();
          reset();
        };
      });

      // Reduced motion on phones: no sliding, the bar simply becomes available after the hero.
      mm.add('(max-width: 1023.98px) and (prefers-reduced-motion: reduce)', () => {
        let past = false;
        let focused = false;
        const sync = () => setReachable(past || focused);
        setReachable(false);

        watchHero((isPast) => {
          past = isPast;
          sync();
        });
        const unwatchFocus = watchFocus(nav, (inside) => {
          focused = inside;
          sync();
        });

        return () => {
          unwatchFocus();
          reset();
        };
      });

      return () => mm.revert();
    },
    { scope: navRef },
  );

  return (
    <nav ref={navRef} aria-label="Quick actions">
      <div className="fixed right-10 top-6 z-40 hidden gap-2 lg:flex">
        <button
          type="button"
          onClick={onRegister}
          className="btn-primary shadow-lg shadow-brand-deep/10 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
        >
          Register your shop
        </button>
        <button
          type="button"
          onClick={goToTvAds}
          className="btn-outline bg-brand-surface shadow-lg shadow-brand-deep/10 focus-visible:outline-offset-[-4px]"
        >
          TV advertising
        </button>
      </div>

      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-line bg-brand-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="grid h-12 grid-cols-[1fr_1px_1fr] items-center">
          <button type="button" onClick={onRegister} className={`${BAR_BUTTON} text-brand-primary`}>
            Register shop
          </button>
          <span aria-hidden="true" className="h-6 w-px bg-brand-line" />
          <button type="button" onClick={goToTvAds} className={`${BAR_BUTTON} text-brand-deep`}>
            TV ads
          </button>
        </div>
      </div>
    </nav>
  );
}
