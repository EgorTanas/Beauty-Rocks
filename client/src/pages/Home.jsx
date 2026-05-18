import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroSection from '../components/sections/HeroSection';
import ServicesSection from '../components/sections/ServicesSection';
import AboutSection from '../components/sections/AboutSection';
import TeamSection from '../components/sections/TeamSection';
import GallerySection from '../components/sections/GallerySection';
import BookingSection from '../components/sections/BookingSection';

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);

  return (
    <div className="br-page">
      <Navbar />

      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <TeamSection />
        <GallerySection />
        <BookingSection />
      </main>

      <Footer />
    </div>
  );
}
