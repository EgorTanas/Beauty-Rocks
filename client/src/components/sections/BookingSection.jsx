import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import ReusableButton from '../common/ReusableButton';
import { sectionReveal } from '../common/motionVariants';

export default function BookingSection() {
  return (
<motion.section
      id="contact"
      className="br-section br-section--contact br-section--contact-luxury"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-12%' }}
      variants={sectionReveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >

        <div className="br-container">
          <div className="br-contact-luxury">
            <div className="br-contact-luxury-main">
              <p className="br-badge br-badge--contact">
                <MapPin size={14} strokeWidth={1.6} className="br-badge-icon" aria-hidden />
                <span>Visit the studio</span>
              </p>
              <p className="br-contact-eyebrow">Get in touch</p>
              <h2 className="br-contact-display">
                Los Angeles,
                <br />
                reimagined.
              </h2>
              <p className="br-contact-slogan">
                A quiet suite for nails, hair, and color — book online and we&apos;ll shape the visit around you.
              </p>
              <ReusableButton to="/booking" variant="solid" startAppt icon iconSize={20}>
                Start your appointment
              </ReusableButton>
            </div>
            <aside className="br-contact-luxury-aside" aria-label="Studio details">
              <div className="br-contact-meta">
                <h3 className="br-contact-meta-title">Location</h3>
                <p className="br-contact-meta-text">456 Beauty Lane</p>
                <p className="br-contact-meta-text">Los Angeles, CA 90001</p>
              </div>
              <div className="br-contact-meta">
                <h3 className="br-contact-meta-title">Hours</h3>
                <p className="br-contact-meta-text">Mon – Sat · 10am – 8pm</p>
                <p className="br-contact-meta-text">Sunday · 11am – 6pm</p>
              </div>
              <div className="br-contact-meta">
                <h3 className="br-contact-meta-title">Reach us</h3>
                <p className="br-contact-meta-text">
                  <a href="tel:+13235556245">+1 (323) 555-6245</a>
                </p>
                <p className="br-contact-meta-text">
                  <a href="mailto:hello@beautyrocks.studio">hello@beautyrocks.studio</a>
                </p>
              </div>
            </aside>
          </div>
        </div>
    </motion.section>
  );
}
