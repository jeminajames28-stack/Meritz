import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import bintangLogo from '@/images/logo_b.png';
import meritzLogo from '@/images/m_logo.png';
import hotelRoom from '@/images/optimised/hotel-room.webp';
import { REGISTRATION_DEADLINE, SECTION_IDS } from '@/content';
import { formatDate } from '@/lib/format';
import { DURATION, EASE, MOTION_QUERIES, STAGGER, SplitText, gsap, useGSAP } from '@/lib/motion';

type Props = {
  onRegister: () => void;
  onTvAds: () => void;
};

export default function Hero({ onRegister, onTvAds }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const mainDriftRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const hotelDriftRef = useRef<HTMLDivElement>(null);
  const hotelRef = useRef<HTMLDivElement>(null);

  // Focus follows the scroll, so keyboard and screen reader users land in section 02 too.
  const goToTvAds = () => {
    onTvAds();
    document.getElementById(SECTION_IDS.tvAds)?.focus({ preventScroll: true });
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      const label = labelRef.current;
      const title = titleRef.current;
      const logo = logoRef.current;
      const actions = actionsRef.current;
      const mainDrift = mainDriftRef.current;
      const photo = photoRef.current;
      const hotelDrift = hotelDriftRef.current;
      const hotel = hotelRef.current;
      if (!section || !label || !title || !logo || !actions || !mainDrift || !photo || !hotelDrift || !hotel) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.desktop, () => {
        const tl = gsap.timeline({ defaults: { ease: EASE.enter } });

        tl.from(label, { autoAlpha: 0, y: 16, duration: DURATION.base }, 0)
          .from([logo, actions], { autoAlpha: 0, y: 16, duration: DURATION.base, stagger: 0.1 }, 0.4)
          .fromTo(
            photo,
            { clipPath: 'inset(18% 0 0 0 round 10px)' },
            { clipPath: 'inset(0% 0 0 0 round 10px)', duration: 1.1 },
            0.05,
          )
          .from(hotel, { autoAlpha: 0, y: 24, duration: DURATION.base }, 0.5);

        // autoSplit re-splits once the web font has loaded; returning the tween keeps its progress.
        const split = SplitText.create(title, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(self.masks, { paddingBottom: '0.15em', marginBottom: '-0.15em' });
            const rise = gsap.from(self.lines, {
              yPercent: 120,
              duration: 0.9,
              stagger: 0.1,
              ease: EASE.enter,
            });
            tl.add(rise, 0.1);
            return rise;
          },
        });
        // The split is only needed for the intro; plain text afterwards keeps the heading simple.
        tl.eventCallback('onComplete', () => split.revert());

        const drift = {
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
        };
        gsap.to(mainDrift, { y: -12, ...drift });
        gsap.to(hotelDrift, { y: -24, ...drift });
      });

      // Phones: text only. The photo is the largest paint on the first screen, so it is left alone.
      mm.add(MOTION_QUERIES.phone, () => {
        gsap.timeline().from([label, title, logo, actions], {
          autoAlpha: 0,
          y: 16,
          duration: DURATION.base,
          ease: EASE.enter,
          stagger: STAGGER,
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="hero" aria-labelledby="hero-title" className="flex min-h-[88svh] flex-col">
      <div className="page flex flex-1 flex-col pt-6">
        <img
          src={meritzLogo}
          alt="Meritz Hotel"
          width={699}
          height={357}
          className="h-12 w-auto self-start lg:h-16"
        />

        <div className="grid flex-1 content-start gap-6 pt-10 lg:grid-cols-[7fr_5fr] lg:content-center lg:items-center lg:gap-10 lg:pb-10 lg:pt-16">
          <div>
            <p ref={labelRef} className="label text-brand-gold-text">
              Bintang Megamall × Meritz Hotel
            </p>
            <h1 ref={titleRef} id="hero-title" className="h-hero mt-4">
              Exclusive Opportunity <i className="text-brand-primary">for Bintang Tenants</i>
            </h1>
            <img
              ref={logoRef}
              src={bintangLogo}
              alt="Bintang Megamall"
              width={796}
              height={313}
              className="mt-6 block h-14 w-auto lg:mt-8 lg:h-[72px]"
            />

            <div ref={actionsRef} className="mt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <button type="button" onClick={onRegister} className="btn-primary">
                  Register your shop
                  <span className="btn-arrow">
                    <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </button>
                {/* The underline sits on the text, not on the 44 px tall hit area. */}
                <button type="button" onClick={goToTvAds} className="text-link self-center border-b-0 pb-0 sm:self-auto">
                  <span className="underline decoration-1 underline-offset-4">Advertise on hotel TVs</span>
                </button>
              </div>
              {REGISTRATION_DEADLINE && (
                <p className="mt-6 inline-flex rounded-full bg-brand-soft px-4 py-2 text-[13px] font-medium text-brand-deep">
                  Registration closes {formatDate(REGISTRATION_DEADLINE)}
                </p>
              )}
            </div>
          </div>

          <div className="relative lg:pb-10 lg:pl-10">
            <div
              ref={mainDriftRef}
              className="rounded-[10px] lg:outline lg:outline-1 lg:outline-offset-[6px] lg:outline-brand-line"
            >
              <div ref={photoRef} className="overflow-hidden rounded-[10px]">
                {/* Same media, candidates and sizes as the two preloads in index.html, so each download is reused.
                    Phones never get the 1188 px file, which keeps them under 100 KB even on 3x screens. */}
                <picture>
                  <source
                    media="(min-width: 1024px)"
                    type="image/webp"
                    srcSet="/hero/mall-640.webp 640w, /hero/mall-960.webp 960w, /hero/mall-1188.webp 1188w"
                    sizes="480px"
                  />
                  <img
                    src="/hero/mall-960.webp"
                    srcSet="/hero/mall-640.webp 640w, /hero/mall-960.webp 960w"
                    sizes="calc(100vw - 48px)"
                    width={1188}
                    height={865}
                    // Lowercase: React 18 does not know fetchPriority and would warn.
                    {...{ fetchpriority: 'high' }}
                    decoding="async"
                    alt="Aerial view of Bintang Megamall with the Meritz Hotel tower"
                    className="block aspect-[3/2] w-full object-cover lg:aspect-[4/5] lg:object-[62%_50%]"
                  />
                </picture>
              </div>
            </div>

            <div ref={hotelDriftRef} className="absolute bottom-0 left-0 hidden w-[48%] lg:block">
              <div ref={hotelRef} className="overflow-hidden rounded-[10px] border-[6px] border-brand-surface">
                <img
                  src={hotelRoom}
                  width={342}
                  height={272}
                  loading="lazy"
                  decoding="async"
                  alt="Meritz Hotel room with a shop advert on the TV"
                  className="block aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
