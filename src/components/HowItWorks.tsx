import { motion } from 'framer-motion';
import { Store, Ticket, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { fadeUpVariant, staggerContainer, transition } from '@/lib/animations';
import { useInView } from '@/lib/hooks';

const steps = [
  {
    icon: Store,
    title: 'Register Your Shop',
    description: 'Tell us about your store — name, unit number, category, and contact details.',
  },
  {
    icon: Ticket,
    title: 'Add Vouchers',
    description: 'Create one or more special offers with discounts, validity dates, and terms.',
  },
  {
    icon: ClipboardCheck,
    title: 'Review & Submit',
    description: 'Double-check everything before submitting. Edit any detail if needed.',
  },
  {
    icon: CheckCircle2,
    title: 'Confirmation',
    description: 'Get a confirmation screen with your registration details and reference.',
  },
];

export default function HowItWorks() {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <section className="py-24 bg-stone-50">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeUpVariant}
            transition={transition}
            className="text-4xl font-bold text-stone-900"
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={fadeUpVariant}
            transition={transition}
            className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto"
          >
            Four simple steps to join our 30th anniversary celebration
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              variants={fadeUpVariant}
              transition={transition}
              className="relative bg-white rounded-2xl p-6 shadow-sm border border-stone-200/60 hover:shadow-lg hover:border-[#b1124a]/50 transition-all duration-300 group"
            >
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#5a0d2a] text-white text-sm font-bold flex items-center justify-center">
                {idx + 1}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#b1124a]/15 to-[#7a1236]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <step.icon className="w-6 h-6 text-[#7a1236]" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">{step.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
