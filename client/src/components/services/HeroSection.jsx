import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="services-hero" aria-labelledby="services-hero-title">
      <div className="services-container services-hero__grid">
        <div className="services-hero__copy">
          <p className="services-eyebrow">Beauty Rocks Studio</p>
          <h1 id="services-hero-title" className="services-hero__title">
            Luxury Nails, Hair &amp; Styling
          </h1>
          <p className="services-hero__lead">
            A Los Angeles beauty studio devoted to manicure, pedicure, hair, and bridal styling — polished looks,
            premium products, and calm, confident service.
          </p>
          <div className="services-hero__actions">
            <Link to="/booking" className="services-btn services-btn--primary">
              Book appointment
            </Link>
            <a href="#services-grid" className="services-btn services-btn--secondary">
              Explore services
            </a>
          </div>
        </div>
        <div className="services-hero__visual">
          <img
            className="services-hero__image"
            src="/imgHome/nails3.jpeg"
            alt="Luxury nail and hair styling at Beauty Rocks"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
