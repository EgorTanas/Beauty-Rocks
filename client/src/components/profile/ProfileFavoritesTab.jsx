import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { CATEGORY_IMAGES } from '@/data/servicesData';

const FALLBACK = '/imgHome/image.png';

function formatMeta(item) {
  const parts = [];
  if (item.duration) parts.push(item.duration);
  if (item.price) parts.push(item.price);
  return parts.join(' · ') || 'Service';
}

export default function ProfileFavoritesTab({ favorites, onRemove }) {
  return (
    <section
      className="pf-sheet"
      role="tabpanel"
      id="pf-panel-favorites"
      aria-labelledby="pf-tab-favorites"
    >
      <header className="pf-sheet__head">
        <h2 className="pf-sheet__title">Saved services</h2>
        <p className="pf-sheet__sub">Heart a service on the menu to keep it here.</p>
      </header>

      {favorites.length === 0 ? (
        <div className="pf-zero">
          <p className="pf-zero__title">Nothing saved</p>
          <p className="pf-zero__text">Browse services and tap the heart to build your list.</p>
          <Link to="/services" className="pf-btn pf-btn--wine">
            Explore services
          </Link>
        </div>
      ) : (
        <ul className="pf-wishlist">
          {favorites.map((item) => {
            const img = item.image || CATEGORY_IMAGES[item.category] || FALLBACK;
            return (
              <li key={item.id}>
                <article className="pf-wish">
                  <div className="pf-wish__thumb">
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK;
                      }}
                    />
                  </div>
                  <div className="pf-wish__body">
                    <h3 className="pf-wish__title">{item.title}</h3>
                    <p className="pf-wish__meta">{formatMeta(item)}</p>
                    <div className="pf-wish__acts">
                      <Link to="/booking" className="pf-btn pf-btn--wine pf-btn--sm">
                        Book
                      </Link>
                      <button
                        type="button"
                        className="pf-btn pf-btn--ghost pf-btn--sm"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.title}`}
                      >
                        <Heart size={14} fill="currentColor" aria-hidden />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
