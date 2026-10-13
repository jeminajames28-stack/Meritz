import { motion } from 'framer-motion';
import { UtensilsCrossed, Shirt, Smartphone, Sparkles, Home, Gamepad2 } from 'lucide-react';
import { fadeUpVariant, staggerContainer, transition } from '@/lib/animations';
import { useInView } from '@/lib/hooks';
import foodImage from '@/images/Fnb.jpg';
import fashionImage from '@/images/fashion.jpg';
import electronicsImage from '@/images/electronics.jpg';
import beautyImage from '@/images/beauty.jpg';
import homeImage from '@/images/home.jpg';
import bowlingImage from '@/images/bowling.jpg';

const categories = [
  {
    icon: UtensilsCrossed,
    title: 'Food & Beverage',
    image: foodImage,
    desc: 'Over 40 dining establishments',
  },
  {
    icon: Shirt,
    title: 'Fashion & Apparel',
    image: fashionImage,
    desc: '200+ branded retail shops',
  },
  {
    icon: Smartphone,
    title: 'Electronics',
    image: electronicsImage,
    desc: 'Latest gadgets and tech',
  },
  {
    icon: Sparkles,
    title: 'Health & Beauty',
    image: beautyImage,
    desc: 'Wellness and beauty services',
  },
  {
    icon: Home,
    title: 'Home & Living',
    image: homeImage,
    desc: 'Everything for your home',
  },
  {
    icon: Gamepad2,
    title: 'Entertainment',
    image: bowlingImage,
    desc: 'Bowling, cinema, and more',
  },
];

export default function Categories() {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <section className="py-24 bg-white">
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
            Celebrating Every Category
          </motion.h2>
          <motion.p
            variants={fadeUpVariant}
            transition={transition}
            className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto"
          >
            From dining to fashion to entertainment — all tenants are welcome to participate
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.title}
              variants={fadeUpVariant}
              transition={transition}
              className="group relative rounded-2xl overflow-hidden h-64 cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="w-10 h-10 rounded-lg bg-[#a20f43]/90 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <cat.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{cat.title}</h3>
                <p className="text-sm text-stone-300 mt-1">{cat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
