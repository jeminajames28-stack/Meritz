import { useRef } from 'react';
import { DURATION, EASE, MOTION_QUERIES, STAGGER, gsap, useGSAP } from '@/lib/motion';

type Props = {
  current: 1 | 2 | 3;
  label: string;
};

/** Three-part bar plus "Step 2 of 3 · Your voucher". The text carries the meaning; the bar is decoration. */
export default function Progress({ current, label }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shownStep = useRef(current);

  useGSAP(
    () => {
      const previous = shownStep.current;
      shownStep.current = current;
      if (current <= previous) return;
      // Only the segments that just became filled grow in.
      const fills = gsap.utils.toArray<HTMLElement>('[data-fill]', rootRef.current).slice(previous, current);
      const mm = gsap.matchMedia();
      const grow = (duration: number) =>
        gsap.from(fills, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration,
          ease: EASE.enter,
          stagger: STAGGER,
          clearProps: 'transform',
        });
      mm.add(MOTION_QUERIES.desktop, () => {
        grow(DURATION.base);
      });
      mm.add(MOTION_QUERIES.phone, () => {
        grow(DURATION.fast);
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [current], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef}>
      <p className="text-sm text-brand-muted">
        Step {current} of 3 · {label}
      </p>
      <div aria-hidden="true" className="mt-2 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((index) => (
          <span key={index} className="h-1 overflow-hidden rounded-full bg-brand-line">
            {index < current && (
              <span
                data-fill
                className={`block h-full w-full rounded-full ${
                  index === current - 1 ? 'bg-brand-primary' : 'bg-brand-deep'
                }`}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
