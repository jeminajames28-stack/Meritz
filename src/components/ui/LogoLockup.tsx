import bintangLogo from '@/images/logo_b.png';
import meritzLogo from '@/images/optimised/logo-meritz.webp';

type Props = {
  /** Height of the Bintang logo in px; the Meritz logo is sized to match visually. */
  size?: 'sm' | 'md';
  className?: string;
};

/** Bintang Megamall and Meritz Hotel logos side by side. Light backgrounds only. */
export default function LogoLockup({ size = 'md', className = '' }: Props) {
  const bintangH = size === 'sm' ? 26 : 32;
  const meritzH = size === 'sm' ? 20 : 25;
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img
        src={bintangLogo}
        alt="Bintang Megamall"
        height={bintangH}
        width={Math.round((796 / 313) * bintangH)}
        style={{ height: bintangH, width: 'auto' }}
      />
      <span aria-hidden="true" className="h-6 w-px bg-brand-line" />
      <img
        src={meritzLogo}
        alt="Meritz Hotel"
        height={meritzH}
        width={Math.round((196 / 100) * meritzH)}
        style={{ height: meritzH, width: 'auto' }}
      />
    </div>
  );
}
