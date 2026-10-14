import { useRef } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import hotelRoom from '@/images/optimised/hotel-room.webp';
import qrTvAds from '@/images/optimised/qr-tv-ads.png';
import { CONTACT, HOTEL_ROOMS, LINKS, SECTION_IDS } from '@/content';
import { DURATION, EASE, gsap, MOTION_QUERIES, revealBlocks, useGSAP } from '@/lib/motion';

const ICON = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const;

function NewTabHint() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

function ContactLine({ className = '' }: { className?: string }) {
  return (
    <p className={`text-sm text-brand-muted ${className}`}>
      Artwork &amp; questions: {CONTACT.name} ·{' '}
      <a
        href={LINKS.telJonathan}
        className="inline-flex min-h-11 items-center font-medium text-brand-primary underline underline-offset-4 hover:text-brand-primary-hover"
      >
        {CONTACT.phoneDisplay}
      </a>
    </p>
  );
}

export default function TvAdvertising() {
  const sectionRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const goldRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const count = countRef.current;
      const gold = goldRef.current;
      if (!section || !count || !gold) return;

      const animate = () => {
        const cleanupReveal = revealBlocks(section);

        gsap.from(gold, {
          scaleX: 0,
          duration: DURATION.slow,
          ease: EASE.enter,
          delay: 0.2,
          scrollTrigger: { trigger: gold, start: 'top 90%', once: true },
        });

        // The digits are aria-hidden; screen readers get the sr-only sentence instead.
        const counter = { value: 0 };
        count.textContent = '0';
        const countUp = gsap.to(counter, {
          value: HOTEL_ROOMS,
          duration: DURATION.slow,
          ease: EASE.enter,
          onUpdate: () => {
            count.textContent = String(Math.round(counter.value));
          },
          scrollTrigger: { trigger: count, start: 'top 85%', once: true },
        });

        return () => {
          cleanupReveal();
          countUp.kill();
          count.textContent = String(HOTEL_ROOMS);
        };
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
      id={SECTION_IDS.tvAds}
      aria-labelledby="tv-ads-title"
      // Focus target for the buttons that scroll here. Not in the Tab order, and no ring around the whole section.
      tabIndex={-1}
      className="section-y bg-brand-blush focus:outline-none"
    >
      <div className="page">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-10">
          <div data-reveal>
            <p className="label text-brand-muted">02 · Meritz Hotel · Exclusive for Bintang tenants</p>
            <h2 id="tv-ads-title" className="h-section mt-4">
              Your ads, <i className="text-brand-primary">our TVs.</i>
            </h2>
          </div>

          <div data-reveal className="lg:justify-self-end">
            <p className="flex items-baseline gap-4">
              <span
                ref={countRef}
                aria-hidden="true"
                className="inline-block min-w-[3ch] font-serif text-[64px] leading-[0.8] tabular-nums text-brand-deep lg:text-[120px]"
              >
                {HOTEL_ROOMS}
              </span>
              <span aria-hidden="true" className="text-sm text-brand-muted">
                hotel rooms
                <br />+ public areas
              </span>
              <span className="sr-only">{HOTEL_ROOMS} hotel rooms and public areas</span>
            </p>
            <p className="mt-4 lg:text-[17px] lg:leading-[26px]">Reach hotel guests during their stay.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[5fr_7fr]">
          <img
            src={hotelRoom}
            width={342}
            height={272}
            loading="lazy"
            decoding="async"
            alt="Meritz Hotel room with a shop advert on the TV"
            className="h-auto w-full max-w-[360px] rounded-[10px]"
          />

          <div>
            <div data-reveal>
              <p className="label text-brand-muted">Special offer</p>
              <p className="mt-2 font-serif text-[28px] leading-tight text-brand-primary lg:text-[36px]">
                Free advertisement for 3 months
              </p>
            </div>

            <div className="mt-6 grid border-t border-brand-line lg:grid-cols-2">
              <div data-reveal className="py-6 lg:pr-6">
                <h3 className="label text-brand-deep">Extend 4th month</h3>
                <p className="mt-2 text-sm text-brand-muted">Standard package</p>
                <p className="mt-2">
                  <span className="font-serif text-[32px] leading-none text-brand-deep lg:text-[40px]">RM300</span>{' '}
                  <span className="text-sm text-brand-muted">/ month</span>
                </p>
              </div>

              <div
                data-reveal
                className="relative border-t border-brand-line py-6 lg:border-l lg:border-t-0 lg:pl-6"
              >
                <span
                  ref={goldRef}
                  aria-hidden="true"
                  className="absolute inset-x-0 -top-px h-0.5 origin-left bg-brand-gold"
                />
                <h3 className="label text-brand-gold-text">Long term option</h3>
                <p className="mt-2 text-sm text-brand-muted">6-month commitment package</p>
                <p className="mt-2">
                  <span className="font-serif text-[32px] leading-none text-brand-deep lg:text-[40px]">RM200</span>{' '}
                  <span className="text-sm text-brand-muted">/ month</span>
                </p>
                <p className="mt-1 text-sm text-brand-muted">(pay for 6 months)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: scan the QR code with a phone. */}
        <div data-reveal className="mt-10 hidden items-center gap-6 border-t border-brand-line pt-10 lg:flex">
          <div className="shrink-0 rounded-[10px] bg-white p-2">
            <img
              src={qrTvAds}
              width={120}
              height={120}
              loading="lazy"
              decoding="async"
              alt="QR code for the Meritz Hotel TV ads registration form"
              className="block h-[120px] w-[120px]"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[26px] leading-tight text-brand-deep">Scan with your phone to register</p>
            <ContactLine className="mt-2" />
          </div>
          <a href={LINKS.tvAdsForm} target="_blank" rel="noopener noreferrer" className="btn-deep shrink-0">
            Open Google Form
            <ArrowUpRight {...ICON} />
            <NewTabHint />
          </a>
        </div>

        {/* Phones: no QR code, the form opens directly. */}
        <div data-reveal className="mt-10 grid gap-2 lg:hidden">
          <a href={LINKS.tvAdsForm} target="_blank" rel="noopener noreferrer" className="btn-deep w-full">
            Register for TV ads
            <ArrowUpRight {...ICON} />
            <NewTabHint />
          </a>
          <a href={LINKS.whatsappJonathan} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
            <MessageCircle {...ICON} />
            WhatsApp {CONTACT.name}
            <NewTabHint />
          </a>
          <ContactLine className="mt-2" />
        </div>
      </div>
    </section>
  );
}
