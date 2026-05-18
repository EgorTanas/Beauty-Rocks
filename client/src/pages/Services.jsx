import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function Services() {
  return (
    <div className="site-page">
      <Navbar />
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
      <Footer />
    </div>
  );
}
