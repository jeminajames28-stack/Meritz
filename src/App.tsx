import { lazy, Suspense, useCallback } from 'react';
import Hero from '@/components/landing/Hero';
import ShopTenants from '@/components/landing/ShopTenants';
import TvAdvertising from '@/components/landing/TvAdvertising';
import Closing from '@/components/landing/Closing';
import Footer from '@/components/landing/Footer';
import FloatingActions from '@/components/landing/FloatingActions';
import { SECTION_IDS } from '@/content';
import { scrollToSection } from '@/lib/motion';
import { useHashView } from '@/lib/useHashView';

// The form and the Supabase client load only when the registration screen opens.
const RegistrationFlow = lazy(() => import('@/components/register/RegistrationFlow'));

export default function App() {
  const { view, openRegister, openLanding } = useHashView();
  const goToTvAds = useCallback(() => scrollToSection(SECTION_IDS.tvAds), []);

  if (view === 'register') {
    return (
      <Suspense fallback={<div className="min-h-svh bg-brand-surface" />}>
        <RegistrationFlow onExit={openLanding} />
      </Suspense>
    );
  }

  return (
    <>
      <main id="main">
        <Hero onRegister={openRegister} onTvAds={goToTvAds} />
        <FloatingActions onRegister={openRegister} onTvAds={goToTvAds} />
        <ShopTenants onRegister={openRegister} />
        <TvAdvertising />
        <Closing onRegister={openRegister} />
      </main>
      <Footer />
    </>
  );
}
