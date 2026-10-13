import { motion } from 'framer-motion';
import {
  BadgeDollarSign,
  Eye,
  Hotel,
  Megaphone,
  Palette,
  QrCode,
  Users,
} from 'lucide-react';
import { fadeUpVariant, staggerContainer, transition } from '@/lib/animations';
import { useInView } from '@/lib/hooks';

type PromoSectionProps = {
  onRegister: () => void;
};

const QR_CODE_URL =
  'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=https%3A%2F%2Fbintangmegamall.com%2F%23promo-registration';

const benefits = [
  { icon: Eye, title: 'Increase Visibility', text: 'Put your brand in front of hotel guests.' },
  { icon: Users, title: 'Reach Hotel Guests', text: 'Connect with guests throughout their stay.' },
  { icon: BadgeDollarSign, title: 'Affordable & Effective', text: 'A practical way to promote your business.' },
  { icon: Megaphone, title: 'Promote Easily', text: 'Share your message across hotel TVs.' },
];

export default function PromoSection({ onRegister }: PromoSectionProps) {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <section id="promo-registration" className="relative overflow-hidden bg-[#fff8fa] py-24">
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#b1124a]/10 blur-3xl" />
      <div className="absolute -right-32 bottom-12 h-80 w-80 rounded-full bg-[#7a1236]/10 blur-3xl" />
      <div ref={ref} className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-14 text-center"
        >
          <motion.p variants={fadeUpVariant} transition={transition} className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#a20f43]">
            Exclusive for Bintang Megamall Tenants
          </motion.p>
          <motion.h2 variants={fadeUpVariant} transition={transition} className="text-4xl font-bold tracking-tight text-[#5a0d2a] md:text-5xl">
            Your Ads, Our TVs
          </motion.h2>
          <motion.p variants={fadeUpVariant} transition={transition} className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#6f5360]">
            Advertise on hotel TVs at Meritz Hotel and reach our guests during their stay.
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeUpVariant}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={transition}
          className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="rounded-[2rem] bg-[#7a1236] p-8 text-white shadow-xl shadow-[#7a1236]/15 md:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f5b2c8]">Special offer</p>
                <h3 className="text-2xl font-bold">Free advertisement for 3 months</h3>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-black/10 p-5">
                <Hotel className="mb-4 h-7 w-7 text-[#f5b2c8]" />
                <p className="font-semibold">Your ads displayed on our TVs</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">Shown on different floors throughout Meritz Hotel.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/10 p-5">
                <Users className="mb-4 h-7 w-7 text-[#f5b2c8]" />
                <p className="font-semibold">Reach 290 hotel rooms</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">Connect with hotel guests and public areas during their stay.</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-5 text-[#5a0d2a]">
              <div className="flex items-center gap-3">
                <Palette className="h-6 w-6 text-[#a20f43]" />
                <p className="font-bold">Artwork submission</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#6f5360]">Submit your promotional artwork and let’s promote together.</p>
              <p className="mt-3 text-sm font-semibold text-[#a20f43]">Jonathan · +60 10 978 0807</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#edc5d2] bg-white p-8 shadow-xl shadow-[#7a1236]/10 md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a20f43]">Choose your package</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-[#fff0f4] p-5">
                <p className="font-bold text-[#5a0d2a]">Extend 4th Month</p>
                <p className="mt-1 text-sm text-[#6f5360]">Standard package</p>
                <p className="mt-3 text-3xl font-bold text-[#a20f43]">RM300 <span className="text-sm font-medium text-[#6f5360]">/ month</span></p>
              </div>
              <div className="rounded-2xl bg-[#5a0d2a] p-5 text-white">
                <p className="font-bold">Long Term Option</p>
                <p className="mt-1 text-sm text-white/70">6-month commitment package · pay for 6 months</p>
                <p className="mt-3 text-3xl font-bold text-[#f5b2c8]">RM200 <span className="text-sm font-medium text-white/70">/ month</span></p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center rounded-2xl border border-[#edc5d2] bg-[#fff8fa] p-5 text-center">
              <img src={QR_CODE_URL} alt="QR code to register for the Meritz Hotel TV advertising promotion" className="h-44 w-44 rounded-xl bg-white p-2" />
              <div className="mt-4 flex items-center gap-2 text-[#5a0d2a]">
                <QrCode className="h-5 w-5" />
                <p className="font-bold">Scan to register</p>
              </div>
              <p className="mt-1 text-sm text-[#6f5360]">Or use the button below to submit your tenant details.</p>
              <button onClick={onRegister} className="mt-5 w-full rounded-xl bg-[#a20f43] px-5 py-3 font-semibold text-white transition hover:bg-[#7a1236] hover:shadow-lg hover:shadow-[#a20f43]/20">
                Register for this promo
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit) => (
            <motion.div key={benefit.title} variants={fadeUpVariant} transition={transition} className="rounded-2xl border border-[#edc5d2] bg-white p-5 text-center">
              <benefit.icon className="mx-auto h-7 w-7 text-[#a20f43]" />
              <h3 className="mt-3 font-bold text-[#5a0d2a]">{benefit.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#6f5360]">{benefit.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
