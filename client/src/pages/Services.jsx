import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import '../style/Home.css';

export default function Services() {
  return (
    <div className="site-page">
      <SiteHeader />
      <main className="site-inner">
        <div className="site-inner-card">
          <h1>Services</h1>
          <p>
            Full menu, add-ons, and pricing will live here. For now, explore highlights on the home page or send a
            note through booking.
          </p>
          <div className="site-inner-actions">
            <Link to="/#services" className="br-btn br-btn--solid">
              View highlights
            </Link>
            <Link to="/booking" className="br-btn br-btn--outline">
              Book now
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
