import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import VoucherTicket from '@/components/ui/VoucherTicket';
import { SECTION_IDS } from '@/content';
import { DURATION, EASE, gsap, MOTION_QUERIES, revealBlocks, useGSAP } from '@/lib/motion';

type Props = {
  onRegister: () => void;
};

const STEPS = ['Shop details', 'Your voucher', 'Review & send'];

export default function ShopTenants({ onRegister }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const ticket = ticketRef.current;
      if (!section || !ticket) return;

      const animate = () => {
        const cleanup = revealBlocks(section);
        gsap.from(ticket, {
          rotation: -2,
          y: 16,
          duration: DURATION.slow,
          ease: EASE.enter,
          scrollTrigger: { trigger: ticket, start: 'top 85%', once: true },
        });
        return cleanup;
      };

      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.desktop, animate);
      mm.add(MOTION_QUERIES.phone, animate);
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id={SECTION_IDS.shopTenants}
      aria-labelledby="shop-tenants-title"
      className="section-y bg-brand-surface"
    >
      <div className="page grid items-start gap-10 lg:grid-cols-2">
        <div>
          <div data-reveal>
            <p className="label text-brand-muted">01 · Shop tenants</p>
            <h2 id="shop-tenants-title" className="h-section mt-4">
              Three steps. <i>Five minutes.</i>
            </h2>
          </div>

          <ol role="list" className="mt-6 border-b border-brand-line">
            {STEPS.map((step, index) => (
              <li
                key={step}
                data-reveal
                className="grid grid-cols-[32px_1fr] items-baseline gap-4 border-t border-brand-line py-4"
              >
                <span className="font-serif text-2xl leading-none text-brand-primary">{index + 1}</span>
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>

          <div data-reveal className="mt-6">
            <button type="button" onClick={onRegister} className="btn-primary w-full sm:w-auto">
              Register your shop
              <span className="btn-arrow">
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>

        <div data-reveal className="rounded-[10px] bg-brand-blush px-6 py-10">
          <p className="label text-brand-muted">Your voucher, as shoppers see it</p>
          <div ref={ticketRef} className="mt-6">
            {/* Notch colour is the blush panel behind the ticket. */}
            <VoucherTicket shopName="Your Shop" detail="Storewide" value="30%" size="lg" notch="#f8e9ee" />
          </div>
          <p className="mt-6 text-sm text-brand-muted">Shown on screens and posters across Bintang Megamall.</p>
        </div>
      </div>
    </section>
  );
}
