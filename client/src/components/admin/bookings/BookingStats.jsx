import { motion, useReducedMotion } from 'framer-motion';
import { CalendarCheck, CheckCircle2, Clock, Sparkles, XCircle } from 'lucide-react';
import { adminItem, adminStagger } from '../adminMotionVariants';

const STAT_CARDS = [
  { key: 'total', label: 'Total bookings', icon: Sparkles },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CalendarCheck },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export default function BookingStats({ stats }) {
  const reduce = useReducedMotion();
  const Wrapper = reduce ? 'div' : motion.div;

  return (
    <Wrapper
      className="adm-bk-stats"
      aria-label="Booking statistics"
      {...(reduce ? {} : { initial: 'hidden', animate: 'visible', variants: adminStagger })}
    >
      {STAT_CARDS.map(({ key, label, icon: Icon }) => {
        const value = stats[key] ?? 0;
        const Card = reduce ? 'article' : motion.article;

        return (
          <Card
            key={key}
            className={`adm-bk-stat adm-bk-stat--${key}`}
            {...(reduce ? {} : { variants: adminItem })}
          >
            <span className="adm-bk-stat__icon" aria-hidden>
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <div>
              {reduce ? (
                <p className="adm-bk-stat__value">{value}</p>
              ) : (
                <motion.p
                  key={value}
                  className="adm-bk-stat__value"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  {value}
                </motion.p>
              )}
              <p className="adm-bk-stat__label">{label}</p>
            </div>
          </Card>
        );
      })}
    </Wrapper>
  );
}
