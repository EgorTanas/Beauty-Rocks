import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, Plus } from 'lucide-react';
import HighlightText from '../../utils/highlightText';
import { CATEGORY_IMAGES, CATEGORY_META } from './servicesData';

const FALLBACK_IMAGE = '/imgHome/image.png';

export default function ServiceListingCard({
  title,
  desc,
  duration,
  price,
  image,
  category = 'other',
  variant = 'light',
  showWishlist = false,
  showAddButton = false,
  showCategoryTag = true,
  interactive = false,
  highlightQuery = '',
}) {
  const isDark = variant === 'dark';
  const categoryFallback = CATEGORY_IMAGES[category] || FALLBACK_IMAGE;
  const initialSrc = image || categoryFallback;
  const [imgSrc, setImgSrc] = useState(initialSrc);

  useEffect(() => {
    setImgSrc(image || categoryFallback);
  }, [image, categoryFallback]);

  const handleImageError = () => {
    setImgSrc((current) => {
      if (current !== categoryFallback) return categoryFallback;
      if (current !== FALLBACK_IMAGE) return FALLBACK_IMAGE;
      return current;
    });
  };

  const categoryLabel = CATEGORY_META[category]?.label ?? category;

  return (
    <article
      className={`services-card services-card--${variant}${interactive ? ' services-card--interactive' : ''}`}
    >
      <div className="services-card__media-wrap">
        <img
          className="services-card__img"
          src={imgSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        {!isDark && showCategoryTag && category ? (
          <span className="services-card__tag">{categoryLabel}</span>
        ) : null}
        {showWishlist ? (
          <button type="button" className="services-card__wishlist" aria-label={`Save ${title}`}>
            <Heart size={14} strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </div>
      <div className="services-card__body">
        <h3 className="services-card__title">
          <HighlightText text={title} query={highlightQuery} />
        </h3>
        {desc ? (
          <p className="services-card__desc">
            <HighlightText text={desc} query={highlightQuery} />
          </p>
        ) : null}
        <footer className={`services-card__footer${showAddButton ? ' services-card__footer--with-action' : ''}`}>
          <span className="services-card__meta">
            <Clock size={12} strokeWidth={1.75} aria-hidden />
            <HighlightText text={duration} query={highlightQuery} />
          </span>
          <span className="services-card__price">
            <HighlightText text={price} query={highlightQuery} />
          </span>
          {showAddButton ? (
            <Link
              to="/booking"
              className="services-card__add"
              aria-label={`Book ${title}`}
            >
              <Plus size={16} strokeWidth={2} aria-hidden />
            </Link>
          ) : null}
        </footer>
      </div>
    </article>
  );
}
