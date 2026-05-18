import { motion } from 'framer-motion';

export default function TeamPreviewCard({ name, role, initials, index = 0, reduceMotion = false }) {
  return (
    <motion.article
      className="br-team-preview-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.22 } }}
    >
      <span className="br-team-preview-avatar" aria-hidden>
        {initials}
      </span>
      <h3 className="br-team-preview-name">{name}</h3>
      <p className="br-team-preview-role">{role}</p>
    </motion.article>
  );
}
