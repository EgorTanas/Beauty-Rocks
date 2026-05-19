import { useEffect, useState } from 'react';
import ServicesCarousel from './ServicesCarousel';
import ServiceListingCard from './ServiceListingCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mapare category din DB → label frumos + descriere scurtă
const CATEGORY_META = {
  nails:    { label: 'Nails',    lead: 'Manicure, pedicure, gel, extensions și nail art.' },
  hair:     { label: 'Hair',     lead: 'Tunsori, culoare, styling, keratin și bridal.' },
  skincare: { label: 'Skincare', lead: 'Tratamente faciale și îngrijire profesională a pielii.' },
  bridal:   { label: 'Bridal',   lead: 'Pachete complete pentru mirese și ocazii speciale.' },
  other:    { label: 'Other',    lead: 'Servicii și pachete curate.' },
};

// Mapare serviciu din DB → props pentru ServiceListingCard
function toCardProps(service) {
  return {
    id:       service._id,
    title:    service.name,
    desc:     service.description,
    duration: service.duration,
    price:    service.price,
    image:    service.image || '',
    variant:  'light',
    category: service.category,
  };
}

// Grupare array de servicii după câmpul category
function groupByCategory(services) {
  const map = {};
  services.forEach((s) => {
    const cat = s.category || 'other';
    if (!map[cat]) {
      map[cat] = {
        id:       cat,
        label:    CATEGORY_META[cat]?.label ?? cat,
        lead:     CATEGORY_META[cat]?.lead  ?? '',
        services: [],
      };
    }
    map[cat].services.push(toCardProps(s));
  });
  // Sortăm categoriile în ordinea din CATEGORY_META
  const ORDER = ['nails', 'hair', 'skincare', 'bridal', 'other'];
  return ORDER.map((k) => map[k]).filter(Boolean);
}

export default function ServicesGrid({ activeCategoryId = 'all', searchQuery = '' }) {
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Fetch o singură dată toate serviciile active
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/api/services`);
        if (!res.ok) throw new Error('Failed to load services');
        const json = await res.json();
        if (!cancelled) setAllServices(json.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Filtrare pe client după categorie + search
  const query = searchQuery.trim().toLowerCase();

  const filtered = allServices.filter((s) => {
    const matchCat =
      activeCategoryId === 'all' || s.category === activeCategoryId;
    const matchSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  // Grupăm rezultatele filtrate pe categorii
  const categories = groupByCategory(filtered);

  // ── Loading
  if (loading) {
    return (
      <section id="services-catalog" className="services-grid-section">
        <div className="services-container">
          <div className="services-loading" aria-live="polite">
            <span className="services-loading__spinner" aria-hidden />
            <p>Loading services…</p>
          </div>
        </div>
      </section>
    );
  }

  // ── Error 
  if (error) {
    return (
      <section id="services-catalog" className="services-grid-section">
        <div className="services-container">
          <p className="services-empty">
            Could not load services right now. Please refresh the page.
          </p>
        </div>
      </section>
    );
  }

  // ── Title dinamic 
  const sectionTitle =
    activeCategoryId === 'all'
      ? 'Explore All Services'
      : (CATEGORY_META[activeCategoryId]?.label ?? 'Services');

  const sectionLead =
    activeCategoryId === 'all'
      ? 'Browse by category — nails, hair, skincare, and curated packages.'
      : (CATEGORY_META[activeCategoryId]?.lead ?? '');

  return (
    <section
      id="services-catalog"
      className="services-grid-section"
      aria-labelledby="services-grid-title"
    >
      <div className="services-container">
        <header className="services-section-head">
          <p className="services-eyebrow">Service menu</p>
          <h2 id="services-grid-title" className="services-section-title">
            {sectionTitle}
          </h2>
          <p className="services-section-lead">{sectionLead}</p>
        </header>

        {categories.length === 0 ? (
          <p className="services-empty">
            No services match your search. Try another term or category.
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              id={`category-${category.id}`}
              className="services-category-block"
              aria-labelledby={`category-title-${category.id}`}
            >
              {/* Afișăm header-ul de categorie doar în modul "all" */}
              {activeCategoryId === 'all' && (
                <header className="services-category-head">
                  <h3
                    id={`category-title-${category.id}`}
                    className="services-category-title"
                  >
                    {category.label}
                  </h3>
                  <p className="services-category-lead">{category.lead}</p>
                </header>
              )}

              <ServicesCarousel
                className="services-category__carousel"
                services={category.services}
                dotsLabel={`${category.label} services`}
                renderCard={(service) => <ServiceListingCard {...service} variant="light" />}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}