import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="services-cta" aria-labelledby="services-cta-title">
      <div className="services-container services-cta__inner">
        <div className="services-cta__copy">
          <p className="services-eyebrow">Ready to glow?</p>
          <h2 id="services-cta-title" className="services-cta__title">Book your appointment today</h2>
          <p className="services-cta__lead">
            Reserve nails, hair, or bridal styling online — we will tailor your visit around you.
          </p>
        </div>
        <Link to="/booking" className="services-btn services-btn--primary services-btn--lg">
          Book appointment
        </Link>
      </div>
    </section>
  );
}
