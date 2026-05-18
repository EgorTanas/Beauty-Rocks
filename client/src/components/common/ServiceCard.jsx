import { motion } from 'framer-motion';

export default function ServiceCard({ title, desc, price, Icon, index = 0, reduceMotion = false }) {
  return (
    <motion.article
      className="br-card br-card--luxury"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
      whileHover={reduceMotion ? undefined : { y: -8, transition: { duration: 0.22 } }}
    >
      <div className="br-card-top">
        <span className="br-card-icon" aria-hidden>
          <Icon size={22} strokeWidth={1.6} />
        </span>
        <h3 className="br-card-title">{title}</h3>
      </div>
      <p className="br-card-desc">{desc}</p>
      <p className="br-card-price">{price}</p>
    </motion.article>
  );
}
