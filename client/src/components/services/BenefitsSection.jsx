export default function BenefitsSection() {
  const benefits = [
    {
      title: 'Premium Products',
      desc: 'Professional nail and hair formulas chosen for lasting finish and salon-grade results.',
    },
    {
      title: 'Experienced Stylists',
      desc: 'Artists skilled in nails, color, cuts, and bridal looks — precise hands, editorial eye.',
    },
    {
      title: 'Personalized Beauty',
      desc: 'Every visit shaped around your style, occasion, and the finish you want to leave with.',
    },
    {
      title: 'Relaxing Atmosphere',
      desc: 'A calm studio rhythm — unhurried chairs, soft light, and service that feels considered.',
    },
  ];

  return (
    <section className="services-benefits" aria-labelledby="services-benefits-title">
      <div className="services-container">
        <h2 id="services-benefits-title" className="visually-hidden">Why choose Beauty Rocks</h2>
        <ul className="services-benefits__list">
          {benefits.map(({ title, desc }) => (
            <li key={title} className="services-benefits__item">
              <span className="services-benefits__icon" aria-hidden />
              <h3 className="services-benefits__title">{title}</h3>
              <p className="services-benefits__desc">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
