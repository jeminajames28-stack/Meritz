import LogoLockup from '@/components/ui/LogoLockup';
import { CONTACT, LINKS } from '@/content';

const MALL_LINKS = [
  { label: 'Official website', href: LINKS.mallWebsite },
  { label: 'Directory', href: LINKS.mallDirectory },
  { label: 'Contact', href: LINKS.mallContact },
];

/** Light footer so both logos stay readable. On phones it leaves room for the bottom bar. */
export default function Footer() {
  return (
    <footer className="border-t border-brand-line bg-brand-surface pb-[calc(48px_+_env(safe-area-inset-bottom))] lg:pb-0">
      <div className="page">
        <div className="flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
          <LogoLockup size="sm" />
          <nav aria-label="Bintang Megamall">
            <ul role="list" className="flex flex-wrap gap-x-6">
              {MALL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-brand-deep underline-offset-4 transition-colors hover:text-brand-primary hover:underline"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-brand-line py-6 text-[13px] text-brand-muted lg:flex-row lg:items-center lg:justify-between">
          <p>
            Artwork &amp; questions: {CONTACT.name} ·{' '}
            <a
              href={LINKS.telJonathan}
              className="inline-flex min-h-11 items-center font-medium text-brand-primary underline underline-offset-4 hover:text-brand-primary-hover"
            >
              {CONTACT.phoneDisplay}
            </a>
          </p>
          <p>© 2026 Bintang Megamall · Meritz Hotel</p>
        </div>
      </div>
    </footer>
  );
}
