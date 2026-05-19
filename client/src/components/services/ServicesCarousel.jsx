import { useCallback, useRef, useState } from 'react';
import ServiceListingCard from './ServiceListingCard';

export default function ServicesCarousel({
  services,
  renderCard,
  className = '',
  dotsLabel = 'Services carousel',
}) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track?.firstElementChild) return;

    const item = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 16;
    const step = item.getBoundingClientRect().width + gap;
    const index = Math.round(track.scrollLeft / step);

    setActiveIndex(Math.max(0, Math.min(index, services.length - 1)));
  }, [services.length]);

  const scrollToIndex = (index) => {
    const track = trackRef.current;
    const item = track?.children[index];
    if (!item) return;

    item.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActiveIndex(index);
  };

  if (!services.length) return null;

  return (
    <div className={`services-carousel${className ? ` ${className}` : ''}`}>
      <div
        ref={trackRef}
        className="services-carousel__track"
        onScroll={handleScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={dotsLabel}
      >
        {services.map((service) => (
          <div key={service.id} className="services-carousel__item">
            {renderCard ? renderCard(service) : <ServiceListingCard {...service} />}
          </div>
        ))}
      </div>

      {services.length > 1 ? (
        <div className="services-carousel__dots" role="tablist" aria-label={dotsLabel}>
          {services.map((service, index) => (
            <button
              key={service.id}
              type="button"
              role="tab"
              className={`services-carousel__dot${index === activeIndex ? ' is-active' : ''}`}
              aria-selected={index === activeIndex}
              aria-label={`Slide ${index + 1}: ${service.title}`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
