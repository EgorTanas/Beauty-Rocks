import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroSection from '../components/services/HeroSection';
import CategoriesBar from '../components/services/CategoriesBar';
import FeaturedServices from '../components/services/FeaturedServices';
import ServicesGrid from '../components/services/ServicesGrid';
import BenefitsSection from '../components/services/BenefitsSection';
import CTASection from '../components/services/CTASection';
import '../style/services.css';

export default function Services() {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (categoryId) => {
    setActiveCategoryId(categoryId);
    const target = categoryId === 'all' ? 'services-catalog' : `category-${categoryId}`;
    requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="br-page services-page">
      <Navbar />

      <main className="services-main">
        <HeroSection />
        <CategoriesBar
          activeCategoryId={activeCategoryId}
          onCategoryChange={handleCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <FeaturedServices />
        <ServicesGrid activeCategoryId={activeCategoryId} searchQuery={searchQuery} />
        <BenefitsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
