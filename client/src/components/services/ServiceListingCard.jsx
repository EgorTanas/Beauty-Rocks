import { Heart } from 'lucide-react';

export default function ServiceListingCard({
  title,
  desc,
  duration,
  price,
  image,
  variant = 'light',
  showWishlist = false,
}) {
  const isDark = variant === 'dark';

  return (
    <article className={`services-card services-card--${variant}`}>
      {image ? (
        <div className="services-card__media-wrap">
          <img className="services-card__media services-card__img" src={image} alt="" loading="lazy" decoding="async" />
          {showWishlist ? (
            <button type="button" className="services-card__wishlist" aria-label={`Save ${title}`}>
              <Heart size={14} strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}
        </div>
      ) : (
        <div className="services-card__media services-placeholder">{title}</div>
      )}
      <div className="services-card__body">
        <h3 className="services-card__title">{title}</h3>
        {!isDark && desc ? <p className="services-card__desc">{desc}</p> : null}
        <footer className="services-card__footer">
          <span>{duration}</span>
          <span>{price}</span>
        </footer>
      </div>
    </article>
  );
}
