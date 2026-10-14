import { useRef } from 'react';
import { DURATION, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  shopName: string;
  value: string;
  /** Offer title or short description under the shop name. */
  detail?: string;
  /** Small label above the shop name, e.g. "Voucher preview". */
  label?: string;
  /** Extra line, e.g. the validity dates. */
  meta?: string;
  size?: Size;
  /** Colour of the background behind the card, so the notches look cut out. */
  notch?: string;
  /** Give the value a small "tick" when it changes (live preview). */
  animateValue?: boolean;
  className?: string;
};

const NAME_SIZE: Record<Size, string> = {
  sm: 'text-lg',
  md: 'text-[22px]',
  lg: 'text-[26px]',
};

const VALUE_SIZE: Record<Size, string> = {
  sm: 'text-2xl',
  md: 'text-[30px]',
  lg: 'text-[34px]',
};

/** Ticket-style voucher card shared by the landing page, the live form preview, Review and Done. */
export default function VoucherTicket({
  shopName,
  value,
  detail,
  label,
  meta,
  size = 'md',
  notch,
  animateValue = false,
  className = '',
}: Props) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const firstRender = useRef(true);

  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      if (!animateValue || prefersReducedMotion() || !valueRef.current) return;
      gsap.fromTo(
        valueRef.current,
        { scale: 1.04 },
        { scale: 1, duration: DURATION.fast * 0.7, ease: 'power2.out', overwrite: true },
      );
    },
    { dependencies: [value] },
  );

  const shownValue = value.trim() || '%';
  const longValue = shownValue.length > 6;

  return (
    <div
      className={`ticket ${className}`}
      style={notch ? ({ '--notch': notch } as React.CSSProperties) : undefined}
    >
      <div className="min-w-0 p-4">
        {label && <p className="label mb-2 text-brand-gold-text">{label}</p>}
        <p className={`truncate font-serif leading-tight text-brand-deep ${NAME_SIZE[size]}`}>
          {shopName.trim() || 'Your Shop'}
        </p>
        {detail && <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-brand-muted">{detail}</p>}
        {meta && <p className="mt-1 text-xs leading-4 text-brand-muted">{meta}</p>}
      </div>
      <div className="ticket-stub">
        <span
          ref={valueRef}
          className={`block text-center font-serif leading-none text-brand-primary [overflow-wrap:anywhere] ${
            longValue ? 'text-lg' : VALUE_SIZE[size]
          }`}
        >
          {shownValue}
        </span>
      </div>
    </div>
  );
}
