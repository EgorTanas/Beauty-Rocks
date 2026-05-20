import { motion, useReducedMotion } from 'framer-motion';
import { catalogItem, catalogStagger, sectionReveal } from '../common/motionVariants';

export default function BenefitsSection() {
  const reduceMotion = useReducedMotion();
  const benefits = [
    {
      title: 'Premium Products',
      desc: 'Professional nail and hair formulas chosen for lasting finish and salon-grade results.',
    },
    {
      title: 'Experienced Stylists',
      desc: 'Artists skilled in nails, color, cuts, and bridal looks — precise hands, editorial eye.',
    },
    {
      title: 'Personalized Beauty',
      desc: 'Every visit shaped around your style, occasion, and the finish you want to leave with.',
    },
    {
      title: 'Relaxing Atmosphere',
      desc: 'A calm studio rhythm — unhurried chairs, soft light, and service that feels considered.',
    },
  ];

  return (
    <motion.section
      className="services-benefits"
      aria-labelledby="services-benefits-title"
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-12%' }}
      variants={sectionReveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="services-container">
        <h2 id="services-benefits-title" className="visually-hidden">
          Why choose Beauty Rocks
        </h2>
        <motion.ul
          className="services-benefits__list"
          variants={catalogStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-8%' }}
        >
          {benefits.map(({ title, desc }) => (
            <motion.li key={title} className="services-benefits__item" variants={catalogItem}>
              <span className="services-benefits__icon" aria-hidden />
              <h3 className="services-benefits__title">{title}</h3>
              <p className="services-benefits__desc">{desc}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.section>
  );
}
