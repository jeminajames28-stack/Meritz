import { useRef } from 'react';
import { ArrowUpRight, CircleCheck, MessageCircle, Phone } from 'lucide-react';
import VoucherTicket from '@/components/ui/VoucherTicket';
import { CONTACT, HOTEL_ROOMS, LINKS } from '@/content';
import { formatDateRange } from '@/lib/format';
import { DURATION, EASE, MOTION_QUERIES, gsap, useGSAP } from '@/lib/motion';
import { HEADING_ID, type VoucherForm } from './draft';

type Props = {
  referenceId: string;
  contactName: string;
  shopName: string;
  vouchers: VoucherForm[];
  onRegisterAnother: () => void;
  onExit: () => void;
};

const NEW_TAB = <span className="sr-only"> (opens in a new tab)</span>;

/** Confirmation after a successful send, with the reference and next steps. */
export default function DoneScreen({
  referenceId,
  contactName,
  shopName,
  vouchers,
  onRegisterAnother,
  onExit,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reference = referenceId.slice(0, 8).toUpperCase();
  const name = contactName.trim();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // The check is fully drawn by default; motion starts each stroke hidden and draws it.
      const draw = (scale: number) => {
        const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
        gsap.utils.toArray<SVGGeometryElement>('[data-check] circle, [data-check] path').forEach((part, index) => {
          const length = part.getTotalLength();
          tl.fromTo(
            part,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: (index === 0 ? DURATION.base : DURATION.fast) * scale,
              clearProps: 'strokeDasharray,strokeDashoffset',
            },
            index === 0 ? 0 : '-=0.15',
          );
        });
        tl.from('[data-reference]', { opacity: 0, y: 8, duration: DURATION.fast, clearProps: 'transform,opacity' }, '<');
      };
      mm.add(MOTION_QUERIES.desktop, () => {
        draw(1);
      });
      mm.add(MOTION_QUERIES.phone, () => {
        draw(0.8);
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
      <div>
        <CircleCheck
          data-check
          aria-hidden="true"
          size={48}
          strokeWidth={1.5}
          absoluteStrokeWidth
          className="text-brand-primary-hover"
        />

        <h1 id={HEADING_ID} tabIndex={-1} className="h-section mt-6 focus:outline-none">
          {name ? `You’re in, ${name}.` : 'You’re in.'}
        </h1>

        <div data-reference className="mt-6">
          <p className="label text-brand-muted">Reference ID</p>
          <p className="mt-2 font-sans text-2xl font-medium tabular-nums tracking-[0.08em] text-brand-deep">{reference}</p>
        </div>

        <p className="mt-6 text-brand-ink lg:text-[17px] lg:leading-[26px]">
          Our campaign team will contact you to confirm your vouchers.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a href={LINKS.whatsappJonathan} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            WhatsApp {CONTACT.name}
            {NEW_TAB}
          </a>
          <a href={LINKS.telJonathan} className="btn-outline">
            <Phone aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            Call {CONTACT.name}
          </a>
          <button type="button" onClick={onRegisterAnother} className="btn-outline">
            Register another shop
          </button>
          <button type="button" onClick={onExit} className="btn-outline">
            Back to page
          </button>
        </div>

        <p className="mt-10 border-t border-brand-line pt-6">
          <a
            href={LINKS.tvAdsForm}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-serif text-2xl leading-tight text-brand-primary underline decoration-1 underline-offset-4 transition-colors hover:text-brand-primary-hover motion-reduce:transition-none"
          >
            Want your ad in {HOTEL_ROOMS} hotel rooms too?
            <ArrowUpRight aria-hidden="true" strokeWidth={1.5} className="h-5 w-5 shrink-0" />
            {NEW_TAB}
          </a>
        </p>
      </div>

      {vouchers.length > 0 && (
        <ul aria-label="Your vouchers" className="space-y-6">
          {vouchers.map((voucher) => (
            <li key={voucher.id}>
              <VoucherTicket
                shopName={shopName}
                detail={voucher.title.trim()}
                value={voucher.discount_value}
                meta={formatDateRange(voucher.valid_from, voucher.valid_until) || undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
