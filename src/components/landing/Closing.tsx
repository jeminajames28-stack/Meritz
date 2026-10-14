import { useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { LINKS } from '@/content';
import { gsap, MOTION_QUERIES, revealBlocks, useGSAP } from '@/lib/motion';

type Props = {
  onRegister: () => void;
};

export default function Closing({ onRegister }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.desktop, () => revealBlocks(section));
      mm.add(MOTION_QUERIES.phone, () => revealBlocks(section));
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} aria-labelledby="closing-title" className="on-dark section-y bg-brand-deep">
      <div className="page flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <h2 id="closing-title" data-reveal className="h-section text-white">
          Let’s promote <i className="text-brand-pink">together.</i>
        </h2>

        <div data-reveal className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onRegister}
            className="btn bg-white text-brand-deep hover:bg-brand-soft active:bg-brand-soft"
          >
            Register your shop
            <span className="btn-arrow">
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
            </span>
          </button>
          <a
            href={LINKS.tvAdsForm}
            target="_blank"
            rel="noopener noreferrer"
            className="btn border border-white text-white hover:bg-brand-deepest active:bg-brand-deepest"
          >
            Register for TV ads
            <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
