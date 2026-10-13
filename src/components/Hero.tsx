import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, ArrowRight, PartyPopper } from 'lucide-react';
import { fadeUpVariant, staggerContainer, transition } from '@/lib/animations';
import heroImage from '@/images/new.png';
import logo30 from '@/images/m_logo.png';

const HERO_IMAGE = heroImage;

const CONFETTI_IMAGE =
  'https://images.pexels.com/photos/5715242/pexels-photo-5715242.jpeg?auto=compress&cs=tinysrgb&w=800';

type HeroProps = {
  onStart: () => void;
};

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Bintang Megamall interior"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floating confetti accents */}
      <motion.div
        className="absolute top-20 right-[8%] w-28 h-28 rounded-full bg-[#b1124a]/20 blur-2xl"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-32 left-[10%] w-40 h-40 rounded-full bg-[#7a1236]/20 blur-3xl"
        animate={{ y: [0, 25, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div
            variants={fadeUpVariant}
            transition={transition}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b1124a]/30 border border-[#edc5d2]/60 text-black text-sm font-bold mb-6 backdrop-blur-md drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)]"
          >
            <PartyPopper className="w-4 h-4" />
            30th Anniversary Celebration  
          </motion.div>

          <motion.div
            variants={fadeUpVariant}
            transition={transition}
            className="relative"
          >
            <img
              src={logo30}
              alt="Bintang Megamall 30 Years of Excellence"
              className="relative mx-auto w-[28rem] sm:w-[34rem] md:w-[42rem] h-auto object-contain"
            />
          </motion.div>

          <motion.p
            variants={fadeUpVariant}
            transition={transition}
            className="mt-6 text-lg md:text-xl text-black max-w-2xl leading-relaxed font-medium drop-shadow-[0_1px_6px_rgba(255,255,255,0.8)]"
          >
           Exclusive Opportunity for Bintang Tenants
          </motion.p>

          <motion.div
            variants={fadeUpVariant}
            transition={transition}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#a20f43] text-white font-semibold text-lg shadow-lg shadow-[#a20f43]/25 hover:bg-[#7a1236] hover:shadow-xl hover:shadow-[#a20f43]/40 hover:scale-105 transition-all duration-300"
            >
              Register Your Shop
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://bintangmegamall.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-black font-medium text-lg hover:bg-white/40 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]"
            >
              <ShoppingBag className="w-5 h-5" />
              Register
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={fadeUpVariant}
            transition={transition}
            className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16"
          >
            {[
              { value: '30', label: 'Years' },
              { value: '200+', label: 'Retail Shops' },
              { value: '40+', label: 'F&B Outlets' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-[#7a1236]">{stat.value}</div>
                <div className="text-sm text-black/80 mt-1 font-medium drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Confetti image strip at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7a1236] via-[#b1124a] to-[#7a1236]" />

      <img
        src={CONFETTI_IMAGE}
        alt=""
        aria-hidden
        className="absolute bottom-4 right-4 w-32 opacity-30 rounded-lg pointer-events-none hidden md:block"
      />
    </section>
  );
}
