import { motion, useReducedMotion } from 'framer-motion';
import { adminReveal } from './adminMotionVariants';

export function AdminReveal({ children, className, as = 'div', delay = 0 }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] ?? motion.div;

  if (reduce) {
    const Tag = as === 'header' ? 'header' : as === 'section' ? 'section' : 'div';
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Comp
      className={className}
      initial="hidden"
      animate="visible"
      variants={adminReveal}
      transition={{ delay }}
    >
      {children}
    </Comp>
  );
}

export function AdminHeader({ children, className = 'adm-dash-header' }) {
  return (
    <AdminReveal as="header" className={className}>
      {children}
    </AdminReveal>
  );
}
