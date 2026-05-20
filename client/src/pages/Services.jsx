import { useRef, useState } from 'react';
import { CATEGORY_FILTERS, normalizeCategory } from '../components/services/servicesData';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroSection from '../components/services/HeroSection';
import CategoriesBar from '../components/services/CategoriesBar';
import FeaturedServices from '../components/services/FeaturedServices';
import ServicesGrid from '../components/services/ServicesGrid';
import CTASection from '../components/services/CTASection';
import '../style/services.css';

const CATEGORY_ORDER = CATEGORY_FILTERS.map((c) => c.id);

export default function Services() {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resultCount, setResultCount] = useState(null);
  const [categoryDirection, setCategoryDirection] = useState(1);
  const [sortBy, setSortBy] = useState('popular');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceMax, setPriceMax] = useState(200);
  const prevCategoryRef = useRef('all');

  const handleCategoryChange = (categoryId) => {
    const prevIdx = CATEGORY_ORDER.indexOf(prevCategoryRef.current);
    const nextIdx = CATEGORY_ORDER.indexOf(categoryId);
    setCategoryDirection(nextIdx >= prevIdx ? 1 : -1);
    prevCategoryRef.current = categoryId;
    setActiveCategoryId(categoryId);

    const targetId =
      categoryId === 'all' ? 'services-catalog' : `category-${normalizeCategory(categoryId)}`;

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const catalogFilterProps = {
    activeCategoryId,
    searchQuery,
    sortBy,
    durationFilter,
    priceMax,
  };

  return (
    <div className="br-page services-page">
      <Navbar />

      <main className="services-main">
        <div className="services-hero-zone">
          <HeroSection />
        </div>

        <section
          id="services-showcase"
          className="services-showcase"
          aria-label="Featured services and filters"
        >
          <div className="services-container services-showcase__inner">
            <CategoriesBar
              activeCategoryId={activeCategoryId}
              onCategoryChange={handleCategoryChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              resultCount={resultCount}
              sortBy={sortBy}
              onSortChange={setSortBy}
              durationFilter={durationFilter}
              onDurationChange={setDurationFilter}
              priceMax={priceMax}
              onPriceMaxChange={setPriceMax}
            />
            <FeaturedServices searchQuery={searchQuery} />
          </div>
        </section>

        <ServicesGrid
          {...catalogFilterProps}
          categoryDirection={categoryDirection}
          onResultCount={setResultCount}
        />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
