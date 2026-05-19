import { Link } from 'react-router-dom';

const HERO_IMAGE = {
  src: '/imgHome/nails3.jpeg',
  alt: 'Luxury beauty services at Beauty Rocks',
};

export default function HeroSection() {
  return (
    <section className="services-hero" aria-labelledby="services-hero-title">
      <div className="services-container">
        <div className="services-hero__panel">
          <div className="services-hero__top">
            <div className="services-hero__copy">
              <p className="services-eyebrow services-hero__eyebrow">Our services</p>
              <h1 id="services-hero-title" className="services-hero__title">
                Premium
                <br className="services-hero__title-break" />
                Beauty Services
              </h1>
              <p className="services-hero__lead">
                Luxury treatments designed to make you look and feel your best.
              </p>
            </div>

            <div className="services-hero__visual">
              <img
                className="services-hero__image"
                src={HERO_IMAGE.src}
                alt={HERO_IMAGE.alt}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>

          <div className="services-hero__actions">
            <Link to="/booking" className="services-btn services-btn--primary services-hero__btn">
              Book appointment
            </Link>
            <a href="#services-catalog" className="services-btn services-btn--secondary services-hero__btn">
              Explore services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
