import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Categories from '@/components/Categories';
import PromoSection from '@/components/PromoSection';
import RegistrationForm from '@/components/RegistrationForm';
import Footer from '@/components/Footer';
import logo from '@/images/m_logo.png';
import { supabase, type TenantInput, type VoucherInput } from '@/lib/supabase';

type View = 'landing' | 'register';

export default function App() {
  const [view, setView] = useState<View>('landing');

  async function handleSubmit(
    tenant: TenantInput,
    vouchers: VoucherInput[]
  ): Promise<{ id: string }> {
    // Saves the shop and its vouchers in one step. Visitors have no direct
    // access to the tables; see supabase/migrations/*_secure_tenant_registration.sql
    const { data: tenantId, error } = await supabase.rpc('register_tenant', {
      p_tenant: {
        shop_name: tenant.shop_name,
        unit_lot_number: tenant.unit_lot_number,
        category: tenant.category,
        contact_person: tenant.contact_person,
        phone: tenant.phone,
        email: tenant.email,
      },
      p_vouchers: vouchers.map((v) => ({
        title: v.title,
        discount_value: v.discount_value,
        description: v.description,
        valid_from: v.valid_from,
        valid_until: v.valid_until,
        quantity: v.quantity,
        terms: v.terms,
      })),
    });

    if (error || !tenantId) {
      throw new Error(
        error?.message || 'Failed to register shop. Please try again.'
      );
    }

    return { id: tenantId as string };
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky nav bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#5a0d2a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setView('landing')}
            className="flex items-center gap-2.5 group"
          >
            <img
              src={logo}
              alt="Bintang Megamall 30th Anniversary"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </button>

          <div className="flex items-center gap-4">
            <a
              href="https://bintangmegamall.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-300 hover:text-white text-sm hidden sm:block transition-colors"
            >
              Mall Website
            </a>
            {view === 'register' ? (
              <button
                onClick={() => setView('landing')}
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                Home
              </button>
            ) : (
              <button
                onClick={() => setView('register')}
                className="px-5 py-2 rounded-lg bg-[#a20f43] text-white text-sm font-semibold hover:bg-[#7a1236] hover:scale-105 transition-all"
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-16">
              <Hero onStart={() => setView('register')} />
              <HowItWorks />
              <Categories />
              <PromoSection onRegister={() => setView('register')} />

              {/* CTA section */}
              <section className="py-24 bg-gradient-to-br from-[#5a0d2a] via-[#7a1236] to-[#5a0d2a] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#f5b2c8]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#edc5d2]/10 rounded-full blur-3xl" />
                <div className="relative max-w-3xl mx-auto px-6 text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-white">
                    Ready to Join the Celebration?
                  </h2>
                  <p className="mt-4 text-lg text-stone-300 max-w-xl mx-auto">
                    Register your shop and add your anniversary vouchers today.
                    Be part of Miri's biggest shopping event.
                  </p>
                  <button
                    onClick={() => setView('register')}
                    className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#a20f43] text-white font-semibold text-lg shadow-lg shadow-[#a20f43]/25 hover:bg-[#b1124a] hover:scale-105 transition-all duration-300"
                  >
                    Start Registration
                  </button>
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-16">
              <RegistrationForm onSubmit={handleSubmit} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
