import { motion } from 'framer-motion';

export default function GalleryCard({ label, tag, image, position, index = 0, reduceMotion = false }) {
  return (
    <motion.figure
      className="br-gallery-cell"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={reduceMotion ? undefined : { scale: 1.015 }}
    >
      <motion.img
        className="br-gallery-img"
        src={image}
        alt={`${label} at Beauty Rocks`}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: position }}
        whileHover={reduceMotion ? undefined : { scale: 1.08 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      />
      <figcaption className="br-gallery-cap">
        <span className="br-gallery-tag">{tag}</span>
        <span className="br-gallery-title">{label}</span>
      </figcaption>
    </motion.figure>
  );
}
