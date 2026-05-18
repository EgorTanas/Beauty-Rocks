export default function ServiceListingCard({ title, desc, duration, price, image, variant = 'light' }) {
  const isDark = variant === 'dark';

  return (
    <article className={`services-card services-card--${variant}`}>
      {image ? (
        <img className="services-card__media services-card__img" src={image} alt="" loading="lazy" decoding="async" />
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
